import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HealthRecords = ({navigation}) => {

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false, 
        });
    }, [navigation]);

  const reports = [
    {
      id: 1,
      type: "Blood Test Report",
      date: "15 Jan 2024",
      doctor: "Dr. Smith",
      status: "Normal",
      category: "Laboratory",
      fileSize: "2.4 MB",
    },
    {
      id: 2,
      type: "X-Ray Report",
      date: "10 Jan 2024",
      doctor: "Dr. Johnson",
      status: "Review Required",
      category: "Radiology",
      fileSize: "5.1 MB",
    },
    {
      id: 3,
      type: "MRI Scan Report",
      date: "5 Jan 2024",
      doctor: "Dr. Williams",
      status: "Normal",
      category: "Radiology",
      fileSize: "8.7 MB",
    },
    {
      id: 4,
      type: "Pathology Report",
      date: "1 Jan 2024",
      doctor: "Dr. Davis",
      status: "Urgent Review",
      category: "Laboratory",
      fileSize: "1.8 MB",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Normal':
        return '#4CAF50';
      case 'Review Required':
        return '#FF9800';
      case 'Urgent Review':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Laboratory':
        return 'test-tube';
      case 'Radiology':
        return 'radioactive';
      default:
        return 'file-document';
    }
  };

  const ReportCard = ({ report }) => (
    <TouchableOpacity style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.categoryIcon}>
          <Icon 
            name={getCategoryIcon(report.category)} 
            size={24} 
            color="#FFF"
          />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.reportType}>{report.type}</Text>
          <Text style={styles.reportDate}>{report.date}</Text>
        </View>
      </View>
      
      <View style={styles.reportDetails}>
        <View style={styles.detailRow}>
          <Icon name="doctor" size={16} color="#666" />
          <Text style={styles.detailText}>{report.doctor}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="folder" size={16} color="#666" />
          <Text style={styles.detailText}>{report.category}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="file" size={16} color="#666" />
          <Text style={styles.detailText}>{report.fileSize}</Text>
        </View>
      </View>

      <View style={styles.reportFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
          <Text style={styles.statusText}>{report.status}</Text>
        </View>
        <TouchableOpacity style={styles.downloadButton}>
          <Icon name="download" size={20} color="#4CAF50" />
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Reports</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-variant" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  scrollView: {
    padding: 16,
  },
  reportCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerRight: {
    flex: 1,
  },
  reportType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 14,
    color: '#666',
  },
  reportDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  downloadText: {
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default HealthRecords;