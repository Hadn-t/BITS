import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import Title from '@/common/Title';
import Button from '@/common/Button';
import Input from '@/common/Input';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig'; 
const SignIn = ({ setAuth, setRole, navigation, setMode }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateInputs = () => {
        let isValid = true;
        
        if (!username) {
            setUsernameError('Username is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(username)) {
            setUsernameError('Please enter a valid email');
            isValid = false;
        }
        
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        }

        return isValid;
    };

    const onSignIn = async () => {
        try {
            if (!validateInputs()) {
                return;
            }

            setLoading(true);

           
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user;

            if (!user?.uid) {
                throw new Error('User UID is missing.');
            }

           
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                throw new Error('User data not found in Firestore.');
            }

            const userData = userDocSnap.data();
            
           
            setAuth(true);
            setRole(userData.role);

            Alert.alert(
                'Success', 
                `Signed in successfully as ${userData.role}!\nWelcome ${userData.firstname}`
            );


        } catch (error) {
            console.error('Sign in error:', error);
            
            const errorMessages = {
                'auth/invalid-email': 'The email address is badly formatted.',
                'auth/user-not-found': 'No user found with this email address.',
                'auth/wrong-password': 'The password is incorrect.',
                'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
                'auth/network-request-failed': 'Network error. Please check your connection.'
            };

            const errorMessage = errorMessages[error.code] || error.message || 'An error occurred during sign in.';
            Alert.alert('Error', errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Title text="Sign In" />

            <Input
                title="Email"
                inTitle="abc@hadnt.com"
                type="email-address"
                hidden={false}
                value={username}
                error={usernameError}
                setValue={(text) => {
                    setUsername(text);
                    setUsernameError('');
                }}
                setError={setUsernameError}
            />

            <Input
                title="Password"
                inTitle="********"
                type="default"
                hidden={true}
                value={password}
                error={passwordError}
                setValue={(text) => {
                    setPassword(text);
                    setPasswordError('');
                }}
                setError={setPasswordError}
            />

            <Button 
                title={loading ? "Signing In..." : "Sign In"} 
                fn={onSignIn}
                disabled={loading}
            />

            <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                    Don't have an account?
                    <TouchableOpacity 
                        onPress={() => setMode('signUp')}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}> Sign Up</Text>
                    </TouchableOpacity>
                </Text>
            </View>
        </View>
    );
};

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