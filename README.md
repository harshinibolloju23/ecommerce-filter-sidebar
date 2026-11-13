# E-Commerce Product Multi-Filter Sidebar

## Features
- Category checklist, dual-handle price slider, minimum star rating
- Instant grid updates (no submit button)
- Empty state with "Reset filters"
- Sort By: Price Low to High, Price High to Low, Top Rated First

## Architecture
- backend/app.py: Flask API
- backend/services/filter_service.py: all filtering and sorting logic (server side)
- frontend/: HTML, CSS, JS (presentation and user interaction only)

## How it works
Pipeline: filter the original dataset (category AND price range AND rating), then sort the result.
Empty filters are skipped, so the full inventory is shown.

## Run
pip install -r requirements.txt
cd backend
python app.py
Open http://127.0.0.1:5000