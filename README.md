# Kill Bills v0

A React application that demonstrates Firebase Realtime Database integration.

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
