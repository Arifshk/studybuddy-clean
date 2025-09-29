# StudyBuddy 📚

A real-time study session platform built for Wilfrid Laurier University students to discover and join study sessions organized by course and location.

## ✨ Features

- 🔥 **Real-time Updates**: Sessions update instantly using Firebase Firestore
- 📍 **Location-based Discovery**: Find study sessions by building and floor
- 📚 **Course Organization**: Filter sessions by specific courses
- 💰 **Donation Support**: Support the platform with Stripe integration
- 🌙 **Dark Mode**: Full light/dark theme support
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🛡️ **Privacy-First**: Only shares building/floor, not GPS coordinates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Stripe account (for donations)

### Installation
```bash
# Clone and install dependencies
git clone <your-repo>
cd studybuddy
npm install
```

### Environment Setup
Create a `.env` file with your credentials:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Development
```bash
npm run dev
```

Visit http://localhost:5000

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: Firebase Firestore (real-time)
- **Payments**: Stripe
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI + shadcn/ui
- **Build Tool**: Vite

## 📦 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🎨 Design System

StudyBuddy uses Wilfrid Laurier University's official colors:
- **Primary Purple**: #4F2683
- **Secondary Gold**: #FFB81C
- **Supporting neutrals** with proper contrast ratios

## 📱 Pages

- **Landing**: Welcome page with app overview
- **Sessions**: Browse and filter active study sessions  
- **Host**: Create new study sessions
- **Donate**: Support the platform development
- **Moderate**: Report inappropriate content

## 🔧 Development

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build locally
- `npm run check` - TypeScript checking

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route components  
│   │   ├── lib/         # Firebase & utilities
│   │   └── store/       # State management
├── server/           # Express backend
├── shared/           # Shared types
└── public/           # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🆘 Support

Having issues? Check out:
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- Firebase Console for database issues
- Stripe Dashboard for payment issues

---

Built with ❤️ for Wilfrid Laurier University students# studybuddy-clean
