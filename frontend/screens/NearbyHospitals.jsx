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
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const RADIUS = 5000; // 5km in meters
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const NearbyHospitals = () => {
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);

  // Calculate the region for 5km radius
  const getRegionForRadius = useCallback((latitude, longitude) => {
    const circumference = 40075;
    const oneDegreeOfLatitudeInMeters = 111.32 * 1000;
    const angularDistance = RADIUS / oneDegreeOfLatitudeInMeters;

    return {
      latitude,
      longitude,
      latitudeDelta: angularDistance * 2,
      longitudeDelta: angularDistance * 2 * ASPECT_RATIO,
    };
  }, []);

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

      const { latitude, longitude } = location.coords;
      const region = getRegionForRadius(latitude, longitude);
      
      setCurrentLocation(location.coords);
      setInitialRegion(region);

      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch your location');
    } finally {
      setLoading(false);
    }
  }, [getRegionForRadius]);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Fetch nearby hospitals
  const fetchHospitals = useCallback(async () => {
    if (!currentLocation) return;

    try {
      setLoading(true);
      const { latitude, longitude } = currentLocation;

      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:${RADIUS},${latitude},${longitude});
          way["amenity"="hospital"](around:${RADIUS},${latitude},${longitude});
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

  // Action handlers
  const makePhoneCall = (phone) => {
    if (phone !== 'Not available') {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Unavailable', 'Phone number not available for this hospital.');
    }
  };

  const openWebsite = (website) => {
    if (website !== 'Not available') {
      Linking.openURL(website);
    } else {
      Alert.alert('Unavailable', 'Website not available for this hospital.');
    }
  };

  const openDirections = (hospital) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${hospital.name}&ll=${hospital.lat},${hospital.lon}`,
      android: `${scheme}0,0?q=${hospital.lat},${hospital.lon}(${hospital.name})`,
    });
    Linking.openURL(url);
  };

  // Focus on selected hospital
  const focusOnHospital = (hospital) => {
    setSelectedHospital(hospital);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: hospital.lat,
        longitude: hospital.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  // Render hospital card
  const renderHospitalCard = ({ item }) => {
    const getButtonStyle = (infoAvailable) => ({
      ...styles.actionButton,
      backgroundColor: infoAvailable ? '#3498db' : '#bdc3c7',
      opacity: infoAvailable ? 1 : 0.6,
    });
  
    return (
      <TouchableOpacity
        style={[styles.hospitalCard, selectedHospital?.id === item.id && styles.selectedCard]}
        onPress={() => focusOnHospital(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.hospitalName} numberOfLines={2}>{item.name}</Text>
          {item.emergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyText}>24/7</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={styles.distance}>
            <MaterialIcons name="location-on" size={16} color="#666" />
            {' '}{item.distance} km away
          </Text>
          <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={getButtonStyle(item.phone !== 'Not available')}
            onPress={() => makePhoneCall(item.phone)}
            disabled={item.phone === 'Not available'}
          >
            <MaterialIcons name="phone" size={20} color="#fff" />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getButtonStyle(item.website !== 'Not available')}
            onPress={() => openWebsite(item.website)}
            disabled={item.website === 'Not available'}
          >
            <MaterialIcons name="web" size={20} color="#fff" />
            <Text style={styles.buttonText}>Website</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getButtonStyle(true)}
            onPress={() => openDirections(item)}
          >
            <MaterialIcons name="directions" size={20} color="#fff" />
            <Text style={styles.buttonText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Effects
  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchHospitals();
    }
  }, [currentLocation]);

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        {currentLocation && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            showsBuildings={true}
            showsTraffic={false}
            showsIndoors={true}
          >
            {/* 5km radius circle */}
            <Circle
              center={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              radius={RADIUS}
              fillColor="rgba(0, 102, 204, 0.1)"
              strokeColor="rgba(0, 102, 204, 0.3)"
              strokeWidth={2}
            />

            {hospitals.map((hospital) => (
              <Marker
                key={hospital.id}
                coordinate={{
                  latitude: hospital.lat,
                  longitude: hospital.lon,
                }}
                title={hospital.name}
                description={`${hospital.distance} km away`}
                onPress={() => setSelectedHospital(hospital)}
              >
                <View style={[
                  styles.markerContainer,
                  selectedHospital?.id === hospital.id && styles.selectedMarker
                ]}>
                  <MaterialIcons
                    name="local-hospital"
                    size={24}
                    color={hospital.emergency ? '#e74c3c' : '#3498db'}
                  />
                </View>
              </Marker>
            ))}
          </MapView>
        )}
      </View>

      <View style={styles.listContainer}>
        <View style={styles.radiusIndicator}>
          <MaterialIcons name="room" size={20} color="#0066cc" />
          <Text style={styles.radiusText}>Showing hospitals within 5km radius</Text>
        </View>

        <FlatList
          data={hospitals}
          keyExtractor={(item) => item.id}
          renderItem={renderHospitalCard}
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={10}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  map: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  radiusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  radiusText: {
    marginLeft: 8,
    color: '#0066cc',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hospitalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hospitalName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    color: '#2c3e50',
    letterSpacing: 0.3,
  },
  cardInfo: {
    marginVertical: 10,
  },
  emergencyBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emergencyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  distance: {
    fontSize: 15,
    color: '#34495e',
    marginBottom: 6,
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.3,
  }
  ,markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 200,  // Increased for smoother corners
    // padding: 1,        // Slightly reduced padding
    elevation: 2,      // Reduced elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 0.5,  // Reduced border width for subtler stroke
    borderColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white border
  },
  selectedMarker: {
    borderWidth: 2,    // Increased border width for selected state
    borderColor: '#e74c3c', // Changed to red color
    backgroundColor: '#fff',
    transform: [{ scale: 1.15 }], // Slightly increased scale
    elevation: 4,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
  },
  refreshButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoWindow: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    maxWidth: 200,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  infoDistance: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  }
});

export default NearbyHospitals;


// Without MAP


// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Linking,
// } from 'react-native';
// import * as Location from 'expo-location';
// import axios from 'axios';
// import { MaterialIcons } from '@expo/vector-icons';

// const NearbyHospitals = () => {
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
//     const url = `https://www.google.com/maps?q=${hospital.lat},${hospital.lon}`;
//     Linking.openURL(url);
//   };

//   // Render individual hospital card
//   const renderHospitalCard = ({ item }) => {
//     const getButtonStyle = (infoAvailable) => ({
//       ...styles.actionButton,
//       backgroundColor: infoAvailable ? '#3498db' : '#bdc3c7', // Blue for enabled, grey for disabled
//       opacity: infoAvailable ? 1 : 0.6, // Full opacity for enabled, reduced for disabled
//     });
  
//     return (
//       <TouchableOpacity
//         style={[styles.hospitalCard, selectedHospital?.id === item.id && styles.selectedCard]}
//         onPress={() => {
//           setSelectedHospital(item);
//           mapRef.current?.animateToRegion({
//             latitude: item.lat,
//             longitude: item.lon,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           });
//         }}
//       >
//         <View style={styles.cardHeader}>
//           <Text style={styles.hospitalName}>{item.name}</Text>
//           {item.emergency && (
//             <View style={styles.emergencyBadge}>
//               <Text style={styles.emergencyText}>24/7</Text>
//             </View>
//           )}
//         </View>
//         <Text style={styles.distance}>{item.distance} km away</Text>
//         <Text style={styles.address}>{item.address}</Text>
  
//         <View style={styles.actionButtons}>
//           <TouchableOpacity
//             style={getButtonStyle(item.phone !== 'Not available')}
//             onPress={() => makePhoneCall(item.phone)}
//             disabled={item.phone === 'Not available'}  // Disable if no phone
//           >
//             <MaterialIcons name="phone" size={20} color="#fff" />
//             <Text style={styles.buttonText}>Call</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={getButtonStyle(item.website !== 'Not available')}
//             onPress={() => openWebsite(item.website)}
//             disabled={item.website === 'Not available'}  // Disable if no website
//           >
//             <MaterialIcons name="web" size={20} color="#fff" />
//             <Text style={styles.buttonText}>Website</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={getButtonStyle(true)}  // Always enabled for Directions
//             onPress={() => openDirections(item)}
//           >
//             <MaterialIcons name="directions" size={20} color="#fff" />
//             <Text style={styles.buttonText}>Directions</Text>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };
//   return (
//     <SafeAreaView style={styles.container}>
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#0066cc" />
//           <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
//         </View>
//       )}

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
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 10,
//   },
//   loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
//   listContainer: { flex: 1 },
//   hospitalCard: {
//     marginHorizontal: 10,
//     marginVertical: 5,
//     padding: 10,
//     borderRadius: 8,
//     elevation: 3,
//   },
//   selectedCard: { borderColor: '#0066cc', borderWidth: 2 },
//   cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   hospitalName: { fontSize: 16, fontWeight: 'bold' },
//   emergencyBadge: {
//     backgroundColor: '#e74c3c',
//     borderRadius: 5,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//   },
//   emergencyText: { color: '#fff', fontSize: 12 },
//   distance: { fontSize: 14, marginVertical: 5 },
//   address: { fontSize: 14, color: '#777' },
//   actionButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
//   actionButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 5,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 5,
//   },
//   buttonText: { color: '#fff', marginLeft: 5, fontSize: 14 },
//   emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
// });

// export default NearbyHospitals;
