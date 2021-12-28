import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAUrmlkel9YYTNZhwFfHmhhjHQkiAtave8",
  authDomain: "aa-survey-form.firebaseapp.com",
  projectId: "aa-survey-form",
  storageBucket: "aa-survey-form.appspot.com",
  messagingSenderId: "767878648530",
  appId: "1:767878648530:web:582a0dc32aa46942c1130b",
  measurementId: "G-HTD3F4KWJJ"
};

const app= firebase.initializeApp(firebaseConfig);
export const fb = firebase;
export const db= app.firestore();
export const auth = app.auth();
