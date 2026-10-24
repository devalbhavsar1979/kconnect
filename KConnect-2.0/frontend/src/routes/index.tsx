import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
  CalendarDays, CalendarCheck,
  Mail, BookOpen, Wallet, Star, Bell,
  Settings, HelpCircle,
} from 'lucide-react'

import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { OpportunityDetailsPage } from '@/features/opportunities/OpportunityDetailsPage'
import { MyApplicationsPage } from '@/features/opportunities/MyApplicationsPage'
import { OpportunitiesPage } from '@/features/opportunities/OpportunitiesPage'
import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import { MyProfilePage } from '@/features/profile/MyProfilePage'

// Admin
import { AdminGuard }           from '@/features/admin/components/AdminGuard'
import { AdminLayout }          from '@/features/admin/components/AdminLayout'
import { AdminDashboardPage }   from '@/features/admin/pages/AdminDashboardPage'
import { UsersPage }            from '@/features/admin/pages/UsersPage'
import { CategoriesPage }       from '@/features/admin/pages/CategoriesPage'
import { OpportunitiesPage as AdminOpportunitiesPage } from '@/features/admin/pages/OpportunitiesPage'
import { CreateOpportunityPage }  from '@/features/admin/pages/CreateOpportunityPage'
import { CreateOrganisationPage } from '@/features/admin/pages/CreateOrganisationPage'
import { ApplicantProfilePage } from '@/features/admin/pages/ApplicantProfilePage'
import { ApplicationsPage }     from '@/features/admin/pages/ApplicationsPage'
import { OrganisationsPage }    from '@/features/admin/pages/OrganisationsPage'
import { AnalyticsPage }        from '@/features/admin/pages/AnalyticsPage'
import { SettingsPage }         from '@/features/admin/pages/SettingsPage'
import { SessionsPage }         from '@/features/admin/pages/SessionsPage'
import { ContentPage }          from '@/features/admin/pages/ContentPage'
import { CommunicationsPage }   from '@/features/admin/pages/CommunicationsPage'
import { SupportPage }          from '@/features/admin/pages/SupportPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // ── Public routes ────────────────────────────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // ── Admin routes ─────────────────────────────────────────────────────────────
  {
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin',                          element: <Navigate to="/admin/dashboard" replace /> },
          { path: '/admin/dashboard',                element: <AdminDashboardPage /> },
          { path: '/admin/users',                    element: <UsersPage /> },
          { path: '/admin/users/verification',       element: <UsersPage /> },
          { path: '/admin/opportunities',                element: <AdminOpportunitiesPage /> },
          { path: '/admin/opportunities/new',           element: <CreateOpportunityPage /> },
          { path: '/admin/opportunities/:id/edit',      element: <CreateOpportunityPage /> },
          { path: '/admin/applications',             element: <ApplicationsPage /> },
          { path: '/admin/applicants/:id', element: <ApplicantProfilePage /> },
          { path: '/admin/categories',               element: <CategoriesPage /> },
          { path: '/admin/organisations',               element: <OrganisationsPage /> },
          { path: '/admin/organisations/new',          element: <CreateOrganisationPage /> },
          { path: '/admin/organisations/:id/edit',     element: <CreateOrganisationPage /> },
          { path: '/admin/sessions',                 element: <SessionsPage /> },
          { path: '/admin/sessions/requests',        element: <SessionsPage /> },
          { path: '/admin/content/announcements',    element: <ContentPage /> },
          { path: '/admin/content/banners',          element: <ContentPage /> },
          { path: '/admin/communications/notifications', element: <CommunicationsPage /> },
          { path: '/admin/communications/email',     element: <CommunicationsPage /> },
          { path: '/admin/analytics',                element: <AnalyticsPage /> },
          { path: '/admin/analytics/users',          element: <AnalyticsPage /> },
          { path: '/admin/analytics/opportunities',  element: <AnalyticsPage /> },
          { path: '/admin/settings/platform',        element: <SettingsPage /> },
          { path: '/admin/settings/admins',          element: <SettingsPage /> },
          { path: '/admin/support',                  element: <SupportPage /> },
        ],
      },
    ],
  },

  // ── Protected routes ─────────────────────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/dashboard',     element: <DashboardPage /> },
          { path: '/opportunities/:id', element: <OpportunityDetailsPage /> },
      { path: '/opportunities', element: <OpportunitiesPage /> },

          {
            path: '/profile',
            element: <MyProfilePage />,
          },
          {
            path: '/applications',
            element: <MyApplicationsPage />,
          },
          {
            path: '/sessions',
            element: (
              <PlaceholderPage
                title="My Sessions"
                description="View and manage your scheduled training and consulting sessions."
                icon={CalendarDays}
              />
            ),
          },
          {
            path: '/availability',
            element: (
              <PlaceholderPage
                title="Availability"
                description="Set your availability so organisations can book you at the right times."
                icon={CalendarCheck}
              />
            ),
          },
          {
            path: '/messages',
            element: (
              <PlaceholderPage
                title="Messages"
                description="Communicate with organisations and hiring managers."
                icon={Mail}
              />
            ),
          },
          {
            path: '/resources',
            element: (
              <PlaceholderPage
                title="Resources"
                description="Access learning materials, templates, and professional resources."
                icon={BookOpen}
              />
            ),
          },
          {
            path: '/earnings',
            element: (
              <PlaceholderPage
                title="Earnings"
                description="Track your payments, invoices, and financial history."
                icon={Wallet}
              />
            ),
          },
          {
            path: '/reviews',
            element: (
              <PlaceholderPage
                title="Reviews"
                description="See ratings and feedback from organisations you have worked with."
                icon={Star}
              />
            ),
          },
          {
            path: '/notifications',
            element: (
              <PlaceholderPage
                title="Notifications"
                description="Stay updated with application status changes and new opportunities."
                icon={Bell}
              />
            ),
          },
          {
            path: '/settings',
            element: (
              <PlaceholderPage
                title="Settings"
                description="Manage your account preferences, notifications, and privacy settings."
                icon={Settings}
              />
            ),
          },
          {
            path: '/help',
            element: (
              <PlaceholderPage
                title="Help & Support"
                description="Find answers to common questions or contact our support team."
                icon={HelpCircle}
              />
            ),
          },
        ],
      },
    ],
  },
])
