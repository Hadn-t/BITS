// import React, { useLayoutEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   Platform,
//   SafeAreaView,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { MaterialIcons } from '@expo/vector-icons';

// const ClientAppointmentScreen = ({ navigation }) => {
//   const [date, setDate] = useState(new Date());
//   const [time, setTime] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [appointments, setAppointments] = useState([]);
//   const [description, setDescription] = useState('');
//   const [isEditing, setIsEditing] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   useLayoutEffect(() => {
//     navigation?.setOptions({
//       headerShown: false,
//     });
//   }, []);

//   const onChangeDate = (event, selectedDate) => {
//     const currentDate = selectedDate || date;
//     setShowDatePicker(Platform.OS === 'ios');
//     setDate(currentDate);
//   };

//   const onChangeTime = (event, selectedTime) => {
//     const currentTime = selectedTime || time;
//     setShowTimePicker(Platform.OS === 'ios');
//     setTime(currentTime);
//   };

//   const validateAppointment = () => {
//     if (description.trim() === '') {
//       Alert.alert('Error', 'Please enter a description for the appointment');
//       return false;
//     }
    
//     const now = new Date();
//     const appointmentDateTime = new Date(date);
//     appointmentDateTime.setHours(time.getHours(), time.getMinutes());
    
//     if (appointmentDateTime < now) {
//       Alert.alert('Error', 'Cannot create appointments in the past');
//       return false;
//     }
    
//     return true;
//   };

//   const saveAppointment = () => {
//     if (!validateAppointment()) return;

//     const newAppointment = {
//       id: isEditing || Math.random().toString(),
//       date: date.toDateString(),
//       time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       description,
//       timestamp: new Date(date).setHours(time.getHours(), time.getMinutes()),
//     };

//     if (isEditing) {
//       setAppointments(appointments.map(app => 
//         app.id === isEditing ? newAppointment : app
//       ));
//       setIsEditing(null);
//       Alert.alert('Success', 'Appointment updated successfully!');
//     } else {
//       setAppointments([...appointments, newAppointment].sort((a, b) => a.timestamp - b.timestamp));
//       Alert.alert('Success', 'New appointment created!');
//     }

//     setDescription('');
//   };

//   const getStatusColor = (timestamp) => {
//     const appointmentDate = new Date(timestamp);
//     const today = new Date();
//     const diffTime = appointmentDate - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     if (diffDays < 0) return '#6B7280'; // Past
//     if (diffDays === 0) return '#4A8B94'; // Today - updated to match theme
//     if (diffDays <= 3) return '#F59E0B'; // Upcoming
//     return '#4A8B94'; // Scheduled - updated to match theme
//   };

//   const renderAppointmentItem = ({ item }) => (
//     <View style={styles.appointmentItem}>
//       <View style={styles.appointmentHeader}>
//         <View>
//           <Text style={styles.appointmentDate}>{item.date}</Text>
//           <View style={styles.timeContainer}>
//             <MaterialIcons name="access-time" size={16} color="#4A8B94" />
//             <Text style={styles.appointmentTime}>{item.time}</Text>
//           </View>
//         </View>
//         <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.timestamp)}20` }]}>
//           <Text style={[styles.statusText, { color: getStatusColor(item.timestamp) }]}>
//             {new Date(item.timestamp) < new Date() ? 'Past' : 
//              new Date(item.timestamp).toDateString() === new Date().toDateString() ? 'Today' : 'Upcoming'}
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.appointmentDescription}>{item.description}</Text>
      
//       <View style={styles.appointmentActions}>
//         <TouchableOpacity 
//           onPress={() => {
//             setIsEditing(item.id);
//             setDate(new Date(item.date));
//             setTime(new Date(item.timestamp));
//             setDescription(item.description);
//           }}
//           style={styles.actionButton}
//         >
//           <MaterialIcons name="edit" size={22} color="#4A8B94" />
//         </TouchableOpacity>
//         <TouchableOpacity 
//           onPress={() => {
//             Alert.alert(
//               'Delete Appointment',
//               'Are you sure you want to delete this appointment?',
//               [
//                 { text: 'Cancel', style: 'cancel' },
//                 { 
//                   text: 'Delete',
//                   style: 'destructive',
//                   onPress: () => {
//                     setAppointments(appointments.filter(app => app.id !== item.id));
//                     Alert.alert('Success', 'Appointment deleted successfully!');
//                   }
//                 }
//               ]
//             );
//           }}
//           style={styles.actionButton}
//         >
//           <MaterialIcons name="delete" size={22} color="#EF4444" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <ScrollView style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Appointment Manager</Text>
//           <TouchableOpacity style={styles.profileButton}>
//             <MaterialIcons name="person" size={24} color="#4A8B94" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.inputSection}>
//           <Text style={styles.sectionTitle}>
//             {isEditing ? 'Edit Appointment' : 'New Appointment'}
//           </Text>

