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
  SafeAreaView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { auth } from "../firebaseConfig";

const DOCUMENT_TYPES = {
  prescription: "Prescription",
  lab_result: "Lab Result",
};

const HealthRecordsScreen = () => {
  // Keeping all state and functions unchanged
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [name, setName] = useState("");
  const [fileList, setFileList] = useState([]);

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

  // Function to upload the selected file
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
        uri: decodeURI(selectedFile.uri),
        type: selectedFile.mimeType || "application/octet-stream",
        name: name.trim() || selectedFile.name,
      };

      formData.append("file", fileToUpload);
      formData.append("user_id", userId); // Use dynamic user ID here
      formData.append("category", selectedDocType);
      formData.append("name", name);

      const csrfToken = "YOUR_CSRF_TOKEN"; // Replace with your actual CSRF token if needed

      const response = await fetch("http://192.168.1.2:8000/core/upload/", {
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
      Alert.alert("Success", "File uploaded successfully!");
      setSelectedFile(null);
      setSelectedDocType(null);
      setName("");
      fetchFiles();
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack,
      });
      Alert.alert("Error", `Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch the list of uploaded files
  const fetchFiles = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert("Error", "Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.1.2:8000/core/user/${userId}/files/`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status}`);
      }
      const data = await response.json();

      // Add the base URL to the file paths
      const filesWithFullUrls = data.files.map((file) => ({
        ...file,
        file_url: `http://192.168.1.2:8000${file.file}`,
      }));

      setFileList(filesWithFullUrls || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      Alert.alert("Error", `Failed to fetch files: ${error.message}`);
    }
  };

  // Function to download the file
  const downloadFile = async (fileUrl, fileName) => {
    if (!fileUrl || !fileName) {
      Alert.alert("Error", "Invalid file URL or file name.");
      console.log("Error", "Invalid file URL or file name.");
      return;
    }

    try {
      // Construct the URI where the file will be saved
      const uri = `${FileSystem.documentDirectory}${fileName}`;
      console.log("Downloading file to:", uri); // Log the target URI

      // Download the file
      const { uri: downloadedUri } = await FileSystem.downloadAsync(
        fileUrl,
        uri
      );

      // Notify the user about successful download
      Alert.alert("Success", `File downloaded to ${downloadedUri}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Error", `Failed to download file: ${error.message}`);
    }
  };
  useEffect(() => {
    fetchFiles();
  }, []);

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return "📄";
    if (['jpg', 'jpeg', 'png'].includes(ext)) return "🖼️";
    if (['doc', 'docx'].includes(ext)) return "📝";
    return "📎";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Records</Text>
          <Text style={styles.headerSubtitle}>Manage your medical documents</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Upload New Document</Text>
            <View style={styles.buttonContainer}>
              {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.docTypeButton,
                    selectedDocType === key && styles.selectedDocTypeButton,
                  ]}
                  onPress={() => pickDocument(key)}
                >
                  <Text 
                    style={[
                      styles.docTypeButtonText,
                      selectedDocType === key && styles.selectedDocTypeButtonText
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedFile && (
              <View style={styles.selectedFileCard}>
                <TextInput
                  placeholder="Enter document name..."
                  placeholderTextColor="#94A3B8"
                  style={styles.fileNameInput}
                  value={name}
                  onChangeText={setName}
                />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileDetailText}>
                    Type: {DOCUMENT_TYPES[selectedDocType]}
                  </Text>
                  <Text style={styles.fileDetailText} numberOfLines={1}>
                    File: {selectedFile.name}
                  </Text>
                  <Text style={styles.fileDetailText}>
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
                {isLoading ? (
                  <ActivityIndicator style={styles.loader} color="#3B82F6" size="large" />
                ) : (
                  <TouchableOpacity style={styles.uploadButton} onPress={uploadFile}>
                    <Text style={styles.uploadButtonText}>Upload Document</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.filesSection}>
            <Text style={styles.sectionTitle}>Your Documents</Text>
            <FlatList
              data={fileList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.fileItem}
                  onPress={() => {
                    if (item.file_url) {
                      downloadFile(item.file_url, item.file_name);
                    } else {
                      Alert.alert("Error", "Invalid file URL.");
                    }
                  }}
                >
                  <View style={styles.fileItemContent}>
                    <Text style={styles.fileIcon}>{getFileIcon(item.file_name)}</Text>
                    <View style={styles.fileItemDetails}>
                      <Text style={styles.fileName}>{item.file_name}</Text>
                      <Text style={styles.fileCategory}>{item.category}</Text>
                    </View>
                    <Text style={styles.downloadIcon}>Download</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No documents uploaded yet</Text>
                  <Text style={styles.emptyStateSubtext}>Your uploaded documents will appear here</Text>
                </View>
              }
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  uploadSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  docTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  selectedDocTypeButton: {
    backgroundColor: "#4A8B94",
  },
  docTypeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  selectedDocTypeButtonText: {
    color: "#FFFFFF",
  },
  selectedFileCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  fileNameInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#1E293B",
  },
  fileDetails: {
    marginTop: 12,
    gap: 4,
  },
  fileDetailText: {
    fontSize: 14,
    color: "#4A8B94",
  },
  uploadButton: {
    backgroundColor: "#4A8B94",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  filesSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fileItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 8,
  },
  fileItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileItemDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
  },
  fileCategory: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  downloadIcon: {
    fontSize: 10,
    color: "#4A8B94",
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  loader: {
    marginVertical: 16,
  },
});

export default HealthRecordsScreen;