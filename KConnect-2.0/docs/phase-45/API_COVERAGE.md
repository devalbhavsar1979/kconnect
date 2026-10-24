# API route coverage

All 59 frozen legacy operations have concrete routes. RouteCoverageTest additionally checks authentication middleware and unauthenticated denial for every protected operation. This mapping is not a claim of byte-for-byte captured FastAPI response parity.

| Method | Legacy path | Laravel handler | Access |
|---|---|---|---|
| GET | `/api/v1/users/me/academic` | ProfileController@index | bearer |
| POST | `/api/v1/users/me/academic` | ProfileController@create | bearer |
| PUT | `/api/v1/users/me/academic/{entry_id}` | ProfileController@update | bearer |
| DELETE | `/api/v1/users/me/academic/{entry_id}` | ProfileController@delete | bearer |
| GET | `/api/v1/users/me/experience` | ProfileController@index | bearer |
| POST | `/api/v1/users/me/experience` | ProfileController@create | bearer |
| PUT | `/api/v1/users/me/experience/{entry_id}` | ProfileController@update | bearer |
| DELETE | `/api/v1/users/me/experience/{entry_id}` | ProfileController@delete | bearer |
| GET | `/api/v1/users/me/expertise` | ProfileController@singleton | bearer |
| PUT | `/api/v1/users/me/expertise` | ProfileController@upsert | bearer |
| GET | `/api/v1/users/me/preferences` | ProfileController@singleton | bearer |
| PUT | `/api/v1/users/me/preferences` | ProfileController@upsert | bearer |
| GET | `/api/v1/users/me/achievements` | ProfileUploadController@index | bearer |
| POST | `/api/v1/users/me/achievements` | ProfileUploadController@create | bearer |
| PUT | `/api/v1/users/me/achievements/{entry_id}` | ProfileUploadController@update | bearer |
| DELETE | `/api/v1/users/me/achievements/{entry_id}` | ProfileUploadController@delete | bearer |
| GET | `/api/v1/users/me/service-delivery` | ProfileController@singleton | bearer |
| PUT | `/api/v1/users/me/service-delivery` | ProfileController@upsert | bearer |
| POST | `/api/v1/auth/register` | AuthController@register | public/token exchange |
| POST | `/api/v1/auth/login` | AuthController@login | public/token exchange |
| POST | `/api/v1/auth/refresh` | AuthController@refresh | public/token exchange |
| POST | `/api/v1/auth/logout` | AuthController@logout | public/token exchange |
| GET | `/api/v1/auth/me` | AuthController@me | bearer |
| GET | `/api/v1/users/me` | AuthController@me | bearer |
| GET | `/api/v1/users/` | Closure | role:ADMIN |
| GET | `/api/v1/users/me/profile` | AuthController@me | bearer |
| PUT | `/api/v1/users/me/profile` | ProfileController@updateProfile | bearer |
| POST | `/api/v1/users/me/profile/photo` | ProfileUploadController@photo | bearer |
| GET | `/api/v1/users/me/completion` | ProfileController@completion | bearer |
| GET | `/api/v1/organizations/` | Closure | bearer |
| POST | `/api/v1/organizations/` | Closure | role:VENDOR,ADMIN |
| GET | `/api/v1/opportunities` | OpportunityController@index | bearer |
| GET | `/api/v1/opportunities/{opportunity_id}` | OpportunityController@show | bearer |
| GET | `/api/v1/applications/` | Closure | bearer |
| POST | `/api/v1/applications/` | Closure | bearer |
| GET | `/api/v1/dashboard/` | Closure | bearer |
| GET | `/api/v1/admin/dashboard` | AdministrationController@dashboard | role:SUPER_ADMIN |
| GET | `/api/v1/admin/users` | AdministrationController@users | role:SUPER_ADMIN |
| GET | `/api/v1/admin/users/{user_id}` | AdministrationController@getUser | role:SUPER_ADMIN |
| PATCH | `/api/v1/admin/users/{user_id}` | AdministrationController@updateUser | role:SUPER_ADMIN |
| GET | `/api/v1/admin/organisations` | AdministrationController@organizations | role:SUPER_ADMIN |
| POST | `/api/v1/admin/organisations` | AdministrationController@saveOrganization | role:SUPER_ADMIN |
| GET | `/api/v1/admin/organisations/{org_id}` | AdministrationController@getOrganization | role:SUPER_ADMIN |
| PUT | `/api/v1/admin/organisations/{org_id}` | AdministrationController@saveOrganization | role:SUPER_ADMIN |
| DELETE | `/api/v1/admin/organisations/{org_id}` | AdministrationController@deleteOrganization | role:SUPER_ADMIN |
| GET | `/api/v1/admin/categories` | AdministrationController@categories | role:SUPER_ADMIN |
| POST | `/api/v1/admin/categories` | AdministrationController@saveCategory | role:SUPER_ADMIN |
| PUT | `/api/v1/admin/categories/{cat_id}` | AdministrationController@saveCategory | role:SUPER_ADMIN |
| DELETE | `/api/v1/admin/categories/{cat_id}` | AdministrationController@deleteCategory | role:SUPER_ADMIN |
| GET | `/api/v1/admin/opportunities` | OpportunityController@adminIndex | role:SUPER_ADMIN |
| POST | `/api/v1/admin/opportunities` | OpportunityController@save | role:SUPER_ADMIN |
| GET | `/api/v1/admin/opportunities/{opp_id}` | OpportunityController@adminShow | role:SUPER_ADMIN |
| PUT | `/api/v1/admin/opportunities/{opp_id}` | OpportunityController@save | role:SUPER_ADMIN |
| DELETE | `/api/v1/admin/opportunities/{opp_id}` | OpportunityController@delete | role:SUPER_ADMIN |
| POST | `/api/v1/admin/opportunities/{opp_id}/publish` | OpportunityController@publish | role:SUPER_ADMIN |
| POST | `/api/v1/admin/opportunities/{opp_id}/archive` | OpportunityController@archive | role:SUPER_ADMIN |
| POST | `/api/v1/admin/opportunities/{opp_id}/attachments` | OpportunityController@upload | role:SUPER_ADMIN |
| DELETE | `/api/v1/admin/opportunities/{opp_id}/attachments/{attachment_id}` | OpportunityController@deleteAttachment | role:SUPER_ADMIN |
| GET | `/health` | FoundationController@health | public/token exchange |
