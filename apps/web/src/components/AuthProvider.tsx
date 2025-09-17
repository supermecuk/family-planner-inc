"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  isMagicLink,
  signInWithMagicLink,
  getEmailForSignIn,
} from "@/lib/auth";
import { Text } from "@tamagui/core";
import { Button, Spinner } from "@repo/ui";
import { YStack, XStack } from "@tamagui/stacks";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Handle magic link authentication
    if (isMagicLink()) {
      const email = getEmailForSignIn();
      if (email) {
        signInWithMagicLink(email)
          .then(() => {
            // Redirect to home page after successful sign in
            window.location.href = "/";
          })
          .catch((error) => {
            console.error("Magic link sign in failed:", error);
            setLoading(false);
          });
      }
    }
  }, []);

  if (loading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <YStack alignItems="center" space="$4">
          <Spinner size="large" color="$blue10" />
          <Text color="$gray11">Loading...</Text>
        </YStack>
      </YStack>
    );
  }

  if (!user) {
    return <SignInForm />;
  }

  return (
    <YStack flex={1} minHeight="100vh">
      <XStack
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        paddingHorizontal="$4"
        paddingVertical="$3"
        justifyContent="space-between"
        alignItems="center"
        minHeight={64}
      >
        <Text fontSize="$6" fontWeight="600">
          Family Planner
        </Text>
        <XStack alignItems="center" space="$3">
          <Text fontSize="$3" color="$gray11">
            {user.displayName || user.email}
          </Text>
          <Button size="$3" variant="outlined" onPress={signOutUser}>
            Sign Out
          </Button>
        </XStack>
      </XStack>
      {children}
    </YStack>
  );
}

function SignInForm() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      padding="$4"
    >
      <YStack maxWidth={400} width="100%" alignItems="center" space="$6">
        <YStack alignItems="center" space="$2">
          <Text fontSize="$8" fontWeight="700">
            Family Planner
          </Text>
          <Text fontSize="$4" color="$gray11" textAlign="center">
            Sign in to continue
          </Text>
        </YStack>

        <Button
          size="$5"
          width="100%"
          backgroundColor="$white1"
          borderColor="$gray7"
          borderWidth={1}
          color="$gray12"
          disabled={loading}
          onPress={handleGoogleSignIn}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
      </YStack>
    </YStack>
  );
}
