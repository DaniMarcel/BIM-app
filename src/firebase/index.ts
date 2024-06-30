// Get Data
import * as Firestore from "firebase/firestore"
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getDocs, collection } from "firebase/firestore" // Asegúrate de importar getDocs y collection desde Firestore
import { IProject } from "../classes/Project"
import { ToDo } from "../bim-components/TodoCreator"


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCI6X9-xQ7RE1dQXgxGyh1gcSTqU0-_vFs",
  authDomain: "bim-dev-app-e0acb.firebaseapp.com",
  projectId: "bim-dev-app-e0acb",
  storageBucket: "bim-dev-app-e0acb.appspot.com",
  messagingSenderId: "962220324993",
  appId: "1:962220324993:web:5fa317a24911a6c639b580"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Get Documents
export const firestoreDB = Firestore.getFirestore()

export function getCollection<T>(path: string) {
  return Firestore.collection(firestoreDB, path) as Firestore.CollectionReference<T>
}

export async function deleteDocument(path: string, id: string) {
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  await Firestore.deleteDoc(doc)
}
export async function getTodos(projectId: string): Promise<ToDo[]> {
  const todosCollectionRef = collection(firestoreDB, `/projects/${projectId}/ToDo`);
  const querySnapshot = await getDocs(todosCollectionRef);
  
  const todos: ToDo[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    todos.push({
      id: doc.id,
      description: data.description,
      date: data.date.toDate ? data.date.toDate() : new Date(data.date), // Convierte a Date
      fragmentMap: data.fragmentMap,
      camera: data.camera,
      priority: data.priority
    } as ToDo);
  });

  return todos;
}


export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const doc = Firestore.doc(firestoreDB, `${path}/${id}`)
  await Firestore.updateDoc(doc, data)
}



// updateDocument<Partial<IProject>>("/projects", "asd", {name: "New Name"})