//           <TouchableOpacity 
//             style={styles.dateTimeButton}
//             onPress={() => setShowDatePicker(true)}
//           >
//             <MaterialIcons name="calendar-today" size={20} color="#4A8B94" />
//             <Text style={styles.dateTimeText}>{date.toDateString()}</Text>
//           </TouchableOpacity>

//           {showDatePicker && (
//             <DateTimePicker
//               value={date}
//               mode="date"
//               display="default"
//               onChange={onChangeDate}
//               minimumDate={new Date()}
//             />
//           )}

//           <TouchableOpacity 
//             style={styles.dateTimeButton}
//             onPress={() => setShowTimePicker(true)}
//           >
//             <MaterialIcons name="access-time" size={20} color="#4A8B94" />
//             <Text style={styles.dateTimeText}>
//               {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </Text>
//           </TouchableOpacity>

//           {showTimePicker && (
//             <DateTimePicker
//               value={time}
//               mode="time"
//               display="default"
//               onChange={onChangeTime}
//             />
//           )}

//           <TextInput
//             style={styles.descriptionInput}
//             placeholder="Enter appointment details"
//             value={description}
//             onChangeText={setDescription}
//             multiline
//             numberOfLines={3}
//             placeholderTextColor="#9CA3AF"
//           />

//           <TouchableOpacity
//             style={[styles.saveButton, !description.trim() && styles.saveButtonDisabled]}
//             onPress={saveAppointment}
//             disabled={!description.trim()}
//           >
//             <Text style={styles.saveButtonText}>
//               {isEditing ? 'Update Appointment' : 'Save Appointment'}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.appointmentsList}>
//           <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search appointments..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholderTextColor="#9CA3AF"
//           />
          
//           {appointments.length === 0 ? (
//             <View style={styles.emptyState}>
//               <MaterialIcons name="event-busy" size={48} color="#D1D5DB" />
//               <Text style={styles.emptyStateText}>No appointments scheduled</Text>
//             </View>
//           ) : (
//             <FlatList
//               data={appointments.filter(app => 
//                 app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 app.date.toLowerCase().includes(searchQuery.toLowerCase())
//               )}
//               keyExtractor={(item) => item.id}
//               renderItem={renderAppointmentItem}
//               showsVerticalScrollIndicator={false}
//               scrollEnabled={false}
//             />
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   profileButton: {
//     padding: 8,
//     backgroundColor: '#F0F0F0',
//     borderRadius: 20,
//   },
//   inputSection: {
//     backgroundColor: '#FFFFFF',
//     margin: 16,
//     padding: 16,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 16,
//   },
//   dateTimeButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: '#F5F5F5',
//   },
//   dateTimeText: {
//     marginLeft: 8,
//     fontSize: 16,
//     color: '#333',
//   },
//   descriptionInput: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     padding: 12,
//     fontSize: 16,
//     minHeight: 100,
//     textAlignVertical: 'top',
//     marginBottom: 16,
//     color: '#333',
//     backgroundColor: '#F5F5F5',
//   },
//   saveButton: {
//     backgroundColor: '#4A8B94',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//   },
//   saveButtonDisabled: {
//     backgroundColor: '#9CA3AF',
//   },
//   saveButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   appointmentsList: {
//     padding: 16,
//   },
//   searchInput: {
//     backgroundColor: '#F5F5F5',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//     color: '#333',
//   },
//   appointmentItem: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   appointmentHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 12,
//   },
//   appointmentDate: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   appointmentTime: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#4A8B94',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   appointmentDescription: {
//     fontSize: 15,
//     color: '#666',
//     marginBottom: 12,
//   },
//   appointmentActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     paddingTop: 12,
//   },
//   actionButton: {
//     padding: 8,
//     marginLeft: 16,
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: '#9CA3AF',
//     marginTop: 12,
//   },
// });

// export default ClientAppointmentScreen;

// ClientAppointmentScreen.js// ClientAppointmentScreen.js

import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, setDoc, updateDoc, deleteDoc, doc, orderBy, serverTimestamp } from 'firebase/firestore';

