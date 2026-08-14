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
const USUARIOS_ESPECIALES = {
  "casasolar.bodega.gt@gmail.com": { nombre: "Samuel Lemus", rol: "Jefe técnico", roles: ["Jefe técnico", "Vendedor"] },
};

export async function profileFromFirebaseUser(user) {
  const email = (user.email || "").toLowerCase();
  const adminName = ADMINISTRADORAS[email];
  const specialUser = USUARIOS_ESPECIALES[email];
  const profileSnapshot = await getDoc(doc(db, "crm_data", `user_${user.uid}`));
  const savedProfile = profileSnapshot.exists() ? profileSnapshot.data() : null;
  const fallbackName = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());

  return {
    uid: user.uid,
    email,
    nombre: specialUser?.nombre || savedProfile?.nombre || adminName || user.displayName || fallbackName || "Vendedor",
    rol: adminName ? "Jefe" : (specialUser?.rol || savedProfile?.rol || "Vendedor"),
    roles: adminName ? ["Jefe"] : (specialUser?.roles || (Array.isArray(savedProfile?.roles) ? savedProfile.roles : [savedProfile?.rol || "Vendedor"])),
    activo: adminName || specialUser ? true : savedProfile?.activo !== false,
  };
}

export async function createCRMUser({ nombre, email, password, rol, roles, telefono, departamentosCobertura, createdBy }) {
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
      roles: Array.isArray(roles) && roles.length ? roles : [rol],
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

export async function updateCRMUserProfile(uid, changes, changedBy = "") {
  if (!uid) throw new Error("El usuario no tiene un identificador de Firebase asociado.");
  await setDoc(doc(db, "crm_data", `user_${uid}`), {
    ...changes,
    perfilActualizadoEn: new Date().toISOString(),
    perfilActualizadoPor: changedBy,
  }, { merge: true });
}

export async function replaceCRMUserEmail({ user, newEmail, changedBy }) {
  if (!user?.uid) throw new Error("El usuario no tiene un acceso de Firebase asociado.");
  const normalizedEmail = newEmail.trim().toLowerCase();
  const secondaryApp = getApps().find(item => item.name === "user-email-change")
    || initializeApp(firebaseConfig, "user-email-change");
  const secondaryAuth = getAuth(secondaryApp);
  const temporaryPassword = Array.from(crypto.getRandomValues(new Uint8Array(18)), byte => (byte % 36).toString(36)).join("") + "A1!";
  const credential = await createUserWithEmailAndPassword(secondaryAuth, normalizedEmail, temporaryPassword);
  try {
    await updateProfile(credential.user, { displayName: user.nombre || "Usuario CRM" });
    await setDoc(doc(db, "crm_data", `user_${credential.user.uid}`), {
      ...user,
      uid: credential.user.uid,
      email: normalizedEmail,
      activo: true,
      estadoAcceso: "Activo",
      correoAnterior: user.email || "",
      correoActualizadoEn: new Date().toISOString(),
      correoActualizadoPor: changedBy,
    });
    await setCRMUserActive(user.uid, false, changedBy);
  } finally {
    await signOut(secondaryAuth);
  }
  await sendPasswordResetEmail(auth, normalizedEmail);
  return { ...user, uid: credential.user.uid, email: normalizedEmail, activo: true, estadoAcceso: "Activo" };
}

export async function deleteCRMContact(contactId) {
  const targets = ["contactos", "cotizaciones", "seguimientos", "campaigns"].map(name => doc(db, "crm_data", name));
  await runTransaction(db, async transaction => {
    const snapshots = await Promise.all(targets.map(target => transaction.get(target)));
    const [contacts, quotes, followups, campaigns] = snapshots.map(snapshot => snapshot.exists() && Array.isArray(snapshot.data().value) ? snapshot.data().value : []);
    const now = new Date().toISOString();
    transaction.set(targets[0], { value: contacts.filter(item => item.id !== contactId), updatedAt: now }, { merge: true });
    transaction.set(targets[1], { value: quotes.filter(item => item.contactoId !== contactId), updatedAt: now }, { merge: true });
    transaction.set(targets[2], { value: followups.filter(item => item.contactoId !== contactId), updatedAt: now }, { merge: true });
    transaction.set(targets[3], { value: campaigns.map(campaign => ({ ...campaign, sends: (campaign.sends || []).filter(send => send.contactoId !== contactId) })), updatedAt: now }, { merge: true });
  });
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

// Agrega o actualiza registros por ID dentro de una transacción. Así una sesión
// antigua nunca reemplaza los clientes, cotizaciones u órdenes de otros usuarios.
export async function upsertSharedDataRecords(key, records) {
  const incoming = (Array.isArray(records) ? records : [records]).filter(item => item?.id);
  if (!incoming.length) return [];
  const target = doc(db, "crm_data", documentName(key));
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(target);
    const current = snapshot.exists() && Array.isArray(snapshot.data().value) ? snapshot.data().value : [];
    const byId = new Map(current.map(item => [item.id, item]));
    incoming.forEach(item => byId.set(item.id, { ...(byId.get(item.id) || {}), ...item, actualizadoEn: new Date().toISOString() }));
    const incomingIds = new Set(incoming.map(item => item.id));
    const next = [...incoming.map(item => byId.get(item.id)), ...current.filter(item => !incomingIds.has(item.id))];
    transaction.set(target, { value: next, updatedAt: new Date().toISOString() }, { merge: true });
    return next;
  });
}

// Crea una cotización y asigna el correlativo usando la lista más reciente en
// Firestore, evitando números repetidos si dos vendedores guardan a la vez.
export async function appendSharedQuote(key, quote, year) {
  const target = doc(db, "crm_data", documentName(key));
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(target);
    const current = snapshot.exists() && Array.isArray(snapshot.data().value) ? snapshot.data().value : [];
    const max = current
      .filter(item => String(item.numero || "").startsWith(`CS-${year}-`))
      .reduce((value, item) => Math.max(value, Number(String(item.numero).split("-").pop()) || 0), 0);
    const created = { ...quote, numero: `CS-${year}-${String(max + 1).padStart(4, "0")}`, creadoEn: quote.creadoEn || new Date().toISOString() };
    transaction.set(target, { value: [created, ...current], updatedAt: new Date().toISOString() }, { merge: true });
    return created;
  });
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
