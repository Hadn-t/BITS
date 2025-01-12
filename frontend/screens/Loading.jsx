import { SafeAreaView, StatusBar, Text, Animated, Image } from "react-native";
import React, { useEffect, useLayoutEffect } from "react";

export default function LoadingScreen({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const scale = new Animated.Value(1);
  const duration = 800;

  useEffect(() => {
    Animated.loop(
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
      ])
    ).start();
  }, [scale]);

  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StatusBar hidden />
      <Animated.Image
        source={{
          uri: "https://imgs.search.brave.com/LNaEGzGf7jFeYmtjkDN65939HQxh1o5FVZTjkfMiZ8g/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy9h/L2EzL0JTaWNvbl9I/T1NQSVRBTC5zdmc",
        }}
        style={{
          width: 100,
          height: 100,
          transform: [{ scale }],
        }}
      />
      <Text
        style={{
          fontSize: 20,
          marginTop: 30,
        }}
      >
        BITS APP NAME
      </Text>
    </SafeAreaView>
  );
}
