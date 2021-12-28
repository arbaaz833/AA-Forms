import { dividerClasses } from "@mui/material";
import { db } from "./firebaseConfig";

export async function addForm(uid, formData) {
  try {
    const query = await db
      .collection("users")
      .doc(uid)
      .collection("forms")
      .where("formName", "==", formData.formName)
      .get();
    if (!query.empty) throw "Another Form already exist with this name";
    else {
      await db.collection("users").doc(uid).collection("forms").add(formData);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
