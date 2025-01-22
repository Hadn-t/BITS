import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import Title from '@/common/Title';
import Button from '@/common/Button';
import Input from '@/common/Input';
import { auth, db } from '../firebaseConfig'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUp = ({ role, setAuth, setRole, navigation, setMode }) => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [usernameError, setUsernameError] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [rePasswordError, setRePasswordError] = useState('');
    const [roleError, setRoleError] = useState('');

    const validateInputs = () => {
        let isValid = true;

        // Role validation
        if (!role) {
            setRoleError('Please select a role');
            isValid = false;
        }

        // Email validation
        if (!username) {
            setUsernameError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(username)) {
            setUsernameError('Please enter a valid email');
            isValid = false;
        }

        // First name validation
        if (!firstName) {
            setFirstNameError('First Name is required');
            isValid = false;
        }

        // Last name validation
        if (!lastName) {
            setLastNameError('Last Name is required');
            isValid = false;
        }

        // Password validation
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }

        // Confirm password validation
        if (password !== rePassword) {
            setRePasswordError('Passwords do not match');
            isValid = false;
        }

        return isValid;
    };

    const onSignUp = async () => {
        try {
            if (!validateInputs()) {
                return;
            }

            // Role check before proceeding
            if (!role) {
                Alert.alert('Error', 'Please select a role before signing up');
                return;
            }

            setLoading(true);

            const userCredential = await createUserWithEmailAndPassword(auth, username, password);
            const user = userCredential.user;

            // Create a reference to the user document
            const userRef = doc(db, 'users', user.uid);

            // Prepare user data including uid
            const userData = {
                uid: user.uid, // Adding UID to the user data
                username: username,
                firstname: firstName,
                lastname: lastName,
                email: user.email,
                role: role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true,
                emailVerified: user.emailVerified,
                // Add any additional fields you want to store
            };

            // Store user data in Firestore
            await setDoc(userRef, userData);

            // If the user is a doctor or patient, create a separate record in respective collection
            if (role === 'doctor' || role === 'patient') {
                const roleRef = doc(db, `${role}s`, user.uid);
                await setDoc(roleRef, {
                    ...userData,
                    // Add role-specific fields here
                    profile: {
                        address: '',
                        phone: '',
                        gender: '',
                        dateOfBirth: '',
                        bloodGroup: '',
                        height: '',
                        weight: '',
                        // Add more profile fields as needed
                    }
                });
            }

            setAuth(true);
            setRole(role);
            Alert.alert(
                'Success', 
                `Signed up successfully as ${role}!\nWelcome ${firstName}`
            );

        } catch (error) {
            console.error('Sign up error:', error);
            
            const errorMessages = {
                'auth/email-already-in-use': 'This email is already registered.',
                'auth/invalid-email': 'The email address is badly formatted.',
                'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
                'auth/weak-password': 'The password is too weak.',
                'auth/network-request-failed': 'Network error. Please check your connection.'
            };

            const errorMessage = errorMessages[error.code] || error.message || 'An error occurred during sign up.';
            Alert.alert('Error', errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Title text={role ? `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Sign Up'} />

            {!role && (
                <Text style={styles.errorText}>{roleError}</Text>
            )}

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
                title="First Name"
                inTitle="John"
                type="default"
                hidden={false}
                value={firstName}
                error={firstNameError}
                setValue={(text) => {
                    setFirstName(text);
                    setFirstNameError('');
                }}
                setError={setFirstNameError}
            />
            <Input
                title="Last Name"
                inTitle="Doe"
                type="default"
                hidden={false}
                value={lastName}
                error={lastNameError}
                setValue={(text) => {
                    setLastName(text);
                    setLastNameError('');
                }}
                setError={setLastNameError}
            />
            <Input
                title="Password"
                inTitle="****"
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
            <Input
                title="Retype Password"
                inTitle="****"
                type="default"
                hidden={true}
                value={rePassword}
                error={rePasswordError}
                setValue={(text) => {
                    setRePassword(text);
                    setRePasswordError('');
                }}
                setError={setRePasswordError}
            />

            <Button 
                title={loading ? "Signing Up..." : "Sign Up"} 
                fn={onSignUp}
                disabled={loading || !role}
            />

            <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                    Already have an account?
                    <TouchableOpacity 
                        onPress={() => setMode('signIn')}
                        disabled={loading}
                    >
                        <Text style={styles.linkText}> Sign In</Text>
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
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default SignUp;
