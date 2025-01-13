import React, { useState, useLayoutEffect } from 'react';
import { View, Text, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import Title from '@/common/Title';
import Button from '@/common/Button';
import SignUp from '@/common/SignUp'; 
import SignIn from '@/common/SignIn'; 

const Authentication = ({ setAuth, setRole, navigation }) => {
  const [mode, setMode] = useState('signIn'); 
  const [role, setRoleState] = useState('client'); 

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
          <SignIn role={role} setAuth={setAuth} setRole={setRole} navigation={navigation} setMode={setMode} />
        )}

        {mode === 'signUp' && (
          <SignUp role={role} setAuth={setAuth} setRole={setRole} navigation={navigation} setMode={setMode} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Authentication;
