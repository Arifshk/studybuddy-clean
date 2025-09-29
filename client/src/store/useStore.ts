import { create } from 'zustand';
import { Session, CreateSessionData } from '@/types';
import { subscribeToSessions, createSession, joinSession as firebaseJoinSession, leaveSession as firebaseLeaveSession } from '@/lib/firebaseService';
import { AuthUser, onAuthStateChange, signInWithGooglePopup, signInWithGoogleRedirect, signOutUser, handleRedirectResult, getCurrentUser } from '@/lib/auth';

interface StoreState {
  sessions: Session[];
  joinedSessions: Set<string>;
  currentUser: { name: string; initials: string } | null;
  authUser: AuthUser | null;
  isAuthenticating: boolean;
  hasShownDonateModal: boolean;
  donateSnoozed: number | null;
  donateDismissed: boolean;
  unsubscribe: (() => void) | null;
  authUnsubscribe: (() => void) | null;
  
  // Actions
  setSessions: (sessions: Session[]) => void;
  addSession: (sessionData: CreateSessionData) => Promise<string>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  setCurrentUser: (user: { name: string; initials: string } | null) => void;
  setAuthUser: (user: AuthUser | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setDonateModalShown: () => void;
  snoozeDonateModal: () => void;
  dismissDonateModal: () => void;
  initializeLocalStorage: () => void;
  initializeFirebase: () => void;
  initializeAuth: () => void;
  cleanup: () => void;
}

// No more dummy data - using Firebase real-time data

export const useStore = create<StoreState>((set, get) => ({
  sessions: [],
  joinedSessions: new Set(),
  currentUser: null,
  authUser: null,
  isAuthenticating: false,
  hasShownDonateModal: false,
  donateSnoozed: null,
  donateDismissed: false,
  unsubscribe: null,
  authUnsubscribe: null,

  setSessions: (sessions) => set({ sessions }),

  addSession: async (sessionData) => {
    const { currentUser } = get();
    const host = currentUser || { name: "Guest User", initials: "GU" };
    
    try {
      const sessionId = await createSession(sessionData, host);
      
      // Add to joined sessions since we're the host
      set((state) => ({
        joinedSessions: new Set([...Array.from(state.joinedSessions), sessionId])
      }));
      
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  joinSession: async (sessionId) => {
    const { joinedSessions, hasShownDonateModal, donateSnoozed, donateDismissed } = get();
    
    if (joinedSessions.has(sessionId)) return;
    
    try {
      await firebaseJoinSession(sessionId);
      
      set((state) => ({
        joinedSessions: new Set([...Array.from(state.joinedSessions), sessionId])
      }));

      // Check if we should show donate modal
      if (!hasShownDonateModal && !donateDismissed && (!donateSnoozed || Date.now() > donateSnoozed)) {
        setTimeout(() => {
          set({ hasShownDonateModal: true });
          localStorage.setItem('studybuddy_donate_shown', 'true');
        }, 1000);
      }
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  },

  leaveSession: async (sessionId) => {
    const { joinedSessions } = get();
    
    if (!joinedSessions.has(sessionId)) return;
    
    try {
      await firebaseLeaveSession(sessionId);
      
      const newJoinedSessions = new Set(joinedSessions);
      newJoinedSessions.delete(sessionId);
      
      set({ joinedSessions: newJoinedSessions });
    } catch (error) {
      console.error('Error leaving session:', error);
      throw error;
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  setAuthUser: (user) => {
    set({ authUser: user });
    // Update currentUser based on authUser
    if (user) {
      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
      const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      set({ currentUser: { name: displayName, initials } });
    } else {
      set({ currentUser: null });
    }
  },

  signInWithGoogle: async () => {
    set({ isAuthenticating: true });
    try {
      // Try popup first, fallback to redirect on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithGoogleRedirect();
      } else {
        await signInWithGooglePopup();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      set({ isAuthenticating: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isAuthenticating: true });
    try {
      await signOutUser();
      set({ authUser: null, currentUser: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ isAuthenticating: false });
    }
  },

  setDonateModalShown: () => set({ hasShownDonateModal: true }),

  snoozeDonateModal: () => {
    const snoozeUntil = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    set({ donateSnoozed: snoozeUntil });
    localStorage.setItem('studybuddy_donate_snooze', snoozeUntil.toString());
  },

  dismissDonateModal: () => {
    set({ donateDismissed: true });
    localStorage.setItem('studybuddy_donate_dismissed', 'true');
  },

  initializeLocalStorage: () => {
    const hasShown = localStorage.getItem('studybuddy_donate_shown') === 'true';
    const snoozed = localStorage.getItem('studybuddy_donate_snooze');
    const dismissed = localStorage.getItem('studybuddy_donate_dismissed') === 'true';

    set({
      hasShownDonateModal: hasShown,
      donateSnoozed: snoozed ? parseInt(snoozed) : null,
      donateDismissed: dismissed
    });
  },

  initializeFirebase: () => {
    const { unsubscribe } = get();
    
    // Clean up existing subscription if any
    if (unsubscribe) {
      unsubscribe();
    }
    
    // Subscribe to Firebase sessions
    const unsubscribeFn = subscribeToSessions((sessions) => {
      set({ sessions });
    });
    
    set({ unsubscribe: unsubscribeFn });
  },

  initializeAuth: () => {
    const { authUnsubscribe } = get();
    
    // Clean up existing auth subscription
    if (authUnsubscribe) {
      authUnsubscribe();
    }
    
    // Check for redirect result on app startup
    handleRedirectResult().then((user) => {
      if (user) {
        set({ authUser: user });
      }
    }).catch(console.error);
    
    // Subscribe to auth state changes
    const unsubscribeFn = onAuthStateChange((user) => {
      set({ authUser: user, isAuthenticating: false });
      if (user) {
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        set({ currentUser: { name: displayName, initials } });
      } else {
        set({ currentUser: null });
      }
    });
    
    set({ authUnsubscribe: unsubscribeFn });
  },

  cleanup: () => {
    const { unsubscribe, authUnsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
    if (authUnsubscribe) {
      authUnsubscribe();
      set({ authUnsubscribe: null });
    }
  }
}));
