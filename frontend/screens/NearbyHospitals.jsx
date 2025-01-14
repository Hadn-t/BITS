// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Platform,
//   Linking,
// } from 'react-native';
// import * as Location from 'expo-location';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import axios from 'axios';
// import { MaterialIcons } from '@expo/vector-icons';

// const NearbyHospitals = () => {
//   const mapRef = useRef(null);
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [hospitals, setHospitals] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedHospital, setSelectedHospital] = useState(null);

//   // Get current location
//   const getCurrentLocation = useCallback(async () => {
//     try {
//       setLoading(true);
//       const { status } = await Location.requestForegroundPermissionsAsync();

//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Please grant location permissions to use this app.');
//         return;
//       }

//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Highest,
//       });

//       setCurrentLocation(location.coords);

//       // Automatically zoom to the user's location (5 km radius)
//       if (mapRef.current) {
//         mapRef.current.animateToRegion({
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           latitudeDelta: 0.045,  // 5 km radius
//           longitudeDelta: 0.045,
//         }, 1000); // Duration of animation in milliseconds
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Could not fetch your location');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Fetch nearby hospitals
//   const fetchHospitals = useCallback(async () => {
//     if (!currentLocation) return;

//     try {
//       setLoading(true);
//       const { latitude, longitude } = currentLocation;

//       const query = `
//         [out:json];
//         (
//           node["amenity"="hospital"](around:5000,${latitude},${longitude});
//           way["amenity"="hospital"](around:5000,${latitude},${longitude});
//         );
//         out body;
//         >;
//         out skel qt;
//       `;

//       const response = await axios.get(
//         `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
//       );

//       if (response.data?.elements) {
//         const processedHospitals = response.data.elements
//           .filter(item => item.lat && item.lon)
//           .map(hospital => ({
//             id: hospital.id.toString(),
//             name: hospital.tags?.name || 'Unnamed Hospital',
//             address: hospital.tags?.["addr:street"]
//               ? `${hospital.tags?.["addr:street"]} ${hospital.tags?.["addr:housenumber"] || ''}`
//               : 'Address unavailable',
//             phone: hospital.tags?.phone || hospital.tags?.["contact:phone"] || 'Not available',
//             website: hospital.tags?.website || 'Not available',
//             emergency: hospital.tags?.emergency === 'yes',
//             lat: hospital.lat,
//             lon: hospital.lon,
//             distance: calculateDistance(
//               currentLocation.latitude,
//               currentLocation.longitude,
//               hospital.lat,
//               hospital.lon
//             ).toFixed(1),
//           }))
//           .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

//         setHospitals(processedHospitals);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to fetch nearby hospitals');
//     } finally {
//       setLoading(false);
//     }
//   }, [currentLocation]);

//   // Calculate distance between two coordinates
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//       Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   useEffect(() => {
//     getCurrentLocation();
//   }, []);

//   useEffect(() => {
//     if (currentLocation) {
//       fetchHospitals();
//     }
//   }, [currentLocation]);

//   // Open phone dialer
//   const makePhoneCall = (phone) => {
//     if (phone !== 'Not available') {
//       Linking.openURL(`tel:${phone}`);
//     } else {
//       Alert.alert('Unavailable', 'Phone number not available for this hospital.');
//     }
//   };

//   // Open website
//   const openWebsite = (website) => {
//     if (website !== 'Not available') {
//       Linking.openURL(website);
//     } else {
//       Alert.alert('Unavailable', 'Website not available for this hospital.');
//     }
//   };

//   // Open directions
//   const openDirections = (hospital) => {
//     const scheme = Platform.select({
//       ios: 'maps:',
//       android: 'geo:',
//     });
//     const url = Platform.select({
//       ios: `${scheme}?q=${hospital.name}&ll=${hospital.lat},${hospital.lon}`,
//       android: `${scheme}0,0?q=${hospital.lat},${hospital.lon}(${hospital.name})`,
//     });
//     Linking.openURL(url);
//   };

//   // Render individual hospital card
//   const renderHospitalCard = ({ item }) => (
//     <TouchableOpacity
//       style={[styles.hospitalCard, selectedHospital?.id === item.id && styles.selectedCard]}
//       onPress={() => {
//         setSelectedHospital(item);
//         mapRef.current?.animateToRegion({
//           latitude: item.lat,
//           longitude: item.lon,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         });
//       }}
//     >
//       <View style={styles.cardHeader}>
//         <Text style={styles.hospitalName}>{item.name}</Text>
//         {item.emergency && (
//           <View style={styles.emergencyBadge}>
//             <Text style={styles.emergencyText}>24/7</Text>
//           </View>
//         )}
//       </View>
//       <Text style={styles.distance}>{item.distance} km away</Text>
//       <Text style={styles.address}>{item.address}</Text>

//       <View style={styles.actionButtons}>
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => makePhoneCall(item.phone)}
//         >
//           <MaterialIcons name="phone" size={20} color="#fff" />
//           <Text style={styles.buttonText}>Call</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => openWebsite(item.website)}
//         >
//           <MaterialIcons name="web" size={20} color="#fff" />
//           <Text style={styles.buttonText}>Website</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => openDirections(item)}
//         >
//           <MaterialIcons name="directions" size={20} color="#fff" />
//           <Text style={styles.buttonText}>Directions</Text>
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#0066cc" />
//           <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
//         </View>
//       )}

