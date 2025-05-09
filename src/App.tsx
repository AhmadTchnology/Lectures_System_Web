import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { LogIn, LogOut, Upload, FileText, Users, User, Info, Menu, X, Search, Filter, Lock, Plus, Trash, Heart, HeartOff, CheckCircle, UserX } from 'lucide-react';
import classNames from 'classnames';
import './App.css';

// Firebase imports
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  where,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { db, storage, auth } from './firebase';

// Define user roles
type Role = 'admin' | 'teacher' | 'student';

// User interface
interface User {
  id: string;
  email: string;
  password?: string;
  role: Role;
  name: string;
  createdAt?: any;
  favorites?: string[];
  completedLectures?: string[];
  lastSignOut?: number;
  unreadAnnouncements?: string[];
}

// Lecture interface
interface Lecture {
  id: string;
  title: string;
  subject: string;
  stage: string;
  pdfUrl: string;
  uploadedBy: string;
  uploadDate: string;
}

// Announcement interface
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'homework' | 'exam' | 'event' | 'other';
  createdBy: string;
  creatorName?: string;
  createdAt: any;
  expiryDate?: string;
}

// Category interface
interface Category {
  id: string;
  name: string;
  type: 'subject' | 'stage';
  createdAt: any;
}

// Add this interface for edit modal state
interface EditUserState {
  id: string;
  name: string;
  email: string;
  role: Role;
  isOpen: boolean;
}

