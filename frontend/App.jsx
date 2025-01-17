import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, getAuth } from 'firebase/auth';  // Import auth functions
import { doc, getDoc, getFirestore } from "firebase/firestore";  // Import Firestore functions
import LoadingScreen from "./screens/Loading";
import MainStack from "./screens/Main";
import Authentication from "./screens/Authentication";
import NotificationDetail from "./screens/NotificationDetail";
import Notifications from "./screens/Notification";
import { auth } from "./firbaseConfig";  // Your Firebase configuration

const Stack = createNativeStackNavigator();

export default function App() {
  const [initial, setInitial] = useState(false);
  const [authStatus, setAuthStatus] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    // This will be triggered when auth status changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, get the role from Firestore
        try {
          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);  // Assuming user data is stored in 'users' collection
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);  // Get role from Firestore
          }
          setAuthStatus(true);  // Set authStatus to true if user is logged in
        } catch (error) {
          console.error("Error fetching role:", error);
          setAuthStatus(false);  // In case of error, treat as not authenticated
        }
      } else {
        setAuthStatus(false);  // User is not logged in
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Set initial state to true after 3 seconds (to show the splash or loading screen)
    const timer = setTimeout(() => {
      setInitial(true);
    }, 3000);
    
    return () => clearTimeout(timer); // Clean up timeout if the component unmounts
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!initial ? (
          // Show loading screen while the app is checking the auth status
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : !authStatus ? (
          // If not authenticated, show Authentication screen
          <Stack.Screen
            name="Auth"
            children={(props) => (
              <Authentication {...props} setAuth={setAuthStatus} setRole={setRole} />
            )}
          />
        ) : (
          // If authenticated, show Main stack directly
          <Stack.Screen name="Main">
            {({ navigation, route }) => (
              <MainStack {...{ navigation, route }} role={role} setAuth={setAuthStatus} />
            )}
          </Stack.Screen>
        )}
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
