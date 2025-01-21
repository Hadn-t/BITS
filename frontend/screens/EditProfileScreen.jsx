import React, { useState, useLayoutEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faChevronLeft,
    faSave,
} from "@fortawesome/free-solid-svg-icons";
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const EditProfileScreen = ({ route, navigation }) => {
    const SPECIALIZATIONS = [
        "Dentistry",
        "Cardiology",
        "Pulmonology",
        "General",
        "Neurology",
        "Gastroenterology",
        "Laboratory",
        "Vaccination",
    ];

    const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const { userData } = route.params;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Common fields
        firstname: userData?.firstname || '',
        lastname: userData?.lastname || '',
        phone: userData?.phone || '',
        email: userData?.email || auth.currentUser?.email || '',
        role: userData?.role || 'client',
        
        // Doctor specific fields
        specialization: userData?.specialization || SPECIALIZATIONS[0],
        experience: userData?.experience || '',
        hospital: userData?.hospital || '',
        schedule: userData?.schedule || {
            weekday: '9:00 AM - 5:00 PM',
            weekend: '9:00 AM - 1:00 PM'
        },
        
        // Client specific fields
        age: userData?.age || '',
        bloodType: userData?.bloodType || BLOOD_TYPES[0],
        weight: userData?.weight || '',
        height: userData?.height || '',
        allergies: userData?.allergies || '',
        medicalHistory: userData?.medicalHistory || ''
    });

    const handleSave = async () => {
        try {
            setLoading(true);

            // Validate required fields
            if (!formData.firstname || !formData.lastname || !formData.phone) {
                Alert.alert('Error', 'Please fill in required fields: First Name, Last Name, and Phone');
                return;
            }

            const userRef = doc(db, "users", auth.currentUser.uid);

            // Base update object with common fields
            const updateData = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                phone: formData.phone,
                email: formData.email,
                role: formData.role,
                updatedAt: new Date().toISOString()
            };

            // Add role-specific fields
            if (formData.role === 'doctor') {
                // Validate doctor-specific required fields
                if (!formData.specialization || !formData.hospital) {
                    Alert.alert('Error', 'Please fill in required fields: Specialization and Hospital');
                    return;
                }

                Object.assign(updateData, {
                    specialization: formData.specialization,
                    experience: formData.experience,
                    hospital: formData.hospital,
                    schedule: {
                        weekday: formData.schedule.weekday,
                        weekend: formData.schedule.weekend
                    }
                });
            } else {
                // Add client-specific fields if they exist
                if (formData.age) updateData.age = formData.age;
                if (formData.bloodType) updateData.bloodType = formData.bloodType;
                if (formData.weight) updateData.weight = formData.weight;
                if (formData.height) updateData.height = formData.height;
                if (formData.allergies) updateData.allergies = formData.allergies;
                if (formData.medicalHistory) updateData.medicalHistory = formData.medicalHistory;
            }

            // Remove any empty string values
            const cleanedUpdateData = Object.fromEntries(
                Object.entries(updateData).filter(([_, value]) => 
                    value !== '' && value !== null && value !== undefined
                )
            );

            await updateDoc(userRef, cleanedUpdateData);
            Alert.alert(
                'Success', 
                'Profile updated successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error("Error updating profile: ", error);
            Alert.alert(
                'Error', 
                'Failed to update profile. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const renderDoctorFields = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialization<Text style={styles.required}>*</Text></Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.specialization}
                        style={styles.picker}
                        onValueChange={(itemValue) =>
                            setFormData(prev => ({ ...prev, specialization: itemValue }))
                        }
                    >
                        {SPECIALIZATIONS.map((specialization) => (
                            <Picker.Item
                                key={specialization}
                                label={specialization}
                                value={specialization}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Years of Experience</Text>
                <TextInput
                    style={styles.input}
                    value={formData.experience}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, experience: text }))}
                    keyboardType="numeric"
                    placeholder="Enter years of experience"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Hospital<Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={formData.hospital}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, hospital: text }))}
                    placeholder="Enter hospital name"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Weekday Schedule</Text>
                <TextInput
                    style={styles.input}
                    value={formData.schedule.weekday}
                    onChangeText={(text) => setFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, weekday: text }
                    }))}
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Weekend Schedule</Text>
                <TextInput
                    style={styles.input}
                    value={formData.schedule.weekend}
                    onChangeText={(text) => setFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, weekend: text }
                    }))}
                    placeholder="e.g., 9:00 AM - 1:00 PM"
                />
            </View>
        </>
    );

    const renderClientFields = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Age</Text>
                <TextInput
                    style={styles.input}
                    value={formData.age}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                    keyboardType="numeric"
                    placeholder="Enter age"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Blood Type</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.bloodType}
                        style={styles.picker}
                        onValueChange={(itemValue) =>
                            setFormData(prev => ({ ...prev, bloodType: itemValue }))
                        }
                    >
                        {BLOOD_TYPES.map((type) => (
                            <Picker.Item
                                key={type}
                                label={type}
                                value={type}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.weight}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                    keyboardType="numeric"
                    placeholder="Enter weight"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.height}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                    keyboardType="numeric"
                    placeholder="Enter height"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Allergies</Text>
                <TextInput
                    style={styles.input}
                    value={formData.allergies}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, allergies: text }))}
                    placeholder="Enter allergies (if any)"
                    multiline
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Medical History</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.medicalHistory}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, medicalHistory: text }))}
                    placeholder="Enter medical history"
                    multiline
                    numberOfLines={4}
                />
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesomeIcon icon={faChevronLeft} size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.form}>
                    {/* Common Fields */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First Name<Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={formData.firstname}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, firstname: text }))}
                            placeholder="Enter first name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name<Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={formData.lastname}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, lastname: text }))}
                            placeholder="Enter last name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone<Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={formData.email}
                            editable={false}
                        />
                        <Text style={styles.helperText}>Email cannot be changed</Text>
                    </View>

                    {/* Conditional Fields */}
                    {formData.role === 'doctor' ? renderDoctorFields() : renderClientFields()}

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSave} size={20} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 16,
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: '#FF4444',
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    picker: {
        height: 50,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    disabledInput: {
        backgroundColor: '#F5F5F5',
        color: '#666666',
    },
    helperText: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#4A8B94',
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default EditProfileScreen;