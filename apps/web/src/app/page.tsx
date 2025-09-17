"use client";

import { useState, useEffect } from "react";
import { View, Text } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { Button } from "@repo/ui";
import { Users, Calendar, ArrowRight } from "lucide-react";
import { getCurrentUser, signInWithGoogle } from "@/lib/auth";
import { getUserFamilyMembership } from "@/lib/inviteService";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
      // The auth state change will trigger a re-render
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoToDashboard = () => {
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
      >
        <Text fontSize="$4" color="$color11">
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      {/* Header */}
      <View backgroundColor="$blue10" padding="$6">
        <YStack alignItems="center" space="$4">
          <Users size={48} color="white" />
          <Text
            fontSize="$8"
            fontWeight="bold"
            color="white"
            textAlign="center"
          >
            Family Planner
          </Text>
          <Text fontSize="$4" color="white" textAlign="center" opacity={0.9}>
            Organize tasks and collaborate with your family
          </Text>
        </YStack>
      </View>

      {/* Main Content */}
      <View flex={1} padding="$6">
        <YStack space="$6" alignItems="center">
          {/* Features */}
          <YStack space="$4" alignItems="center" maxWidth={600}>
            <Text
              fontSize="$6"
              fontWeight="bold"
              color="$color12"
              textAlign="center"
            >
              Manage Your Family Tasks Together Forever
            </Text>

            <YStack space="$3" width="100%">
              <XStack space="$3" alignItems="center">
                <Calendar size={24} color="$blue10" />
                <Text fontSize="$4" color="$color11">
                  Create and assign tasks to family members
                </Text>
              </XStack>

              <XStack space="$3" alignItems="center">
                <Users size={24} color="$green10" />
                <Text fontSize="$4" color="$color11">
                  Invite family members with role-based permissions
                </Text>
              </XStack>

              <XStack space="$3" alignItems="center">
                <ArrowRight size={24} color="$orange10" />
                <Text fontSize="$4" color="$color11">
                  Track progress and approve completed tasks
                </Text>
              </XStack>
            </YStack>
          </YStack>

          {/* Auth Section */}
          <YStack space="$4" alignItems="center" maxWidth={400}>
            {!user ? (
              <>
                <Text
                  fontSize="$5"
                  fontWeight="bold"
                  color="$color12"
                  textAlign="center"
                >
                  Get Started
                </Text>
                <Text fontSize="$4" color="$color11" textAlign="center">
                  Sign in to create your family workspace or join an existing
                  family
                </Text>
                <Button
                  onPress={handleSignIn}
                  disabled={signingIn}
                  backgroundColor="$blue10"
                  color="white"
                  size="large"
                >
                  {signingIn ? "Signing in..." : "Sign in with Google"}
                </Button>
              </>
            ) : (
              <>
                <Text
                  fontSize="$5"
                  fontWeight="bold"
                  color="$color12"
                  textAlign="center"
                >
                  Welcome back!
                </Text>
                <Text fontSize="$4" color="$color11" textAlign="center">
                  {user.displayName || user.email}
                </Text>
                <Button
                  onPress={handleGoToDashboard}
                  backgroundColor="$green10"
                  color="white"
                  size="large"
                >
                  Go to Dashboard
                </Button>
              </>
            )}
          </YStack>

          {/* Info */}
          <YStack
            space="$2"
            alignItems="center"
            backgroundColor="$gray2"
            padding="$4"
            borderRadius="$4"
            maxWidth={500}
          >
            <Text fontSize="$3" color="$color10" textAlign="center">
              💡 Tip: Create a family first, then invite members using the
              invite system
            </Text>
          </YStack>
        </YStack>
      </View>
    </View>
  );
}
