import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';
import { Session, CreateSessionData } from '@/types';

export interface FirebaseSession extends Omit<Session, 'id' | 'endsAt'> {
  id?: string;
  endsAt: Timestamp;
  createdAt: Timestamp;
}

// Convert Firebase session to app session format
export const convertFirebaseSession = (doc: any): Session => {
  const data = doc.data();
  const now = new Date();
  const endTime = data.endsAt.toDate();
  const timeDiff = endTime.getTime() - now.getTime();
  const minutesRemaining = Math.max(0, Math.floor(timeDiff / (1000 * 60)));
  
  let timeString = 'ended';
  if (minutesRemaining > 0) {
    if (minutesRemaining < 60) {
      timeString = `in ${minutesRemaining}m`;
    } else {
      const hours = Math.floor(minutesRemaining / 60);
      const mins = minutesRemaining % 60;
      timeString = `in ${hours}h ${mins}m`;
    }
  }

  return {
    id: doc.id,
    courseCode: data.courseCode,
    building: data.building,
    floor: data.floor,
    capacity: data.capacity,
    attendeeCount: data.attendeeCount,
    public: data.public,
    endsAt: timeString,
    host: data.host,
    notes: data.notes,
    area: data.area,
    duration: data.duration,
    locationImages: data.locationImages || []
  };
};

// Subscribe to all sessions
export const subscribeToSessions = (callback: (sessions: Session[]) => void) => {
  const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const sessions: Session[] = [];
    querySnapshot.forEach((doc) => {
      const session = convertFirebaseSession(doc);
      // Only include sessions that haven't ended
      if (session.endsAt !== 'ended') {
        sessions.push(session);
      }
    });
    callback(sessions);
  });
};

// Create a new session
export const createSession = async (sessionData: CreateSessionData, host: { name: string; initials: string }): Promise<string> => {
  const now = new Date();
  const endTime = new Date(now.getTime() + sessionData.duration * 60000);
  
  const firebaseSession: Omit<FirebaseSession, 'id'> = {
    ...sessionData,
    attendeeCount: 1,
    endsAt: Timestamp.fromDate(endTime),
    host,
    createdAt: serverTimestamp() as Timestamp
  };

  const docRef = await addDoc(collection(db, 'sessions'), firebaseSession);
  return docRef.id;
};

// Join a session
export const joinSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(db, 'sessions', sessionId);
  // Note: In a real app, you'd want to use a transaction to prevent race conditions
  // For now, we'll use a simple update
  const sessionDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(sessionRef));
  
  if (sessionDoc.exists()) {
    const currentCount = sessionDoc.data().attendeeCount || 0;
    const capacity = sessionDoc.data().capacity || 0;
    
    if (currentCount < capacity) {
      await updateDoc(sessionRef, {
        attendeeCount: currentCount + 1
      });
    } else {
      throw new Error('Session is full');
    }
  }
};

// Leave a session
export const leaveSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(db, 'sessions', sessionId);
  const sessionDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(sessionRef));
  
  if (sessionDoc.exists()) {
    const currentCount = sessionDoc.data().attendeeCount || 1;
    await updateDoc(sessionRef, {
      attendeeCount: Math.max(1, currentCount - 1)
    });
  }
};

// Delete a session (for cleanup)
export const deleteSession = async (sessionId: string): Promise<void> => {
  await deleteDoc(doc(db, 'sessions', sessionId));
};

// Upload location images to Firebase Storage
export const uploadLocationImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    // Create a unique filename using timestamp and random string
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `location-images/${timestamp}-${randomId}-${file.name}`;
    
    const storageRef = ref(storage, fileName);
    
    try {
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${file.name}`);
    }
  });

  // Wait for all uploads to complete
  return Promise.all(uploadPromises);
};

// Delete location images from Firebase Storage
export const deleteLocationImages = async (imageUrls: string[]): Promise<void> => {
  const deletePromises = imageUrls.map(async (url) => {
    try {
      // Extract the path from the URL
      const urlObj = new URL(url);
      const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw here to allow partial cleanup
    }
  });

  await Promise.all(deletePromises);
};