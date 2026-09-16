import AdminEntityList from '../../components/AdminEntityList';
import AdminListCard from '../../components/AdminListCard';
import { ipURL } from '../../utils/utils';

type ParentRow = {
  id: string;
  name: string;
  email: string;
  acceptedLinks: number;
  pendingLinks: number;
};

const ParentsScreen = () => (
  <AdminEntityList<ParentRow>
    title="Parents"
    endpoint={`${ipURL}/api/admin/parents`}
    dataKey="parents"
    searchPlaceholder="Search parents"
    emptyText="No parents found"
    renderItem={(item) => (
      <AdminListCard
        title={item.name}
        subtitle={item.email}
        meta={`${item.acceptedLinks} linked students · ${item.pendingLinks} pending invites`}
      />
    )}
  />
);

export default ParentsScreen;