const ClientAppointmentScreen = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [specializations] = useState([
    "Dentistry", "Cardiology", "Pulmonology", "General", "Neurology", "Gastroenterology", "Laboratory", "Vaccination"
  ]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await fetchAppointments();
    setLoading(false);
  };

  const fetchDoctorsBySpecialization = async (specialization) => {
    setLoading(true);
    try {
      const snapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'doctor'), where('specialization', '==', specialization))
      );
      const doctorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Alert.alert('Error', 'Failed to fetch doctors');
    }
    setLoading(false);
  };

  const fetchAppointments = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'User is not logged in');
        return;
      }
  
      // Query appointments collection
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('patientId', '==', currentUser.uid),
        orderBy('createdAt', 'desc') 
      );
  
      const snapshot = await getDocs(q);
      
      const appointmentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date,
          time: data.time,
          description: data.description,
          doctorId: data.doctorId,
          doctorName: data.doctorName,
          specialization: data.specialization,
          status: data.status,
          createdAt: data.createdAt,
          timestamp: data.timestamp,
          patientId: data.patientId
        };
      });
  
      setAppointments(appointmentsData);
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert(
        'Error',
        'Failed to fetch appointments. Please try again later.'
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      await fetchAppointments();
      Alert.alert('Success', 'Appointment cancelled successfully');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { backgroundColor: '#FEF3C7' },
      approved: { backgroundColor: '#D1FAE5' },
      rejected: { backgroundColor: '#FEE2E2' },
      completed: { backgroundColor: '#E0E7FF' },
    };
    return styles[status] || styles.pending;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#D97706',
      approved: '#059669',
      rejected: '#DC2626',
      completed: '#4F46E5',
    };
    return colors[status] || colors.pending;
  };

  const renderAppointments = () => {
    return appointments.map((item) => (
      <View key={item.id} style={styles.appointmentItem}>
        <View style={styles.appointmentHeader}>
          <View>
            <Text style={styles.appointmentDate}>{item.date}</Text>
            <View style={styles.timeContainer}>
              <MaterialIcons name="access-time" size={16} color="#4A8B94" />
              <Text style={styles.appointmentTime}>{item.time}</Text>
            </View>
            <Text style={styles.doctorInfoText}>Dr. {item.doctorName}</Text>
            <Text style={styles.categoryInfo}>{item.specialization}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.appointmentDescription}>{item.description}</Text>

        <View style={styles.appointmentActions}>
          {item.status === 'pending' && (
            <>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(item.id);
                  setDate(new Date(item.date));
                  setTime(new Date(item.timestamp));
                  setDescription(item.description);
                  setSelectedSpecialization(item.specialization);
                  setSelectedDoctor({
                    id: item.doctorId,
                    name: item.doctorName,
                  });
                }}
                style={styles.actionButton}
              >
                <MaterialIcons name="edit" size={22} color="#4A8B94" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Cancel Appointment',
                    'Are you sure you want to cancel this appointment?',
                    [
                      { text: 'No', style: 'cancel' },
                      { text: 'Yes', style: 'destructive', onPress: () => deleteAppointment(item.id) },
                    ]
                  );
                }}
                style={styles.actionButton}
              >
                <MaterialIcons name="delete" size={22} color="#EF4444" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    ));
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !description || !selectedSpecialization) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Construct doctor name from selected doctor data
    const doctorName = selectedDoctor.firstname && selectedDoctor.lastname
      ? `${selectedDoctor.firstname} ${selectedDoctor.lastname}`
      : selectedDoctor.name || 'Unknown Doctor';
  
    setLoading(true);
  
    const appointmentData = {
      patientId: auth.currentUser.uid,
      doctorId: selectedDoctor.id,
      doctorName: doctorName,
      specialization: selectedSpecialization,
      date: date.toDateString(),
      time: time.toLocaleTimeString(),
      description: description.trim(),
      status: 'pending',
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    };
  
    try {
      if (isEditing) {
        const docRef = doc(db, 'appointments', isEditing);
        await updateDoc(docRef, appointmentData);
        Alert.alert('Success', 'Appointment updated successfully');
      } else {
        const newDocRef = doc(collection(db, 'appointments'));
        await setDoc(newDocRef, appointmentData);
        Alert.alert('Success', 'Appointment booked successfully');
      }
  
      // Reset form
      setSelectedDoctor(null);
      setSelectedSpecialization('');
      setDescription('');
      setDate(new Date());
      setTime(new Date());
      setIsEditing(null);
      
      // Refresh appointments list
      await fetchAppointments();
    } catch (error) {
      console.error('Error submitting appointment:', error);
      Alert.alert('Error', 'Failed to submit appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <MaterialIcons name="person" size={24} color="#4A8B94" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Select Specialization</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {specializations.map((specialization) => (
              <TouchableOpacity
                key={specialization}
                style={[styles.categoryItem, selectedSpecialization === specialization && styles.selectedCategory]}
                onPress={() => {
                  setSelectedSpecialization(specialization);
                  fetchDoctorsBySpecialization(specialization);
                  setSelectedDoctor(null);
                }}
              >
                <Text
                  style={[styles.categoryText, selectedSpecialization === specialization && styles.selectedCategoryText]}
                >
                  {specialization}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedSpecialization && (
          <View style={styles.doctorsContainer}>
            <Text style={styles.sectionTitle}>Select Doctor</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#4A8B94" />
            ) : (
              <ScrollView>
                {doctors.map((doctor) => (
                  <TouchableOpacity
                    key={doctor.id}
                    onPress={() => setSelectedDoctor(doctor)}
                    style={[
                      styles.doctorItem,
                      selectedDoctor && selectedDoctor.id === doctor.id && styles.selectedDoctor,
                    ]}
                  >
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>
                        {doctor.firstname} {doctor.lastname}
                      </Text>
                      <Text style={styles.hospital}>{doctor.hospital}</Text>
                      <Text style={styles.contact}>Mobile: {doctor.phone}</Text>
                      <Text style={styles.contact}>Email: {doctor.email}</Text>
                      <Text style={styles.createdAt}>Created At: {new Date(doctor.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.schedule}>
                      <Text>Weekday: {doctor.schedule?.weekday}</Text>
                      <Text>Weekend: {doctor.schedule?.weekend}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        <View style={styles.appointmentsContainer}>
          <Text style={styles.sectionTitle}>Your Appointments</Text>
          {appointments.length === 0 ? (
            <Text style={styles.noAppointmentsText}>No appointments found</Text>
          ) : (
            <ScrollView>
              {renderAppointments()}
            </ScrollView>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter a brief description"
            style={styles.textInput}
            multiline
          />
        </View>

        <View style={styles.dateTimeContainer}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateTimeButton}>
            <MaterialIcons name="date-range" size={24} color="#4A8B94" />
            <Text style={styles.dateTimeText}>{date.toDateString()}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateTimeButton}>
            <MaterialIcons name="access-time" size={24} color="#4A8B94" />
            <Text style={styles.dateTimeText}>{time.toLocaleTimeString()}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>{isEditing ? 'Update Appointment' : 'Book Appointment'}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setTime(selectedTime);
              }
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A8B94',
  },
  profileButton: {
    padding: 10,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A8B94',
    marginBottom: 8,
  },
  categoryItem: {
    padding: 10,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
  },
  selectedCategory: {
    backgroundColor: '#4A8B94',
  },
  categoryText: {
    fontSize: 16,
    color: '#4A8B94',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  doctorsContainer: {
    marginBottom: 16,
  },
  doctorItem: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  selectedDoctor: {
    borderColor: '#4A8B94',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A8B94',
  },
  hospital: {
    color: '#6B7280',
  },
  contact: {
    color: '#6B7280',
  },
  createdAt: {
    fontSize: 12,
    color: '#6B7280',
  },
  schedule: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '30%',
  },
  appointmentsContainer: {
    marginBottom: 16,
  },
  noAppointmentsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#4A8B94',
  },
  appointmentItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A8B94',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  doctorInfo: {
    fontSize: 16,
    color: '#6B7280',
  },
  categoryInfo: {
    fontSize: 14,
    color: '#4A8B94',
  },
  statusBadge: {
    padding: 5,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentDescription: {
    marginTop: 8,
    color: '#6B7280',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    height: 100,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#F3F4F6',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#4A8B94',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#4A8B94',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});

export default ClientAppointmentScreen;