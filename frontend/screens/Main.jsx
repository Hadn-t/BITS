import React, { useLayoutEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHome, faHospital, faFileAlt, faCalendar, faUsers, faCommentDots, faDashboard, faUser } from "@fortawesome/free-solid-svg-icons";

import DashboardScreen from "./Dashboard";
import ClientAppointmentScreen from "./ClientAppointment";
import AppointmentScreen from "./Appointment";
import PatientsScreen from "./Patients";
import MessagesScreen from "./Messages";
import HomeScreen from "./Home";
import NearbyHospitalsScreen from "./NearbyHospitals";
import HealthRecordsScreen from "./HealthRecords";
import ProfileScreen from "./Profile";

const Tab = createBottomTabNavigator();

const MainStack = ({ navigation, role, setAuth }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#202020",
        tabBarInactiveTintColor: "#888",
        tabBarShowLabel: false,
      }}
    >
      {role === 'client' ? (
        <>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesomeIcon icon={faHome} size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Nearby Hospitals"
            component={NearbyHospitalsScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesomeIcon icon={faHospital} size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="ClientAppointments"
            component={ClientAppointmentScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesomeIcon icon={faCalendar} size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Messages"
            component={MessagesScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesomeIcon icon={faCommentDots} size={size} color={color} />
              ),
            }}
          />
        </>
      ) : role === 'doctor' ? (
        <>
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesomeIcon icon={faDashboard} size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Appointments"
            component={AppointmentScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesomeIcon icon={faCalendar} size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Patients"
            component={PatientsScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesomeIcon icon={faUsers} size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Messages"
            component={MessagesScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <FontAwesomeIcon icon={faCommentDots} size={size} color={color} />
              ),
            }}
          />
        </>
      ) : null}

      <Tab.Screen
        name="Profile"
        children={(props) => <ProfileScreen {...props} setAuth={setAuth} />}
        initialParams={{ role }}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesomeIcon icon={faUser} size={size} color={color} />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

export default MainStack;