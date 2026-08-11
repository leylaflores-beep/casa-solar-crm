import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

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
const db = getFirestore(app);
const auth = getAuth(app);

const ADMINISTRADORAS = {
  "leyla.flores@gmail.com": "Leyla Flores",
  "ligiaeugeniamolina@gmail.com": "Ligia Eugenia Molina",
};

export function profileFromFirebaseUser(user) {
  const email = (user.email || "").toLowerCase();
  const adminName = ADMINISTRADORAS[email];
  const fallbackName = email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());

  return {
    uid: user.uid,
    email,
    nombre: adminName || user.displayName || fallbackName || "Vendedor",
    rol: adminName ? "Jefe" : "Vendedor",
  };
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
