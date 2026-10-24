# Generated source baseline

Source-derived only; runtime responses and screenshots are not captured.

## API and permission inventory

| Method | Path | Auth dependency | Behavior | Source |
|---|---|---|---|---|
| GET | `/api/v1/admin/categories` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/categories.py:17` |
| POST | `/api/v1/admin/categories` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/categories.py:25` |
| DELETE | `/api/v1/admin/categories/{cat_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/categories.py:62` |
| PUT | `/api/v1/admin/categories/{cat_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/categories.py:41` |
| GET | `/api/v1/admin/dashboard` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/dashboard.py:17` |
| GET | `/api/v1/admin/opportunities` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:47` |
| POST | `/api/v1/admin/opportunities` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:109` |
| DELETE | `/api/v1/admin/opportunities/{opp_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:194` |
| GET | `/api/v1/admin/opportunities/{opp_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:126` |
| PUT | `/api/v1/admin/opportunities/{opp_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:137` |
| POST | `/api/v1/admin/opportunities/{opp_id}/archive` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:179` |
| POST | `/api/v1/admin/opportunities/{opp_id}/attachments` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:217` |
| DELETE | `/api/v1/admin/opportunities/{opp_id}/attachments/{attachment_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:268` |
| POST | `/api/v1/admin/opportunities/{opp_id}/publish` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/opportunities.py:155` |
| GET | `/api/v1/admin/organisations` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/organisations.py:44` |
| POST | `/api/v1/admin/organisations` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/organisations.py:84` |
| DELETE | `/api/v1/admin/organisations/{org_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/organisations.py:128` |
| GET | `/api/v1/admin/organisations/{org_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/organisations.py:99` |
| PUT | `/api/v1/admin/organisations/{org_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/organisations.py:111` |
| GET | `/api/v1/admin/users` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/users.py:17` |
| GET | `/api/v1/admin/users/{user_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/users.py:50` |
| PATCH | `/api/v1/admin/users/{user_id}` | `require_super_admin` | implemented-source | `backend/app/api/v1/admin/users.py:62` |
| GET | `/api/v1/applications/` | `get_current_user` | placeholder | `backend/app/api/v1/applications.py:12` |
| POST | `/api/v1/applications/` | `get_current_user` | placeholder | `backend/app/api/v1/applications.py:20` |
| POST | `/api/v1/auth/login` | `public` | implemented-source | `backend/app/api/v1/auth.py:92` |
| POST | `/api/v1/auth/logout` | `public` | implemented-source | `backend/app/api/v1/auth.py:108` |
| GET | `/api/v1/auth/me` | `get_current_user` | implemented-source | `backend/app/api/v1/auth.py:116` |
| POST | `/api/v1/auth/refresh` | `public` | implemented-source | `backend/app/api/v1/auth.py:100` |
| POST | `/api/v1/auth/register` | `public` | implemented-source | `backend/app/api/v1/auth.py:27` |
| GET | `/api/v1/dashboard/` | `get_current_user` | placeholder | `backend/app/api/v1/dashboard.py:12` |
| GET | `/api/v1/opportunities` | `get_current_user` | implemented-source | `backend/app/api/v1/opportunities.py:45` |
| GET | `/api/v1/opportunities/{opportunity_id}` | `get_current_user` | implemented-source | `backend/app/api/v1/opportunities.py:148` |
| GET | `/api/v1/organizations/` | `get_current_user` | placeholder | `backend/app/api/v1/organizations.py:12` |
| POST | `/api/v1/organizations/` | `require_user_type(UserType.VENDOR, UserType.ADMIN)` | placeholder | `backend/app/api/v1/organizations.py:19` |
| GET | `/api/v1/users/` | `require_user_type(UserType.ADMIN)` | placeholder | `backend/app/api/v1/users.py:51` |
| GET | `/api/v1/users/me` | `get_current_user` | implemented-source | `backend/app/api/v1/users.py:44` |
| GET | `/api/v1/users/me/academic` | `get_current_user` | implemented-source | `backend/app/api/v1/academic.py:17` |
| POST | `/api/v1/users/me/academic` | `get_current_user` | implemented-source | `backend/app/api/v1/academic.py:30` |
| DELETE | `/api/v1/users/me/academic/{entry_id}` | `get_current_user` | implemented-source | `backend/app/api/v1/academic.py:64` |
| PUT | `/api/v1/users/me/academic/{entry_id}` | `get_current_user` | implemented-source | `backend/app/api/v1/academic.py:43` |
| GET | `/api/v1/users/me/achievements` | `get_current_user` | implemented-source | `backend/app/api/v1/achievements.py:60` |
| POST | `/api/v1/users/me/achievements` | `get_current_user` | implemented-source | `backend/app/api/v1/achievements.py:73` |
| DELETE | `/api/v1/users/me/achievements/{entry_id}` | `get_current_user` | implemented-source | `backend/app/api/v1/achievements.py:144` |
| PUT | `/api/v1/users/me/achievements/{entry_id}` | `get_current_user` | implemented-source | `backend/app/api/v1/achievements.py:105` |
| GET | `/api/v1/users/me/completion` | `get_current_user` | implemented-source | `backend/app/api/v1/users.py:111` |
| GET | `/api/v1/users/me/experience` | `get_current_user` | implemented-source | `backend/app/api/v1/experience.py:22` |
| POST | `/api/v1/users/me/experience` | `get_current_user` | implemented-source | `backend/app/api/v1/experience.py:39` |
| DELETE | `/api/v1/users/me/experience/{entry_id}` | `get_current_user` | implemented-source | `backend/app/api/v1/experience.py:72` |
| PUT | `/api/v1/users/me/experience/{entry_id}` | `get_current_user` | implemented-source | `backend/app/api/v1/experience.py:52` |
| GET | `/api/v1/users/me/expertise` | `get_current_user` | implemented-source | `backend/app/api/v1/expertise.py:17` |
| PUT | `/api/v1/users/me/expertise` | `get_current_user` | implemented-source | `backend/app/api/v1/expertise.py:28` |
| GET | `/api/v1/users/me/preferences` | `get_current_user` | implemented-source | `backend/app/api/v1/preferences.py:17` |
| PUT | `/api/v1/users/me/preferences` | `get_current_user` | implemented-source | `backend/app/api/v1/preferences.py:28` |
| GET | `/api/v1/users/me/profile` | `get_current_user` | implemented-source | `backend/app/api/v1/users.py:60` |
| PUT | `/api/v1/users/me/profile` | `get_current_user` | implemented-source | `backend/app/api/v1/users.py:67` |
| POST | `/api/v1/users/me/profile/photo` | `get_current_user` | implemented-source | `backend/app/api/v1/users.py:80` |
| GET | `/api/v1/users/me/service-delivery` | `get_current_user` | implemented-source | `backend/app/api/v1/service_delivery.py:61` |
| PUT | `/api/v1/users/me/service-delivery` | `get_current_user` | implemented-source | `backend/app/api/v1/service_delivery.py:76` |
| GET | `/health` | `public` | implemented-source | `backend/app/main.py:62` |

## UI inventory

| Route | Component | Classification | Guard |
|---|---|---|---|
| `/` | Navigate | redirect | none |
| `/login` | LoginPage | implemented-source | PublicRoute |
| `/register` | RegisterPage | implemented-source | PublicRoute |
| `/admin` | Navigate | redirect | SUPER_ADMIN |
| `/admin/dashboard` | AdminDashboardPage | implemented-source | SUPER_ADMIN |
| `/admin/users` | UsersPage | implemented-source | SUPER_ADMIN |
| `/admin/users/verification` | UsersPage | implemented-source | SUPER_ADMIN |
| `/admin/opportunities` | AdminOpportunitiesPage | implemented-source | SUPER_ADMIN |
| `/admin/opportunities/new` | CreateOpportunityPage | implemented-source | SUPER_ADMIN |
| `/admin/opportunities/:id/edit` | CreateOpportunityPage | implemented-source | SUPER_ADMIN |
| `/admin/applications` | ApplicationsPage | placeholder | SUPER_ADMIN |
| `/admin/categories` | CategoriesPage | implemented-source | SUPER_ADMIN |
| `/admin/organisations` | OrganisationsPage | implemented-source | SUPER_ADMIN |
| `/admin/organisations/new` | CreateOrganisationPage | implemented-source | SUPER_ADMIN |
| `/admin/organisations/:id/edit` | CreateOrganisationPage | implemented-source | SUPER_ADMIN |
| `/admin/sessions` | SessionsPage | placeholder | SUPER_ADMIN |
| `/admin/sessions/requests` | SessionsPage | placeholder | SUPER_ADMIN |
| `/admin/content/announcements` | ContentPage | placeholder | SUPER_ADMIN |
| `/admin/content/banners` | ContentPage | placeholder | SUPER_ADMIN |
| `/admin/communications/notifications` | CommunicationsPage | placeholder | SUPER_ADMIN |
| `/admin/communications/email` | CommunicationsPage | placeholder | SUPER_ADMIN |
| `/admin/analytics` | AnalyticsPage | placeholder | SUPER_ADMIN |
| `/admin/analytics/users` | AnalyticsPage | placeholder | SUPER_ADMIN |
| `/admin/analytics/opportunities` | AnalyticsPage | placeholder | SUPER_ADMIN |
| `/admin/settings/platform` | SettingsPage | placeholder | SUPER_ADMIN |
| `/admin/settings/admins` | SettingsPage | placeholder | SUPER_ADMIN |
| `/admin/support` | SupportPage | placeholder | SUPER_ADMIN |
| `/dashboard` | DashboardPage | static-demo-with-auth-user | ProtectedRoute |
| `/opportunities` | OpportunitiesPage | implemented-source | ProtectedRoute |
| `/profile` | MyProfilePage | implemented-source | ProtectedRoute |
| `/applications` | PlaceholderPage | placeholder | ProtectedRoute |
| `/sessions` | PlaceholderPage | placeholder | ProtectedRoute |
| `/availability` | PlaceholderPage | placeholder | ProtectedRoute |
| `/messages` | PlaceholderPage | placeholder | ProtectedRoute |
| `/resources` | PlaceholderPage | placeholder | ProtectedRoute |
| `/earnings` | PlaceholderPage | placeholder | ProtectedRoute |
| `/reviews` | PlaceholderPage | placeholder | ProtectedRoute |
| `/notifications` | PlaceholderPage | placeholder | ProtectedRoute |
| `/settings` | PlaceholderPage | placeholder | ProtectedRoute |
| `/help` | PlaceholderPage | placeholder | ProtectedRoute |
