import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Map = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [RADIUS, setRADIUS] = useState(5000);

  const getRegionForRadius = useCallback(
    (latitude, longitude) => {
      const circumference = 40075; // Earth's circumference in km
      const oneDegreeOfLatitudeInMeters = 111.32 * 1000; // Meters per degree of latitude
      const angularDistance = RADIUS / oneDegreeOfLatitudeInMeters;

      return {
        latitude,
        longitude,
        latitudeDelta: angularDistance * 2,
        longitudeDelta: angularDistance * 2 * (width / height),
      };
    },
    [RADIUS]
  );

  useEffect(() => {
    if (currentLocation) {
      fetchHospitals();
    }
  }, [currentLocation, RADIUS]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant location permissions to use this app."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setCurrentLocation(location.coords);
    } catch (error) {
      Alert.alert("Error", "Could not fetch your location");
    } finally {
      setLoading(false);
    }
  };

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
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          query
        )}`
      );

      if (response.data?.elements) {
        const processedHospitals = response.data.elements
          .filter((item) => item.lat && item.lon)
          .map((hospital) => ({
            id: hospital.id.toString(),
            name: hospital.tags?.name || "Unnamed Hospital",
            address: hospital.tags?.["addr:street"]
              ? `${hospital.tags?.["addr:street"]} ${hospital.tags?.["addr:housenumber"] || ""}`
              : "Address unavailable",
            phone:
              hospital.tags?.phone ||
              hospital.tags?.["contact:phone"] ||
              "Not available",
            website: hospital.tags?.website || "Not available",
            emergency: hospital.tags?.emergency === "yes",
            lat: hospital.lat,
            lon: hospital.lon,
          }));

        setHospitals(processedHospitals);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch nearby hospitals");
    } finally {
      setLoading(false);
    }
  }, [currentLocation, RADIUS]);

  const makePhoneCall = (phone) => {
    if (phone !== "Not available") {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("Unavailable", "Phone number not available for this hospital.");
    }
  };

  const openWebsite = (website) => {
    if (website !== "Not available") {
      Linking.openURL(website);
    } else {
      Alert.alert("Unavailable", "Website not available for this hospital.");
    }
  };

  const renderHospitalCard = ({ item }) => {
    return (
      <TouchableOpacity style={styles.hospitalCard} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <Text style={styles.hospitalName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.emergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyText}>24/7</Text>
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.address} numberOfLines={2}>
            {item.address}
          </Text>
        </View>

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
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
        </View>
      )}

      <FlatList
        data={hospitals}
        keyExtractor={(item) => item.id}
        renderItem={renderHospitalCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A8B94',
    fontWeight: '600',
  },
  hospitalCard: {
    width: width * 0.85,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hospitalName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 12,
    letterSpacing: 0.3,
  },
  emergencyBadge: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#ff4757',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#4a4a4a',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A8B94',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#4A8B94',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  websiteButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4A8B94',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  websiteButtonText: {
    color: '#4A8B94',
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  distanceBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#4A8B94',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
  distanceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  address: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
    marginLeft:10,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    fontSize: 14,
    color: '#ffa502',
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  }
});

export default Map;
