import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoadingScreen from "./screens/Loading";
import MainStack from "./screens/Main";
import Authentication from "./screens/Authentication";

import "./core/fontawesome";


const Stack = createNativeStackNavigator();

export default function App() {
  const [initial, setInitial] = useState(false);
  const [auth, setAuth] = useState(false);
  const [role, setRole] = useState('');

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
            {(props) => <MainStack {...props} role={role} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
