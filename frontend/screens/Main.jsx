import { StyleSheet, Text, View } from "react-native";
import React, { useLayoutEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "./Dashboard"; // Assuming you have this component
import AppointmentScreen from "./Appointment"; // Assuming you have this component
import PatientsScreen from "./Patients"; // Assuming you have this component
import MessagesScreen from "./Messages"; // Assuming you have this component
import HomeScreen from "./Home";
import NearbyHospitalsScreen from "./NearbyHospitals"; // Assuming you have this component
import HealthRecordsScreen from "./HealthRecords"; // Assuming you have this component
import ProfileScreen from "./Profile";

const Tab = createBottomTabNavigator();

const MainStack = ({ navigation, role }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  });

  return (
    <Tab.Navigator>

      {role === 'client' ? (
        <>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Nearby Hospitals" component={NearbyHospitalsScreen} />
          <Tab.Screen name="Health Records" component={HealthRecordsScreen} />
          <Tab.Screen name="Appointments" component={AppointmentScreen} />
        </>
      ) : role === 'doctor' ? (
        <>
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Appointments" component={AppointmentScreen} />
          <Tab.Screen name="Patients" component={PatientsScreen} />
          <Tab.Screen name="Messages" component={MessagesScreen} />
        </>
      ):null} 
      
    </Tab.Navigator>
  );
};

export default MainStack;
