# StudyBuddy Deployment Guide

## Download and Setup for IntelliJ IDEA

### Prerequisites
- Node.js 18+ installed on your machine
- IntelliJ IDEA Ultimate with JavaScript/TypeScript support
- Firebase account
- Stripe account

### IntelliJ Setup
1. Download all project files to your local machine
2. Open IntelliJ IDEA and select "Open or Import"
3. Navigate to your StudyBuddy folder and open it
4. IntelliJ should automatically detect it as a Node.js project
5. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables Setup
Create a `.env` file in your project root with these variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Firebase Setup
1. Go to https://console.firebase.google.com/
2. Create a new project or use existing one
3. Enable Firestore Database in production mode
4. Add a web app and copy the configuration values
5. Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if true; // For demo purposes - restrict in production
    }
    match /donations/{donationId} {
      allow read, write: if true; // For demo purposes - restrict in production
    }
  }
}
```

### Stripe Setup
1. Go to https://dashboard.stripe.com/
2. Get your publishable key (starts with `pk_test_`) and secret key (starts with `sk_test_`)
3. Add these to your environment variables

### Running Locally in IntelliJ
1. Open the terminal in IntelliJ
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:5000 in your browser

## Vercel Deployment

### Method 1: Direct Deploy (Recommended)
1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to https://vercel.com/ and sign up/login
3. Click "New Project" and import your repository
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# Follow the prompts
```

### Environment Variables on Vercel
1. In your Vercel project dashboard, go to Settings → Environment Variables
2. Add all the variables from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_STRIPE_PUBLIC_KEY`
   - `STRIPE_SECRET_KEY`

### Production Considerations

#### Firebase Security Rules
Update your Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read: if true;
      allow write: if request.auth != null; // Requires authentication
    }
    match /donations/{donationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### Stripe Configuration
- Switch to live keys when ready for production
- Configure webhooks for payment confirmations
- Set up proper error handling and logging

## Project Structure

```
StudyBuddy/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/           # Firebase and utility functions
│   │   ├── store/         # Zustand state management
│   │   └── hooks/         # Custom React hooks
│   ├── public/            # Static assets
│   └── index.html         # Entry point
├── server/                # Backend Express server
│   ├── routes.ts          # API routes
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schemas
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - TypeScript type checking

## Features

✅ Real-time study session updates via Firebase
✅ Course-based session filtering
✅ Location-based session discovery
✅ Stripe-powered donation system
✅ Responsive design with Wilfrid Laurier branding
✅ Dark/light mode support
✅ Report system for session moderation

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase and Stripe accounts are properly configured
4. Check network connectivity and API quotas

## License

MIT License - See LICENSE file for details