import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

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
