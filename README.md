# Kill Bills v0

## AI-Assisted Development
This application was created using AI tools including GitHub Copilot and ChatGPT. The development process leveraged AI prompting to generate code, refine architecture, and implement best practices. 

## About the Application
Kill Bills is a bill management application designed to help users track shared expenses and manage order items. The app allows users to:

- Create and manage items with prices
- Track order quantities
- Manage location information for bills
- Automatically calculate totals
- Convert between currencies (EUR/CZK)
- Archive completed bills for future reference

The application provides real-time updates and synchronization across devices, making it perfect for roommates, friends, or colleagues who need to split expenses.

## Technologies & Libraries

### Core Technologies
- **React 18** - Frontend UI library
- **TypeScript** - Static typing for improved code quality
- **Firebase** - Backend services including:
  - Realtime Database for data storage
  - Authentication for user management
- **Vite** - Fast build tooling and development server

### UI Components & Styling
- **Material UI (MUI)** - Component library with responsive design
- **MUI Icons** - Icon set for the interface

### State Management & Hooks
- Custom React hooks for:
  - Firebase data management
  - Currency conversion
  - Modal controls
  - Error handling

### Additional Features
- Currency conversion API integration
- Responsive design for mobile and desktop
- Dark/light theme support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable the Realtime Database
   - In Project Settings, find your web app configuration
   - Copy the configuration values to `src/firebase.js`

3. Update Firebase Configuration:
   Open `src/firebase.js` and replace the placeholder values with your Firebase project configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. Start the development server:
```bash
npm start
```

## Features

- Real-time data synchronization with Firebase
- Add new items to the database
- Display items with timestamps
- Automatic updates when data changes

## Firebase Security Rules

Make sure to set up appropriate security rules in your Firebase Console. For development, you can use these rules (not recommended for production):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, implement more restrictive rules based on your authentication and authorization requirements.

## Project Structure

- `src/firebase.js` - Firebase configuration and initialization
- `src/App.js` - Main React component with Firebase integration
- `src/App.css` - Styling for the application
