# DFD Level 0 — LekhProject

This folder contains a high-level Data Flow Diagram (Level 0) for the LekhProject repository.

- `dfd-level0.svg`: an SVG diagram that shows the top-level external entities, the main system process (`0 — LekhProject System`), and the primary data stores.

Diagram summary:
- External entities: `Consumer`, `Farmer`, `Admin` — these interact with the system via the frontend (web/mobile).
- Main process: `0 — LekhProject System` — encompasses authentication, product/catalog management, order processing, notifications.
- Data stores:
  - `Application Database` (MongoDB): stores Users, Products, Orders, Carts, Wishlists, SpecialOrders, Notifications, etc. (see `backend-nodejs/models/`)
  - `File Store` (`uploads/`): image and file uploads used by products and profiles.

How to view the diagram:
1. Open `docs/dfd-level0.svg` in a browser (double-click) or any SVG viewer/editor.
2. You can also open it in VS Code to preview.

- Notes & next steps:
- This Level 0 DFD is intentionally high-level. For deeper understanding, create a Level 1 DFD that decomposes the central process into sub-processes such as Authentication, Product Catalog, Order Processing, Notifications, and File Management.
- The backend uses Mongoose (MongoDB) models (see `backend-nodejs/models`) and stores uploads in `backend-nodejs/uploads/`.

Exporting a PNG/PDF from the SVG
--------------------------------

I included a small Node script `docs/convert-svg-to-png.js` that uses Puppeteer to render the `dfd-level0.svg` into a PNG. To generate a high-resolution PNG (3000×1750) run these commands from the repo root:

```powershell
cd "e:\lekhproject (3)\lekhproject"
npm install --save-dev puppeteer
node docs/convert-svg-to-png.js docs/dfd-level0.svg docs/dfd-level0.png 3000 1750
```

Notes:
- `png` is raster — choose 3000×1750 for good print quality; increase for larger prints.
- For vector output (best for print), use the original `dfd-level0.svg` or export to PDF from an SVG editor.

