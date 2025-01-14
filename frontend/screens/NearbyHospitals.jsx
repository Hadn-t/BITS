import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, FlatList, Button, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Correct import
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons'; // For distance icon

// Haversine Formula to calculate distance between two lat/long points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const NearbyHospitals = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('distance'); // Default sort by distance

  // Function to get the user's current location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords);
  };

  // Function to fetch nearby hospitals from OpenStreetMap using Overpass API
  const getNearbyHospitals = async () => {
    if (!currentLocation) return;
    setLoading(true);
    const { latitude, longitude } = currentLocation;

    try {
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000,${latitude},${longitude});
          way["amenity"="hospital"](around:5000,${latitude},${longitude});
          relation["amenity"="hospital"](around:5000,${latitude},${longitude});
        );
        out body;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const response = await axios.get(url);

      if (response.data && response.data.elements) {
        const hospitalsData = response.data.elements.map((hospital) => {
          const { lat, lon } = hospital;
          if (lat && lon) {
            const distance = calculateDistance(latitude, longitude, lat, lon);
            return {
              id: hospital.id,
              name: hospital.tags?.name || 'Unnamed Hospital',
              address: hospital.tags?.addr || 'Address not available',
              phone: hospital.tags?.phone || 'Not available',
              website: hospital.tags?.website || 'Not available',
              rating: hospital.tags?.rating || 0, // Assuming we have a rating field
              lat,
              lon,
              distance: distance.toFixed(2), // Distance in km
            };
          }
          return null;
        }).filter(hospital => hospital !== null); // Filter out hospitals without valid coordinates
        setHospitals(hospitalsData);
      } else {
        Alert.alert('No hospitals found', 'No hospitals found near your location.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch nearby hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      getNearbyHospitals();
    }
  }, [currentLocation]);

  useEffect(() => {
    if (sortCriteria === 'distance') {
      setHospitals(prevHospitals => prevHospitals.sort((a, b) => a.distance - b.distance)); // Sort by distance
    } else if (sortCriteria === 'rating') {
      setHospitals(prevHospitals => prevHospitals.sort((a, b) => b.rating - a.rating)); // Sort by rating
    }
  }, [sortCriteria]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {currentLocation && (
          <MapView
            style={styles.map}
            region={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            loadingEnabled={true}
          >
            {hospitals.map((hospital) => (
              <Marker
                key={hospital.id}
                coordinate={{
                  latitude: hospital.lat,
                  longitude: hospital.lon,
                }}
                title={hospital.name}
                description={hospital.address}
              />
            ))}
          </MapView>
        )}
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterText}>Sort by:</Text>
        <Picker
          selectedValue={sortCriteria}
          style={styles.picker}
          onValueChange={(itemValue) => setSortCriteria(itemValue)}
        >
          <Picker.Item label="Distance" value="distance" />
          <Picker.Item label="Rating" value="rating" />
        </Picker>
      </View>

      <View style={styles.hospitalsList}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <FlatList
            data={hospitals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.hospitalCard} onPress={() => Alert.alert(item.name, 'More details here')}>
                <Text style={styles.hospitalName}>{item.name}</Text>
                <Text style={styles.hospitalAddress}>{item.address}</Text>
                <View style={styles.cardDetails}>
                  <Text style={styles.hospitalDistance}>
                    <MaterialIcons name="location-on" size={20} color="#888" /> {item.distance} km
                  </Text>
                  <Text style={styles.hospitalRating}>
                    <MaterialIcons name="star" size={20} color="#888" /> {item.rating} / 5
                  </Text>
                  <Text style={styles.hospitalPhone}>
                    <MaterialIcons name="call" size={20} color="#888" /> {item.phone}
                  </Text>
                  <Text style={styles.hospitalWebsite}>
                    <MaterialIcons name="web" size={20} color="#888" /> {item.website}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <Button title="Get Nearby Hospitals" onPress={getNearbyHospitals} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    marginBottom: 10,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  filterContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  picker: {
    height: 50,
    width: 150,
  },
  hospitalsList: {
    flex: 1,
    marginTop: 10,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  hospitalCard: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    marginBottom: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  hospitalName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  cardDetails: {
    flexDirection: 'column',
    marginTop: 5,
  },
  hospitalDistance: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  hospitalRating: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  hospitalPhone: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  hospitalWebsite: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
});

export default NearbyHospitals;
