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
   - Create a `.env` file in the root directory
   - Add your Firebase configuration to the `.env` file using the following format:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```
   - Note: The `.env` file is excluded from git to protect your API keys and sensitive information

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

## AI Chat Integration

The system includes an AI Chat feature powered by **n8n** workflows. This allows users to chat with an AI assistant that can be customized via n8n.

### Architecture
- **Frontend**: React component (`AIChat.tsx`) sends POST requests with user message, name, and role.
- **Proxy**: Vite (`vite.config.ts`) forwards requests from `/api/n8n` to the actual n8n server to handle CORS.
- **Backend (n8n)**: Receives the webhook, processes the message (e.g., using OpenAI/Anthropic), stores the chat in PostgreSQL, and returns a response.

### Setup Instructions

1. **Environment Variables**:
   Add your n8n webhook URL to `.env`:
   ```bash
   # Use the local proxy path (recommended for dev)
   VITE_N8N_WEBHOOK_URL=/api/n8n/webhook/your-workflow-name
   ```

2. **n8n Workflow**:
   - Create a **Webhook** node:
     - Method: `POST`
     - Path: `your-postgresql-table-name`
   - Create a **PostgreSQL** node (to store chats):
     - Operation: `Execute Query`
     - Query:
       ```sql
       INSERT INTO "your-postgresql-table-name" (user_name, user_role, message, "date", "timestamp")
       VALUES ('{{ $json.body.user }}', '{{ $json.body.role }}', '{{ $json.body.message }}', '{{ $json.body.date }}', '{{ $json.body.timestamp }}');
       ```
     - *Note: Ensure you handle single quotes in messages safely.*

3. **Database Schema**:
   Run this SQL in your PostgreSQL database to create the required table:
   ```sql
   CREATE TABLE "your-postgresql-table-name" (
       id SERIAL PRIMARY KEY,
       user_name VARCHAR(255) NOT NULL,
       user_role VARCHAR(50) NOT NULL,
       message TEXT NOT NULL,
       date DATE,
       timestamp TIMESTAMPTZ,
       created_at TIMESTAMPTZ DEFAULT NOW()
   );
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