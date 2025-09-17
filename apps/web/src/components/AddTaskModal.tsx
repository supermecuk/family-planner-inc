import { useState } from "react";
import { Text } from "@tamagui/core";
import { Button, Form, Input, TextArea } from "@repo/ui";
import { XStack, YStack } from "@tamagui/stacks";
import { Sheet } from "@tamagui/sheet";
import { Select } from "@tamagui/select";
import { Adapt } from "@tamagui/adapt";
import { X, Plus } from "lucide-react";
import { TaskFormData } from "@/types/task";

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskData: TaskFormData) => Promise<void>;
  loading?: boolean;
}

const ASSIGNEE_COLORS = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#84CC16", label: "Lime" },
];

const FAMILY_MEMBERS = ["Mom", "Dad", "Alice", "Bob", "Charlie"];

export function AddTaskModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: AddTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    assigneeId: "",
    assigneeColor: ASSIGNEE_COLORS[0].value,
    deadline: "",
  });

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.assigneeId || !formData.deadline) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: "",
        description: "",
        assigneeId: "",
        assigneeColor: ASSIGNEE_COLORS[0].value,
        deadline: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error Submitting Task:", error);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      // Test comment to check git tracking
      modal={true}
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85, 50, 25]}
      dismissOnSnapToBottom
      position={0}
      zIndex={100_000}
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame
        padding="$4"
        justifyContent="flex-start"
        alignItems="stretch"
        space="$5"
        backgroundColor="$background"
      >
        <Adapt when="sm" platform="touch">
          <Sheet.ScrollView>
            <Adapt.Contents />
          </Sheet.ScrollView>
        </Adapt>

        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Add New Task
          </Text>
          <Button
            size="$3"
            circular
            icon={X}
            backgroundColor="$gray5"
            borderColor="$gray7"
            onPress={() => onOpenChange(false)}
          />
        </XStack>

        {/* Form */}
        <Form onSubmit={handleSubmit}>
          <YStack space="$4" flex={1}>
            {/* Title */}
            <YStack space="$2">
              <Text fontSize="$4" fontWeight="600" color="$color">
                Title *
              </Text>
              <Input
                size="$4"
                placeholder="Enter task title"
                value={formData.title}
                onChangeText={(text: string) =>
                  setFormData((prev: TaskFormData) => ({
                    ...prev,
                    title: text,
                  }))
                }
                borderRadius="$4"
                backgroundColor="$background"
                borderColor="$borderColor"
              />
            </YStack>

            {/* Description */}
            <YStack space="$2">
              <Text fontSize="$4" fontWeight="600" color="$color">
                Description
              </Text>
            </YStack>

            {/* Assignee */}
            <YStack space="$2">
              <Text fontSize="$4" fontWeight="600" color="$color">
                Assign to *
              </Text>
              <Select
                value={formData.assigneeId}
                onValueChange={(value: string) =>
                  setFormData((prev: TaskFormData) => ({
                    ...prev,
                    assigneeId: value,
                  }))
                }
              >
                <Select.Trigger
                  size="$4"
                  borderRadius="$4"
                  backgroundColor="$background"
                  borderColor="$borderColor"
                >
                  <Select.Value placeholder="Select family member" />
                </Select.Trigger>

                <Adapt when="sm" platform="touch">
                  <Select.Content zIndex={200000}>
                    <Select.Viewport>
                      <Select.Group>
                        {FAMILY_MEMBERS.map((member, i) => (
                          <Select.Item key={member} index={i} value={member}>
                            <Select.ItemText>{member}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Viewport>
                  </Select.Content>
                </Adapt>
              </Select>
            </YStack>

            {/* Color Selection */}
            <YStack space="$2">
              <Text fontSize="$4" fontWeight="600" color="$color">
                Color
              </Text>
              <XStack space="$2" flexWrap="wrap">
                {ASSIGNEE_COLORS.map((color) => (
                  <Button
                    key={color.value}
                    size="$3"
                    circular
                    backgroundColor={color.value}
                    borderColor={
                      formData.assigneeColor === color.value
                        ? "$color"
                        : "transparent"
                    }
                    borderWidth={formData.assigneeColor === color.value ? 3 : 0}
                    onPress={() =>
                      setFormData((prev: TaskFormData) => ({
                        ...prev,
                        assigneeColor: color.value,
                      }))
                    }
                    width={40}
                    height={40}
                  />
                ))}
              </XStack>
            </YStack>

            {/* Deadline */}
            <YStack space="$2">
              <Text fontSize="$4" fontWeight="600" color="$color">
                Deadline *
              </Text>
              <Input
                size="$4"
                placeholder="YYYY-MM-DD"
                value={formData.deadline}
                onChangeText={(text: string) =>
                  setFormData((prev: TaskFormData) => ({
                    ...prev,
                    deadline: text,
                  }))
                }
                borderRadius="$4"
                backgroundColor="$background"
                borderColor="$borderColor"
              />
              <Button
                size="$2"
                variant="outlined"
                onPress={() =>
                  setFormData((prev: TaskFormData) => ({
                    ...prev,
                    deadline: getTomorrowDate(),
                  }))
                }
                alignSelf="flex-start"
              >
                Set Tomorrow
              </Button>
            </YStack>

            {/* Submit Button */}
            <Form.Trigger asChild>
              <Button
                size="$5"
                backgroundColor="$blue10"
                color="white"
                borderRadius="$6"
                marginTop="$4"
                disabled={
                  loading ||
                  !formData.title.trim() ||
                  !formData.assigneeId ||
                  !formData.deadline
                }
                icon={loading ? undefined : Plus}
              >
                {loading ? "Creating..." : "Create Task"}
              </Button>
            </Form.Trigger>
          </YStack>
        </Form>
      </Sheet.Frame>
    </Sheet>
  );
}
