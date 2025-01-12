import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

const Authentication = ({ setAuth, navigation }) => {
  const [mode, setMode] = useState(''); 

  const handleAuth = () => {
    
    // If no mode is selected, show an alert to select a mode
    if (mode === null) {
      Alert.alert(
        'Select Mode',
        'Please choose between Client and Doctor',
        [
          {
            text: 'Client',
            onPress: () => {
              setMode('client');
              navigation.navigate('ClientHome'); // Navigate to client home screen
            },
          },
          {
            text: 'Doctor',
            onPress: () => {
              setMode('doctor');
              navigation.navigate('DoctorHome'); // Navigate to doctor home screen
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      // If mode is already selected, navigate based on the mode
      if (mode === 'client') {
        navigation.navigate('ClientHome');
      } else if (mode === 'doctor') {
        navigation.navigate('DoctorHome');
      }
      // setAuth(true);
    }
  };

  return (
    <View>
      <Text>Authentication</Text>
      <Text>Selected Mode: {mode}</Text>

      <Button
        title='Client'
        onPress={() => setMode('client')}
      />
      <Button
        title={`Doctor`}
        onPress={() => setMode('doctor')}
      />
      
      <Button title='Complete Auth' onPress={handleAuth} />
    </View>
  );
};

export default Authentication;
