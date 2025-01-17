import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

const DOCUMENT_TYPES = {
  prescription: "Prescription",
  lab_result: "Lab Result",
};

const HealthRecordsScreen = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [name, setName] = useState("");
  const [userFiles, setUserFiles] = useState([]);

  // Fetch user's files on component mount
  useEffect(() => {
    fetchUserFiles();
  }, []);

  const fetchUserFiles = async () => {
    setFilesLoading(true);
    try {
      const response = await fetch(
        "http://192.168.29.157:5000/core/user/user123/files/"
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }

      const files = await response.json();
      setUserFiles(files);
    } catch (error) {
      console.error("Error fetching user files:", error);
      Alert.alert("Error", `Failed to fetch files: ${error.message}`);
    } finally {
      setFilesLoading(false);
    }
  };

  const pickDocument = async (documentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
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

    setIsLoading(true);

    try {
      const formData = new FormData();

      const fileToUpload = {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || "application/octet-stream",
        name: name.trim() || selectedFile.name,
      };

      formData.append("file", fileToUpload);
      formData.append("user_id", "user123");
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

      Alert.alert("Success", "File uploaded successfully!");
      setSelectedFile(null);
      setSelectedDocType(null);
      setName("");

      // Refresh the file list after successful upload
      fetchUserFiles();
    } catch (error) {
      console.error("Error during file upload:", error);
      Alert.alert("Error", `Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileItem = ({ item }) => (
    <View style={styles.fileCard}>
      <Image
        source={{ uri: `http://192.168.29.157:5000${item.file}` }}
        style={styles.fileThumbnail}
      />
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>Name: {item.file_name}</Text>
        <Text style={styles.fileCategory}>
          Category: {DOCUMENT_TYPES[item.category] || item.category}
        </Text>
        <Text style={styles.fileDate}>
          Uploaded: {new Date(item.uploaded_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

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
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
            <View>
              <Text style={styles.fileDetails}>
                Type: {DOCUMENT_TYPES[selectedDocType]}
              </Text>
              <Text style={styles.fileDetails}>File: {selectedFile.name}</Text>
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

        <Text style={styles.subHeader}>Your Uploaded Files</Text>
        {filesLoading ? (
          <ActivityIndicator color="#2196F3" size="large" />
        ) : (
          <FlatList
            data={userFiles}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.fileList}
          />
        )}
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
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    color: "#444",
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  fileCard: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  fileThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  fileCategory: {
    fontSize: 14,
    color: "#666",
  },
  fileDate: {
    fontSize: 14,
    color: "#666",
  },
  loader: {
    marginVertical: 20,
  },
  fileList: {
    paddingBottom: 20,
  },
});

export default HealthRecordsScreen;
