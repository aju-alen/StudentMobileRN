import AdminEntityList from '../../components/AdminEntityList';
import AdminListCard from '../../components/AdminListCard';
import { ipURL } from '../../utils/utils';

type OrgRow = {
  id: string;
  orgName: string;
  orgEmail: string | null;
  orgWebsite: string | null;
  orgCapacity: number;
  memberCount: number;
  teamLeadName: string | null;
  teamLeadEmail: string | null;
};

const OrganizationsScreen = () => (
  <AdminEntityList<OrgRow>
    title="Organizations"
    endpoint={`${ipURL}/api/admin/organizations`}
    dataKey="organizations"
    searchPlaceholder="Search organizations"
    emptyText="No organizations found"
    renderItem={(item) => (
      <AdminListCard
        title={item.orgName}
        subtitle={item.orgEmail || item.teamLeadEmail}
        meta={`Lead: ${item.teamLeadName || '—'} · ${item.memberCount}/${item.orgCapacity} members${item.orgWebsite ? ` · ${item.orgWebsite}` : ''}`}
      />
    )}
  />
);

export default OrganizationsScreen;
