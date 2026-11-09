/** First-launch onboarding flag (AsyncStorage). */
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "ve_onboarded";

export async function getOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEY, "1");
}
