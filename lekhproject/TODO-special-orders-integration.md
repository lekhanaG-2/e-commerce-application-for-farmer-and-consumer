# TODO: Integrate Special Orders into Farmer Dashboard

## Backend Changes
- [ ] Add backend routes in `backend-nodejs/routes/special-orders.js` for farmers to CRUD special order offers (add, get, update, delete)
- [ ] Ensure routes are authenticated and verify farmer ownership

## Frontend API Changes
- [ ] Add API methods in `frontend-reactjs/src/services/api.js` under farmerAPI for special orders (getSpecialOrders, addSpecialOrder, updateSpecialOrder, deleteSpecialOrder)

## Farmer Dashboard Updates
- [ ] Add 'specialOrders' to the sidebar navigation in `frontend-reactjs/src/components/FarmerDashboard.js`
- [ ] Update renderContent to handle 'specialOrders' section
- [ ] Create `frontend-reactjs/src/components/SpecialOrders.js` component for viewing and managing special orders
- [ ] Create `frontend-reactjs/src/components/AddSpecialOrder.js` component/form for adding new special orders
- [ ] Integrate AddSpecialOrder into SpecialOrders component

## Testing and Verification
- [ ] Test the integration by running the app
- [ ] Verify special orders appear in consumer dashboard
- [ ] Verify special orders are manageable in admin dashboard
- [ ] Ensure all data comes from backend API, not dummy data
