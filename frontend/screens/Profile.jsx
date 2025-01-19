import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faStethoscope,
  faUserMd,
  faHospital,
  faClock,
  faCalendarCheck,
  faUserCircle,
  faEnvelope,
  faPhone,
  faPen
} from "@fortawesome/free-solid-svg-icons";
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // assuming you have firebaseConfig file
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = ({ route, setAuth, navigation }) => {
  const [userData, setUserData] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const { role } = route.params;

  const fetchUserData = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid); // "users" is your collection name
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data()); // Fetch user data
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting user data: ", error);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchUserData(); // Fetch user data after component is mounted
    }
  }, []);

  const handleEditProfile = () => {
    console.log('Edit Profile Button Pressed');
    // Add navigation to the edit profile screen here if needed
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setAuth(false);
      })
      .catch((error) => {
        console.error("Logout Error: ", error);
        alert('Error logging out, please try again.');
      });
  };

  const DoctorProfile = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: 'https://example.com/doctor_profile.jpg' }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <FontAwesomeIcon icon={faUserMd} size={20} color="#007BFF" />
          <Text style={styles.verifiedText}>Verified Doctor</Text>
        </View>
      </View>

      <Text style={styles.name}>{userData?.firstname || 'Dr. John Doe'}</Text>
      <Text style={styles.role}>Cardiologist</Text>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <FontAwesomeIcon icon={faEnvelope} size={16} color="#555" />
          <Text style={styles.contactText}>{userData?.email || 'john.doe@hospital.com'}</Text>
        </View>
        <View style={styles.contactItem}>
          <FontAwesomeIcon icon={faPhone} size={16} color="#555" />
          <Text style={styles.contactText}>+1234567890</Text>
        </View>
        <View style={styles.contactItem}>
          <FontAwesomeIcon icon={faHospital} size={16} color="#555" />
          <Text style={styles.contactText}>Central Hospital</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>150+</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>10+</Text>
          <Text style={styles.statLabel}>Years Exp.</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.schedule}>
        <Text style={styles.sectionTitle}>Current Schedule</Text>
        <Text style={styles.scheduleText}>Mon - Fri: 9:00 AM - 5:00 PM</Text>
        <Text style={styles.scheduleText}>Sat: 9:00 AM - 1:00 PM</Text>
      </View>
      
      <TouchableOpacity onPress={handleEditProfile} style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const ClientProfile = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: 'https://example.com/client_profile.jpg' }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <FontAwesomeIcon icon={faUserCircle} size={20} color="#28a745" />
          <Text style={styles.verifiedText}>Premium Member</Text>
        </View>
      </View>

      <Text style={styles.name}>{userData?.firstname || 'John Doe'}</Text>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <FontAwesomeIcon icon={faEnvelope} size={16} color="#555" />
          <Text style={styles.contactText}>{userData?.email || 'john.doe@example.com'}</Text>
        </View>
        <View style={styles.contactItem}>
          <FontAwesomeIcon icon={faPhone} size={16} color="#555" />
          <Text style={styles.contactText}>+1234567890</Text>
        </View>
      </View>

      <View style={styles.healthInfo}>
        <Text style={styles.sectionTitle}>Health Information</Text>
        <View style={styles.healthItem}>
          <Text style={styles.healthLabel}>Blood Type:</Text>
          <Text style={styles.healthValue}>A+</Text>
        </View>
        <View style={styles.healthItem}>
          <Text style={styles.healthLabel}>Age:</Text>
          <Text style={styles.healthValue}>35</Text>
        </View>
        <View style={styles.healthItem}>
          <Text style={styles.healthLabel}>Weight:</Text>
          <Text style={styles.healthValue}>75 kg</Text>
        </View>
        <View style={styles.healthItem}>
          <Text style={styles.healthLabel}>Height:</Text>
          <Text style={styles.healthValue}>175 cm</Text>
        </View>
      </View>

      <View style={styles.appointment}>
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <View style={styles.appointmentCard}>
          <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#007BFF" />
          <Text style={styles.appointmentText}>Appointment with Dr. Smith - 25th Jan 2025</Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleEditProfile} style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {role === 'doctor' ? DoctorProfile() : ClientProfile()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  role: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  contactInfo: {
    marginTop: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007BFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  schedule: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  scheduleText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  healthInfo: {
    marginBottom: 20,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 16,
    color: '#555',
  },
  healthValue: {
    fontSize: 16,
    color: '#555',
  },
  appointment: {
    marginBottom: 20,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    padding: 15,
    borderRadius: 10,
  },
  appointmentText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
};

export default ProfileScreen;
