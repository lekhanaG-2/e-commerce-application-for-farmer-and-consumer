# Profile Page Implementation TODO

## Current Work
Implementing My Profile page for viewing/updating user info (name, phone, email, address) with profile photo upload. Route: /profile.

## Key Technical Concepts
- React: useState/useEffect for form state, FormData for file upload.
- Backend: Express routes with userAuth middleware, multer for photo upload, MySQL queries for GET/PUT user + addresses.
- Auth: JWT from localStorage 'user'.
- Photo: Local storage in /backend-nodejs/uploads, update users.profile_photo path.
- Validation: express-validator for updates (unique email/phone).

## Relevant Files and Code
- backend-nodejs/routes/users.js: Add GET /profile (SELECT user JOIN addresses), PUT /profile (UPDATE users, INSERT/UPDATE addresses, multer.single('photo')).
- frontend-reactjs/src/App.js: Add import ProfilePage from './components/ProfilePage'; <Route path="/profile" element={<ProfilePage cartItems={cartItems} userProfile={userProfile} searchTerm={searchTerm} onSearchChange={handleSearchChange} onLogout={() => setUserProfile(null)} />} />.
- frontend-reactjs/src/components/Navbar.js: Change <a href="/edit-profile"> to <Link to="/profile">My Profile</Link>.
- frontend-reactjs/src/services/api.js: Export const getProfile = () => api.get('/users/profile'); const updateProfile = (data) => { const formData = new FormData(); Object.keys(data).forEach(key => formData.append(key, data[key])); if (data.photo) formData.append('photo', data.photo); return api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); }.
- New: frontend-reactjs/src/components/ProfilePage.js: useState for form data, fetch user on mount, photo preview URL.createObjectURL, submit updateProfile, protected (if (!user) navigate('/login')).
- New: frontend-reactjs/src/components/ProfilePage.css: Form styling, photo upload preview.

## Problem Solving
- Auth guard: Check localStorage 'user' in ProfilePage; redirect if null.
- Multi-address: Fetch from /addresses, allow add/edit/delete.
- Photo: Validate file type/size (image <5MB), backend multer config with filename timestamp + ext.
- Updates: Handle partial updates, check duplicates on email/phone.
- Error handling: Display API errors in form.

## Pending Tasks and Next Steps
- [x] Install multer: cd backend-nodejs && npm i multer
- [x] Check/add profile_photo column: Column exists in users table.
- [x] Create /backend-nodejs/uploads dir: mkdir backend-nodejs/uploads
- [x] Update backend-nodejs/routes/users.js: Added multer config, GET /profile (fetch user + addresses), PUT /profile (update user fields, multer for photo upload/save to /uploads, update profile_photo path).
- [x] Update frontend-reactjs/src/services/api.js: Added getProfile and updateProfile functions with FormData for photo.
- [x] Create frontend-reactjs/src/components/ProfilePage.js: Form with name/phone/email/address fields, photo upload with preview, API integration, auth guard, localStorage update.
- [x] Create frontend-reactjs/src/components/ProfilePage.css: Styling for form, photo preview, error/success messages.
- [x] Update frontend-reactjs/src/App.js: Added import ProfilePage and Route path="/profile".
- [x] Update frontend-reactjs/src/components/Navbar.js: Changed My Profile link to <Link to="/profile">.
- [ ] Test: Login user → navigate /profile → view data → edit name/address → upload photo → submit → verify DB update, photo saved, localStorage refreshed, navbar greeting updated.
- [ ] Edge cases: No auth (redirect login), invalid photo (error), duplicate email (validation error), no changes (success).

Next step: Install multer and check DB schema.
