import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, FlatList, Button } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const NearbyHospitals = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

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

      // Log the response to inspect the data structure
      console.log(response.data);

      // Ensure that the data structure is correct before setting it
      if (response.data && response.data.elements) {
        setHospitals(response.data.elements);
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
            {hospitals.map((hospital, index) => {
              const hospitalLatitude = hospital.lat || hospital.center?.[0];
              const hospitalLongitude = hospital.lon || hospital.center?.[1];

              // Ensure latitude and longitude are valid
              if (!hospitalLatitude || !hospitalLongitude) {
                return null; // Skip marker if latitude/longitude is missing
              }

              return (
                <Marker
                  key={index}
                  coordinate={{ latitude: hospitalLatitude, longitude: hospitalLongitude }}
                  title={hospital.tags?.name || 'Unnamed Hospital'}
                  description={hospital.tags?.addr || 'Address not available'}
                />
              );
            })}
          </MapView>
        )}
      </View>

      <View style={styles.hospitalsList}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={hospitals}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.hospitalCard}>
                <Text style={styles.hospitalName}>{item.tags?.name || 'Unnamed Hospital'}</Text>
                <Text style={styles.hospitalAddress}>{item.tags?.addr || 'Address not available'}</Text>
              </View>
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
  },
  mapContainer: {
    flex: 1,
    marginBottom: 10,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  hospitalsList: {
    flex: 1,
    marginTop: 10,
  },
  hospitalCard: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  hospitalName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#555',
  },
});

export default NearbyHospitals;
