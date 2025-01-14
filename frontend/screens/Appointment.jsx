import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const Appointment = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(null);

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
    
    // Validate that the appointment is not in the past
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
    } else {
      setAppointments([...appointments, newAppointment].sort((a, b) => a.timestamp - b.timestamp));
    }

    setDescription('');
    Alert.alert('Success', 'Appointment saved successfully!');
  };

  const editAppointment = (appointment) => {
    setDate(new Date(appointment.date));
    setTime(new Date(appointment.timestamp));
    setDescription(appointment.description);
    setIsEditing(appointment.id);
  };

  const deleteAppointment = (id) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAppointments(appointments.filter(app => app.id !== id));
          }
        }
      ]
    );
  };

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.appointmentItem}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentDate}>
          {item.date}
        </Text>
        <Text style={styles.appointmentTime}>
          {item.time}
        </Text>
      </View>
      <Text style={styles.appointmentDescription}>{item.description}</Text>
      <View style={styles.appointmentActions}>
        <TouchableOpacity 
          onPress={() => editAppointment(item)}
          style={styles.actionButton}
        >
          <MaterialIcons name="edit" size={20} color="#4a90e2" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => deleteAppointment(item.id)}
          style={styles.actionButton}
        >
          <MaterialIcons name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        {isEditing ? 'Edit Appointment' : 'Create an Appointment'}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date:</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.pickerButtonText}>{date.toDateString()}</Text>
          <MaterialIcons name="calendar-today" size={20} color="#4a90e2" />
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

        <Text style={styles.label}>Time:</Text>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.pickerButtonText}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <MaterialIcons name="access-time" size={20} color="#4a90e2" />
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}

        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter appointment details"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
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
        <Text style={styles.subHeader}>Upcoming Appointments</Text>
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={40} color="#ccc" />
            <Text style={styles.emptyStateText}>No appointments scheduled</Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={renderAppointmentItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#b2b2b2',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
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
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  appointmentTime: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
  },
  appointmentDescription: {
    fontSize: 15,
    color: '#34495e',
    marginBottom: 8,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});

export default Appointment;