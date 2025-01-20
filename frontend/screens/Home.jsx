import React, { useLayoutEffect, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View, SafeAreaView, TextInput, Image, Linking, Alert } from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBell,
  faPhone,
  faTooth,
  faHeart,
  faLungs,
  faUserMd,
  faBrain,
  faStomach,
  faFlask,
  faSyringe,
  faDiagnoses
} from "@fortawesome/free-solid-svg-icons";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth } from '../firebaseConfig';
import Map from '../common/mapFlatList';
const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [medicalCenters, setMedicalCenters] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchUserData();
    fetchMedicalCenters();
    checkNotifications();
  }, []);

  const fetchUserData = async () => {
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", auth.currentUser?.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.firstname || 'User');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchMedicalCenters = async () => {
    try {
      const db = getFirestore();
      const centersRef = collection(db, "medicalCenters");
      const q = query(centersRef, where("active", "==", true));
      const querySnapshot = await getDocs(q);

      const centers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMedicalCenters(centers);
    } catch (error) {
      console.error("Error fetching medical centers:", error);
    }
  };

  const checkNotifications = async () => {
    try {
      const db = getFirestore();
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef,
        where("userId", "==", auth.currentUser?.uid),
        where("read", "==", false)
      );
      const querySnapshot = await getDocs(q);
      setHasNotifications(!querySnapshot.empty);
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  const handleSOSCall = () => {
    Alert.alert(
      "Emergency Call",
      "Are you sure you want to make an emergency call?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Call",
          onPress: () => {
            const phoneNumber = 'tel:112';
            Linking.canOpenURL(phoneNumber)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(phoneNumber);
                } else {
                  Alert.alert('Error', 'Unable to make a phone call at this time.');
                }
              })
              .catch((error) => {
                console.error('Error opening URL:', error);
                Alert.alert('Error', 'Something went wrong. Please try again.');
              });
          }
        }
      ]
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Implement search functionality here
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryDetails', { category });
  };

  const handleMedicalCenterPress = (center) => {
    navigation.navigate('Nearby Hospitals', { center });
  };

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };

  const categories = [
    { id: 1, title: "Dentistry", icon: faTooth },
    { id: 2, title: "Cardiology", icon: faHeart },
    { id: 3, title: "Pulmonology", icon: faLungs },
    { id: 4, title: "General", icon: faUserMd },
    { id: 5, title: "Neurology", icon: faBrain },
    { id: 6, title: "Gastroenterology", icon: faDiagnoses },
    { id: 7, title: "Laboratory", icon: faFlask },
    { id: 8, title: "Vaccination", icon: faSyringe },
  ];

  const CategoryItem = ({ icon, title }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(title)}
    >
      <View style={styles.categoryIcon}>
        <FontAwesomeIcon icon={icon} size={24} color="#4A8B94" />
      </View>
      <Text style={styles.categoryTitle}>{title}</Text>
    </TouchableOpacity>
  );
  const MedicalCenter = ({ image, name }) => (
    <View style={styles.medicalCenter}>
      <Image source={image} style={styles.medicalImage} />
      <Text style={styles.medicalName}>{name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Location Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotificationsPress}
          >
            <FontAwesomeIcon icon={faBell} size={20} color="#333" />
            {hasNotifications && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctor..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <View>
              <Text style={styles.bannerTitle}>Looking for{'\n'}Specialist Doctors?</Text>
              <Text style={styles.bannerSubtitle}>Schedule an appointment with{'\n'}our top doctors.</Text>
            </View>
          </View>
          <View style={styles.bannerDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                icon={category.icon}
                title={category.title}
              />
            ))}
          </View>
        </View>

        {/* Nearby Medical Centers */}
        <View style={styles.MedicalCenterSection}>
            <Text style={styles.sectionTitle}>Nearby Medical Centers</Text>
          <View style={styles.sectionHeader}>
            <Map />
          </View>
        </View>

      </ScrollView>


      {/* Emergency Call Button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={handleSOSCall}
        activeOpacity={0.8}
      >
        <View style={styles.emergencyContent}>
          <FontAwesomeIcon icon={faPhone} size={20} color="#fff" />
          <Text style={styles.emergencyButtonText}>Emergency Call</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  locationContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  bannerContainer: {
    margin: 16,
    backgroundColor: '#4A8B94',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerContent: {
    padding: 24,
    flexDirection: 'row',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  bannerDots: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
    marginHorizontal: 4,
  },
  activeDot: {
    opacity: 1,
  },
  categoriesSection: {
    padding: 16,
  },
  MedicalCenterSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  seeAllButton: {
    color: '#666',
    fontSize: 14,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  medicalCentersSection: {
    padding: 16,
    marginBottom: 80,
  },
  medicalCentersList: {
    marginTop: 16,
  },
  medicalCenter: {
    width: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  medicalImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0F0F0',
  },
  medicalInfo: {
    padding: 12,
  },
  medicalName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  medicalAddress: {
    fontSize: 12,
    color: '#666',
  },
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;