# TODO: Enhance Settings Page and Add Help & Support

## Steps to Complete:

- [x] Step 1: Alter users table to add notification preference fields (email_notifications, push_notifications, sms_notifications).

- [x] Step 2: Update backend-nodejs/routes/users.js - Add PUT /change-password endpoint for password updates and POST /contact for contact form.

- [x] Step 3: Update frontend-reactjs/src/services/api.js - Add changePassword, updateNotificationPreferences, and submitContactForm functions.

- [x] Step 4: Update frontend-reactjs/src/components/SettingsPage.js - Add password change section and notification preferences section with toggles.

- [x] Step 5: Update frontend-reactjs/src/components/SettingsPage.css - Add styles for password change and notification sections.

- [x] Step 6: Update frontend-reactjs/src/components/Navbar.js - Add "Help & Support" to profile dropdown, link to /help.

- [x] Step 7: Create frontend-reactjs/src/components/HelpPage.js - Implement FAQs, contact form, and live chat placeholder.

- [x] Step 8: Create frontend-reactjs/src/components/HelpPage.css - Add styles for FAQs, contact form, and chat section.

- [x] Step 9: Update frontend-reactjs/src/App.js - Add /help route with HelpPage component.

- [x] Step 10: Test the implementation - Run frontend and backend, login, test settings updates and help page features.

## Notes:
- Password change: current password, new password, confirm new password.
- Notification preferences: toggles for email, push, SMS.
- Help & Support: Static FAQs, contact form submits to backend, live chat as placeholder.
- Ensure auth for settings, public for help.
- Responsive design.
