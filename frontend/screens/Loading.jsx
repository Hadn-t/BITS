import { SafeAreaView, StatusBar, Text, Animated, StyleSheet } from "react-native";
import React, { useEffect, useLayoutEffect } from "react";

export default function LoadingScreen({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const scale = new Animated.Value(1);
  const opacity = new Animated.Value(0);
  const duration = 500;

  useEffect(() => {
    // Run scaling and opacity animations
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scale, opacity]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <Animated.Image
        source={require("../assets/images/Logo.png")}
        style={[
          styles.logo,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
      <Text style={styles.text}></Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#4A8B94",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 22,
    marginTop: 30,
    fontWeight: "bold",
    color: "#333",
  },
});
