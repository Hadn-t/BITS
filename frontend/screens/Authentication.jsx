import React, { useState, useLayoutEffect } from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import Title from '@/common/Title';
import Button from '@/common/Button';
import SignUp from '@/common/SignUp'; 
import SignIn from '@/common/SignIn'; 
import { auth } from '../firbaseConfig';  // Import firebase auth

const Authentication = ({ setAuth, setRole, navigation }) => {
  const [mode, setMode] = useState('signIn'); 
  const [role, setRoleState] = useState('client'); 

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleSignIn = async (email, password) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      setAuth(true);
      setRole(role);  // Set role here after sign-in
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignUp = async (email, password) => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      setAuth(true);
      setRole(role);  // Set role after sign-up
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
        <Title text="Authentication" />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', width: '100%' }}>
          <Button
            title="Client"
            fn={() => setRoleState('client')}
            width="40%"
            style={{ marginHorizontal: 10, backgroundColor: 'green' }}
          />
          <Button
            title="Doctor"
            fn={() => setRoleState('doctor')}
            width="40%"
            style={{ marginHorizontal: 10, backgroundColor: 'green' }}
          />
        </View>

        {mode === 'signIn' && (
          <SignIn role={role} setAuth={setAuth} setRole={setRole} navigation={navigation} setMode={setMode} handleSignIn={handleSignIn} />
        )}

        {mode === 'signUp' && (
          <SignUp role={role} setAuth={setAuth} setRole={setRole} navigation={navigation} setMode={setMode} handleSignUp={handleSignUp} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Authentication;
