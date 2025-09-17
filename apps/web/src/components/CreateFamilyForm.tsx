"use client";

import { useState } from "react";
import { View, Text } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { Button, Input, Spinner } from "@repo/ui";
import { Users, Home } from "lucide-react";
import { createFamily } from "@/lib/familyService";
import { getCurrentUser } from "@/lib/auth";

interface CreateFamilyFormProps {
  onFamilyCreated: (familyId: string) => void;
  onCancel: () => void;
}

export function CreateFamilyForm({
  onFamilyCreated,
  onCancel,
}: CreateFamilyFormProps) {
  const [familyName, setFamilyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      setError("Please enter a family name");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError("You must be signed in to create a family");
        return;
      }

      console.log("Creating family with:", {
        familyName: familyName.trim(),
        ownerId: currentUser.uid,
        userEmail: currentUser.email,
      });

      const result = await createFamily(familyName.trim(), currentUser.uid);

      console.log("Family creation result:", result);

      if (result.success) {
        onFamilyCreated(result.family.id);
      } else {
        setError(result.error || "Failed to create family");
      }
    } catch (err) {
      console.error("Error creating family:", err);
      setError("Failed to create family. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <View
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$background"
      padding="$4"
    >
      <YStack alignItems="center" space="$4" maxWidth={400}>
        <Home size={48} color="$blue10" />
        <Text
          fontSize="$6"
          fontWeight="bold"
          color="$color12"
          textAlign="center"
        >
          Create Your Family
        </Text>

        <Text fontSize="$4" color="$color11" textAlign="center">
          Set up your family workspace to start managing tasks together
        </Text>

        {error && (
          <View
            backgroundColor="$red2"
            padding="$3"
            borderRadius="$4"
            width="100%"
          >
            <Text color="$red10" fontSize="$3" textAlign="center">
              {error}
            </Text>
          </View>
        )}

        <YStack space="$3" width="100%">
          <YStack space="$2">
            <Text fontSize="$3" color="$color11">
              Family Name
            </Text>
            <input
              type="text"
              placeholder="Enter your family name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              autoFocus
              style={{
                padding: "12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "16px",
                width: "100%",
                backgroundColor: "white",
              }}
            />
          </YStack>

          <XStack space="$2">
            <Button
              onPress={handleCreateFamily}
              disabled={creating || !familyName.trim()}
              backgroundColor="$blue10"
              color="white"
              flex={1}
            >
              {creating ? (
                <XStack alignItems="center" space="$2">
                  <Spinner size="small" color="white" />
                  <Text color="white">Creating...</Text>
                </XStack>
              ) : (
                "Create Family"
              )}
            </Button>
            <Button onPress={onCancel} variant="outlined">
              Cancel
            </Button>
          </XStack>
        </YStack>

        <YStack
          space="$2"
          alignItems="center"
          backgroundColor="$gray2"
          padding="$3"
          borderRadius="$4"
          width="100%"
        >
          <Users size={20} color="$gray10" />
          <Text fontSize="$3" color="$color10" textAlign="center">
            You can invite family members after creating your family
          </Text>
        </YStack>
      </YStack>
    </View>
  );
}
