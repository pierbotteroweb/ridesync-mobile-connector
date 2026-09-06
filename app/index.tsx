import cms from "@/mocks/cms.json";
import { useFonts } from "expo-font";
import { StyleSheet, Text, View } from "react-native";
import { Controls } from "../components/home/controls";
import { SpeedData } from "../components/home/speedData";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Orbitron: require("../assets/fonts/Orbitron.ttf"),
  });
  const homeCms = cms.home;

  function formatTime(totalSeconds: number): string {
    if (!totalSeconds) {
      return "99:99:99";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }
  return (
    <View style={styles.container}>
      <View style={styles.flexContainerVertical}>
        <Text style={[styles.text, styles.time]}>{formatTime(2486)}</Text>
        <Text style={[styles.text, styles.speed]}>{homeCms.speed}</Text>
        <Text style={[styles.text, styles.label]}>{homeCms.sleepLabel}</Text>
        <View style={styles.flexContainer}>
          <View style={styles.subContainerOne}>
            <Text style={[styles.text, styles.dataText]}>
              {homeCms.distance}
            </Text>
            <Text style={[styles.text, styles.label]}>
              {homeCms.distanceLabel}
            </Text>
          </View>
          <View style={styles.subContainerOne}>
            <Text style={[styles.text, styles.dataText]}>{homeCms.heart}</Text>
            <Text style={[styles.text, styles.label]}>
              {homeCms.heartLabel}
            </Text>
          </View>
        </View>
        <SpeedData />
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

  text: {
    textAlign: "center",
    color: "orange",
    fontSize: 30,
  },

  title: {
    fontWeight: "bold",
  },

  time: {
    fontSize: 70,
    fontFamily: "Orbitron",
  },

  speed: {
    fontSize: 120,
    lineHeight: 180,
    fontFamily: "Orbitron",
    transform: [{ scaleY: 1.5 }],
  },

  label: {
    fontSize: 20,
    lineHeight: 20,
  },
  flexContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    textAlign: "center",
  },
  flexContainerVertical: {
    display: "flex",
    justifyContent: "flex-end",
  },

  subContainerOne: {
    alignItems: "center",
    marginTop: 20,
  },

  dataText: {
    fontSize: 60,
    lineHeight: 60,
    fontFamily: "Orbitron",
  },
});
