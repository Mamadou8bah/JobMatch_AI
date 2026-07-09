import { Tabs } from "expo-router";
import StitchTabBar from "../../components/StitchTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <StitchTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="coach" options={{ title: "AI Bot" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="applications" options={{ href: null }} />
    </Tabs>
  );
}
