import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL (from SKILL.md): must pass firestoreDatabaseId
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// SKILL.md: Validate Connection to Firestore on startup
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline, check connection.");
    }
    return false;
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type UserRole = 'admin' | 'astrologer' | 'user' | 'unknown';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  astrologerId?: string | null;
  isAdmin: boolean;
  isAstrologer: boolean;
}

// Designate default Super Admin (Business email: info.lumsic@gmail.com)
export const SUPER_ADMIN_EMAIL = 'info.lumsic@gmail.com';
export const ADMIN_EMAILS = ['info.lumsic@gmail.com', 'bankush014@gmail.com'];

/**
 * Fetch and verify the user role from Firestore and secure backend API
 */
export async function getUserRole(user: User): Promise<UserRole> {
  if (!user || !user.email) return 'unknown';

  const userEmail = user.email.toLowerCase().trim();

  // Root bootstrap rule: Primary verified developer/admin email
  if (ADMIN_EMAILS.includes(userEmail)) {
    try {
      // Ensure user profile in Firestore reflects admin role
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: userEmail,
        displayName: user.displayName || (userEmail === SUPER_ADMIN_EMAIL ? 'Lumsic Super Admin' : 'Super Admin'),
        role: 'admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const adminRef = doc(db, 'admins', user.uid);
      await setDoc(adminRef, {
        uid: user.uid,
        email: userEmail,
        assignedBy: 'system',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch {
      // non-blocking
    }
    return 'admin';
  }

  // 1. Check admins collection
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    if (adminSnap.exists()) {
      return 'admin';
    }
  } catch (err) {
    console.warn('Error reading admin collection:', err);
  }

  // 2. Check astrologers collection
  try {
    const astroSnap = await getDoc(doc(db, 'astrologers', user.uid));
    if (astroSnap.exists()) {
      return 'astrologer';
    }
  } catch (err) {
    console.warn('Error reading astrologers collection:', err);
  }

  // 3. Check users collection
  try {
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.role === 'admin' || data.role === 'astrologer') {
        return data.role;
      }
    }
  } catch (err) {
    console.warn('Error reading users collection:', err);
  }

  // 4. Fallback to server verification
  try {
    const res = await fetch(`/api/auth/role?email=${encodeURIComponent(userEmail)}&uid=${user.uid}`);
    if (res.ok) {
      const data = await res.json();
      if (data.role) return data.role;
    }
  } catch {
    // offline fallback
  }

  return 'user';
}

/**
 * Sign in using Google Popup (preferred in AI Studio iframe environment)
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with Email / Password
 */
export async function signInEmailPassword(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Sign up with Email / Password
 */
export async function signUpEmailPassword(email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Sign out current user
 */
export async function signOutCurrentUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Hook or observer for auth state with role
 */
export function subscribeToAuthRole(
  onProfile: (profile: AuthUserProfile | null, loading: boolean) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      onProfile(null, false);
      return;
    }

    try {
      const role = await getUserRole(user);
      onProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        role,
        isAdmin: role === 'admin',
        isAstrologer: role === 'astrologer'
      }, false);
    } catch {
      onProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'User',
        photoURL: user.photoURL,
        role: 'user',
        isAdmin: false,
        isAstrologer: false
      }, false);
    }
  });
}
