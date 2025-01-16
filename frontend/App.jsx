import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoadingScreen from "./screens/Loading";
import MainStack from "./screens/Main";
import Authentication from "./screens/Authentication";

import "./core/fontawesome";
import NotificationDetail from "./screens/NotificationDetail";
import Notifications from "./screens/Notification";


const Stack = createNativeStackNavigator();

export default function App() {
  const [initial, setInitial] = useState(true);
  const [auth, setAuth] = useState(true);
  const [role, setRole] = useState('client');

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
        ) : !auth ? (
          <Stack.Screen
            name="Auth"
            children={(props) => (
              <Authentication {...props} setAuth={setAuth} setRole={setRole} />
            )}
          />
        ) : (
          <Stack.Screen name="Main">
            {({ navigation, route }) => (
              <MainStack {...{ navigation, route }} role={role} setAuth={setAuth} />
            )}
          </Stack.Screen>

        )}
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
