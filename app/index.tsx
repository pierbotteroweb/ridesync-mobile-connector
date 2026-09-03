import { useFonts } from "expo-font";
import { StyleSheet, Text, View } from "react-native";
import { Controls } from "./controls";
import { SpeedData } from "./speedData";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Orbitron: require("../assets/fonts/Orbitron.ttf"),
  });
  return (
    <View style={styles.container}>
      <View style={styles.flexContainerVertical}>
        <Text style={[styles.text, styles.time]}>00:35:00</Text>
        <Text style={[styles.text, styles.speed]}>15,06</Text>
        <Text style={[styles.text, styles.label]}>Speed (km/h)</Text>
        <View style={styles.flexContainer}>
          <View style={styles.subContainerOne}>
            <Text style={[styles.text, styles.dataText]}>12,00</Text>
            <Text style={[styles.text, styles.label]}>Distance (km)</Text>
          </View>
          <View style={styles.subContainerOne}>
            <Text style={[styles.text, styles.dataText]}>102</Text>
            <Text style={[styles.text, styles.label]}>Heart Rate (bpm)</Text>
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