//       <View style={styles.mapContainer}>
//         {currentLocation && (
//           <MapView
//             ref={mapRef}
//             style={styles.map}
//             showsUserLocation={true}
//             showsMyLocationButton={true}
//             followsUserLocation={true}
//           >
//             {hospitals.map((hospital) => (
//               <Marker
//                 key={hospital.id}
//                 coordinate={{
//                   latitude: hospital.lat,
//                   longitude: hospital.lon,
//                 }}
//                 title={hospital.name}
//                 description={`${hospital.distance} km away`}
//               >
//                 <View style={styles.markerContainer}>
//                   <MaterialIcons
//                     name="local-hospital"
//                     size={30}
//                     color={hospital.emergency ? '#e74c3c' : '#3498db'}
//                   />
//                 </View>
//               </Marker>
//             ))}
//           </MapView>
//         )}
//       </View>

//       <View style={styles.listContainer}>
//         <FlatList
//           data={hospitals}
//           keyExtractor={(item) => item.id}
//           renderItem={renderHospitalCard}
//           initialNumToRender={5}
//           maxToRenderPerBatch={8}
//           windowSize={10}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No hospitals found nearby.</Text>
//           }
//         />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   },
//   loadingText: { fontSize: 18, color: '#fff', marginTop: 10 },
//   mapContainer: { flex: 1 },
//   map: { ...StyleSheet.absoluteFillObject },
//   listContainer: { flex: 1, padding: 10 },
//   emptyText: { fontSize: 18, textAlign: 'center', color: '#888' },
//   hospitalCard: {
//     backgroundColor: '#fff',
//     padding: 15,
//     marginBottom: 15,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   selectedCard: { backgroundColor: '#e0e0e0' },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
//   hospitalName: { fontSize: 18, fontWeight: 'bold' },
//   emergencyBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
//   emergencyText: { color: '#fff', fontWeight: 'bold' },
//   distance: { fontSize: 14, color: '#777' },
//   address: { fontSize: 14, color: '#555' },
//   actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
//   actionButton: {
//     flexDirection: 'row',
//     backgroundColor: '#3498db',
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   buttonText: { color: '#fff', marginLeft: 5 },
// });

// export default NearbyHospitals;





// Without MAP


import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const NearbyHospitals = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permissions to use this app.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setCurrentLocation(location.coords);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch your location');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch nearby hospitals
  const fetchHospitals = useCallback(async () => {
    if (!currentLocation) return;

    try {
      setLoading(true);
      const { latitude, longitude } = currentLocation;

      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000,${latitude},${longitude});
          way["amenity"="hospital"](around:5000,${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await axios.get(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );

      if (response.data?.elements) {
        const processedHospitals = response.data.elements
          .filter(item => item.lat && item.lon)
          .map(hospital => ({
            id: hospital.id.toString(),
            name: hospital.tags?.name || 'Unnamed Hospital',
            address: hospital.tags?.["addr:street"]
              ? `${hospital.tags?.["addr:street"]} ${hospital.tags?.["addr:housenumber"] || ''}`
              : 'Address unavailable',
            phone: hospital.tags?.phone || hospital.tags?.["contact:phone"] || 'Not available',
            website: hospital.tags?.website || 'Not available',
            emergency: hospital.tags?.emergency === 'yes',
            lat: hospital.lat,
            lon: hospital.lon,
            distance: calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              hospital.lat,
              hospital.lon
            ).toFixed(1),
          }))
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

        setHospitals(processedHospitals);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby hospitals');
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchHospitals();
    }
  }, [currentLocation]);

  // Open phone dialer
  const makePhoneCall = (phone) => {
    if (phone !== 'Not available') {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Unavailable', 'Phone number not available for this hospital.');
    }
  };

  // Open website
  const openWebsite = (website) => {
    if (website !== 'Not available') {
      Linking.openURL(website);
    } else {
      Alert.alert('Unavailable', 'Website not available for this hospital.');
    }
  };

  // Open directions
  const openDirections = (hospital) => {
    const url = `https://www.google.com/maps?q=${hospital.lat},${hospital.lon}`;
    Linking.openURL(url);
  };

  // Render individual hospital card
  const renderHospitalCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.hospitalCard, selectedHospital?.id === item.id && styles.selectedCard]}
      onPress={() => setSelectedHospital(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.hospitalName}>{item.name}</Text>
        {item.emergency && (
          <View style={styles.emergencyBadge}>
            <Text style={styles.emergencyText}>24/7</Text>
          </View>
        )}
      </View>
      <Text style={styles.distance}>{item.distance} km away</Text>
      <Text style={styles.address}>{item.address}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => makePhoneCall(item.phone)}
        >
          <MaterialIcons name="phone" size={20} color="#fff" />
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openWebsite(item.website)}
        >
          <MaterialIcons name="web" size={20} color="#fff" />
          <Text style={styles.buttonText}>Website</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openDirections(item)}
        >
          <MaterialIcons name="directions" size={20} color="#fff" />
          <Text style={styles.buttonText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
        </View>
      )}

      <View style={styles.listContainer}>
        <FlatList
          data={hospitals}
          keyExtractor={(item) => item.id}
          renderItem={renderHospitalCard}
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={10}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hospitals found nearby.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  listContainer: { flex: 1 },
  hospitalCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  selectedCard: { borderColor: '#0066cc', borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hospitalName: { fontSize: 16, fontWeight: 'bold' },
  emergencyBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  emergencyText: { color: '#fff', fontSize: 12 },
  distance: { fontSize: 14, color: '#555', marginVertical: 4 },
  address: { fontSize: 14, color: '#777', marginBottom: 8 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: { color: '#fff', marginLeft: 5, fontSize: 14 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
});

export default NearbyHospitals;

