import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CategoryDetails = ({ route }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { category } = route.params;

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        console.log('Fetching doctors for category:', category); // Debug log
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'doctor'));
        const querySnapshot = await getDocs(q);
        const doctorsList = [];
        
        querySnapshot.forEach((doc) => {
          const doctorData = doc.data();
          console.log('Doctor data:', doctorData); // Debug log
          
          // Include all doctors if category is 'All', otherwise filter by specialization
          if (category === 'All' || doctorData.specialization === category) {
            const randomSeed = Math.floor(Math.random() * 1000);
            doctorsList.push({ 
              id: doc.id, 
              ...doctorData,
              photoUrl: `https://picsum.photos/seed/${randomSeed}/200/200`
            });
          }
        });
        
        console.log('Filtered doctors:', doctorsList); // Debug log
        setDoctors(doctorsList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        alert('Error loading doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [category]);

  const renderDoctor = ({ item }) => {
    console.log('Rendering doctor:', item); // Debug log
    return (
      <View style={styles.licenseCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>{item.specialization} SPECIALIST</Text>
          <Text style={styles.cardId}>{item.hospital}</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.photoSection}>
            <Image
              source={{ uri: item.photoUrl }}
              style={styles.photo}
              defaultSource={require('../assets/images/icon.png')}
            />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>NAME</Text>
              <Text style={styles.value}>Dr. {item.firstname} {item.lastname}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>HOSPITAL</Text>
              <Text style={styles.value}>{item.hospital || 'Not specified'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>EXPERIENCE</Text>
              <Text style={styles.value}>{item.experience || 'N/A'} Years</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>CONTACT</Text>
              <Text style={styles.value}>{item.phone || 'Not available'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.scheduleSection}>
          <Text style={styles.scheduleTitle}>SCHEDULE</Text>
          <View style={styles.scheduleDetails}>
            <Text style={styles.scheduleText}>
              Weekdays: {item.schedule?.__weekday || 'Not specified'}
            </Text>
            <Text style={styles.scheduleText}>
              Weekends: {item.schedule?.__weekend || 'Not specified'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Email: {item.email || 'Not available'}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {category === 'All' ? 'All Doctors' : `${category} Specialists`}
      </Text>
      {doctors.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No doctors found</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          renderItem={renderDoctor}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    padding: 8,
  },
  licenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cardId: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  cardContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  photoSection: {
    width: 100,
    height: 120,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  infoSection: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  scheduleSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  scheduleDetails: {
    marginTop: 4,
  },
  scheduleText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'right',
  },
});

export default CategoryDetails;