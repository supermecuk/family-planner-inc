import { View, Text, Button } from "@tamagui/core";

export function TamaguiTest() {
  return (
    <View padding="$4" backgroundColor="$background" borderRadius="$4">
      <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
        Tamagui is working! 🎉
      </Text>
      <Button
        backgroundColor="$blue10"
        color="white"
        padding="$3"
        borderRadius="$3"
        onPress={() => alert("Button clicked!")}
      >
        Test Button
      </Button>
    </View>
  );
}
