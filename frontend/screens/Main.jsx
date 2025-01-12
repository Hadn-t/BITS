import { StyleSheet, Text, View } from "react-native";
import React, { useLayoutEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DetailsScreen from "./Details";
import DocumentScreen from "./Document";
import ProfileScreen from "./Profile";
import HospitalScreen from "./Hospital";
import HomeScreen from "./Home";

const Tab = createBottomTabNavigator();
const MainStack = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  });
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Hospital" component={HospitalScreen} />
      <Tab.Screen name="Document" component={DocumentScreen} />
      <Tab.Screen name="Details" component={DetailsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />


    </Tab.Navigator>
  );
};

export default MainStack;
