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
import { Invite, InviteFormData } from "@/types/invite";
import { FamilyMember } from "@repo/shared/types/user";
import { InviteError, INVITE_ERROR_CODES, logError } from "./errorHandling";

/**
 * Generate a unique UUID for invite codes
 */
export const generateInviteCode = (): string => {
  return crypto.randomUUID();
};

/**
 * Create a new invite
 */
export const createInvite = async (
  familyId: string,
  inviteData: InviteFormData,
  createdBy: string
): Promise<{ invite: Invite; joinLink: string }> => {
  try {
    const code = generateInviteCode();
    const expiresInDays = inviteData.expiresInDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const inviteDoc = {
      familyId,
      email: inviteData.email || null,
      role: inviteData.role,
      status: "pending" as const,
      code,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      createdBy,
    };

    const docRef = await addDoc(collection(db, "invites"), inviteDoc);

    const invite: Invite = {
      id: docRef.id,
      familyId,
      email: inviteData.email,
      role: inviteData.role,
      status: "pending",
      code,
      expiresAt,
      createdAt: new Date(),
      createdBy,
    };

    const joinLink = `${window.location.origin}/invite?code=${code}`;

    return { invite, joinLink };
  } catch (error) {
    logError(error, "createInvite");
    throw new InviteError(
      "Failed to create invite",
      INVITE_ERROR_CODES.UNKNOWN_ERROR
    );
  }
};

/**
 * Get invite by code
 */
export const getInviteByCode = async (code: string): Promise<Invite | null> => {
  try {
    const invitesRef = collection(db, "invites");
    const inviteQuery_q = query(invitesRef, where("code", "==", code));
    const querySnapshot = await getDocs(inviteQuery_q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      familyId: data.familyId,
      email: data.email,
      role: data.role,
      status: data.status,
      code: data.code,
      expiresAt: data.expiresAt.toDate(),
      createdAt: data.createdAt.toDate(),
      createdBy: data.createdBy,
    };
  } catch (error) {
    logError(error, "getInviteByCode");
    throw new InviteError(
      "Failed to fetch invite",
      INVITE_ERROR_CODES.NETWORK_ERROR
    );
  }
};

/**
 * Validate invite (check if it's valid and not expired)
 */
export const validateInvite = (
  invite: Invite
): { valid: boolean; error?: string; code?: string } => {
  if (invite.status !== "pending") {
    return {
      valid: false,
      error: "Invite has already been used or expired",
      code: INVITE_ERROR_CODES.ALREADY_USED,
    };
  }

  if (invite.expiresAt < new Date()) {
    return {
      valid: false,
      error: "Invite has expired",
      code: INVITE_ERROR_CODES.EXPIRED,
    };
  }

  return { valid: true };
};

/**
 * Accept invite and add user to family
 */
export const acceptInvite = async (
  inviteCode: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const invite = await getInviteByCode(inviteCode);

    if (!invite) {
      return {
        success: false,
        error: "Invalid invite code",
        code: INVITE_ERROR_CODES.INVALID_CODE,
      };
    }

    const validation = validateInvite(invite);
    if (!validation.valid) {
      return { success: false, error: validation.error, code: validation.code };
    }

    // Check if user is already a member of this family
    const familyMembersRef = collection(db, "users");
    const existingMemberQuery_q = query(
      familyMembersRef,
      where("uid", "==", userId),
      where("familyId", "==", invite.familyId)
    );
    const existingMemberQuery = await getDocs(existingMemberQuery_q);

    if (!existingMemberQuery.empty) {
      return {
        success: false,
        error: "You are already a member of this family",
        code: INVITE_ERROR_CODES.ALREADY_MEMBER,
      };
    }

    // Update the user's document to add family membership
    const usersRef = collection(db, "users");
    const userQuery_q = query(usersRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(userQuery_q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        familyId: invite.familyId,
        role: invite.role,
        subscriptionType: "base",
        joinedAt: serverTimestamp(),
      });
      console.log("Updated user document with family membership");
    } else {
      console.error(
        "User document not found - this shouldn't happen after sign-in"
      );
      return {
        success: false,
        error: "User document not found",
        code: INVITE_ERROR_CODES.USER_NOT_FOUND,
      };
    }

    // Update invite status
    const inviteRef = doc(db, "invites", invite.id);
    await updateDoc(inviteRef, {
      status: "accepted",
    });

    return { success: true };
  } catch (error) {
    logError(error, "acceptInvite");
    return {
      success: false,
      error: "Failed to accept invite",
      code: INVITE_ERROR_CODES.UNKNOWN_ERROR,
    };
  }
};

/**
 * Get all invites for a family (for family owners/editors to manage)
 */
export const getFamilyInvites = async (familyId: string): Promise<Invite[]> => {
  try {
    const invitesRef = collection(db, "invites");
    const familyInvitesQuery_q = query(
      invitesRef,
      where("familyId", "==", familyId)
    );
    const querySnapshot = await getDocs(familyInvitesQuery_q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        familyId: data.familyId,
        email: data.email,
        role: data.role,
        status: data.status,
        code: data.code,
        expiresAt: data.expiresAt.toDate(),
        createdAt: data.createdAt.toDate(),
        createdBy: data.createdBy,
      };
    });
  } catch (error) {
    logError(error, "getFamilyInvites");
    throw new InviteError(
      "Failed to fetch family invites",
      INVITE_ERROR_CODES.NETWORK_ERROR
    );
  }
};

/**
 * Revoke an invite
 */
export const revokeInvite = async (inviteId: string): Promise<void> => {
  try {
    const inviteRef = doc(db, "invites", inviteId);
    await updateDoc(inviteRef, {
      status: "expired",
    });
  } catch (error) {
    logError(error, "revokeInvite");
    throw new InviteError(
      "Failed to revoke invite",
      INVITE_ERROR_CODES.UNKNOWN_ERROR
    );
  }
};

/**
 * Get user's family membership
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
