//App.jsx

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import LoadingScreen from "./screens/Loading";
import MainStack from "./screens/Main";
import Authentication from "./screens/Authentication";
import NotificationDetail from "./screens/NotificationDetail";
import Notifications from "./screens/Notification";
import { auth } from "./firebaseConfig";
import CategoryDetails from "./screens/CategoryDetails";
import EditProfileScreen from "./screens/editProfileScreen";
import Reference from "./screens/Reference";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initial, setInitial] = useState(false);
  const [authStatus, setAuthStatus] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
          }
          setAuthStatus(true);
        } catch (error) {
          console.error("Error fetching role:", error);
          setAuthStatus(false);
        }
      } else {
        setAuthStatus(false);
      }
    });


    return () => unsubscribe();
  }, []);

  useEffect(() => {

    const timer = setTimeout(() => {
      setInitial(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!initial ? (

          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : !authStatus ? (

          <Stack.Screen
            name="Auth"
            children={(props) => (
              <Authentication {...props} setAuth={setAuthStatus} setRole={setRole} />
            )}
          />
        ) : (

          <Stack.Screen name="Main">
            {({ navigation, route }) => (
              <MainStack {...{ navigation, route }} role={role} setAuth={setAuthStatus} />
            )}
          </Stack.Screen>
        )}
        <Stack.Screen
          name="Notifications"
          component={Notifications}
        />
        <Stack.Screen
          name="NotificationDetail"
          component={NotificationDetail}
        />
        <Stack.Screen
          name='EditProfile'
          component={EditProfileScreen}
        />
        <Stack.Screen
          name='CategoryDetails'
          component={CategoryDetails}
        />
        <Stack.Screen
        name='Refer'
        component={Reference}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}