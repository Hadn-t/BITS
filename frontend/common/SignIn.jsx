import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import Title from '@/common/Title';
import Button from '@/common/Button';
import Input from '@/common/Input';

const SignIn = ({ role, setAuth, setRole, navigation, setMode }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const onSignIn = () => {
        const faultUsername = !username;
        const faultPassword = !password;

        faultUsername && setUsernameError('Username is required');
        faultPassword && setPasswordError('Password is required');

        if (faultUsername || faultPassword) {
            return;
        }

        // Proceed with sign-in logic
        setAuth(true);
        setRole(role);
        Alert.alert('Success', `${role.charAt(0).toUpperCase() + role.slice(1)} signed in successfully!`);
        // navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <Title text={`Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`} />

            <Input
                title="Username"
                inTitle="abc_xyz"
                type="default"
                hidden={false}
                value={username}
                error={usernameError}
                setValue={setUsername}
                setError={setUsernameError}
            />
            <Input
                title="Password"
                inTitle="********"
                type="default"
                hidden={true}
                value={password}
                error={passwordError}
                setValue={setPassword}
                setError={setPasswordError}
            />

            <Button title="Sign In" fn={onSignIn} />

            <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                    Don't have an account?
                    <TouchableOpacity onPress={() => setMode('signUp')}>
                        <Text style={styles.linkText}> Sign Up</Text>
                    </TouchableOpacity>
                </Text>
            </View>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        flex: 1,
        justifyContent: 'center',
    },
    switchContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 16,
        color: '#333',
    },
    linkText: {
        color: '#007BFF',
        textDecorationLine: 'underline',
    },
});

export default SignIn;
