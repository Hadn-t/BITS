import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig'; 

const Dashboard = ({ navigation }) => {
  const [userName, setUserName] = useState('Doctor');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const db = getFirestore();
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.firstname) {
            setUserName(userData.firstname);
          } else {
            setUserName('Doctor');
          }
        } else {
          console.log("User data not found!");
          setUserName('Doctor');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName('Doctor');
      }
    };

    if (auth.currentUser) {
      fetchUserData();
    } else {
      setUserName('Doctor');
    }
  }, []);
  const appointments = [
    { time: '09:00 AM', patient: 'Sarah Johnson', type: 'Check-up', status: 'Confirmed' },
    { time: '10:30 AM', patient: 'Mike Peters', type: 'Follow-up', status: 'In Progress' },
    { time: '11:45 AM', patient: 'Emma Wilson', type: 'Consultation', status: 'Waiting' },
  ];

  const notifications = [
    { text: 'New lab results for Sarah Johnson', time: '2h ago' },
    { text: 'Appointment request from James Brown', time: '3h ago' },
    { text: 'Prescription renewal for Emma Wilson', time: '5h ago' },
    { text: 'New lab results for Mike Peters', time: '1h ago' },
    { text: 'Follow-up needed for Sarah Johnson', time: '30m ago' },
    { text: 'Appointment canceled by James Brown', time: '10m ago' },
  ];

  const StatCard = ({ iconName, title, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <FontAwesome5 name={iconName} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const AppointmentCard = ({ appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentTime}>
        <FontAwesome5 name="clock" size={14} color="#666" />
        <Text style={styles.timeText}>{appointment.time}</Text>
      </View>

      <View style={styles.appointmentDetails}>
        <Text style={styles.patientName}>{appointment.patient}</Text>
        <Text style={styles.appointmentType}>{appointment.type}</Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              appointment.status === 'Confirmed'
                ? '#e1f7e1'
                : appointment.status === 'In Progress'
                ? '#e1f1ff'
                : '#fff3e1',
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color:
                appointment.status === 'Confirmed'
                  ? '#2e7d32'
                  : appointment.status === 'In Progress'
                  ? '#1976d2'
                  : '#ed6c02',
            },
          ]}
        >
          {appointment.status}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      {/* Header */}
      <View style={styles.header}>
      <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.doctorName}>Dr. {userName}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation?.navigate('Notifications')}
        >
          <FontAwesome5 name="bell" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard iconName="users" title="Total Patients" value="1,234" color="#2196F3" />
          <StatCard iconName="calendar-check" title="Today's Appointments" value="8" color="#4CAF50" />
          <StatCard iconName="clipboard-list" title="Pending Reviews" value="5" color="#FF9800" />
          <StatCard iconName="chart-line" title="Patient Growth" value="+12%" color="#9C27B0" />
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('Appointments')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.appointmentsList}>
            {appointments.map((appointment, index) => (
              <AppointmentCard key={index} appointment={appointment} />
            ))}
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          {notifications.slice(0, 3).map((notification, index) => (
            <TouchableOpacity
              key={index}
              style={styles.notificationCard}
              onPress={() => navigation?.navigate('NotificationDetail', { notification })}
            >
              <FontAwesome5 name="user-check" size={20} color="#666" />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>{notification.text}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  notificationButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: (Dimensions.get('window').width - 40) / 2,
    alignItems: 'center',
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  seeAllButton: {
    color: '#2196F3',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  appointmentsList: {
    gap: 10,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: '25%',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  appointmentDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  appointmentType: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  notificationContent: {
    marginLeft: 15,
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default Dashboard;
