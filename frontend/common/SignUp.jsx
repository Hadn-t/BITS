import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import Title from '@/common/Title';
import Button from '@/common/Button';
import Input from '@/common/Input';
import { auth } from '../firbaseConfig';  // Import Firebase auth
import { createUserWithEmailAndPassword } from 'firebase/auth';

const SignUp = ({ role, setAuth, setRole, navigation, setMode }) => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [rePasswordError, setRePasswordError] = useState('');

    const onSignUp = async () => {
        const faultUsername = !username || username.length < 5;
        const faultFirstName = !firstName;
        const faultLastName = !lastName;
        const faultPassword = !password || password.length < 6;
        const faultRePassword = rePassword !== password;

        faultUsername && setUsernameError('Username must be at least 5 characters');
        faultFirstName && setFirstNameError('First Name is required');
        faultLastName && setLastNameError('Last Name is required');
        faultPassword && setPasswordError('Password must be at least 6 characters');
        faultRePassword && setRePasswordError('Passwords do not match');

        if (faultUsername || faultFirstName || faultLastName || faultPassword || faultRePassword) {
            return;
        }

        // Firebase sign-up logic
        try {
            await createUserWithEmailAndPassword(auth,username, password);
            setAuth(true);
            setRole(role);
            Alert.alert('Success', `${role.charAt(0).toUpperCase() + role.slice(1)} signed up successfully!`);
            // navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Title text={`Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`} />

            <Input
                title="Email"
                inTitle="abc@hadnt.com"
                type="email-address"
                hidden={false}
                value={username}
                error={usernameError}
                setValue={setUsername}
                setError={setUsernameError}
            />
            <Input
                title="First Name"
                inTitle="John"
                type="default"
                hidden={false}
                value={firstName}
                error={firstNameError}
                setValue={setFirstName}
                setError={setFirstNameError}
            />
            <Input
                title="Last Name"
                inTitle="Doe"
                type="default"
                hidden={false}
                value={lastName}
                error={lastNameError}
                setValue={setLastName}
                setError={setLastNameError}
            />
            <Input
                title="Password"
                inTitle="****"
                type="default"
                hidden={true}
                value={password}
                error={passwordError}
                setValue={setPassword}
                setError={setPasswordError}
            />
            <Input
                title="Retype Password"
                inTitle="****"
                type="default"
                hidden={true}
                value={rePassword}
                error={rePasswordError}
                setValue={setRePassword}
                setError={setRePasswordError}
            />

            <Button title="Sign Up" fn={onSignUp} />

            <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                    Already have an account?
                    <TouchableOpacity onPress={() => setMode('signIn')}>
                        <Text style={styles.linkText}> Sign In</Text>
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

export default SignUp;
