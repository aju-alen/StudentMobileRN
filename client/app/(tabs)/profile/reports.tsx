import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { ipURL } from '../../utils/utils';
import { axiosWithAuth } from '../../utils/customAxios';

interface Report {
  id: string;
  userId: string;
  subjectId: string;
  reportDescription: string;
  reportStatus: 'PENDING' | 'RESOLVED' | 'REJECTED';
  reportResolution: string | null;
  createdAt: string;
  reportedSubject: {
    subjectName: string;
  };
}

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/reports/user`);
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B';
      case 'RESOLVED':
        return '#10B981';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
     

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No reports found</Text>
        </View>
      ) : (
        <ScrollView style={styles.reportsList}>
          {reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.subjectName}>{report.reportedSubject.subjectName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.reportStatus) }]}>
                  <Text style={styles.statusText}>{report.reportStatus}</Text>
                </View>
              </View>
              <Text style={styles.date}>{formatDate(report.createdAt)}</Text>
              <Text style={styles.reportDescription}>{report.reportDescription}</Text>
              {report.reportResolution && (
                <View style={styles.resolutionContainer}>
                  <Text style={styles.resolutionLabel}>Resolution:</Text>
                  <Text style={styles.resolutionText}>{report.reportResolution}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: horizontalScale(16),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#333',
  },
  errorContainer: {
    padding: moderateScale(16),
    backgroundColor: '#ffebee',
    margin: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#666',
    marginTop: verticalScale(16),
  },
  reportsList: {
    flex: 1,
    padding: moderateScale(16),
  },
  reportCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  subjectName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    marginLeft: horizontalScale(8),
  },
  statusText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  date: {
    fontSize: moderateScale(14),
    color: '#666',
    marginBottom: verticalScale(8),
  },
  reportDescription: {
    fontSize: moderateScale(14),
    color: '#666',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  resolutionContainer: {
    marginTop: verticalScale(8),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resolutionLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: verticalScale(4),
  },
  resolutionText: {
    fontSize: moderateScale(14),
    color: '#666',
    lineHeight: moderateScale(20),
  },
});

export default ReportsPage; 