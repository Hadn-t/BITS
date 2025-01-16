import React, { useState } from "react";
import { 
  View, 
  Text, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

const DOCUMENT_TYPES = {
  prescription: "Prescription",
  lab_result: "Medical Report"
};

const UploadFiles = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const pickDocument = async (documentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      console.log("result picker", result);
      if (result.type === "success") {
        setSelectedFile({
          ...result,
          documentType
        });
        Alert.alert("Success", `Selected: ${result.name}`);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to select file. Please try again.");
    }
    setShowTypeModal(false);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Please select a file first.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("user_id", "user123");
    formData.append("category", selectedFile.documentType);
    formData.append("file", {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || "application/octet-stream",
    });

    try {
      const response = await fetch("http://192.168.1.2:5000/core/upload/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Upload success:", data);
      Alert.alert("Success", "File uploaded successfully!");
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const TypeSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTypeModal}
      onRequestClose={() => setShowTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Document Type</Text>
          {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={styles.modalOption}
              onPress={() => pickDocument(key)}
            >
              <Text style={styles.modalOptionText}>{value}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowTypeModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upload Medical Documents</Text>
      
      <View style={styles.mainContent}>
        {/* Select Document Button */}
        <TouchableOpacity
          style={[styles.button, styles.selectButton]}
          onPress={() => setShowTypeModal(true)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {selectedFile ? "Change File" : "Select Document"}
          </Text>
        </TouchableOpacity>

        {/* File Info */}
        {selectedFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileType}>
              Type: {DOCUMENT_TYPES[selectedFile.documentType]}
            </Text>
            <Text style={styles.fileName} numberOfLines={1}>
              File: {selectedFile.name}
            </Text>
          </View>
        )}

        {/* Upload Button - Always visible after file selection */}
        {selectedFile && (
          isLoading ? (
            <ActivityIndicator style={styles.loader} color="#2196F3" size="large" />
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.uploadButton]}
              onPress={uploadFile}
            >
              <Text style={styles.buttonText}>Upload Now</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <TypeSelectionModal />
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
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectButton: {
    backgroundColor: "#2196F3",
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
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
  fileType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#444",
  },
  fileName: {
    color: "#666",
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  modalOption: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  cancelButton: {
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#ff5252",
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UploadFiles;