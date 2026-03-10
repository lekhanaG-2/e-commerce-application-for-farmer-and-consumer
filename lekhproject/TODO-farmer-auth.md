# Farmer Registration and Authentication Implementation

## TODO List

- [ ] Create FarmerRegistrationPage component with additional fields: farm name, location, ID proof upload
- [ ] Update backend users.js to handle farmer registration with role="farmer" and additional fields
- [ ] Update LoginPage to detect user role and redirect farmers to /farmer/dashboard
- [ ] Create FarmerDashboard component for farmer-specific interface
- [ ] Add farmer routes to App.js (/farmer/register, /farmer/dashboard)
- [ ] Fix ConsumerDashboard "Sell as a Farmer" button to navigate to /farmer/register
- [ ] Update database schema if needed for farmer fields

## Followup Steps
- [ ] Test farmer registration flow
- [ ] Test farmer login and dashboard access
- [ ] Verify role-based navigation
