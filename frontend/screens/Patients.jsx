import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Patients = ({navigation}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("role", "==", "client"));
        const querySnapshot = await getDocs(q);
        const clientList = [];
        querySnapshot.forEach((doc) => {
          const randomSeed = Math.floor(Math.random() * 1000);
          clientList.push({
            id: doc.id,
            ...doc.data(),
            photoUrl: `https://picsum.photos/seed/${randomSeed}/200/200`,
          });
        });
        setClients(clientList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clients: ", error);
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const renderClient = ({ item }) => (
    <View style={styles.licenseCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>PATIENT ID CARD</Text>
        <Text style={styles.cardId}>ID: {item.uid}</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.photoSection}>
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.photo}
            defaultSource={{ uri: "https://picsum.photos/200/200" }}
          />
          <View style={styles.photoOverlay}>
            <Text style={styles.photoText}>PHOTO</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>FIRST NAME</Text>
            <Text style={styles.value}>{item.firstname || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>LAST NAME</Text>
            <Text style={styles.value}>{item.lastname || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{item.email || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>MOBILE</Text>
            <Text style={styles.value}>{item.phone || "N/A"}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#f5f5dc",
          height: 50,
          width: "100%",
          borderRadius: 26,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => navigation.navigate("Refer")}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight:'condensedBold',
          }}
        >View Patient Report's</Text>
      </TouchableOpacity>

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>Valid Until: 12/2025</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Directory</Text>
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  loading: {
    textAlign: "center",
    marginTop: 20,
  },
  listContainer: {
    padding: 8,
  },
  licenseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  cardId: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  cardContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  photoSection: {
    width: 100,
    marginRight: 16,
    position: "relative",
  },
  photo: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  photoText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
  },
  infoSection: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "right",
  },
});

export default Patients;