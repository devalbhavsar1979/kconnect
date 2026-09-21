import { Briefcase, FileText, Calendar, Eye, Users, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { StatCard } from '@/components/common/StatCard'
import { CategoryCard } from '@/components/common/CategoryCard'
import { ActivityItem } from '@/components/common/ActivityItem'
import { ScheduleCard } from '@/components/common/ScheduleCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrator',
  VENDOR: 'Vendor',
  TRAINER: 'Trainer',
  SME: 'Subject Matter Expert',
  FREELANCER: 'Freelancer',
  CONSULTANT: 'Consultant',
}

// Sample schedule items for the placeholder dashboard
const sampleSchedule = [
  { id: '1', title: 'Interview — TechCorp Training', time: '10:00 AM', duration: '45 min', type: 'interview' as const, virtual: true },
  { id: '2', title: 'Project Kick-off Call', time: '2:00 PM', duration: '30 min', type: 'meeting' as const, virtual: true },
  { id: '3', title: 'Proposal Submission Deadline', time: '6:00 PM', duration: '', type: 'deadline' as const },
]

const sampleActivity = [
  { type: 'shortlisted' as const, title: 'Shortlisted for Python Training', description: 'InnovateTech Pvt Ltd reviewed your application', time: '2 hours ago' },
  { type: 'applied' as const, title: 'Applied to SME Role', description: 'FinEdge Solutions — Data Analytics SME', time: '5 hours ago' },
  { type: 'new_opportunity' as const, title: 'New opportunity matched', description: '3 new Consulting roles matching your profile', time: 'Yesterday' },
  { type: 'selected' as const, title: 'Selected for Freelance Project', description: 'GlobalHR — HR Automation Module', time: '2 days ago' },
]

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {greeting}, {user?.first_name ?? 'User'}!
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Here's an overview of your K-CONNECT activity today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Opportunities" value="24" trend="+12% this week" trendUp icon={Briefcase} color="blue" />
        <StatCard title="Applications Sent" value="8" trend="+3 this month" trendUp icon={FileText} color="purple" />
        <StatCard title="Interviews Scheduled" value="2" icon={Calendar} color="green" />
        <StatCard title="Profile Views" value="156" trend="+23% this week" trendUp icon={Eye} color="orange" />
      </div>

      {/* Categories + right column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Opportunity categories */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunities by Category</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <CategoryCard label="Training" count={8}  icon={Users}    color="blue" />
              <CategoryCard label="Freelance" count={12} icon={Briefcase} color="purple" />
              <CategoryCard label="Consulting" count={5} icon={TrendingUp} color="green" />
              <CategoryCard label="Projects" count={7}  icon={FileText} color="orange" />
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <div>
              {sampleActivity.map((item, i) => (
                <ActivityItem
                  key={item.title}
                  {...item}
                  isLast={i === sampleActivity.length - 1}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Profile completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Progress</span>
                <span className="font-semibold text-slate-900">
                  {user?.profile_status === 'COMPLETE' ? '100%' : '40%'}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all"
                  style={{ width: user?.profile_status === 'COMPLETE' ? '100%' : '40%' }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {user?.profile_status === 'COMPLETE'
                  ? 'Your profile is complete.'
                  : 'Complete your profile to attract more opportunities.'}
              </p>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs text-slate-500">
                <span className="font-medium text-slate-800">Role:</span>
                <span>{user ? (ROLE_LABEL[user.user_type] ?? user.user_type) : '—'}</span>
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <ScheduleCard items={sampleSchedule} />
          </Card>
        </div>
      </div>
    </div>
  )
}
