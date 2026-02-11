## Packages
recharts | Data visualization for inventory forecasting and analytics
date-fns | Date formatting for localization (DD/MM/YYYY)
framer-motion | Smooth animations for page transitions and UI elements
lucide-react | Icon set (already in base but explicit for clarity)
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
Authentication uses email/password via Passport.js (cookie-based).
API endpoints are defined in shared/routes.ts.
Date format should be DD/MM/YYYY.
Currency format should be ₹ (Indian Rupee).
Forecasting charts need to handle historical and predicted data series.
