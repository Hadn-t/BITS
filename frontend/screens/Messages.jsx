import React, { useState, useLayoutEffect, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, firestore } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, addDoc } from "firebase/firestore"; // import Firestore methods
import { useNavigation } from "@react-navigation/native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

// Make sure to get Firestore instance correctly
import { getFirestore } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [usernames, setUsernames] = useState({}); // Cache for usernames
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
    navigation.navigate("Login");
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onSignOut} style={styles.logoutButton}>
          <AntDesign name="logout" size={24} color="#6366F1" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: "#F8FAFC",
      },
      headerTintColor: "#6366F1",
      headerTitleStyle: {
        fontWeight: "600",
      },
    });
  }, [navigation]);

  useEffect(() => {
    // Correct usage of Firestore
    const firestore = getFirestore(); // Ensure firestore instance is initialized

    // Fetching all usernames once on load
    const usersRef = collection(firestore, "users");
    onSnapshot(usersRef, (snapshot) => {
      const userMap = {};
      snapshot.forEach((doc) => {
        userMap[doc.id] = doc.data().username; // Use the `uid` as the key and the `username` as the value
      });
      setUsernames(userMap);
    });

    // Fetching messages in descending order
    const messagesRef = collection(firestore, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = [];
      snapshot.forEach((doc) => {
        messageList.push({ ...doc.data(), _id: doc.id });
      });
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = useCallback(() => {
    if (!inputText.trim()) return;

    const firestore = getFirestore(); // Ensure firestore instance is initialized
    const messagesRef = collection(firestore, "messages");

    const message = {
      createdAt: Date.now(),
      text: inputText.trim(),
      user: {
        _id: auth?.currentUser?.uid, // Using UID to track the user
      },
    };

    addDoc(messagesRef, message);
    setInputText("");
  }, [inputText]);

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.user._id === auth?.currentUser?.uid;
    const formattedTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const username = usernames[item.user._id] || "Loading..."; // Fallback to "Loading..." if the username isn't loaded yet

    return (
      <View
        style={[
          styles.messageRowContainer,
          isCurrentUser ? styles.currentUserRow : styles.otherUserRow,
        ]}
      >
        {!isCurrentUser && (
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        )}
        <View>
          {!isCurrentUser ? (
            <Text style={styles.userIdText_current}>{username}</Text>
          ) : (
            <Text style={styles.userIdText_other}>You</Text>
          )}
          <View
            style={[
              styles.messageContainer,
              isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText,
              ]}
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.timeText,
                isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
              ]}
            >
              {formattedTime}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
          maxHeight={100}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendButton}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={inputText.trim() ? "#6366F1" : "#CBD5E1"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  messagesList: {
    padding: 15,
  },
  messageRowContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
  },
  currentUserRow: {
    justifyContent: "flex-end",
  },
  otherUserRow: {
    justifyContent: "flex-start",
  },
  messageContainer: {
    maxWidth: width * 0.7,
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  currentUserMessage: {
    backgroundColor: "#6366F1",
    borderTopRightRadius: 4,
  },
  otherUserMessage: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserText: {
    color: "#FFFFFF",
  },
  otherUserText: {
    color: "#1E293B",
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
  },
  currentUserTime: {
    color: "#E2E8F0",
  },
  otherUserTime: {
    color: "#94A3B8",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  attachButton: {
    padding: 8,
  },
  logoutButton: {
    marginRight: 12,
  },
  userIdText_current: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    marginRight: 40,
    textAlign: "right",
  },
  userIdText_other: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    marginLeft: 40,
    textAlign: "left",
  },
});
