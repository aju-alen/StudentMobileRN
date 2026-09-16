import AdminEntityList from '../../components/AdminEntityList';
import AdminListCard from '../../components/AdminListCard';
import { ipURL } from '../../utils/utils';

type TeacherRow = {
  id: string;
  name: string;
  email: string;
  organizationName: string | null;
  organizationRole: string | null;
  verifiedSubjects: number;
  pendingSubjects: number;
  rejectedSubjects: number;
};

const TeachersScreen = () => (
  <AdminEntityList<TeacherRow>
    title="Teachers"
    endpoint={`${ipURL}/api/admin/teachers`}
    dataKey="teachers"
    searchPlaceholder="Search teachers"
    emptyText="No teachers found"
    renderItem={(item) => (
      <AdminListCard
        title={item.name}
        subtitle={item.email}
        meta={`${item.organizationName || 'Independent'}${item.organizationRole ? ` · ${item.organizationRole}` : ''} · ${item.verifiedSubjects} verified, ${item.pendingSubjects} pending, ${item.rejectedSubjects} rejected`}
      />
    )}
  />
);

export default TeachersScreen;
