# MongoDB Migration TODO

## Phase 1: Dependencies and Connection
- [x] Update package.json: remove mysql2, add mongoose
- [x] Update db.js to use MongoDB connection
- [x] Install dependencies

## Phase 2: Models Creation
- [x] Create models/User.js
- [x] Create models/Product.js
- [x] Create models/Order.js
- [x] Create models/Address.js
- [x] Create models/Wishlist.js
- [x] Create models/Cart.js (if needed)
- [x] Create models/Admin.js (if needed)

## Phase 3: Route Updates
- [x] Update routes/users.js
- [x] Update routes/products.js
- [x] Update routes/orders.js
- [x] Update routes/cart.js
- [x] Update routes/wishlist.js
- [x] Update routes/admin.js
- [x] Update routes/dashboard.js
- [x] Update routes/farmers.js
- [x] Update routes/special-orders.js

## Phase 4: Data Migration
- [x] Create scripts to migrate existing MySQL data to MongoDB
- [x] Update SQL insert scripts to MongoDB insert scripts

## Phase 5: Testing
- [x] Test all API endpoints
- [x] Verify data integrity
- [x] Update test files if needed
- [x] Fix JWT token issues with ObjectId format
- [x] Update test-cart-api.js with valid ObjectId user ID
- [x] Update test-orders-api.js with valid ObjectId user ID
- [x] Update test-wishlist-with-auth.js with valid ObjectId user ID
- [x] Add missing axios import to test-orders-api.js
- [x] Correct test-cart-api.js to test cart endpoints instead of wishlist
