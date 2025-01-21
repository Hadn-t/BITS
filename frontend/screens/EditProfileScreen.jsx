import React, { useState, useEffect, useLayoutEffect } from 'react';
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
    // Predefined specializations array
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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);

    const { userData } = route.params;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstname: userData?.firstname || '',
        lastname: userData?.lastname || '',
        phone: userData?.phone || '',
        email: userData?.email || auth.currentUser?.email || '',
        role: userData?.role || 'client',
        // Doctor specific fields
        specialization: userData?.specialization || SPECIALIZATIONS[0],
        experience: userData?.experience || '0',
        hospital: userData?.hospital || 'General Hospital',
        schedule: userData?.schedule || {
            weekday: '9:00 AM - 5:00 PM',
            weekend: '9:00 AM - 1:00 PM'
        },
        // Client specific fields
        age: userData?.age || '',
        bloodType: userData?.bloodType || 'A+',
        weight: userData?.weight || '',
        height: userData?.height || '',
        allergies: userData?.allergies || '',
        medicalHistory: userData?.medicalHistory || ''
    });

    const handleSave = async () => {
        try {
            setLoading(true);
            const userRef = doc(db, "users", auth.currentUser.uid);

            // Remove empty fields before updating
            const updateData = Object.fromEntries(
                Object.entries(formData).filter(([_, value]) => value !== '')
            );

            await updateDoc(userRef, updateData);
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error("Error updating profile: ", error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderDoctorFields = () => (
        <>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Specialization</Text>
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
                <Text style={styles.label}>Hospital</Text>
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
                <TextInput
                    style={styles.input}
                    value={formData.bloodType}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, bloodType: text }))}
                    placeholder="Enter blood type"
                />
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
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.firstname}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, firstname: text }))}
                            placeholder="Enter first name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.lastname}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, lastname: text }))}
                            placeholder="Enter last name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
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
                        style={styles.saveButton}
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