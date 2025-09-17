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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Family } from "@repo/shared/types/user";
import { FamilyMember } from "@repo/shared/types/user";
import { InviteError, INVITE_ERROR_CODES, logError } from "./errorHandling";

/**
 * Create a new family
 */
export const createFamily = async (
  name: string,
  ownerId: string
): Promise<{ family: Family; success: boolean; error?: string }> => {
  try {
    // Check if user already has a family
    const existingMembership = await getUserFamilyMembership(ownerId);
    if (existingMembership) {
      return {
        family: {} as Family,
        success: false,
        error:
          "You are already a member of a family. You can only be in one family at a time.",
      };
    }

    // Create family document matching your existing schema
    const familyDoc = {
      familyName: name,
      ownerId,
      isActive: true,
      createdAt: serverTimestamp(),
      subscriptionExpiresAt: null, // Set to null initially
    };

    console.log("Creating family document:", familyDoc);
    const familyRef = await addDoc(collection(db, "families"), familyDoc);
    console.log("Family created with ID:", familyRef.id);

    const family: Family = {
      id: familyRef.id,
      name,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update the user's document to add family membership
    const usersRef = collection(db, "users");
    const ownerQuery_q = query(usersRef, where("uid", "==", ownerId));
    const querySnapshot = await getDocs(ownerQuery_q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        familyId: familyRef.id,
        role: "owner",
        subscriptionType: "base",
        joinedAt: serverTimestamp(),
      });
      console.log("Updated user document with family membership");
    } else {
      console.error(
        "User document not found - this shouldn't happen after sign-in"
      );
    }

    return { family, success: true };
  } catch (error) {
    logError(error, "createFamily");
    return {
      family: {} as Family,
      success: false,
      error: "Failed to create family. Please try again.",
    };
  }
};

/**
 * Get family by ID
 */
export const getFamilyById = async (
  familyId: string
): Promise<Family | null> => {
  try {
    const familyRef = doc(db, "families", familyId);
    const familySnap = await getDoc(familyRef);

    if (!familySnap.exists()) {
      return null;
    }

    const data = familySnap.data();
    return {
      id: familySnap.id,
      name: data.familyName,
      ownerId: data.ownerId,
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      updatedAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Use createdAt as updatedAt since we don't have updatedAt in your schema
    };
  } catch (error) {
    logError(error, "getFamilyById");
    throw new InviteError(
      "Failed to fetch family",
      INVITE_ERROR_CODES.NETWORK_ERROR
    );
  }
};

/**
 * Update family information
 */
export const updateFamily = async (
  familyId: string,
  updates: Partial<Pick<Family, "name">>
): Promise<void> => {
  try {
    const familyRef = doc(db, "families", familyId);
    const updateData: any = {};

    // Map name to familyName for your schema
    if (updates.name !== undefined) {
      updateData.familyName = updates.name;
    }

    await updateDoc(familyRef, updateData);
  } catch (error) {
    logError(error, "updateFamily");
    throw new InviteError(
      "Failed to update family",
      INVITE_ERROR_CODES.UNKNOWN_ERROR
    );
  }
};

/**
 * Get all family members
 */
export const getFamilyMembers = async (
  familyId: string
): Promise<FamilyMember[]> => {
  try {
    const usersRef = collection(db, "users");
    const familyMembersQuery_q = query(
      usersRef,
      where("familyId", "==", familyId)
    );
    const querySnapshot = await getDocs(familyMembersQuery_q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: data.uid,
        familyId: data.familyId,
        role: data.role,
        subscriptionType: data.subscriptionType,
        joinedAt: data.joinedAt ? data.joinedAt.toDate() : new Date(),
      };
    });
  } catch (error) {
    logError(error, "getFamilyMembers");
    throw new InviteError(
      "Failed to fetch family members",
      INVITE_ERROR_CODES.NETWORK_ERROR
    );
  }
};

/**
 * Remove user from family (only owner can do this)
 */
export const removeFamilyMember = async (
  familyId: string,
  memberId: string,
  requesterId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if requester is the owner
    const requesterMembership = await getUserFamilyMembership(requesterId);
    if (!requesterMembership || requesterMembership.role !== "owner") {
      return {
        success: false,
        error: "Only the family owner can remove members",
      };
    }

    // Don't allow owner to remove themselves
    if (memberId === requesterId) {
      return {
        success: false,
        error: "You cannot remove yourself from the family",
      };
    }

    // Find and delete the member document
    const usersRef = collection(db, "users");
    const memberQuery_q = query(
      usersRef,
      where("uid", "==", memberId),
      where("familyId", "==", familyId)
    );
    const querySnapshot = await getDocs(memberQuery_q);

    if (querySnapshot.empty) {
      return {
        success: false,
        error: "Member not found",
      };
    }

    const memberDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, "users", memberDoc.id), {
      familyId: null, // Or delete the document entirely
    });

    return { success: true };
  } catch (error) {
    logError(error, "removeFamilyMember");
    return {
      success: false,
      error: "Failed to remove family member",
    };
  }
};

/**
 * Get user's family membership (re-exported from inviteService for convenience)
 */
export const getUserFamilyMembership = async (
  userId: string
): Promise<FamilyMember | null> => {
  try {
    const usersRef = collection(db, "users");
    const userMembershipQuery_q = query(usersRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(userMembershipQuery_q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    // Check if user has family membership
    if (!data.familyId || !data.role) {
      return null;
    }

    return {
      uid: data.uid,
      familyId: data.familyId,
      role: data.role,
      subscriptionType: data.subscriptionType,
      joinedAt: data.joinedAt ? data.joinedAt.toDate() : new Date(),
    };
  } catch (error) {
    logError(error, "getUserFamilyMembership");
    throw new InviteError(
      "Failed to fetch user family membership",
      INVITE_ERROR_CODES.NETWORK_ERROR
    );
  }
};
