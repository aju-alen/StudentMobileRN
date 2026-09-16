import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { axiosWithAuth } from '../../utils/customAxios';
import { ipURL } from '../../utils/utils';
import { registerForPushNotificationsAsync, isPushSupported } from '../../utils/pushNotifications';
import { COLORS } from '../../../constants';

type AdminStats = {
  teachers: number;
  students: number;
  parents: number;
  organizations: number;
  pendingSubjects: number;
  confirmedPurchases: number;
  totalSpendMinor: number;
};

const formatAed = (minor: number) =>
  `AED ${((minor || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const AdminOverview = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          setError(null);
          const response = await axiosWithAuth.get(`${ipURL}/api/admin/stats`);
          if (active) {
            setStats(response.data);
            setLoading(false);
          }
        } catch {
          if (active) {
            setError('Failed to load admin stats');
            setLoading(false);
          }
        }
      };
      load();

      if (isPushSupported()) {
        const register = async () => {
          const token = await registerForPushNotificationsAsync();
          if (!token) return;
          try {
            await axiosWithAuth.put(`${ipURL}/api/auth/push-token`, { pushToken: token });
          } catch (e) {
            console.error('Failed to register push token', e);
          }
        };
        register();
      }

      return () => {
        active = false;
      };
    }, [])
  );

  const cards = [
    { key: 'pending', label: 'Pending verification', value: stats?.pendingSubjects ?? 0, icon: 'shield-checkmark-outline' as const },
    { key: 'teachers', label: 'Teachers', value: stats?.teachers ?? 0, icon: 'school-outline' as const },
    { key: 'orgs', label: 'Organizations', value: stats?.organizations ?? 0, icon: 'business-outline' as const },
    { key: 'parents', label: 'Parents', value: stats?.parents ?? 0, icon: 'people-outline' as const },
    { key: 'students', label: 'Students', value: stats?.students ?? 0, icon: 'person-outline' as const },
    { key: 'purchases', label: 'Courses bought', value: stats?.confirmedPurchases ?? 0, icon: 'cart-outline' as const },
  ];

  const links = [
    { href: '/(tabs)/verification/pending', label: 'Pending verification', icon: 'shield-checkmark-outline' as const, hint: `${stats?.pendingSubjects ?? 0} waiting` },
    { href: '/(tabs)/verification/teachers', label: 'Teachers', icon: 'school-outline' as const, hint: 'Directory' },
    { href: '/(tabs)/verification/organizations', label: 'Organizations', icon: 'business-outline' as const, hint: 'Student orgs' },
    { href: '/(tabs)/verification/parents', label: 'Parents', icon: 'people-outline' as const, hint: 'Linked families' },
    { href: '/(tabs)/verification/purchases', label: 'Purchases', icon: 'card-outline' as const, hint: 'Courses and spend' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Coach Academ</Text>
        <Text style={styles.heroTitle}>Admin</Text>
        <Text style={styles.heroSpend}>{formatAed(stats?.totalSpendMinor || 0)} spent by students</Text>
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.grid}>
            {cards.map((card) => (
              <View key={card.key} style={styles.statCard}>
                <Ionicons name={card.icon} size={20} color="#1A2B4B" />
                <Text style={styles.statValue}>{card.value}</Text>
                <Text style={styles.statLabel}>{card.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Browse</Text>
          {links.map((link) => (
            <TouchableOpacity
              key={link.href}
              style={styles.row}
              onPress={() => router.push(link.href as any)}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={link.icon} size={20} color="#fff" />
              </View>
              <View style={styles.rowCopy}>
                <Text style={styles.rowLabel}>{link.label}</Text>
                <Text style={styles.rowHint}>{link.hint}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AdminOverview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  hero: {
    backgroundColor: '#1A2B4B',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroEyebrow: {
    color: '#94A3B8',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
  },
  heroSpend: {
    color: '#CBD5E1',
    marginTop: 8,
    fontSize: 15,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EEF4',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2B4B',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B4B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EEF4',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A2B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2B4B',
  },
  rowHint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
  },
});
