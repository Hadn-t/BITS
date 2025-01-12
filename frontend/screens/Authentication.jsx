import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';

const Authentication = ({ setAuth, setRole, navigation }) => {
  const [mode, setMode] = useState(''); 

  const handleAuth = () => {
    if (mode === '') {
      Alert.alert(
        'Select Mode',
        'Please choose between Client and Doctor',
        [
          {
            text: 'Client',
            onPress: () => {
              setMode('client');
              setRole('client');
              setAuth(true);  
            },
          },
          {
            text: 'Doctor',
            onPress: () => {
              setMode('doctor');
              setRole('doctor');
              setAuth(true);  
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      if (mode === 'client') {
        setRole('client');
        setAuth(true);  
      } else if (mode === 'doctor') {
        setRole('doctor');
        setAuth(true);  
      }
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
