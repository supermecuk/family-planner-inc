import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";
import { FamilyMember } from "@repo/shared/types/user";
import { logError } from "./errorHandling";

/**
 * Create or update user document in Firestore
 */
export const createOrUpdateUserDocument = async (user: User): Promise<void> => {
  try {
    console.log("Creating/updating user document for:", user.uid);

    // Check if user document already exists
    const usersRef = collection(db, "users");
    const userExistsQuery_q = query(usersRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(userExistsQuery_q);

    if (querySnapshot.empty) {
      // User doesn't exist, create new document
      console.log("Creating new user document");

      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastSignIn: serverTimestamp(),
        // Don't set familyId or role yet - they'll be set when they join/create a family
      };

      await addDoc(collection(db, "users"), userDoc);
      console.log("User document created successfully");
    } else {
      // User exists, update lastSignIn
      console.log("Updating existing user document");
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        lastSignIn: serverTimestamp(),
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL,
      });
      console.log("User document updated successfully");
    }
  } catch (error) {
    logError(error, "createOrUpdateUserDocument");
    console.error("Failed to create/update user document:", error);
    // Don't throw error - we don't want to break the sign-in flow
  }
};

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (uid: string): Promise<any | null> => {
  try {
    const usersRef = collection(db, "users");
    const getUserQuery_q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(getUserQuery_q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    logError(error, "getUserDocument");
    throw error;
  }
};

/**
 * Check if user has a family membership
 */
export const hasFamilyMembership = async (uid: string): Promise<boolean> => {
  try {
    const usersRef = collection(db, "users");
    const membershipQuery_q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(membershipQuery_q);

    if (querySnapshot.empty) {
      return false;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Check if user has familyId and role (indicating family membership)
    return !!(userData.familyId && userData.role);
  } catch (error) {
    logError(error, "hasFamilyMembership");
    return false;
  }
};
