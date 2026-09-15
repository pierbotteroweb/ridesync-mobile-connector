import cms from "@/mocks/cms.json";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, StyleSheet, View } from "react-native";

export function Controls() {
  let { start, pause, finish } = cms.controls;
  return (
    <View style={styles.flexContainer}>
      <Pressable style={styles.controlButton}>
        <Entypo name="controller-play" size={72} color="black" />
      </Pressable>
      <Pressable style={styles.controlButton}>
        <FontAwesome name="pause" size={52} color="black" />
      </Pressable>
      <Pressable style={styles.controlButton}>
        <MaterialCommunityIcons name="flag-checkered" size={52} color="black" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    paddingTop: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    textAlign: "center",
    marginTop: 20,
  },

  controlButton: {
    width: 100,
    height: 100,
    display: "flex",
    borderRadius: 50,
    verticalAlign: "middle",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 30,
    backgroundColor: "orange",
  },

  buttonText: {
    color: "black",
    fontSize: 20,
    fontWeight: 700,
  },
});
