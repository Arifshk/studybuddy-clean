import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth } from './firebase';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Convert Firebase User to our AuthUser type
export function transformUser(user: User | null): AuthUser | null {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

// Sign in with Google using popup (preferred for desktop)
export async function signInWithGooglePopup(): Promise<AuthUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return transformUser(result.user);
  } catch (error) {
    console.error('Error signing in with Google popup:', error);
    throw error;
  }
}

// Sign in with Google using redirect (fallback for mobile)
export async function signInWithGoogleRedirect(): Promise<void> {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Error signing in with Google redirect:', error);
    throw error;
  }
}

// Handle redirect result (call on app startup)
export async function handleRedirectResult(): Promise<AuthUser | null> {
  try {
    const result = await getRedirectResult(auth);
    return result ? transformUser(result.user) : null;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(transformUser(user));
  });
}

// Get current user
export function getCurrentUser(): AuthUser | null {
  return transformUser(auth.currentUser);
}