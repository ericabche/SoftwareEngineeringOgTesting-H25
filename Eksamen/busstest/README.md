# Bus Ticket App (Buss)

A React app based on the Figma design for a Norwegian bus ticket application.

## Features

- Complete navigation flow through all screens
- Ticket purchase flow
- Profile management
- Search functionality for routes
- Payment methods management
- Settings and preferences
- Favorites and saved places

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
  ├── assets/
  │   └── images.js          # Figma image assets
  ├── components/
  │   ├── Footer.jsx         # Bottom navigation footer
  │   └── Footer.css
  ├── pages/                  # All page components
  │   ├── LoadingPage.jsx
  │   ├── HomePage.jsx
  │   ├── TicketPage.jsx
  │   ├── ProfilePage.jsx
  │   └── ... (other pages)
  ├── App.jsx                 # Main app with routing
  ├── main.jsx               # Entry point
  └── index.css              # Global styles
```

## Routes

- `/` - Loading page (redirects to home)
- `/home` - Home page with map and route search
- `/ticket` - Ticket page
- `/profile` - Profile page
- `/search` - Search for routes
- `/search/from` - Select departure location
- `/search/to` - Select destination
- `/journey/:id` - Journey details
- `/ticket/purchase` - Ticket purchase options
- `/ticket/single` - Single ticket selection
- `/ticket/period` - Period ticket selection
- `/payment` - Payment page
- `/ticket/success` - Ticket purchase success
- `/ticket/active` - Active ticket view
- `/ticket/history` - Ticket history
- `/payment/methods` - Payment methods
- `/payment/methods/add` - Add payment method
- `/profile/info` - Profile information
- `/profile/edit/name` - Edit name
- `/profile/edit/phone` - Edit phone
- `/profile/edit/email` - Edit email
- `/settings` - Settings
- `/saved-places` - Saved places
- `/favorites` - Favorites
- `/favorites/add` - Add favorite
- `/help` - Help page
- `/quick-purchase` - Quick purchase

## Notes

- Images from Figma are valid for 7 days (until they expire)
- The app is designed for mobile view (max-width: 390px)
- All text is in Norwegian
- Uses React Router for navigation

