import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';

const Reference = ({ fileId, userId }) => {
  const [documentReference, setDocumentReference] = useState(null);

  useEffect(() => {
    const fetchDocumentReference = async () => {
      try {
        const response = await fetch(`http://192.168.29.157:8000/core/document_reference/${1}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userId}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setDocumentReference(data);
      } catch (error) {
        console.error('Error fetching document reference:', error);
      }
    };

    if (fileId && userId) {
      fetchDocumentReference();
    }
  }, [fileId, userId]);

  if (!documentReference) {
    return <Text>Loading document reference...</Text>;
  }

  return (
    <View>
      <Text>Document Title: {documentReference.content[0].attachment.title}</Text>
      <Text>Document Type: {documentReference.type.coding[0].display}</Text>
      <Text>Uploaded At: {documentReference.date}</Text>

      <Button
        title="Download Document"
        onPress={() => {
          // Trigger the file download from the URL
          const fileUrl = documentReference.content[0].attachment.url;
          console.log('Downloading file from:', fileUrl);
        }}
      />
    </View>
  );
};

export default Reference;