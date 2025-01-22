import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';

const Appointment = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [patientDetails, setPatientDetails] = useState({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchPatientDetails = async (patientId) => {
    try {
      // First try to get from users collection
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('uid', '==', patientId));
      const userSnapshot = await getDocs(userQuery);

      // If not found in users, try patients collection
      if (userSnapshot.empty) {
        const patientsRef = collection(db, 'patients');
        const patientQuery = query(patientsRef, where('uid', '==', patientId));
        const patientSnapshot = await getDocs(patientQuery);

        if (!patientSnapshot.empty) {
          const patientData = patientSnapshot.docs[0].data();
          setPatientDetails(prevDetails => ({
            ...prevDetails,
            [patientId]: patientData
          }));
          return;
        }
      } else {
        const userData = userSnapshot.docs[0].data();
        setPatientDetails(prevDetails => ({
          ...prevDetails,
          [patientId]: userData
        }));
        return;
      }

      console.log('No patient found with ID:', patientId);
      setPatientDetails(prevDetails => ({
        ...prevDetails,
        [patientId]: {}
      }));
    } catch (error) {
      console.error('Error fetching patient details:', error);
      Alert.alert('Error', 'Failed to fetch patient information');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'Doctor is not logged in');
        return;
      }

      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('doctorId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAppointments(appointmentsData);

      // Fetch patient details for each appointment
      const patientPromises = appointmentsData.map(appointment => 
        fetchPatientDetails(appointment.patientId)
      );
      await Promise.all(patientPromises);

    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Show appropriate message based on status
      let message = '';
      switch(newStatus) {
        case 'rejected':
          message = 'Appointment declined successfully';
          break;
        case 'approved':
          message = 'Appointment accepted successfully';
          break;
        case 'completed':
          message = 'Appointment marked as completed';
          break;
        default:
          message = 'Appointment status updated successfully';
      }
      
      await fetchAppointments();
      Alert.alert('Success', message);
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Error', 'Failed to update appointment status');
    }
  };

  const renderDetailItem = (label, value) => (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const renderStatusBadge = (status) => {
    const getStatusStyle = (status) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return { backgroundColor: '#fffbeb', color: '#f59e0b' };
        case 'approved':
          return { backgroundColor: '#dcfce7', color: '#22c55e' };
        case 'rejected':
          return { backgroundColor: '#fee2e2', color: '#ef4444' };
        case 'completed':
          return { backgroundColor: '#eff6ff', color: '#3b82f6' };
        default:
          return { backgroundColor: '#f3f4f6', color: '#6b7280' };
      }
    };

    const statusStyle = getStatusStyle(status);

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
        <Text style={[styles.statusText, { color: statusStyle.color }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  const renderAppointment = (appointment) => {
    const patient = patientDetails[appointment.patientId] || {};
    const appointmentDate = appointment.createdAt?.toDate();
    
    return (
      <View key={appointment.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>
              {appointmentDate ? appointmentDate.toLocaleDateString() : 'Date not available'}
            </Text>
            <View style={styles.timeContainer}>
              <MaterialIcons name="access-time" size={16} color="#4b5563" />
              <Text style={styles.timeText}>
                {appointmentDate ? appointmentDate.toLocaleTimeString() : 'Time not available'}
              </Text>
            </View>
          </View>
          {renderStatusBadge(appointment.status)}
        </View>

        <View style={styles.divider} />

        <View style={styles.patientInfoContainer}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          {renderDetailItem('Name', patient.firstname && patient.lastname 
            ? `${patient.firstname} ${patient.lastname}`
            : 'Not available')}
          {renderDetailItem('Age', patient.age || 'Not available')}
          {renderDetailItem('Gender', patient.gender || 'Not available')}
          {renderDetailItem('Blood Group', patient.bloodType || 'Not available')}
          {renderDetailItem('Weight', patient.weight ? `${patient.weight} kg` : 'Not available')}
          {renderDetailItem('Height', patient.height ? `${patient.height} cm` : 'Not available')}
          {renderDetailItem('Contact', patient.phone || 'Not available')}
          {renderDetailItem('Email', patient.email || 'Not available')}
          {patient.address && renderDetailItem('Address', patient.address)}
        </View>

        <View style={styles.divider} />

        <View style={styles.appointmentInfoContainer}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          {renderDetailItem('Specialization', appointment.specialization || 'Not specified')}
          {renderDetailItem('Description', appointment.description || 'No description provided')}
        </View>

        {appointment.status === 'pending' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => updateAppointmentStatus(appointment.id, 'rejected')}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => updateAppointmentStatus(appointment.id, 'approved')}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {appointment.status === 'approved' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateAppointmentStatus(appointment.id, 'completed')}
          >
            <Text style={styles.acceptButtonText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Appointments</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <FontAwesome5 name="user-md" size={20} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4b5563" style={styles.loader} />
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {appointments.length === 0 ? (
            <Text style={styles.noAppointmentsText}>No appointments found</Text>
          ) : (
            appointments.map(appointment => renderAppointment(appointment))
          )}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  profileButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    marginLeft: 4,
    color: '#4b5563',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  patientInfoContainer: {
    marginBottom: 16,
  },
  appointmentInfoContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#fee2e2',
  },
  acceptButton: {
    backgroundColor: '#22c55e',
  },
  completeButton: {
    backgroundColor: '#3b82f6',
    marginTop: 16,
  },
  declineButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAppointmentsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default Appointment;