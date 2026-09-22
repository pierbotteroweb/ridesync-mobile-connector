import { MainData } from "@/components/home/mainData";
import { SensorsState } from "@/components/home/sensorsState";
import { useRideTimer } from "@/hooks/useRideTimer";
import { StyleSheet, View } from "react-native";
import { Controls } from "../components/home/controls";
import { SpeedData } from "../components/home/speedData";

export default function HomeScreen() {
  useRideTimer();

  return (
    <View style={styles.container}>
      <View>
        <MainData />
      </View>
      <View>
        <SpeedData />
      </View>
      <View>
        <SensorsState />
      </View>
      <View>
        <Controls />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    display: "flex",
    height: "100%",
    alignItems: "stretch",
    backgroundColor: "black",
    paddingTop: 30,
  },
});
