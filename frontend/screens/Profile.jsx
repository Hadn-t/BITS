import React, { useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

const ProfileScreen = ({ route, setAuth, navigation }) => {

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    })
  }, [navigation])

  const { role } = route.params;

  const handleEditProfile = () => {
    console.log('Edit Profile Button Pressed');
  };

  const handleLogout = () => {
    setAuth(false);
  };

  const DoctorProfile = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.headerSection}>
        <Image
          source={{ uri: 'https://example.com/doctor_profile.jpg' }}
          style={styles.profilePicture}
        />
        <View style={styles.badgeContainer}>
          <FontAwesomeIcon icon={faUserMd} size={20} color="#007BFF" />
          <Text style={styles.verifiedBadge}>Verified Doctor</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.name}>Dr. John Doe</Text>
        <Text style={styles.specialty}>Cardiologist</Text>

        <View style={styles.contactInfo}>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={faEnvelope} size={16} color="#555" />
            <Text style={styles.infoText}>john.doe@hospital.com</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={faPhone} size={16} color="#555" />
            <Text style={styles.infoText}>+1234567890</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={faHospital} size={16} color="#555" />
            <Text style={styles.infoText}>Central Hospital</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>150+</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>10+</Text>
          <Text style={styles.statLabel}>Years Exp.</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>4.9</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.scheduleSection}>
        <Text style={styles.sectionTitle}>Current Schedule</Text>
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleText}>Mon - Fri: 9:00 AM - 5:00 PM</Text>
          <Text style={styles.scheduleText}>Sat: 9:00 AM - 1:00 PM</Text>
        </View>
      </View>
    </ScrollView>
  );

  const ClientProfile = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.headerSection}>
        <Image
          source={{ uri: 'https://example.com/client_profile.jpg' }}
          style={styles.profilePicture}
        />
        <View style={styles.badgeContainer}>
          <FontAwesomeIcon icon={faUserCircle} size={20} color="#28a745" />
          <Text style={styles.memberBadge}>Premium Member</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.name}>John Doe</Text>
        <View style={styles.contactInfo}>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={faEnvelope} size={16} color="#555" />
            <Text style={styles.infoText}>john.doe@example.com</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesomeIcon icon={faPhone} size={16} color="#555" />
            <Text style={styles.infoText}>+1234567890</Text>
          </View>
        </View>
      </View>

      <View style={styles.healthInfoSection}>
        <Text style={styles.sectionTitle}>Health Information</Text>
        <View style={styles.healthInfo}>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Blood Type:</Text>
            <Text style={styles.healthValue}>A+</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Age:</Text>
            <Text style={styles.healthValue}>35</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Weight:</Text>
            <Text style={styles.healthValue}>75 kg</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Height:</Text>
            <Text style={styles.healthValue}>175 cm</Text>
          </View>
        </View>
      </View>

      <View style={styles.upcomingSection}>
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <View style={styles.appointmentCard}>
          <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#007BFF" />
          <Text style={styles.appointmentText}>Dr. Smith - Cardiologist</Text>
          <Text style={styles.appointmentDate}>Tomorrow, 10:00 AM</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {role === 'doctor' ? <DoctorProfile /> : <ClientProfile />}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEditProfile}
        >
          <FontAwesomeIcon icon={faPen} size={16} color="#fff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 12,  // Reduced padding
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 5,  // Reduced from 10
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 20,
    marginBottom: 5,  // Reduced from 10
  },
  verifiedBadge: {
    marginLeft: 8,
    color: '#007BFF',
    fontWeight: '600',
  },
  memberBadge: {
    marginLeft: 8,
    color: '#28a745',
    fontWeight: '600',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 15,  // Reduced from 20
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  specialty: {
    fontSize: 18,
    color: '#007BFF',
    marginBottom: 15,
  },
  contactInfo: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,  // Reduced padding
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    color: '#555',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,  // Reduced from 20
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 12,  // Reduced padding
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  scheduleSection: {
    backgroundColor: '#fff',
    padding: 12,  // Reduced padding
    borderRadius: 10,
    marginBottom: 15,  // Reduced from 20
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,  // Reduced from 10
  },
  scheduleInfo: {
    marginTop: 10,
  },
  scheduleText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  healthInfoSection: {
    backgroundColor: '#fff',
    padding: 12,  // Reduced padding
    borderRadius: 10,
    marginBottom: 15,  // Reduced from 20
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthInfo: {
    marginTop: 10,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  healthLabel: {
    fontSize: 16,
    color: '#666',
  },
  healthValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  upcomingSection: {
    backgroundColor: '#fff',
    padding: 12,  // Reduced padding
    borderRadius: 10,
    marginBottom: 15,  // Reduced from 20
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentCard: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
  },
  appointmentText: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#007BFF',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;