function App() {
  // State for authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isSignup, setIsSignup] = useState<boolean>(false);
  
  // State for users and lectures
  const [users, setUsers] = useState<User[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // UI states
  const [activeView, setActiveView] = useState<string>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupName, setSignupName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<Role>('student');
  const [newLectureTitle, setNewLectureTitle] = useState<string>('');
  const [newLectureSubject, setNewLectureSubject] = useState<string>('');
  const [newLectureStage, setNewLectureStage] = useState<string>('');
  const [newLectureUrl, setNewLectureUrl] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [newCategoryType, setNewCategoryType] = useState<'subject' | 'stage'>('subject');
  const [loginError, setLoginError] = useState<string>('');
  const [signupError, setSignupError] = useState<string>('');
  
  // Announcement form states
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState<string>('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState<string>('');
  const [newAnnouncementType, setNewAnnouncementType] = useState<'homework' | 'exam' | 'event' | 'other'>('homework');
  const [newAnnouncementExpiryDate, setNewAnnouncementExpiryDate] = useState<string>('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  
  // Add state for edit modal
  const [editUser, setEditUser] = useState<EditUserState>({
    id: '',
    name: '',
    email: '',
    role: 'student',
    isOpen: false
  });
  
  // Refs
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Add force sign out function
  const handleForceSignOut = async () => {
    if (currentUser?.role !== 'admin') return;
    
    if (!confirm('Are you sure you want to force all users to sign out?')) {
      return;
    }

    setIsLoading(true);
    
    try {
      const batch = writeBatch(db);
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const forceSignOutTime = Date.now();
      
      usersSnapshot.docs.forEach((userDoc) => {
        batch.update(doc(db, 'users', userDoc.id), {
          lastSignOut: forceSignOutTime
        });
      });
      
      await batch.commit();
      alert('All users have been signed out successfully');
    } catch (error) {
      console.error('Error forcing sign out:', error);
      alert('Error forcing sign out');
    } finally {
      setIsLoading(false);
    }
  };

  // Modify auth state listener to check for force sign out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get user data from Firestore
          const userDoc = await getDocs(
            query(collection(db, 'users'), where('email', '==', user.email))
          );
          
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data() as User;
            userData.id = userDoc.docs[0].id;
            
            // Check if user was force signed out
            const lastSignOut = userData.lastSignOut || 0;
            const lastSignIn = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : Infinity;
            
            if (lastSignOut > lastSignIn) {
              await signOut(auth);
              setIsAuthenticated(false);
              setCurrentUser(null);
              setActiveView('login');
              alert('You have been signed out by an administrator. Please sign in again.');
              return;
            }
            
            // Initialize missing fields if they don't exist
            const userRef = doc(db, 'users', userData.id);
            const updates: Partial<User> = {};
            
            if (!userData.favorites) {
              updates.favorites = [];
            }
            if (!userData.completedLectures) {
              updates.completedLectures = [];
            }
            if (!userData.unreadAnnouncements) {
              updates.unreadAnnouncements = [];
            }
            
            // Only update if there are missing fields
            if (Object.keys(updates).length > 0) {
              await updateDoc(userRef, updates);
              Object.assign(userData, updates);
            }
            
            setCurrentUser(userData);
            setIsAuthenticated(true);
            
            // Set appropriate view based on user role
            if (userData.role === 'admin') {
              setActiveView('users');
            } else {
              setActiveView('lectures');
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          await signOut(auth);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setActiveView('login');
      }
      
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Subscribe to categories collection
  useEffect(() => {
    if (isAuthenticated) {
      const categoriesQuery = query(
        collection(db, 'categories'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(categoriesQuery, (snapshot) => {
        const categoriesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        
        setCategories(categoriesList);
      });
      
      return () => unsubscribe();
    }
  }, [isAuthenticated]);
  
  // Subscribe to users collection
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'admin') {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        
        setUsers(usersList);
      });
      
      return () => unsubscribe();
    }
  }, [isAuthenticated, currentUser]);
  
  // Subscribe to announcements collection
  useEffect(() => {
    if (isAuthenticated) {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
        const announcementsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Announcement[];
        
        setAnnouncements(announcementsList);
        
        // Calculate unread announcements
        if (currentUser) {
          const unreadAnnouncements = currentUser.unreadAnnouncements || [];
          const count = announcementsList.filter(announcement => 
            !unreadAnnouncements.includes(announcement.id)
          ).length;
          setUnreadCount(count);
        }
      });
      
      return () => unsubscribe();
    }
  }, [isAuthenticated, currentUser]);
  
  // Subscribe to lectures collection
  useEffect(() => {
    if (isAuthenticated) {
      const lecturesQuery = query(
        collection(db, 'lectures'),
        orderBy('uploadDate', 'desc')
      );
      
      const unsubscribe = onSnapshot(lecturesQuery, (snapshot) => {
        const lecturesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Lecture[];
        
        setLectures(lecturesList);
        setFilteredLectures(lecturesList);
      });
      
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Filter lectures when search term or filter category changes
  useEffect(() => {
    let filtered = [...lectures];
    
    if (searchTerm) {
      filtered = filtered.filter(lecture => 
        lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterSubject !== 'all') {
      filtered = filtered.filter(lecture => 
        lecture.subject.toLowerCase() === filterSubject.toLowerCase()
      );
    }
    
    if (filterStage !== 'all') {
      filtered = filtered.filter(lecture => 
        lecture.stage.toLowerCase() === filterStage.toLowerCase()
      );
    }
    
    setFilteredLectures(filtered);
  }, [searchTerm, filterSubject, filterStage, lectures]);

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setIsLoading(true);
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );
      
      // Add user to Firestore with favorites and completedLectures arrays
      const newUser: Omit<User, 'id' | 'password'> = {
        email: signupEmail,
        name: signupName,
        role: 'student',
        createdAt: serverTimestamp(),
        favorites: [],
        completedLectures: []
      };
      
      await addDoc(collection(db, 'users'), newUser);
      
      // Reset form
      setSignupEmail('');
      setSignupPassword('');
      setSignupName('');
      setIsSignup(false);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setSignupError('Email is already registered');
      } else if (error.code === 'auth/weak-password') {
        setSignupError('Password should be at least 6 characters');
      } else {
        setSignupError('An error occurred during signup');
      }
      
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    try {
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      // Auth state listener will handle the rest
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/invalid-credential') {
        setLoginError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setLoginError('Too many failed login attempts. Please try again later.');
      } else {
        setLoginError('An error occurred during login');
      }
      
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Auth state listener will handle the rest
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add new announcement (admin and teacher only)
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) return;
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create announcement in Firestore with creator name
      const newAnnouncement = {
        title: newAnnouncementTitle.trim(),
        content: newAnnouncementContent.trim(),
        type: newAnnouncementType,
        createdBy: currentUser.id,
        creatorName: currentUser.name, // Store creator name directly
        createdAt: serverTimestamp(),
        expiryDate: newAnnouncementExpiryDate || null
      };
      
      await addDoc(collection(db, 'announcements'), newAnnouncement);
      
      // Reset form
      setNewAnnouncementTitle('');
      setNewAnnouncementContent('');
      setNewAnnouncementType('homework');
      setNewAnnouncementExpiryDate('');
      
      alert('Announcement created successfully!');
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Error creating announcement');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete announcement (admin and creator only)
  const handleDeleteAnnouncement = async (announcementId: string, createdBy: string) => {
    // Check if user has permission to delete
    if (currentUser?.role !== 'admin' && currentUser?.id !== createdBy) {
      alert('You do not have permission to delete this announcement');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'announcements', announcementId));
      
      alert('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mark announcement as read
  const markAnnouncementAsRead = async (announcementId: string) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.id);
      const unreadAnnouncements = currentUser.unreadAnnouncements || [];
      
      // If already read, do nothing
      if (unreadAnnouncements.includes(announcementId)) return;
      
      // Update local state
      const updatedUser = {
        ...currentUser,
        unreadAnnouncements: [...unreadAnnouncements, announcementId]
      };
      setCurrentUser(updatedUser);
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update Firestore
      await updateDoc(userRef, {
        unreadAnnouncements: updatedUser.unreadAnnouncements
      });
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  // Add new user (admin only)
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newUserEmail, 
        newUserPassword
      );
      
      // Add user to Firestore with favorites and completedLectures arrays
      const newUser: Omit<User, 'id' | 'password'> & { uid: string } = {
        email: newUserEmail,
        role: newUserRole,
        name: newUserName,
        createdAt: serverTimestamp(),
        uid: userCredential.user.uid,
        favorites: [],
        completedLectures: []
      };
      
      await addDoc(collection(db, 'users'), newUser);
      
      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('student');
    } catch (error: any) {
      console.error('Error adding user:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        alert('Email is already in use');
      } else {
        alert('Error creating user: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user edit
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateDoc(doc(db, 'users', editUser.id), {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role
      });

      setEditUser({ id: '', name: '', email: '', role: 'student', isOpen: false });
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user (admin only)
  const handleDeleteUser = async (userId: string) => {
    // Prevent admin from deleting their own account
    if (currentUser && currentUser.id === userId) {
      alert('You cannot delete your own account!');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Note: Deleting from Firebase Auth requires admin SDK
      // which can't be used in client-side code
      // In a real app, you would use a Cloud Function for this
      
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new category (admin only)
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    setIsLoading(true);
    
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategory.trim(),
        type: newCategoryType,
        createdAt: serverTimestamp()
      });
      
      setNewCategory('');
      alert('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete category (admin only)
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      alert('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload new lecture (teacher only)
  const handleUploadLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLectureUrl || !currentUser) return;
    
    setIsLoading(true);
    
    try {
      // Create lecture document in Firestore
      const newLecture = {
        title: newLectureTitle,
        subject: newLectureSubject,
        stage: newLectureStage,
        pdfUrl: newLectureUrl,
        uploadedBy: currentUser.id,
        uploadDate: new Date().toISOString().split('T')[0]
      };
      
      // Add lecture to Firestore
      await addDoc(collection(db, 'lectures'), newLecture);
      
      // Reset form
      setNewLectureTitle('');
      setNewLectureSubject('');
      setNewLectureStage('');
      setNewLectureUrl('');
      
      alert('Lecture uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading lecture:', error);
      alert('Error uploading lecture: ' + (error.message || 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // Delete lecture (teacher and admin only)
  const handleDeleteLecture = async (lecture: Lecture) => {
    // Check if user has permission to delete
    if (currentUser?.role !== 'admin' && currentUser?.id !== lecture.uploadedBy) {
      alert('You do not have permission to delete this lecture');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this lecture?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'lectures', lecture.id));
      
      alert('Lecture deleted successfully');
    } catch (error) {
      console.error('Error deleting lecture:', error);
      alert('Error deleting lecture');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (lectureId: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.id);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Initialize favorites array if it doesn't exist
      const favorites = userData?.favorites || [];

      // Update local state immediately
      const updatedUser = {
        ...currentUser,
        favorites: favorites.includes(lectureId)
          ? favorites.filter((id: string) => id !== lectureId)
          : [...favorites, lectureId]
      };
      setCurrentUser(updatedUser);

      // Update Firestore
      await updateDoc(userRef, {
        favorites: updatedUser.favorites
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert local state if the update fails
      const userDoc = await getDoc(doc(db, 'users', currentUser.id));
      const userData = userDoc.data();
      setCurrentUser(prev => ({ ...prev!, favorites: userData?.favorites || [] }));
    }
  };

  // Toggle lecture completion
  const toggleLectureCompletion = async (lectureId: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.id);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // Initialize completedLectures array if it doesn't exist
      const completedLectures = userData?.completedLectures || [];

      // Update local state immediately
      const updatedUser = {
        ...currentUser,
        completedLectures: completedLectures.includes(lectureId)
          ? completedLectures.filter((id: string) => id !== lectureId)
          : [...completedLectures, lectureId]
      };
      setCurrentUser(updatedUser);

      // Update Firestore
      await updateDoc(userRef, {
        completedLectures: updatedUser.completedLectures
      });
    } catch (error) {
      console.error('Error toggling lecture completion:', error);
      // Revert local state if the update fails
      const userDoc = await getDoc(doc(db, 'users', currentUser.id));
      const userData = userDoc.data();
      setCurrentUser(prev => ({ ...prev!, completedLectures: userData?.completedLectures || [] }));
    }
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get subjects and stages from categories
  const subjects = categories.filter(cat => cat.type === 'subject');
  const stages = categories.filter(cat => cat.type === 'stage');

  // Render login form
  const renderLoginForm = () => (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-logo">
          <div className="auth-logo-circle">
            <FileText size={32} color="white" />
          </div>
        </div>
        <h2>Lecture Management System</h2>
        <p>{isSignup ? 'Create your account' : 'Login to your account'}</p>
        
        {isSignup ? (
          <form onSubmit={handleSignup}>
            {signupError && (
              <div className="error-message">
                {signupError}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="signupName">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="signupName"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signupEmail">Email</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="email"
                  id="signupEmail"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="signupPassword">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="signupPassword"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Create a password"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <LogIn size={18} /> Sign Up
                </>
              )}
            </button>
            <p className="text-center mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setSignupError('');
                }}
                className="text-primary-color hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="input-field pl-10"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
            <p className="text-center mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setLoginError('');
                }}
                className="text-primary-color hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );

  // Render user management (admin only)
  const renderUserManagement = () => (
    <div className="content-container">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title">User Management</h2>
        <button 
          onClick={handleForceSignOut}
          className="btn-danger flex items-center gap-2"
          disabled={isLoading}
        >
          <UserX size={18} />
          Force Sign Out All Users
        </button>
      </div>
      
      <div className="card">
        <h3 className="card-title">Add New User</h3>
        <form onSubmit={handleAddUser}>
          <div className="form-group">
            <label htmlFor="newUserName">Name</label>
            <input
              type="text"
              id="newUserName"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newUserEmail">Email</label>
            <input
              type="email"
              id="newUserEmail"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newUserPassword">Password</label>
            <input
              type="password"
              id="newUserPassword"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="newUserRole">Role</label>
            <select
              id="newUserRole"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as Role)}
              required
              className="input-field"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Add User'
            )}
          </button>
        </form>
      </div>
      
      <div className="card mt-6">
        <h3 className="card-title">Categories Management</h3>
        <form onSubmit={handleAddCategory} className="mb-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category"
                className="input-field"
                required
              />
            </div>
            <select
              value={newCategoryType}
              onChange={(e) => setNewCategoryType(e.target.value as 'subject' | 'stage')}
              className="input-field"
              style={{ width: '150px' }}
            >
              <option value="subject">Subject</option>
              <option value="stage">Stage</option>
            </select>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              <Plus size={18} />
              Add
            </button>
          </div>
        </form>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-lg font-semibold mb-3">Subjects</h4>
            {subjects.map((category) => (
              <div 
                 
                key={category.id}
                className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-2"
              >
                <span>{category.name}</span>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="btn-danger"
                  disabled={isLoading}
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3">Stages</h4>
            {stages.map((category) => (
              <div 
                key={category.id}
                className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-2"
              >
                <span>{category.name}</span>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="btn-danger"
                  disabled={isLoading}
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card mt-6">
        <h3 className="card-title">User List</h3>
        <div className="user-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar-lg">
                  <User size={32} />
                </div>
                <span className={`role-badge role-${user.role}`}>{user.role}</span>
              </div>
              <div className="user-card-body">
                <h4 className="user-card-name">{user.name}</h4>
                <p className="user-card-email">{user.email}</p>
              </div>
              <div className="user-card-footer">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditUser({
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      role: user.role,
                      isOpen: true
                    })}
                    className="btn-secondary flex-1"
                    disabled={currentUser?.id === user.id}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn-danger"
                    disabled={currentUser?.id === user.id || isLoading}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label htmlFor="editName">Name</label>
                <input
                  type="text"
                  id="editName"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editEmail">Email</label>
                <input
                  type="email"
                  id="editEmail"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editRole">Role</label>
                <select
                  id="editRole"
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as Role })}
                  required
                  className="input-field"
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setEditUser({ id: '', name: '', email: '', role: 'student', isOpen: false })}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Render lecture upload form (teacher only)
  const renderLectureUpload = () => (
    <div className="card">
      <h3 className="card-title">Add New Lecture</h3>
      <form onSubmit={handleUploadLecture}>
        <div className="form-group">
          <label htmlFor="lectureTitle">Title</label>
          <input
            type="text"
            id="lectureTitle"
            value={newLectureTitle}
            onChange={(e) => setNewLectureTitle(e.target.value)}
            required
            className="input-field"
            placeholder="Enter lecture title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="lectureSubject">Subject</label>
          <select
            id="lectureSubject"
            value={newLectureSubject}
            onChange={(e) => setNewLectureSubject(e.target.value)}
            required
            className="input-field"
          >
            <option value="">Select a subject</option>
            {subjects.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="lectureStage">Stage</label>
          <select
            id="lectureStage"
            value={newLectureStage}
            onChange={(e) => setNewLectureStage(e.target.value)}
            required
            className="input-field"
          >
            <option value="">Select a stage</option>
            {stages.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="lectureUrl">PDF URL</label>
          <input
            type="url"
            id="lectureUrl"
            value={newLectureUrl}
            onChange={(e) => setNewLectureUrl(e.target.value)}
            required
            className="input-field"
            placeholder="Enter PDF URL"
          />
        </div>
        <button 
          type="submit" 
          className="btn-primary"
          disabled={!newLectureUrl || isLoading}
        >
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <Upload size={18} /> Add Lecture
            </>
          )}
        </button>
      </form>
    </div>
  );

  // Render lectures list
  const renderLecturesList = () => {
    const displayedLectures = showFavorites && currentUser?.role === 'student'
      ? filteredLectures.filter(lecture => currentUser?.favorites?.includes(lecture.id))
      : filteredLectures;

    return (
      <div className="content-container">
        <h2 className="section-title">Lectures</h2>
        
        {currentUser?.role === 'teacher' && renderLectureUpload()}
        
        <div className="search-filter-container">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <Filter size={20} className="filter-icon" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Subjects</option>
              {subjects.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-container">
            <Filter size={20} className="filter-icon" />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Stages</option>
              {stages.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {currentUser?.role === 'student' && (
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={classNames('btn-secondary', {
                'btn-active': showFavorites
              })}
            >
              {showFavorites ? <HeartOff size={20} /> : <Heart size={20} />}
              {showFavorites ? 'Show All' : 'Show Favorites'}
            </button>
          )}
        </div>
        
        <div className="card mt-6">
          <h3 className="card-title">
            {showFavorites ? 'Favorite Lectures' : 'Available Lectures'}
          </h3>
          <div className="lecture-grid">
            {displayedLectures.length > 0 ? (
              displayedLectures.map((lecture) => (
                <div 
                  key={lecture.id} 
                  className="lecture-card"
                >
                  <div className="lecture-card-header">
                    <h4 className="lecture-title">{lecture.title}</h4>
                    <div className="lecture-tags">
                      <span className="lecture-tag">{lecture.subject}</span>
                      <span className="lecture-tag">{lecture.stage}</span>
                    </div>
                  </div>
                  <div className="lecture-card-body">
                    <span className="lecture-date">Uploaded: {lecture.uploadDate}</span>
                  </div>
                  <div className="lecture-card-footer">
                    <div className="flex gap-2">
                      <a
                        href={lecture.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary flex-1"
                      >
                        View PDF
                      </a>
                      {currentUser?.role === 'student' && (
                        <>
                          <button
                            onClick={() => toggleFavorite(lecture.id)}
                            className={classNames('btn-icon', {
                              'btn-favorite': currentUser?.favorites?.includes(lecture.id)
                            })}
                          >
                            <Heart 
                              size={20} 
                              fill={currentUser?.favorites?.includes(lecture.id) ? "#ef4444" : "none"}
                            />
                          </button>
                          <button
                            onClick={() => toggleLectureCompletion(lecture.id)}
                            className={classNames('btn-icon', {
                              'btn-completed': currentUser?.completedLectures?.includes(lecture.id)
                            })}
                          >
                            <CheckCircle 
                              size={20} 
                              fill={currentUser?.completedLectures?.includes(lecture.id) ? "#10b981" : "none"}
                            />
                          </button>
                        </>
                      )}
                      {(currentUser?.role === 'admin' || currentUser?.id === lecture.uploadedBy) && (
                        <button
                          onClick={() => handleDeleteLecture(lecture)}
                          className="btn-danger"
                          disabled={isLoading}
                        >
                          <Trash size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No lectures found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render About Us page
  const renderAboutUs = () => (
    <div className="content-container">
      <h2 className="section-title">About Us</h2>
      
      <div className="card about-card">
        <div className="about-header">
          <img 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
            alt="University Campus" 
            className="about-banner"
          />
        </div>
        
        <div className="about-body">
          <h3 className="about-title">
            University Lecture Management System
          </h3>
          
          <p className="about-description">
            Welcome to our University Lecture Management System, a sophisticated digital platform designed to revolutionize how educational content is organized and accessed within our university. This system serves as a central hub for managing academic lectures across different subjects and stages, ensuring seamless access to educational materials for both educators and students.
          </p>
          
          <h4 className="about-subtitle">
            Core Features:
          </h4>
          
          <ul className="about-features">
            <li>Multi-stage lecture organization with customizable subject categories</li>
            <li>Role-based access control for administrators, teachers, and students</li>
            <li>Advanced search and filtering capabilities by subject and stage</li>
            <li>Secure PDF lecture storage and viewing</li>
            <li>User-friendly interface for lecture uploads and management</li>
            <li>Real-time updates</li>
            <li>Comprehensive user management system</li>
          </ul>
          
          <div className="about-creator">
            <div className="creator-avatar">
              <User size={32} />
            </div>
            <div className="creator-info">
              <p className="creator-name">Ahmed Shukor</p>
              <p className="creator-title">Department of Computer Engineering</p>
            </div>
          </div>
          
          <p className="about-copyright">
            © 2025 University of Technology - Lecture Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );

  // Render announcements section
  const renderAnnouncements = () => (
    <div className="content-container">
      <h2 className="section-title">Announcements</h2>
      
      {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
        <div className="card">
          <h3 className="card-title">Create New Announcement</h3>
          
          <form onSubmit={handleAddAnnouncement}>
            <div className="form-group">
              <label htmlFor="announcementTitle">Title</label>
              <input
                type="text"
                id="announcementTitle"
                className="input-field"
                value={newAnnouncementTitle}
                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="announcementContent">Content</label>
              <textarea
                id="announcementContent"
                className="input-field"
                value={newAnnouncementContent}
                onChange={(e) => setNewAnnouncementContent(e.target.value)}
                rows={4}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="announcementType">Type</label>
              <select
                id="announcementType"
                className="input-field"
                value={newAnnouncementType}
                onChange={(e) => setNewAnnouncementType(e.target.value as 'homework' | 'exam' | 'event' | 'other')}
              >
                <option value="homework">Homework</option>
                <option value="exam">Exam</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="announcementExpiry">Expiry Date (Optional)</label>
              <input
                type="date"
                id="announcementExpiry"
                className="input-field"
                value={newAnnouncementExpiryDate}
                onChange={(e) => setNewAnnouncementExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <Plus size={18} /> Create Announcement
                </>
              )}
            </button>
          </form>
        </div>
      )}
      
      <div className="announcement-grid">
        {announcements.length > 0 ? (
          announcements.map((announcement) => {
            const isUnread = currentUser?.unreadAnnouncements?.includes(announcement.id) === false;
            const creator = users.find(user => user.id === announcement.createdBy);
            
            return (
              <div 
                key={announcement.id} 
                className={`announcement-card ${isUnread ? 'announcement-unread' : ''}`}
                onClick={() => markAnnouncementAsRead(announcement.id)}
              >
                <div className="announcement-card-header">
                  <h3 className="announcement-title">{announcement.title}</h3>
                  <span className={`announcement-type announcement-type-${announcement.type}`}>
                    {announcement.type}
                  </span>
                </div>
                
                <div className="announcement-card-body">
                  <p className="announcement-content">{announcement.content}</p>
                </div>
                
                <div className="announcement-card-footer">
                  <div className="announcement-meta">
                    <span className="announcement-creator">By: {announcement.creatorName || creator?.name || 'Unknown'}</span>
                    <span className="announcement-date">
                      {announcement.createdAt?.toDate ? 
                        new Date(announcement.createdAt.toDate()).toLocaleDateString() : 
                        'Just now'}
                    </span>
                  </div>
                  
                  {(currentUser?.role === 'admin' || currentUser?.id === announcement.createdBy) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnnouncement(announcement.id, announcement.createdBy);
                      }}
                      className="btn-danger"
                      disabled={isLoading}
                    >
                      <Trash size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            <p>No announcements available.</p>
          </div>
        )}
      </div>
    </div>
  );
  
  // Render navigation
  const renderNavigation = () => (
    <>
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1>LMS</h1>
        
        <div className="notification-container">
          <button 
            className="notification-button" 
            onClick={toggleNotifications}
          >
            <div className="notification-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button 
                  className="notification-close" 
                  onClick={toggleNotifications}
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="notification-list">
                {announcements.length > 0 ? (
                  announcements.slice(0, 5).map(announcement => {
                    const isUnread = currentUser?.unreadAnnouncements?.includes(announcement.id) === false;
                    return (
                      <div 
                        key={announcement.id} 
                        className={`notification-item ${isUnread ? 'notification-unread' : ''}`}
                        onClick={() => {
                          markAnnouncementAsRead(announcement.id);
                          setActiveView('announcements');
                          setShowNotifications(false);
                        }}
                      >
                        <div className="notification-content">
                          <h4>{announcement.title}</h4>
                          <p>{announcement.content.substring(0, 50)}...</p>
                          <small>By: {announcement.creatorName || 'Unknown'}</small>
                        </div>
                        <span className={`notification-type notification-type-${announcement.type}`}>
                          {announcement.type}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="notification-empty">
                    <p>No notifications</p>
                  </div>
                )}
              </div>
              
              <div className="notification-footer">
                <button 
                  className="btn-secondary w-full"
                  onClick={() => {
                    setActiveView('announcements');
                    setShowNotifications(false);
                  }}
                >
                  View All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {(isSidebarOpen || window.innerWidth > 768) && (
        <nav 
          className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}
          ref={sidebarRef}
        >
          <div className="sidebar-header">
            <div className="sidebar-title">
              <h1>LMS</h1>
              <p>Lecture Management</p>
            </div>
            <button className="close-sidebar" onClick={toggleSidebar}>
              <X size={24} />
            </button>
          </div>
          
          <div className="user-profile">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div className="user-details">
              <p>{currentUser?.name}</p>
              <span className={`role-badge role-${currentUser?.role}`}>{currentUser?.role}</span>
            </div>
          </div>
          
          <ul className="nav-links">
            <li>
              <button
                className={activeView === 'lectures' ? 'active' : ''}
                onClick={() => {
                  setActiveView('lectures');
                  setIsSidebarOpen(false);
                }}
              >
                <FileText size={20} /> Lectures
              </button>
            </li>
            
            <li>
              <button
                className={activeView === 'announcements' ? 'active' : ''}
                onClick={() => {
                  setActiveView('announcements');
                  setIsSidebarOpen(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                Announcements
                {unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount}</span>
                )}
              </button>
            </li>
            
            {currentUser?.role === 'admin' && (
              <li>
                <button
                  className={activeView === 'users' ? 'active' : ''}
                  onClick={() => {
                    setActiveView('users');
                    setIsSidebarOpen(false);
                  }}
                >
                  <Users size={20} /> Users
                </button>
              </li>
            )}
            
            <li>
              <button
                className={activeView === 'about' ? 'active' : ''}
                onClick={() => {
                  setActiveView('about');
                  setIsSidebarOpen(false);
                }}
              >
                <Info size={20} /> About Us
              </button>
            </li>
            
            <li className="nav-footer">
              <button 
                onClick={handleLogout} 
                className="btn-logout"
              >
                <LogOut size={20} /> Logout
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loading-spinner" style={{ borderColor: 'rgba(79, 70, 229, 0.3)', borderTopColor: '#4f46e5', width: '3rem', height: '3rem' }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="app">
      {!isAuthenticated ? (
        renderLoginForm()
      ) : (
        <div className="dashboard">
          {renderNavigation()}
          <main className="main-content">
            {activeView === 'users' && renderUserManagement()}
            {activeView === 'lectures' && renderLecturesList()}
            {activeView === 'announcements' && renderAnnouncements()}
            {activeView === 'about' && renderAboutUs()}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;