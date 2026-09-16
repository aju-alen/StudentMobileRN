import AdminEntityList from '../../components/AdminEntityList';
import AdminListCard from '../../components/AdminListCard';
import { ipURL } from '../../utils/utils';

type PurchaseRow = {
  id: string;
  studentName: string | null;
  studentEmail: string | null;
  subjectName: string | null;
  purchaseAmount: number;
  purchaseCurrency: string;
  purchaseDate: string;
};

const formatAmount = (amount: number, currency: string) => {
  const value = (amount || 0) / 100;
  if ((currency || '').toUpperCase() === 'AED') {
    return `AED ${value.toLocaleString()}`;
  }
  return `${(currency || 'AED').toUpperCase()} ${value.toLocaleString()}`;
};

const PurchasesScreen = () => (
  <AdminEntityList<PurchaseRow>
    title="Purchases"
    endpoint={`${ipURL}/api/admin/purchases`}
    dataKey="purchases"
    searchPlaceholder="Search student or course"
    emptyText="No confirmed purchases"
    renderItem={(item) => (
      <AdminListCard
        title={item.subjectName || 'Course'}
        subtitle={`${item.studentName || 'Student'} · ${item.studentEmail || ''}`}
        meta={`${formatAmount(item.purchaseAmount, item.purchaseCurrency)} · ${new Date(item.purchaseDate).toLocaleDateString()}`}
      />
    )}
  />
);

export default PurchasesScreen;
