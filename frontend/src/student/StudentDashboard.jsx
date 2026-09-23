import { DashboardOverview } from '../components/DashboardOverview'

export function StudentDashboard({ data }) {
  return <DashboardOverview data={data} teacher={false} />
}
