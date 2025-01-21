import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert
} from 'react-native';
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
  faPen,
  faChevronLeft,
  faStar,
  faCertificate,
  faHeartbeat,
  faTextHeight,
  faWeight
} from "@fortawesome/free-solid-svg-icons";
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import * as Animatable from 'react-native-animatable';

const ProfileScreen = ({ route, setAuth, navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [120, 80],
    extrapolate: 'clamp',
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const { role } = route.params;

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (error) {
      console.error("Error getting user data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchUserData();
    }
  }, []);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userData });
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuth(false);
    } catch (error) {
      console.error("Logout Error: ", error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const ProfileHeader = ({ name, role, imageUrl, verified }) => (
    <Animated.View style={[styles.profileHeader, { height: headerHeight }]}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesomeIcon icon={faChevronLeft} size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Animatable.View
        animation="fadeIn"
        duration={1000}
        style={styles.headerContent}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.profileImage}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
          <View style={styles.verificationBadge}>
            <FontAwesomeIcon
              icon={verified ? faCertificate : faUserCircle}
              size={16}
              color="#fff"
            />
            <Text style={styles.verifiedText}>{role}</Text>
          </View>
        </View>
      </Animatable.View>
    </Animated.View>
  );

  const StatCard = ({ icon, value, label }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={300}
      style={styles.statCard}
    >
      <FontAwesomeIcon icon={icon} size={24} color="#007BFF" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animatable.View>
  );

  const DoctorProfile = () => (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      <ProfileHeader
        name={userData?.firstname || 'Dr. John Doe'}
        role={userData?.specialization||"Cardiologist"}
        imageUrl="https://example.com/doctor_profile.jpg"
        verified={true}
      />

      <View style={styles.contentContainer}>
        <View style={styles.statsContainer}>
          <StatCard icon={faUserMd} value="150+" label="Patients" />
          <StatCard icon={faClock} value={userData?.experience||"1+" }label="Years Exp." />
          <StatCard icon={faStar} value="4.9" label="Rating" />
        </View>

        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <FontAwesomeIcon icon={faEnvelope} size={20} color="#007BFF" />
              <Text style={styles.contactText}>{userData?.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <FontAwesomeIcon icon={faPhone} size={20} color="#007BFF" />
              <Text style={styles.contactText}>{userData?.phone||'+91 123456789'}</Text>
            </View>
            <View style={styles.contactItem}>
              <FontAwesomeIcon icon={faHospital} size={20} color="#007BFF" />
              <Text style={styles.contactText}>{userData?.hospital||'Central Hospital'}</Text>
            </View>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Monday - Friday</Text>
              <Text style={styles.scheduleTime}>{userData.schedule?.weekday||'Not Specifified'}</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>Saturday</Text>
              <Text style={styles.scheduleTime}>{userData.schedule?.weekend||'Not Specifified'}</Text>
            </View>
          </View>
        </Animatable.View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            <FontAwesomeIcon icon={faPen} size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
  onPress={() => Alert.alert(
    "Confirm Logout",
    "Are you sure you want to log out?",
    [
      {
        text: "Cancel",
        style: "cancel",
        // iOS-specific color, on Android it will use default system colors
        style: { color: '#4A8B94' }  // Matches your app's theme color
      },
      {
        text: "Logout",
        onPress: handleLogout,
        style: "destructive", // iOS will automatically make this red
        // Additional styling for Android
        style: { color: '#e74c3c' }  // Red color for emphasis
      }
    ],
    { cancelable: true }  // Allows dismissing alert by tapping outside
  )}
  style={styles.logoutButton}
>
  <Text style={styles.buttonText}>Log Out</Text>
</TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const ClientProfile = () => (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      <ProfileHeader
        name={userData?.firstname || 'John Doe'}
        role="Premium Member"
        imageUrl="https://example.com/client_profile.jpg"
        verified={true}
      />

      <View style={styles.contentContainer}>
        <Animatable.View animation="fadeInUp" delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthRow}>
              <View style={styles.healthItem}>
                <FontAwesomeIcon icon={faHeartbeat} size={20} color="#007BFF" />
                <Text style={styles.healthLabel}>Blood Type</Text>
                <Text style={styles.healthValue}>{userData?.bloodType||'Not Submitted'}</Text>
              </View>
              <View style={styles.healthItem}>
                <FontAwesomeIcon icon={faUserCircle} size={20} color="#007BFF" />
                <Text style={styles.healthLabel}>Age</Text>
                <Text style={styles.healthValue}>{userData?.age||'Not Submitted'}</Text>
              </View>
            </View>
            <View style={styles.healthRow}>
              <View style={styles.healthItem}>
                <FontAwesomeIcon icon={faWeight} size={20} color="#007BFF" />
                <Text style={styles.healthLabel}>Weight</Text>
                <Text style={styles.healthValue}>{userData?.weight||'Not Submitted'}</Text>
              </View>
              <View style={styles.healthItem}>
                <FontAwesomeIcon icon={faTextHeight} size={20} color="#007BFF" />
                <Text style={styles.healthLabel}>Height</Text>
                <Text style={styles.healthValue}>{userData?.height||'Not Submitted'}</Text>
              </View>
            </View>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <Text style={styles.sectionTitle}>Next Appointment</Text>
          <TouchableOpacity style={styles.appointmentCard}>
            <FontAwesomeIcon icon={faCalendarCheck} size={24} color="#007BFF" />
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentTitle}>Dr. Smith</Text>
              <Text style={styles.appointmentDate}>25th Jan 2025</Text>
              <Text style={styles.appointmentTime}>10:00 AM</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            <FontAwesomeIcon icon={faPen} size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
  onPress={() => Alert.alert(
    "Confirm Logout",
    "Are you sure you want to log out?",
    [
      {
        text: "Cancel",
        style: "cancel",
        style: { backgroundColor: '#4A8B94' } 
      },
      {
        text: "Logout",
        onPress: handleLogout,
        style: { backgroundColor: '#e74c3c' }  
      }
    ],
    { cancelable: true } 
  )}
  style={styles.logoutButton}
>
  <Text style={styles.buttonText}>Log Out</Text>
</TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      {role === 'doctor' ? <DoctorProfile /> : <ClientProfile />}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 10,
  },

  // Header Styles
  profileHeader: {
    backgroundColor: '#4A8B94',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 30,
  },
  backButton: {
    marginTop:20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginLeft:'10%',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingLeft: 4,
  },

  // Card Styles (Contact, Schedule, Health)
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  // Contact Card Styles
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },

  // Schedule Styles
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  scheduleItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 12,
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#666',
  },

  // Health Card Styles
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  healthItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#F5F5F5',
  },
  healthLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // Appointment Styles
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#4A8B94',
    fontWeight: '500',
  },

  // Button Styles
  buttonGroup: {
    marginTop: 16,
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#4A8B94',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});



export default ProfileScreen;
