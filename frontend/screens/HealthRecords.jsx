import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { auth } from '../firebaseConfig';

const DOCUMENT_TYPES = {
  prescription: "Prescription",
  lab_result: "Lab Result",
};

const HealthRecordsScreen = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [name, setName] = useState('');

  const pickDocument = async (documentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log("Picked asset:", asset);

        setSelectedFile(asset);
        setSelectedDocType(documentType);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select file. Please try again.");
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Please select a file first.");
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "Please login first.");
      return;
    }

    const userId = auth.currentUser.uid;
    console.log("Uploading file for user:", userId);

    setIsLoading(true);

    try {
      const formData = new FormData();

      const fileToUpload = {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || "application/octet-stream",
        name: name.trim() || selectedFile.name,
      };

      formData.append("file", fileToUpload);
      formData.append("user_id", userId);
      formData.append("category", selectedDocType);
      formData.append("name", name);

      const csrfToken = "YOUR_CSRF_TOKEN";

      const response = await fetch("http://192.168.29.157:5000/core/upload/", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "X-CSRFToken": csrfToken,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Upload successful for user:", userId);
      Alert.alert("Success", "File uploaded successfully!");
      setSelectedFile(null);
      setSelectedDocType(null);
      setName('');
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack,
        userId: auth.currentUser?.uid
      });
      Alert.alert("Error", `Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Files</Text>

      <View style={styles.mainContent}>
        <View style={styles.buttonContainer}>
          {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.button,
                styles.typeButton,
                selectedDocType === key && styles.selectedButton,
              ]}
              onPress={() => pickDocument(key)}
            >
              <Text style={styles.buttonText}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedFile && (
          <View style={styles.fileInfo}>
            <TextInput
              placeholder="Enter the File Name"
              style={styles.fileNameInput}
              value={name}
              onChangeText={setName}
            />
            <View style={styles.fileDetailsContainer}>
              <Text style={styles.fileType}>
                Type: {DOCUMENT_TYPES[selectedDocType]}
              </Text>

              <Text style={styles.fileName} numberOfLines={1}>
                File: {selectedFile.name}
              </Text>
              <Text style={styles.fileDetails}>
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          </View>
        )}

        {selectedFile &&
          (isLoading ? (
            <ActivityIndicator
              style={styles.loader}
              color="#2196F3"
              size="large"
            />
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.uploadButton]}
              onPress={uploadFile}
            >
              <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#333",
  },
  mainContent: {
    gap: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#2196F3",
  },
  selectedButton: {
    backgroundColor: "#1976D2",
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fileInfo: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  fileNameInput: {
    width: "100%",
    borderRadius: 12,
    height: 60,
    borderColor: "teal",
    borderWidth: 2,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  fileDetailsContainer: {
    paddingLeft: 12,
    marginTop: 12,
  },
  fileType: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    color: "#444",
  },
  fileName: {
    color: "#666",
    fontSize: 16,
    marginBottom: 5,
  },
  fileDetails: {
    color: "#666",
    fontSize: 16,
    marginBottom: 5,
  },
  loader: {
    marginVertical: 20,
  },
});

export default HealthRecordsScreen;