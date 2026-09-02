import{initializeApp}from"firebase/app";import{createUserWithEmailAndPassword,getAuth,signOut,updateProfile}from"firebase/auth";import{getFirestore}from"firebase/firestore";
const firebaseConfig={apiKey:"AIzaSyCW6qgf7yRVsh0EIWu-WCRIFQ_LPC1FDT8",authDomain:"crm-multiservicios-flores.firebaseapp.com",projectId:"crm-multiservicios-flores",storageBucket:"crm-multiservicios-flores.firebasestorage.app",messagingSenderId:"45531027904",appId:"1:45531027904:web:2fb3a9794cb8cfeaead1025"};
const app=initializeApp(firebaseConfig);export const auth=getAuth(app);export const db=getFirestore(app);
const userManagementApp=initializeApp(firebaseConfig,"userManagement");
const userManagementAuth=getAuth(userManagementApp);
export async function createCRMUser({nombre,correo,clave}){
  const credential=await createUserWithEmailAndPassword(userManagementAuth,correo.trim(),clave);
  await updateProfile(credential.user,{displayName:nombre.trim()});
  await signOut(userManagementAuth);
  return credential.user;
}
