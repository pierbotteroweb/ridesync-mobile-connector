import cms from "@/mocks/cms.json";
import { useSensorStore } from "@/store/sensorStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Text } from "@react-navigation/elements";
import { StyleSheet, View } from "react-native";
import { useStore } from "zustand";

export function SensorsState() {
  let { speedSensorLabel, cadenceSensorLabel, heartRateSensorLabel } =
    cms.sensors;

  const speed = useStore(useSensorStore, (state) => state.speed);
  const cadence = useStore(useSensorStore, (state) => state.cadence);
  const heartRate = useStore(useSensorStore, (state) => state.heartrate);

  return (
    <View style={styles.flexContainer}>
      <View style={styles.subContainerOne}>
        {speed ? (
          <AntDesign name="link" size={48} color="orange" />
        ) : (
          <AntDesign name="disconnect" size={48} color="red" />
        )}
        <Text style={styles.label}>{speedSensorLabel}</Text>
      </View>
      <View style={styles.subContainerOne}>
        {cadence ? (
          <AntDesign name="link" size={48} color="orange" />
        ) : (
          <AntDesign name="disconnect" size={48} color="red" />
        )}
        <Text style={styles.label}>{cadenceSensorLabel}</Text>
      </View>
      <View style={styles.subContainerOne}>
        {heartRate ? (
          <AntDesign name="link" size={48} color="orange" />
        ) : (
          <AntDesign name="disconnect" size={48} color="red" />
        )}
        <Text style={styles.label}>{heartRateSensorLabel}</Text>
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
