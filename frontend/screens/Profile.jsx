import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ProfileScreen = () => {
  const handleEditProfile = () => {
    console.log('Edit Profile Button Pressed');
    // Implement the action for editing the profile (e.g., navigating to an edit screen)
  };

  const handleLogout = () => {
    console.log('Logout Button Pressed');
    // Implement the logout functionality (e.g., clear user session and redirect to login screen)
  };

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <Image
        source={{ uri: 'https://example.com/profile_picture.jpg' }} // Replace with a valid image URL or asset
        style={styles.profilePicture}
      />
      
      {/* User Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
        <Text style={styles.contact}>+1234567890</Text>
      </View>

      {/* Edit and Logout Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  contact: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
