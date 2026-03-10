# TODO: Integrate Backend Wishlist API and Replace localStorage Logic

## Information Gathered
- Backend has wishlist table and API routes (GET, POST, DELETE) with authentication.
- Frontend currently uses localStorage for wishlist in ProductsPage.js, ProductDetailsPage.js, and Wishlist.js.
- API service has wishlist methods but they are incorrect (wrong URLs and parameters).
- Components store wishlist as array of { productId: id } in localStorage.
- Backend expects product_id directly, returns array of wishlist items with product_id.

## Plan
1. Fix wishlist API methods in frontend-reactjs/src/services/api.js to match backend routes.
2. Update Navbar.js to fetch wishlist from API if user is logged in.
3. Update ProductsPage.js to use API for wishlist operations.
4. Update ProductDetailsPage.js to use API for wishlist operations.
5. Update Wishlist.js to use API for fetching and removing items.
6. Handle authentication: if no token, disable wishlist or show login prompt.

## Dependent Files
- frontend-reactjs/src/services/api.js
- frontend-reactjs/src/components/Navbar.js
- frontend-reactjs/src/components/ProductsPage.js
- frontend-reactjs/src/components/ProductDetailsPage.js
- frontend-reactjs/src/components/Wishlist.js

## Followup Steps
- Test wishlist functionality with logged-in user.
- Ensure fallback for non-logged-in users (disable or localStorage).
- Verify API calls work correctly.
