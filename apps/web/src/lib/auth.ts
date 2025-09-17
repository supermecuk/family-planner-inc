import {
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { createOrUpdateUserDocument } from "./userService";
import { checkPendingInvitations } from "./emailService";

// Configuration for magic link authentication
const actionCodeSettings = {
  // URL you want to redirect back to after clicking the magic link
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
  // This must be true for magic link to work
  handleCodeInApp: true,
};

/**
 * Send magic link to user's email
 */
export const sendMagicLink = async (email: string): Promise<void> => {
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save the email to localStorage for verification
    if (typeof window !== "undefined") {
      localStorage.setItem("emailForSignIn", email);
    }
  } catch (error) {
    console.error("Error sending magic link:", error);
    throw error;
  }
};

/**
 * Sign in with magic link
 */
export const signInWithMagicLink = async (email: string): Promise<User> => {
  try {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error("Invalid magic link");
    }

    const result = await signInWithEmailLink(auth, email, window.location.href);

    // Clear the email from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("emailForSignIn");
    }

    // Automatically create/update user document in Firestore
    await createOrUpdateUserDocument(result.user);

    return result.user;
  } catch (error) {
    console.error("Error signing in with magic link:", error);
    throw error;
  }
};

/**
 * Sign in with Google popup
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // Automatically create/update user document in Firestore
    await createOrUpdateUserDocument(result.user);

    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes with automatic user document creation
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in, ensure their document exists in Firestore
      try {
        await createOrUpdateUserDocument(user);

        // Check for pending invitations
        if (user.email) {
          const invitationCheck = await checkPendingInvitations(user.email);
          if (invitationCheck.hasInvitations) {
            console.log(
              `Found ${invitationCheck.invitations.length} pending invitations for ${user.email}`
            );
            // You could dispatch an event or show a notification here
            // For now, we'll just log it
            invitationCheck.invitations.forEach((invite) => {
              console.log(
                `- Invitation to ${invite.familyName} as ${invite.role}`
              );
            });
          }
        }
      } catch (error) {
        console.error(
          "Error creating/updating user document on auth state change:",
          error
        );
        // Don't break the auth flow if document creation fails
      }
    }

    // Call the original callback
    callback(user);
  });
};

/**
 * Check if current URL is a magic link
 */
export const isMagicLink = (): boolean => {
  if (typeof window === "undefined") return false;
  return isSignInWithEmailLink(auth, window.location.href);
};

/**
 * Get email from localStorage for magic link verification
 */
export const getEmailForSignIn = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("emailForSignIn");
};
