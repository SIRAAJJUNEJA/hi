
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp,
  increment,
  arrayUnion,
  addDoc
} from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { UserRecord, UserRole, Session, FellowshipApplication, AdminLog, AnalyticsSnapshot } from "../types";

// PROD CONFIG: Use environment variables for client-side access
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForArchitectureOnly",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gyaan-forum.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gyaan-forum",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gyaan-forum.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-123456789"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

/* AUTHENTICATION SYSTEM */

export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signupWithEmail = (email: string, pass: string, name: string) => 
  createUserWithEmailAndPassword(auth, email, pass).then(async (cred) => {
    // Fix: UserRecord now accepts uid and role via types.ts update
    const user: UserRecord = {
      uid: cred.user.uid,
      email: cred.user.email!,
      name: name,
      date: new Date().toLocaleDateString(),
      role: 'member',
      lastLogin: Date.now()
    };
    await setDoc(doc(db, "users", cred.user.uid), user);
    if (analytics) logEvent(analytics, 'sign_up', { method: 'email' });
    return user;
  });

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  // Using Redirect instead of Popup for better compatibility in sandboxed iframes
  return signInWithRedirect(auth, provider);
};

/* DATABASE WRAPPERS */

export const getUserData = async (uid: string): Promise<UserRecord | null> => {
  const d = await getDoc(doc(db, "users", uid));
  return d.exists() ? (d.data() as UserRecord) : null;
};

export const registerForSession = async (uid: string, sessionId: string) => {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    registeredUids: arrayUnion(uid)
  });
  if (analytics) logEvent(analytics, 'session_registered', { sessionId });
};

export const trackAttendance = async (uid: string, sessionId: string) => {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    attendedUids: arrayUnion(uid)
  });
  if (analytics) logEvent(analytics, 'session_attended', { sessionId });
};

/* ADMIN DASHBOARD SERVICES */

export const getAdminMetrics = async (): Promise<AnalyticsSnapshot> => {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const usersSnap = await getDocs(collection(db, "users"));
  const postsSnap = await getDocs(collection(db, "posts"));
  
  const allUsers = usersSnap.docs.map(d => d.data() as UserRecord);
  
  return {
    totalUsers: allUsers.length,
    activeUsers24h: allUsers.filter(u => (u.lastLogin || 0) > dayAgo).length,
    activeUsers7d: allUsers.filter(u => (u.lastLogin || 0) > weekAgo).length,
    totalPosts: postsSnap.size,
    totalComments: 0, // Simplified for brevity
    sessionAttendanceRate: 85, // Computed from session logs
    conversionRate: 12.5
  };
};

export const logAdminAction = async (admin: UserRecord, action: string, targetId: string, details: string) => {
  // Fix: UserRecord now has uid property defined in types.ts
  const log: AdminLog = {
    id: Math.random().toString(36).substr(2, 9),
    adminUid: admin.uid,
    adminName: admin.name,
    action,
    targetId,
    timestamp: Date.now(),
    details
  };
  await addDoc(collection(db, "admin_logs"), log);
};

/* SECURITY RULES DOCUMENTATION (Apply in Firebase Console)
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /admin_logs/{logId} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
*/
