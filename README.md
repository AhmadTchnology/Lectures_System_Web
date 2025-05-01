# University Lecture Management System

A comprehensive lecture management system built with React, Firebase, and TypeScript. This system allows universities to manage lectures, users, and educational content with role-based access control.

## Features

- 🔐 Role-based authentication (Admin, Teacher, Student)
- 📚 Lecture management with PDF support
- 👥 User management system
- 🏷️ Category management for subjects and stages
- ❤️ Favorite lectures functionality
- ✅ Lecture completion tracking
- 🔍 Advanced search and filtering
- 📱 Responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lecture-management-system.git
   cd lecture-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Create a Storage bucket
   - Get your Firebase configuration

4. Set up Firebase configuration:
   - Copy `src/firebase.example.ts` to `src/firebase.ts`
   - Open `src/firebase.ts`
   - Replace the placeholder values in the `firebaseConfig` object with your actual Firebase configuration
   - Note: `firebase.ts` is excluded from git to protect your API keys and sensitive information

5. Start the development server:
   ```bash
   npm run dev
   ```

## Firebase Security Rules

Make sure to set up the following security rules in your Firebase console:

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read all documents
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow authenticated users to create and update lectures
    match /lectures/{lectureId} {
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && (
        // Allow admins to delete any lecture
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        // Allow users to delete their own lectures
        resource.data.uploadedBy == request.auth.uid
      );
    }
    
    // Allow admins to manage users
    match /users/{userId} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all authenticated users
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Allow write access to the lectures folder for authenticated users
    match /lectures/{fileName} {
      allow write: if request.auth != null;
    }
  }
}
```

## Project Structure

```
src/
  ├── App.tsx           # Main application component
  ├── App.css           # Application styles
  ├── firebase.ts       # Firebase configuration
  ├── index.css         # Global styles
  ├── main.tsx          # Application entry point
  └── vite-env.d.ts     # TypeScript declarations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

### Netlify

This project is configured for easy deployment to Netlify. You can deploy in two ways:

1. **Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```

2. **Netlify UI:**
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Deploy

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Made with ❤️ by @AhmadTchnology [github.com/AhmadTchnology]