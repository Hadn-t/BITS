import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const Appointment = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useLayoutEffect(() => {
    navigation?.setOptions({
      headerShown: false,
    });
  }, []);

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  const validateAppointment = () => {
    if (description.trim() === '') {
      Alert.alert('Error', 'Please enter a description for the appointment');
      return false;
    }
    
    const now = new Date();
    const appointmentDateTime = new Date(date);
    appointmentDateTime.setHours(time.getHours(), time.getMinutes());
    
    if (appointmentDateTime < now) {
      Alert.alert('Error', 'Cannot create appointments in the past');
      return false;
    }
    
    return true;
  };

  const saveAppointment = () => {
    if (!validateAppointment()) return;

    const newAppointment = {
      id: isEditing || Math.random().toString(),
      date: date.toDateString(),
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description,
      timestamp: new Date(date).setHours(time.getHours(), time.getMinutes()),
    };

    if (isEditing) {
      setAppointments(appointments.map(app => 
        app.id === isEditing ? newAppointment : app
      ));
      setIsEditing(null);
      Alert.alert('Success', 'Appointment updated successfully!');
    } else {
      setAppointments([...appointments, newAppointment].sort((a, b) => a.timestamp - b.timestamp));
      Alert.alert('Success', 'New appointment created!');
    }

    setDescription('');
  };

  const getStatusColor = (timestamp) => {
    const appointmentDate = new Date(timestamp);
    const today = new Date();
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '#6B7280'; // Past
    if (diffDays === 0) return '#4A8B94'; // Today - updated to match theme
    if (diffDays <= 3) return '#F59E0B'; // Upcoming
    return '#4A8B94'; // Scheduled - updated to match theme
  };

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.appointmentItem}>
      <View style={styles.appointmentHeader}>
        <View>
          <Text style={styles.appointmentDate}>{item.date}</Text>
          <View style={styles.timeContainer}>
            <MaterialIcons name="access-time" size={16} color="#4A8B94" />
            <Text style={styles.appointmentTime}>{item.time}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.timestamp)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.timestamp) }]}>
            {new Date(item.timestamp) < new Date() ? 'Past' : 
             new Date(item.timestamp).toDateString() === new Date().toDateString() ? 'Today' : 'Upcoming'}
          </Text>
        </View>
      </View>

      <Text style={styles.appointmentDescription}>{item.description}</Text>
      
      <View style={styles.appointmentActions}>
        <TouchableOpacity 
          onPress={() => {
            setIsEditing(item.id);
            setDate(new Date(item.date));
            setTime(new Date(item.timestamp));
            setDescription(item.description);
          }}
          style={styles.actionButton}
        >
          <MaterialIcons name="edit" size={22} color="#4A8B94" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              'Delete Appointment',
              'Are you sure you want to delete this appointment?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    setAppointments(appointments.filter(app => app.id !== item.id));
                    Alert.alert('Success', 'Appointment deleted successfully!');
                  }
                }
              ]
            );
          }}
          style={styles.actionButton}
        >
          <MaterialIcons name="delete" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Appointment Manager</Text>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialIcons name="person" size={24} color="#4A8B94" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>
            {isEditing ? 'Edit Appointment' : 'New Appointment'}
          </Text>

          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#4A8B94" />
            <Text style={styles.dateTimeText}>{date.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date()}
            />
          )}

          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <MaterialIcons name="access-time" size={20} color="#4A8B94" />
            <Text style={styles.dateTimeText}>
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onChangeTime}
            />
          )}

          <TextInput
            style={styles.descriptionInput}
            placeholder="Enter appointment details"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            style={[styles.saveButton, !description.trim() && styles.saveButtonDisabled]}
            onPress={saveAppointment}
            disabled={!description.trim()}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Update Appointment' : 'Save Appointment'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentsList}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search appointments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          
          {appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No appointments scheduled</Text>
            </View>
          ) : (
            <FlatList
              data={appointments.filter(app => 
                app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.date.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={renderAppointmentItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  inputSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: '#333',
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#4A8B94',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentsList: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  appointmentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4A8B94',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default Appointment;