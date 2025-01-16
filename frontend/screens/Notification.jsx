// Notifications.jsx
import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const Notifications = ({ navigation }) => {


    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false, 
        });
    }, [navigation]);
    
    const [notifications] = useState([
      {
        id: '1',
        text: 'New lab results for Sarah Johnson',
        time: '2h ago',
        type: 'lab',
        details: {
          patientName: 'Sarah Johnson',
          patientId: 'P-1234',
          category: 'Lab Results',
          testType: 'Blood Work',
          status: 'Ready for Review',
          receivedAt: '2024-01-15 10:30 AM',
          priority: 'Normal',
        }
      },
      {
        id: '2',
        text: 'Appointment request from James Brown',
        time: '3h ago',
        type: 'appointment',
        details: {
          patientName: 'James Brown',
          patientId: 'P-5678',
          requestType: 'Follow-up',
          preferredDate: '2024-01-20',
          preferredTime: 'Morning',
          reason: 'Discuss test results',
          priority: 'Medium',
        }
      },
      {
        id: '3',
        text: 'Prescription renewal for Emma Wilson',
        time: '5h ago',
        type: 'prescription',
        details: {
          patientName: 'Emma Wilson',
          patientId: 'P-9012',
          medication: 'Amoxicillin',
          currentDosage: '500mg',
          frequency: 'Twice daily',
          lastPrescribed: '2023-12-15',
          priority: 'High',
        }
      },
      {
        id: '4',
        text: 'New appointment scheduled for Michael Scott',
        time: '1d ago',
        type: 'appointment',
        details: {
          patientName: 'Michael Scott',
          patientId: 'P-3456',
          requestType: 'Consultation',
          preferredDate: '2024-02-01',
          preferredTime: 'Afternoon',
          reason: 'Routine check-up',
          priority: 'Normal',
        }
      },
      {
        id: '5',
        text: 'Lab results available for Angela Martin',
        time: '2d ago',
        type: 'lab',
        details: {
          patientName: 'Angela Martin',
          patientId: 'P-7890',
          category: 'Lab Results',
          testType: 'X-ray',
          status: 'Ready for Review',
          receivedAt: '2024-01-13 09:00 AM',
          priority: 'Low',
        }
      },
      {
        id: '6',
        text: 'New prescription for Dwight Schrute',
        time: '3d ago',
        type: 'prescription',
        details: {
          patientName: 'Dwight Schrute',
          patientId: 'P-1122',
          medication: 'Lisinopril',
          currentDosage: '10mg',
          frequency: 'Once daily',
          lastPrescribed: '2024-01-12',
          priority: 'Medium',
        }
      },
      {
        id: '7',
        text: 'Appointment cancellation for Pam Beesly',
        time: '3d ago',
        type: 'appointment',
        details: {
          patientName: 'Pam Beesly',
          patientId: 'P-3344',
          requestType: 'Consultation',
          preferredDate: '2024-01-18',
          preferredTime: 'Morning',
          reason: 'Canceled appointment',
          priority: 'Low',
        }
      },
      {
        id: '8',
        text: 'Test results available for Ryan Howard',
        time: '4d ago',
        type: 'lab',
        details: {
          patientName: 'Ryan Howard',
          patientId: 'P-5566',
          category: 'Lab Results',
          testType: 'MRI Scan',
          status: 'In Review',
          receivedAt: '2024-01-10 03:30 PM',
          priority: 'High',
        }
      },
      {
        id: '9',
        text: 'Prescription renewal reminder for Toby Flenderson',
        time: '5d ago',
        type: 'prescription',
        details: {
          patientName: 'Toby Flenderson',
          patientId: 'P-7788',
          medication: 'Hydrochlorothiazide',
          currentDosage: '25mg',
          frequency: 'Once daily',
          lastPrescribed: '2023-12-10',
          priority: 'Normal',
        }
      },
      {
        id: '10',
        text: 'New lab results for Jan Levinson',
        time: '6d ago',
        type: 'lab',
        details: {
          patientName: 'Jan Levinson',
          patientId: 'P-8899',
          category: 'Lab Results',
          testType: 'Urine Test',
          status: 'Pending Review',
          receivedAt: '2024-01-08 07:45 AM',
          priority: 'Medium',
        }
      },
      {
        id: '11',
        text: 'New appointment request for Creed Bratton',
        time: '6d ago',
        type: 'appointment',
        details: {
          patientName: 'Creed Bratton',
          patientId: 'P-9900',
          requestType: 'Routine Check',
          preferredDate: '2024-01-25',
          preferredTime: 'Afternoon',
          reason: 'Routine check-up',
          priority: 'Normal',
        }
      },
      {
        id: '12',
        text: 'Prescription alert for Stanley Hudson',
        time: '7d ago',
        type: 'prescription',
        details: {
          patientName: 'Stanley Hudson',
          patientId: 'P-1111',
          medication: 'Metformin',
          currentDosage: '500mg',
          frequency: 'Twice daily',
          lastPrescribed: '2023-12-05',
          priority: 'High',
        }
      },
      {
        id: '13',
        text: 'Upcoming appointment reminder for Kelly Kapoor',
        time: '8d ago',
        type: 'appointment',
        details: {
          patientName: 'Kelly Kapoor',
          patientId: 'P-2222',
          requestType: 'Consultation',
          preferredDate: '2024-02-10',
          preferredTime: 'Morning',
          reason: 'Consultation regarding health',
          priority: 'Low',
        }
      },
      {
        id: '14',
        text: 'New test results for Oscar Martinez',
        time: '10d ago',
        type: 'lab',
        details: {
          patientName: 'Oscar Martinez',
          patientId: 'P-3333',
          category: 'Lab Results',
          testType: 'Cholesterol Test',
          status: 'Ready for Review',
          receivedAt: '2024-01-05 11:00 AM',
          priority: 'Normal',
        }
      },
      {
        id: '15',
        text: 'New prescription available for Phyllis Vance',
        time: '12d ago',
        type: 'prescription',
        details: {
          patientName: 'Phyllis Vance',
          patientId: 'P-4444',
          medication: 'Amlodipine',
          currentDosage: '5mg',
          frequency: 'Once daily',
          lastPrescribed: '2023-12-01',
          priority: 'Medium',
        }
      }
    ]);
    

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'lab':
        return 'flask';
      case 'appointment':
        return 'calendar-alt';
      case 'prescription':
        return 'prescription';
      default:
        return 'bell';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'normal':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={styles.notificationCard}
            onPress={() => navigation.navigate('NotificationDetail', { notification })}
          >
            <View style={[styles.iconContainer, { backgroundColor: getPriorityColor(notification.details.priority) + '20' }]}>
              <FontAwesome5
                name={getNotificationIcon(notification.type)}
                size={20}
                color={getPriorityColor(notification.details.priority)}
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>{notification.text}</Text>
              <Text style={styles.timeText}>{notification.time}</Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>
        ))}
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
  },
  header: {
    
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default Notifications;
