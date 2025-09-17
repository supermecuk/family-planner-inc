"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { View, Text } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { Button, Spinner } from "@repo/ui";
import { CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";
import {
  getInviteByCode,
  acceptInvite,
  validateInvite,
} from "@/lib/inviteService";
import { signInWithGoogle, getCurrentUser } from "@/lib/auth";
import { Invite } from "@/types/invite";

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  const inviteCode = searchParams.get("code");

  useEffect(() => {
    const checkAuthAndInvite = async () => {
      if (!inviteCode) {
        setError("Invalid invite link");
        setLoading(false);
        return;
      }

      try {
        // Check if user is authenticated
        const currentUser = getCurrentUser();
        setUser(currentUser);

        // Fetch invite details
        const inviteData = await getInviteByCode(inviteCode);
        if (!inviteData) {
          setError("Invalid invite code");
          setLoading(false);
          return;
        }

        setInvite(inviteData);

        // If user is authenticated, validate the invite
        if (currentUser) {
          const validation = validateInvite(inviteData);
          if (!validation.valid) {
            setError(validation.error || "Invalid invite");
          }
        }
      } catch (err) {
        setError("Failed to load invite details");
        console.error("Error checking invite:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndInvite();
  }, [inviteCode]);

  const handleSignIn = async () => {
    try {
      setProcessing(true);
      await signInWithGoogle();
      // The auth state change will trigger a re-render
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error("Sign in error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!invite || !user) return;

    try {
      setProcessing(true);
      const result = await acceptInvite(inviteCode!, user.uid, user.email);

      if (result.success) {
        setSuccess(true);
        // Redirect to family dashboard after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(result.error || "Failed to accept invite");
      }
    } catch (err) {
      setError("Failed to accept invite. Please try again.");
      console.error("Accept invite error:", err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$4"
      >
        <Spinner size="large" color="$blue10" />
        <Text marginTop="$4" fontSize="$4" color="$color11">
          Loading invite details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$4"
      >
        <YStack alignItems="center" space="$4" maxWidth={400}>
          <XCircle size={48} color="$red10" />
          <Text
            fontSize="$6"
            fontWeight="bold"
            color="$color12"
            textAlign="center"
          >
            Invalid Invite
          </Text>
          <Text fontSize="$4" color="$color11" textAlign="center">
            {error}
          </Text>
          <Button onPress={() => router.push("/")} variant="outlined">
            Go Home
          </Button>
        </YStack>
      </View>
    );
  }

  if (success) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$4"
      >
        <YStack alignItems="center" space="$4" maxWidth={400}>
          <CheckCircle size={48} color="$green10" />
          <Text
            fontSize="$6"
            fontWeight="bold"
            color="$color12"
            textAlign="center"
          >
            Welcome to the Family!
          </Text>
          <Text fontSize="$4" color="$color11" textAlign="center">
            You have successfully joined the family. Redirecting to dashboard...
          </Text>
          <Spinner size="small" color="$blue10" />
        </YStack>
      </View>
    );
  }

  if (!invite) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$4"
      >
        <YStack alignItems="center" space="$4" maxWidth={400}>
          <AlertCircle size={48} color="$orange10" />
          <Text
            fontSize="$6"
            fontWeight="bold"
            color="$color12"
            textAlign="center"
          >
            Invite Not Found
          </Text>
          <Text fontSize="$4" color="$color11" textAlign="center">
            The invite link you clicked is invalid or has expired.
          </Text>
          <Button onPress={() => router.push("/")} variant="outlined">
            Go Home
          </Button>
        </YStack>
      </View>
    );
  }

  return (
    <View
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$background"
      padding="$4"
    >
      <YStack alignItems="center" space="$4" maxWidth={400}>
        <Users size={48} color="$blue10" />
        <Text
          fontSize="$6"
          fontWeight="bold"
          color="$color12"
          textAlign="center"
        >
          Family Invitation
        </Text>

        <YStack space="$2" alignItems="center">
          <Text fontSize="$4" color="$color11" textAlign="center">
            You've been invited to join a family with the role:
          </Text>
          <Text
            fontSize="$5"
            fontWeight="bold"
            color="$blue10"
            textAlign="center"
          >
            {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
          </Text>
        </YStack>

        <YStack
          space="$2"
          alignItems="center"
          backgroundColor="$gray2"
          padding="$3"
          borderRadius="$4"
        >
          <Text fontSize="$3" color="$color10" textAlign="center">
            Invite expires: {invite.expiresAt.toLocaleDateString()}
          </Text>
          {invite.email && (
            <Text fontSize="$3" color="$color10" textAlign="center">
              Email: {invite.email}
            </Text>
          )}
        </YStack>

        {!user ? (
          <YStack space="$3" alignItems="center">
            <Text fontSize="$4" color="$color11" textAlign="center">
              Please sign in to accept this invitation
            </Text>
            <Button
              onPress={handleSignIn}
              disabled={processing}
              backgroundColor="$blue10"
              color="white"
            >
              {processing ? (
                <XStack alignItems="center" space="$2">
                  <Spinner size="small" color="white" />
                  <Text color="white">Signing in...</Text>
                </XStack>
              ) : (
                "Sign in with Google"
              )}
            </Button>
          </YStack>
        ) : (
          <YStack space="$3" alignItems="center">
            <Text fontSize="$4" color="$color11" textAlign="center">
              Welcome, {user.displayName || user.email}!
            </Text>
            <Button
              onPress={handleAcceptInvite}
              disabled={processing}
              backgroundColor="$green10"
              color="white"
            >
              {processing ? (
                <XStack alignItems="center" space="$2">
                  <Spinner size="small" color="white" />
                  <Text color="white">Joining family...</Text>
                </XStack>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </YStack>
        )}

        <Button onPress={() => router.push("/")} variant="outlined">
          Cancel
        </Button>
      </YStack>
    </View>
  );
}
