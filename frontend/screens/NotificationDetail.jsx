// NotificationDetail.jsx
import React,{useLayoutEffect} from 'react';
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

const NotificationDetail = ({ route, navigation }) => {

      useLayoutEffect(() => {
          navigation.setOptions({
              headerShown: false, 
          });
      }, [navigation]);
  const { notification } = route.params;

  const renderDetailItem = (label, value, key) => (
    <View style={styles.detailItem} key={key}>  {/* Use key for unique identification */}
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
  

  const getPriorityStyle = (priority) => {
    const baseStyle = {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
    };

    switch (priority.toLowerCase()) {
      case 'high':
        return { ...baseStyle, backgroundColor: '#fef2f2', borderColor: '#ef4444', borderWidth: 1 };
      case 'medium':
        return { ...baseStyle, backgroundColor: '#fffbeb', borderColor: '#f59e0b', borderWidth: 1 };
      case 'normal':
        return { ...baseStyle, backgroundColor: '#eff6ff', borderColor: '#3b82f6', borderWidth: 1 };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', borderColor: '#6b7280', borderWidth: 1 };
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
        <Text style={styles.headerTitle}>Notification Detail</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.notificationText}>{notification.text}</Text>
          <Text style={styles.timeText}>{notification.time}</Text>

          <View style={styles.divider} />

          <View style={styles.priorityContainer}>
            <View style={getPriorityStyle(notification.details.priority)}>
              <Text style={[
                styles.priorityText,
                { color: getPriorityStyle(notification.details.priority).borderColor }
              ]}>
                {notification.details.priority}
              </Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
  {Object.entries(notification.details).map(([key, value], index) => {
    if (key !== 'priority') {
      const label = key
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return renderDetailItem(label, value, index); // Pass index as key
    }
  })}
</View>

        </View>
      </ScrollView>

      {notification.type === 'appointment' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
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
  notificationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
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
});

export default NotificationDetail;