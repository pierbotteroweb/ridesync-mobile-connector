import cms from "@/mocks/cms.json";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export function SensorsState() {
  let { speedSensorLabel, cadenceSensorLabel, heartBeatSensorLabel } =
    cms.sensors;

  const [sensorState, setSensorState] = useState({
    speed: false,
    cadence: false,
    heartBeat: true,
  });

  return (
    <View style={styles.flexContainer}>
      <View style={styles.subContainerOne}>
        {sensorState.speed ? (
          <AntDesign name="link" size={48} color="orange" />
        ) : (
          <AntDesign name="disconnect" size={48} color="red" />
        )}
        <Text style={styles.label}>{speedSensorLabel}</Text>
      </View>
      <View style={styles.subContainerOne}>
        {sensorState.cadence ? (
          <AntDesign name="link" size={48} color="orange" />
        ) : (
          <AntDesign name="disconnect" size={48} color="red" />
        )}
        <Text style={styles.label}>{cadenceSensorLabel}</Text>
      </View>
      <View style={styles.subContainerOne}>
        {sensorState.heartBeat ? (
          <AntDesign name="link" size={48} color="orange" />
        ) : (
          <AntDesign name="disconnect" size={48} color="red" />
        )}
        <Text style={styles.label}>{heartBeatSensorLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  label: {
    textAlign: "center",
    color: "orange",
    fontSize: 20,
  },
  subContainerOne: {
    width: 130,
    alignItems: "center",
    marginTop: 40,
  },
});
