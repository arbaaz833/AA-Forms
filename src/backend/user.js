import { db, auth } from "./firebaseConfig";

export async function createUser(email, password, name) {
  await auth.createUserWithEmailAndPassword(email, password);
  await auth.currentUser.updateProfile({ displayName: `${name}` });
}

export async function SignInUser(email, password) {
  await auth.signInWithEmailAndPassword(email, password);
}
