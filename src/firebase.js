import { getApps, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { arrayUnion, doc, getDoc, initializeFirestore, onSnapshot, persistentLocalCache, persistentMultipleTabManager, runTransaction, setDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkDZgfSyIM_KwfA68w5cRN9jj-S4lSeJU",
  authDomain: "crm-casa-solar.firebaseapp.com",
  projectId: "crm-casa-solar",
  storageBucket: "crm-casa-solar.firebasestorage.app",
  messagingSenderId: "823792741257",
  appId: "1:823792741257:web:75408391faaa786fdccf58",
  measurementId: "G-PWREWR04ZW",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
const auth = getAuth(app);

const ADMINISTRADORAS = {
  "leyla.flores@gmail.com": "Leyla Flores",
  "ligiaeugeniamolina@gmail.com": "Ligia Eugenia Molina",
};

export async function profileFromFirebaseUser(user) {
  const email = (user.email || "").toLowerCase();
  const adminName = ADMINISTRADORAS[email];
  const profileSnapshot = await getDoc(doc(db, "crm_data", `user_${user.uid}`));
  const savedProfile = profileSnapshot.exists() ? profileSnapshot.data() : null;
  const fallbackName = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());

  return {
    uid: user.uid,
    email,
    nombre: savedProfile?.nombre || adminName || user.displayName || fallbackName || "Vendedor",
    rol: adminName ? "Jefe" : (savedProfile?.rol || "Vendedor"),
    activo: adminName ? true : savedProfile?.activo !== false,
  };
}

export async function createCRMUser({ nombre, email, password, rol, telefono, departamentosCobertura, createdBy }) {
  const secondaryApp = getApps().find(item => item.name === "user-creation")
    || initializeApp(firebaseConfig, "user-creation");
  const secondaryAuth = getAuth(secondaryApp);
  const credential = await createUserWithEmailAndPassword(secondaryAuth, email.trim().toLowerCase(), password);
  try {
    await updateProfile(credential.user, { displayName: nombre.trim() });
    const profile = {
      uid: credential.user.uid,
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      rol,
      telefono: telefono || "",
      departamentosCobertura: departamentosCobertura || "",
      activo: true,
      creadoEn: new Date().toISOString(),
      creadoPor: createdBy.nombre,
      creadoPorEmail: createdBy.email,
    };
    await setDoc(doc(db, "crm_data", `user_${credential.user.uid}`), profile);
    return profile;
  } finally {
    await signOut(secondaryAuth);
  }
}

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logoutFirebase() {
  return signOut(auth);
}

export async function sendCRMPasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function setCRMUserActive(uid, active, changedBy = "") {
  if (!uid) throw new Error("El usuario no tiene un identificador de Firebase asociado.");
  await setDoc(doc(db, "crm_data", `user_${uid}`), {
    activo: Boolean(active),
    estadoAcceso: active ? "Activo" : "Suspendido",
    estadoAccesoActualizadoEn: new Date().toISOString(),
    estadoAccesoActualizadoPor: changedBy,
  }, { merge: true });
}

const documentName = (key) => key.replace("casasolar:", "").replace(/[^a-zA-Z0-9_-]/g, "_");

export async function getSharedData(key) {
  const snapshot = await getDoc(doc(db, "crm_data", documentName(key)));
  return snapshot.exists() ? snapshot.data().value : null;
}

export async function setSharedData(key, value) {
  await setDoc(doc(db, "crm_data", documentName(key)), {
    value,
    updatedAt: new Date().toISOString(),
  });
}

export async function appendSharedData(key, value) {
  await setDoc(doc(db, "crm_data", documentName(key)), {
    value: arrayUnion(value),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// Actualiza registros existentes dentro de una transacción para no reemplazar
// seguimientos agregados por otro usuario mientras la pantalla estaba abierta.
export async function updateSharedDataRecords(key, ids, changes) {
  const target = doc(db, "crm_data", documentName(key));
  const selected = new Set(ids);
  await runTransaction(db, async transaction => {
    const snapshot = await transaction.get(target);
    const current = snapshot.exists() && Array.isArray(snapshot.data().value) ? snapshot.data().value : [];
    transaction.set(target, {
      value: current.map(item => selected.has(item.id) ? { ...item, ...changes } : item),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  });
}

export function subscribeSharedData(key, callback, onError) {
  return onSnapshot(doc(db, "crm_data", documentName(key)), snapshot => {
    callback(snapshot.exists() ? snapshot.data().value : null);
  }, onError);
}

export function subscribeCRMUserProfile(uid, callback, onError) {
  return onSnapshot(doc(db, "crm_data", `user_${uid}`), snapshot => {
    callback(snapshot.exists() ? snapshot.data() : null);
  }, onError);
}

export async function savePublicCampaign(campaign) {
  await setDoc(doc(db, "public_campaigns", campaign.id), campaign, { merge: true });
}

export async function createCampaignLink(token, data) {
  await setDoc(doc(db, "campaign_links", token), {
    ...data,
    accessedAt: null,
    benefitRequestedAt: null,
    usedBenefit: false,
    usedAt: null,
  });
}

export async function getCampaignLink(token) {
  const snapshot = await getDoc(doc(db, "campaign_links", token));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function getPublicCampaign(id) {
  const snapshot = await getDoc(doc(db, "public_campaigns", id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function markCampaignAccess(token) {
  await updateDoc(doc(db, "campaign_links", token), { accessedAt: new Date().toISOString() });
}

export async function requestCampaignBenefit(token) {
  await updateDoc(doc(db, "campaign_links", token), { benefitRequestedAt: new Date().toISOString() });
}

export async function markCampaignBenefitUsed(token, used) {
  await updateDoc(doc(db, "campaign_links", token), {
    usedBenefit: Boolean(used),
    usedAt: used ? new Date().toISOString() : null,
  });
}
