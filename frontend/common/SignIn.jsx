import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import Title from '@/common/Title';
import Button from '@/common/Button';
import Input from '@/common/Input';
import { auth, firestore } from '../firbaseConfig';  // Import Firebase auth and Firestore
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';  // Import Firestore functions to fetch the role

const SignIn = ({ setAuth, setRole, navigation, setMode }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const onSignIn = async () => {
        const faultUsername = !username;
        const faultPassword = !password;

        faultUsername && setUsernameError('Username is required');
        faultPassword && setPasswordError('Password is required');

        if (faultUsername || faultPassword) {
            return;
        }

        // Firebase sign-in logic
        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user; // Get the user object from Firebase Auth

            // Fetch the user's role from Firestore based on the email
            const userRef = doc(firestore, 'users', user.uid); // Reference to the user's Firestore document
            const docSnapshot = await getDoc(userRef);

            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const userRole = userData.role; // Get the role from Firestore

                // Set the role in state and navigate to the main screen
                setAuth(true);
                setRole(userRole); // Set the role fetched from Firestore
                Alert.alert('Success', `Signed in successfully as ${userRole}!`);

                // Navigate to the main screen
                // navigation.navigate('Main');
            } else {
                // If no document found (error or data missing)
                Alert.alert('Error', 'User data not found in Firestore.');
            }
        } catch (error) {
            Alert.alert('Error', 'Invalid credentials. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Title text={`Sign In`} />

            <Input
                title="Email"
                inTitle="abc@hadnt.com"
                type='email-address'
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
