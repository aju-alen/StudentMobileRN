import { useCallback, useEffect, useState, type ReactElement } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosWithAuth } from '../utils/customAxios';
import { COLORS } from '../../constants';

type AdminEntityListProps<T> = {
  title: string;
  endpoint: string;
  dataKey: string;
  searchPlaceholder: string;
  emptyText: string;
  renderItem: (item: T) => ReactElement;
};

const AdminEntityList = <T extends { id: string }>({
  title,
  endpoint,
  dataKey,
  searchPlaceholder,
  emptyText,
  renderItem,
}: AdminEntityListProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (search: string) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: '1', pageSize: '50' });
      if (search.trim()) {
        params.set('q', search.trim());
      }
      const response = await axiosWithAuth.get(`${endpoint}?${params.toString()}`);
      setItems(response.data?.[dataKey] || []);
      setTotal(response.data?.total || 0);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [dataKey, endpoint]);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchItems(query);
    }, 300);
    return () => clearTimeout(handle);
  }, [fetchItems, query]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']} accessibilityLabel={title}>
      <View style={styles.header}>
        <Text style={styles.count}>{total} total</Text>
      </View>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
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
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
          renderItem={({ item }) => renderItem(item)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
  },
  count: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#1A2B4B',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
  },
});

export default AdminEntityList;
