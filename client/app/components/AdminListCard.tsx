import { StyleSheet, Text, View } from 'react-native';

type AdminListCardProps = {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
};

const AdminListCard = ({ title, subtitle, meta }: AdminListCardProps) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {meta ? <Text style={styles.meta}>{meta}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EEF4',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2B4B',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#475569',
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },
});

export default AdminListCard;
