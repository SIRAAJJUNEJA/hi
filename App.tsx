
import React, { useState, useEffect } from 'react';
import { SessionCard } from './components/SessionCard';
import { Concierge } from './components/Concierge';
import { INITIAL_SESSIONS } from './constants';
import { Session, Review, UserRecord, FellowshipApplication, FoundingCohortApplication } from './types';
import { 
  loginWithEmail, 
  signupWithEmail, 
  loginWithGoogle, 
  getUserData, 
  auth,
  submitFellowshipApplication,
  submitFoundingApplication,
  submitReview,
  logActivity,
  getFellowshipApplications,
  getFoundingApplications,
  getReviews,
  getActivityLogs,
  updateApplicationStatus
} from './services/backend';
import { signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';

const ADMIN_EMAIL = 'siraajjuneja1@gmail.com'.toLowerCase();

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1A2238]/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative bg-white w-full ${sizeClasses[size]} rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale max-h-[90vh] flex flex-col`}>
        <div className="p-8 pb-4 flex justify-between items-center sticky top-0 bg-white z-10 border-b border-gray-50">
          <h2 className="text-2xl font-playfair font-bold text-[#1A2238]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-8 pt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [modalType, setModalType] = useState<'auth' | 'apply' | 'founding' | 'admin' | 'session' | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [userList, setUserList] = useState<UserRecord[]>([]);
  const [applications, setApplications] = useState<FellowshipApplication[]>([]);
  const [foundingApplications, setFoundingApplications] = useState<FoundingCohortApplication[]>([]);
  const [activeView, setActiveView] = useState<'landing' | 'community' | 'sessions' | 'fellowship'>('landing');
  const [adminTab, setAdminTab] = useState<'insights' | 'scholars' | 'fellowship' | 'founding' | 'curriculum'>('insights');
  const [linkingSessionId, setLinkingSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const triggerSuccess = () => {
    setShowSuccess(true);
    setModalType(null);
    setActiveView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setShowSuccess(false);
    }, 4000);
  };

  // Buffer States
  const [editUserBuffer, setEditUserBuffer] = useState<Partial<UserRecord>>({});
  const [editSessionBuffer, setEditSessionBuffer] = useState<Partial<Session>>({});

  // Review & Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [newSession, setNewSession] = useState<Partial<Session>>({
    title: '',
    category: 'Economics',
    timeLabel: '',
    mentorName: '',
    mentorInst: '',
    description: '',
    longDescription: '',
    zoomLink: '',
    status: 'UPCOMING'
  });

  const [logoClicks, setLogoClicks] = useState(0);
  const [recentActivity, setRecentActivity] = useState<{id: string, type: string, user: string, time: string}[]>([]);

  useEffect(() => {
    // Load data from Firestore
    const loadData = async () => {
      try {
        const [apps, founding, revs, logs] = await Promise.all([
          getFellowshipApplications(),
          getFoundingApplications(),
          getReviews(),
          getActivityLogs()
        ]);
        setApplications(apps);
        setFoundingApplications(founding);
        setReviews(revs);
        setRecentActivity(logs);
      } catch (error) {
        console.error("Error loading data from Firestore:", error);
        // Fallback to localStorage if Firestore fails
        const savedActivity = localStorage.getItem('gyaan_activity');
        if (savedActivity) setRecentActivity(JSON.parse(savedActivity));
        
        const savedApps = localStorage.getItem('gyaan_applications');
        if (savedApps) setApplications(JSON.parse(savedApps));

        const savedFounding = localStorage.getItem('gyaan_founding_applications');
        if (savedFounding) setFoundingApplications(JSON.parse(savedFounding));
      }
    };

    loadData();
    
    const savedUsers = localStorage.getItem('gyaan_users');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      setUserList(parsed.map((u: any) => ({
        ...u,
        uid: u.uid || Math.random().toString(36).substr(2, 9),
        role: u.role || (u.email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'member')
      })));
    }
    
    const savedApps = localStorage.getItem('gyaan_applications');
    if (savedApps) setApplications(JSON.parse(savedApps));

    const savedFounding = localStorage.getItem('gyaan_founding_applications');
    if (savedFounding) setFoundingApplications(JSON.parse(savedFounding));

    const activeSession = localStorage.getItem('gyaan_active_user');
    if (activeSession) {
      const user = JSON.parse(activeSession);
      const userWithAdmin: UserRecord = { 
        ...user, 
        uid: user.uid || Math.random().toString(36).substr(2, 9),
        role: user.role || (user.email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'member'),
        isAdmin: user.email.toLowerCase() === ADMIN_EMAIL 
      };
      setCurrentUser(userWithAdmin);
    }

    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid);
        if (userData) {
          const userWithAdmin = { ...userData, isAdmin: userData.email.toLowerCase() === ADMIN_EMAIL };
          setCurrentUser(userWithAdmin);
          localStorage.setItem('gyaan_active_user', JSON.stringify(userWithAdmin));
        }
      }
    });

    // Handle Redirect Result
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const userData = await getUserData(result.user.uid);
        if (userData) {
          const userWithAdmin = { ...userData, isAdmin: userData.email.toLowerCase() === ADMIN_EMAIL };
          setCurrentUser(userWithAdmin);
          localStorage.setItem('gyaan_active_user', JSON.stringify(userWithAdmin));
        }
      }
    }).catch(err => console.error("Redirect error:", err));

    // Handle Secret URL Access - REMOVED due to 403 issues, moving to Secret Click
    
    const savedReviews = localStorage.getItem('gyaan_reviews');
    if (savedReviews) setReviews(JSON.parse(savedReviews));

    const savedSessions = localStorage.getItem('gyaan_sessions_registry');
    if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
    } else {
        localStorage.setItem('gyaan_sessions_registry', JSON.stringify(INITIAL_SESSIONS));
    }
  }, []);

  const categories = ['All', 'Economics', 'Engineering', 'Career', 'Design', 'Science'];
  const filteredSessions = filter === 'All' ? sessions : sessions.filter(s => s.category === filter);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setActiveView('landing');
    window.scrollTo({top: 0, behavior: 'smooth'});
    
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    
    // Reset clicks if not completed within 3 seconds
    if (newClicks === 1) {
      setTimeout(() => setLogoClicks(0), 3000);
    }

    if (newClicks >= 5) {
      const adminUser: UserRecord = {
        uid: 'admin-vault-id',
        email: ADMIN_EMAIL,
        name: 'Siraaj (Admin)',
        date: new Date().toLocaleDateString(),
        role: 'admin',
        isAdmin: true
      };
      setCurrentUser(adminUser);
      localStorage.setItem('gyaan_active_user', JSON.stringify(adminUser));
      alert("Vault Unlocked: Admin Access Granted.");
      setLogoClicks(0);
    }
  };

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.target as any).name.value;
    const email = (e.target as any).email.value;
    
    const newUser: UserRecord = {
      uid: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name: name,
      date: new Date().toLocaleDateString(),
      role: email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'member',
      isAdmin: email.toLowerCase() === ADMIN_EMAIL,
      lastLogin: Date.now()
    };

    // Update local user list
    const updatedList = [...userList, newUser];
    setUserList(updatedList);
    localStorage.setItem('gyaan_users', JSON.stringify(updatedList));
    
    // Set current user
    setCurrentUser(newUser);
    localStorage.setItem('gyaan_active_user', JSON.stringify(newUser));

    // Save user to Firestore
    const { setDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./services/backend');
    await setDoc(doc(db, "users", newUser.uid), newUser);

    // Log Activity
    const activity = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'JOIN',
      user: name,
      time: new Date().toLocaleTimeString()
    };
    const updatedActivity = [activity, ...recentActivity].slice(0, 10);
    setRecentActivity(updatedActivity);
    localStorage.setItem('gyaan_activity', JSON.stringify(updatedActivity));
    
    // Save to Firestore
    logActivity(activity);

    triggerSuccess();
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      // Redirect happens here, so no need for further logic in this function
    } catch (error: any) {
      console.error("Google Auth error:", error);
      alert(error.message || "Google Authentication failed.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('gyaan_active_user');
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedSession) return;

    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      sessionId: selectedSession.id,
      userName: currentUser.name,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('gyaan_reviews', JSON.stringify(updatedReviews));
    
    // Save to Firestore
    submitReview(newReview);

    setReviewComment('');
    setReviewRating(5);
    triggerSuccess();
  };

  const adminHandleApplication = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    const updatedApps = applications.map(app => {
      if (app.id === id) {
        if (action === 'APPROVED') {
          const updatedUsers = userList.map(u => u.email === app.email ? { ...u, isFellow: true } : u);
          setUserList(updatedUsers);
          localStorage.setItem('gyaan_users', JSON.stringify(updatedUsers));
        }
        return { ...app, status: action };
      }
      return app;
    });
    setApplications(updatedApps);
    localStorage.setItem('gyaan_applications', JSON.stringify(updatedApps));
    
    // Update in Firestore
    await updateApplicationStatus("fellowship_applications", id, action);
  };

  const adminHandleFoundingApplication = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    const updatedApps = foundingApplications.map(app => {
      if (app.id === id) {
        return { ...app, status: action };
      }
      return app;
    });
    setFoundingApplications(updatedApps);
    localStorage.setItem('gyaan_founding_applications', JSON.stringify(updatedApps));
    
    // Update in Firestore
    await updateApplicationStatus("founding_applications", id, action);
  };

  const handleFellowshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newApp: FellowshipApplication = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      education: formData.get('education') as string,
      expertise: formData.get('expertise') as string,
      narrative: formData.get('narrative') as string,
      linkedinUrl: formData.get('linkedinUrl') as string || undefined,
      status: 'PENDING',
      submittedAt: new Date().toLocaleDateString()
    };

    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    localStorage.setItem('gyaan_applications', JSON.stringify(updatedApps));
    
    // Save to Firestore
    submitFellowshipApplication(newApp);

    triggerSuccess();
  };

  const handleFoundingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newApp: FoundingCohortApplication = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      education: formData.get('education') as string,
      statement: formData.get('statement') as string,
      linkedinUrl: formData.get('linkedinUrl') as string || undefined,
      status: 'PENDING',
      submittedAt: new Date().toLocaleDateString()
    };

    const updatedApps = [newApp, ...foundingApplications];
    setFoundingApplications(updatedApps);
    localStorage.setItem('gyaan_founding_applications', JSON.stringify(updatedApps));
    
    // Save to Firestore
    submitFoundingApplication(newApp);

    triggerSuccess();
  };

  const handleAdminAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionToAdd: Session = {
      ...newSession as Session,
      id: Math.random().toString(36).substr(2, 9),
      avatarUrl: `https://picsum.photos/seed/${newSession.mentorName}/100/100`,
      mentorBio: 'Session created via administrator portal.',
      mentorTitle: 'Curriculum Mentor',
    };
    const updated = [sessionToAdd, ...sessions];
    setSessions(updated);
    localStorage.setItem('gyaan_sessions_registry', JSON.stringify(updated));
    setIsAddingNew(false);
    setNewSession({ title: '', category: 'Economics', timeLabel: '', mentorName: '', mentorInst: '', description: '', longDescription: '', zoomLink: '', status: 'UPCOMING' });
  };

  const handleAdminUpdateSession = (sessionId: string, updates: Partial<Session>) => {
    const updated = sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s);
    setSessions(updated);
    localStorage.setItem('gyaan_sessions_registry', JSON.stringify(updated));
    setEditingSessionId(null);
    setEditSessionBuffer({});
  };

  const handleAdminUpdateUser = (uid: string, updates: Partial<UserRecord>) => {
      const updated = userList.map(u => u.uid === uid ? { ...u, ...updates } : u);
      setUserList(updated);
      localStorage.setItem('gyaan_users', JSON.stringify(updated));
      setEditingUserId(null);
  };

  const handleAdminDeleteSession = (sessionId: string) => {
    if (!confirm("Confirm removal from curriculum?")) return;
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem('gyaan_sessions_registry', JSON.stringify(updated));
  };

  const handleToggleScholarLink = (sessionId: string, scholarEmail: string) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        const current = s.linkedScholarEmails || [];
        const isLinked = current.includes(scholarEmail);
        return { ...s, linkedScholarEmails: isLinked ? current.filter(e => e !== scholarEmail) : [...current, scholarEmail] };
      }
      return s;
    });
    setSessions(updated);
    localStorage.setItem('gyaan_sessions_registry', JSON.stringify(updated));
  };

  const getSessionReviews = (sessionId: string) => reviews.filter(r => r.sessionId === sessionId);

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FDFBF7]">
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-md z-40 border-b border-gray-50">
        <div className="text-2xl font-bold tracking-tighter font-playfair text-[#1A2238] cursor-pointer select-none" onClick={handleLogoClick}>GYAAN.ONE</div>
        <div className="hidden md:flex space-x-10 text-xs uppercase tracking-widest font-semibold text-gray-500">
          <button onClick={() => { setActiveView('landing'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`transition-all ${activeView === 'landing' ? 'text-[#1A2238] font-bold border-b-2 border-[#C5A059] pb-1' : 'hover:text-[#1A2238]'}`}>Home</button>
          <button onClick={() => { setActiveView('community'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`transition-all ${activeView === 'community' ? 'text-[#1A2238] font-bold border-b-2 border-[#C5A059] pb-1' : 'hover:text-[#1A2238]'}`}>Community</button>
          <button onClick={() => { setActiveView('sessions'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`transition-all ${activeView === 'sessions' ? 'text-[#1A2238] font-bold border-b-2 border-[#C5A059] pb-1' : 'hover:text-[#1A2238]'}`}>Sessions</button>
          <button onClick={() => { setActiveView('fellowship'); window.scrollTo({top:0, behavior:'smooth'}); }} className={`transition-all ${activeView === 'fellowship' ? 'text-[#1A2238] font-bold border-b-2 border-[#C5A059] pb-1' : 'hover:text-[#1A2238]'}`}>Fellowship</button>
          {(currentUser?.isAdmin || currentUser?.email?.toLowerCase() === ADMIN_EMAIL) && (
            <button onClick={() => setModalType('admin')} className="text-[#C5A059] font-bold bg-[#C5A059]/10 px-4 py-1.5 rounded-full hover:bg-[#C5A059]/20 transition">Admin Dashboard</button>
          )}
        </div>
        <div>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-gray-400">Hi, {currentUser.name}</span>
                {(currentUser.isAdmin || currentUser.email.toLowerCase() === ADMIN_EMAIL) && (
                  <span className="text-[8px] bg-[#C5A059]/10 text-[#C5A059] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">Administrator</span>
                )}
              </div>
              <button onClick={handleLogout} className="text-xs font-bold text-red-400 hover:text-red-600">Logout</button>
            </div>
          ) : (
            <button onClick={() => setModalType('auth')} className="bg-[#1A2238] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase hover:bg-[#7FB5B5] transition shadow-md active:scale-95">Join Community</button>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {activeView === 'landing' && (
          <>
            <section className="relative overflow-hidden hero-gradient pt-16 md:pt-24 pb-20 md:pb-32">
              <div className="max-w-6xl mx-auto px-6 text-center relative z-10 animate-scale">
                <div className="inline-block py-1 px-4 mb-6 rounded-full bg-[#7FB5B5]/10 border border-[#7FB5B5]/20">
                  <span className="text-[#7FB5B5] font-bold tracking-[0.2em] uppercase text-[10px]">
                    A Collective for Intellectual Growth
                  </span>
                </div>
                <h1 className="text-5xl md:text-8xl mt-4 mb-8 leading-tight font-playfair font-bold text-[#1A2238]">
                  Peer-led learning, <br className="hidden md:block" />
                  <span className="italic font-normal text-[#C5A059]">redefined.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                  A peer-led platform powered by students from India’s top IITs and IIMs.
                  <br />
                  Practical strategies, not textbook theory.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <button onClick={() => { setActiveView('sessions'); window.scrollTo({top:0, behavior:'smooth'}); }} className="bg-[#1A2238] text-white px-10 py-4 rounded-2xl font-bold text-sm tracking-widest uppercase hover:scale-105 transition shadow-xl active:scale-95">
                    Explore Masterclasses
                  </button>
                  <button onClick={() => setModalType('apply')} className="border border-[#1A2238] px-10 py-4 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-[#1A2238] hover:text-white transition text-[#1A2238] active:scale-95">
                    Apply to Fellowship
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-[#FDFBF7] py-24 border-y border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#C5A059]/5 to-transparent pointer-events-none" />
              <div className="max-w-6xl mx-auto px-6 relative z-10 animate-in">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-4xl md:text-6xl font-playfair font-bold text-[#1A2238] leading-tight mb-6">
                        Founding Cohort <br />
                        <span className="text-[#C5A059] relative">
                          2026
                          <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#C5A059]/20 rounded-full" />
                        </span>
                      </h2>
                      <div className="space-y-4 text-lg">
                        <p className="font-bold text-[#1A2238] leading-relaxed">
                          The first generation of serious students who will define the culture and standard of Gyaan.one.
                        </p>
                        <p className="text-gray-500 font-light leading-relaxed">
                          This is not open enrollment. Entry is selective and based on discipline, ambition, and long-term intent.
                        </p>
                        <p className="text-gray-500 font-light leading-relaxed">
                          Founding Members will be permanently recognized as the core builders of the platform.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {[
                        "Early access to all live sessions",
                        "Direct interaction with the core team",
                        "Official recognition as a Founding Member"
                      ].map((point, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-[#C5A059]/30 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-[#1A2238] transition-colors">{point}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setModalType('founding')}
                      className="group relative bg-[#1A2238] text-white px-12 py-5 rounded-2xl font-bold text-sm tracking-widest uppercase overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl"
                    >
                      <span className="relative z-10">Apply for Founding Cohort</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#C5A059] to-[#B48F48] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </button>
                  </div>

                  <div className="relative hidden md:block">
                    <div className="absolute -inset-4 bg-[#C5A059]/10 blur-3xl rounded-full animate-pulse" />
                    <div className="relative bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl transform hover:-translate-y-2 transition-transform duration-700">
                      <div className="space-y-8">
                        <div className="flex justify-between items-center">
                          <div className="w-12 h-12 rounded-2xl bg-[#1A2238]/5 flex items-center justify-center">
                            <div className="w-6 h-0.5 bg-[#C5A059]" />
                          </div>
                          <div className="px-4 py-1.5 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[10px] font-bold uppercase tracking-widest">
                            Class of 2026
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-[#C5A059] rounded-full" />
                          </div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Cohort Capacity: 33% Filled</p>
                        </div>
                        <div className="pt-4">
                          <p className="text-2xl font-playfair font-bold text-[#1A2238] mb-2">Selective Admission</p>
                          <p className="text-sm text-gray-400 font-light">Applications are reviewed by the founding council for alignment with core values.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === 'community' && (
          <div className="animate-in text-center py-32">
            <h2 className="text-4xl font-playfair font-bold text-[#1A2238]">Community Dialogue Hub</h2>
            <p className="text-gray-400 mt-4 font-light">Peer-to-peer discussion boards are initializing for current scholars.</p>
          </div>
        )}

        {activeView === 'sessions' && (
          <section className="bg-white py-24 md:py-32 animate-in">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div className="text-left">
                  <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-4 text-[#1A2238]">Active Dialogues</h2>
                  <p className="text-gray-400 text-lg font-light">Live learning environments curated for intellectual rigor.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${filter === cat ? 'bg-[#1A2238] text-white shadow-xl -translate-y-1' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 stagger-container">
                {filteredSessions.map(session => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onSelect={(s) => { setSelectedSession(s); setModalType('session'); }}
                    reviews={getSessionReviews(session.id)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {activeView === 'fellowship' && (
          <div className="animate-in max-w-4xl mx-auto px-6 py-24">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-playfair font-bold text-[#1A2238] mb-8">Gyaan.one Fellowship</h2>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-light max-w-3xl mx-auto">
                The Gyaan.one Fellowship is a highly selective program for individuals who want to play a meaningful role in shaping ambitious students. 
                Fellows become key contributors to our academic community and work closely with the core team to create real impact.
              </p>
            </div>

            <div className="bg-white p-12 md:p-16 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-3xl font-playfair font-bold text-[#1A2238] mb-10">Why Join?</h3>
              <ul className="space-y-6">
                {[
                  "Mentor driven and serious students",
                  "Become an official Gyaan.one Fellow",
                  "Gain leadership and community-building experience",
                  "Work directly with the founding team",
                  "Receive a Fellowship Certificate (based on contribution)"
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-[#C5A059] flex-shrink-0" />
                    <span className="text-lg text-gray-600 font-light">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-12 pt-10 border-t border-gray-50">
                <button 
                  onClick={() => setModalType('apply')}
                  className="w-full md:w-auto bg-[#1A2238] text-white px-12 py-5 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-[#7FB5B5] transition shadow-xl active:scale-95"
                >
                  Apply for Fellowship
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-50 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xs text-gray-400 font-medium">
              © 2026 Gyaan.one. All rights reserved.
            </div>
            <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-gray-400">
              <button onClick={() => { setActiveView('landing'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#1A2238] transition-colors">Home</button>
              <button onClick={() => { setActiveView('community'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#1A2238] transition-colors">Community</button>
              <button onClick={() => { setActiveView('sessions'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#1A2238] transition-colors">Sessions</button>
              <button onClick={() => { setActiveView('fellowship'); window.scrollTo({top:0, behavior:'smooth'}); }} className="hover:text-[#1A2238] transition-colors">Fellowship</button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-300">Built for the ambitious.</p>
          </div>
        </div>
      </footer>

      {/* SESSION MODAL */}
      <Modal 
        isOpen={modalType === 'session' && !!selectedSession} 
        onClose={() => setModalType(null)} 
        title="Masterclass Specification"
        size="lg"
      >
        {selectedSession && (
          <div className="space-y-12 pb-16">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-10">
                <div className="flex flex-col items-start gap-4">
                  <div className="inline-block py-1 px-3 rounded-full bg-[#7FB5B5]/10 border border-[#7FB5B5]/20">
                    <span className="text-[#7FB5B5] font-bold tracking-widest uppercase text-[10px]">
                      {selectedSession.category} · {selectedSession.timeLabel}
                    </span>
                  </div>
                  <h1 className="text-4xl font-playfair font-bold text-[#1A2238] mb-2 leading-tight">
                    {selectedSession.title}
                  </h1>
                  <p className="text-lg text-gray-500 font-light leading-relaxed">
                    {selectedSession.longDescription}
                  </p>
                </div>

                <div className="bg-[#1A2238] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="text-center md:text-left relative z-10">
                    <h3 className="text-xl font-playfair font-bold mb-2">Live Engagement Portal</h3>
                    <p className="text-gray-400 text-sm font-light">Access the verified Zoom environment for this masterclass.</p>
                  </div>
                  <button 
                    disabled={!selectedSession.zoomLink}
                    onClick={() => selectedSession.zoomLink && window.open(selectedSession.zoomLink, '_blank')}
                    className={`bg-[#7FB5B5] text-[#1A2238] px-10 py-4 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-white transition-all shadow-lg active:scale-95 ${selectedSession.zoomLink ? 'animate-pulse' : 'opacity-40 grayscale cursor-not-allowed'}`}
                  >
                    {selectedSession.zoomLink ? 'Join via Zoom' : 'Link Pending'}
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-10">
                  <h3 className="text-xl font-playfair font-bold mb-6">Leave a Scholarly Evaluation</h3>
                  {currentUser ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Rating:</span>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setReviewRating(star)} className="transition-transform hover:scale-125 focus:outline-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={star <= reviewRating ? "#C5A059" : "none"} stroke={star <= reviewRating ? "none" : "#D1D5DB"} strokeWidth="1.5">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your perspective on this dialogue..."
                        required
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7FB5B5]/20 outline-none h-32 resize-none"
                      ></textarea>
                      <button type="submit" className="bg-[#1A2238] text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#7FB5B5] transition-all shadow-md active:scale-95">
                        Post Evaluation
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-6">Please log in to share your evaluation.</p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-10">
                  <h3 className="text-xl font-playfair font-bold mb-8 text-[#1A2238]">Academic Peer Reviews</h3>
                  <div className="space-y-6">
                    {getSessionReviews(selectedSession.id).length > 0 ? (
                      getSessionReviews(selectedSession.id).map(r => (
                        <div key={r.id} className="border-b border-gray-50 pb-6 group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-[#1A2238]">{r.userName}</span>
                            <div className="flex gap-1 text-[#C5A059]">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < r.rating ? "currentColor" : "none"} stroke={i < r.rating ? "none" : "#D1D5DB"} strokeWidth="2">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 font-light italic mb-2">"{r.comment}"</p>
                          <span className="text-[10px] text-gray-300 uppercase tracking-widest">{r.date}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-10">No evaluations recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 sticky top-24 shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-6">About the Mentor</h4>
                  <div className="flex items-center gap-4 mb-6">
                    <img src={selectedSession.avatarUrl} alt={selectedSession.mentorName} className="w-16 h-16 rounded-full object-cover grayscale" />
                    <div>
                      <p className="font-bold text-[#1A2238]">{selectedSession.mentorName}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{selectedSession.mentorInst}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-[#1A2238] uppercase tracking-wider mb-2">{selectedSession.mentorTitle}</p>
                  <p className="text-sm text-gray-500 leading-relaxed font-light">{selectedSession.mentorBio}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ADMIN DASHBOARD */}
      <Modal isOpen={modalType === 'admin'} onClose={() => { setModalType(null); setAdminTab('insights'); setEditingSessionId(null); setEditingUserId(null); }} title="Administrator Intelligence Board" size="xl">
        <div className="flex flex-col md:flex-row gap-8 min-h-[600px] text-[#1A2238]">
          <div className="w-full md:w-64 space-y-2 border-r border-gray-50 pr-6">
            {['insights', 'scholars', 'fellowship', 'founding', 'curriculum'].map(tab => (
              <button key={tab} onClick={() => { setAdminTab(tab as any); setEditingSessionId(null); setEditingUserId(null); }} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition ${adminTab === tab ? 'bg-[#1A2238] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
                {tab === 'scholars' ? 'Scholars Registry' : tab === 'founding' ? 'Founding Cohort' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {adminTab === 'insights' && (
              <div className="animate-in space-y-12">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Global Scholars', val: userList.length },
                    { label: 'Approved Fellows', val: userList.filter(u => u.isFellow).length },
                    { label: 'Pending Dossiers', val: applications.filter(a => a.status === 'PENDING').length },
                    { label: 'Founding Apps', val: foundingApplications.filter(a => a.status === 'PENDING').length },
                    { label: 'Live Sessions', val: sessions.length }
                  ].map((stat, i) => (
                    <div key={i} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">{stat.label}</p>
                      <p className="text-4xl font-playfair font-bold">{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-playfair font-bold">Recent Activity</h3>
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
                    {recentActivity.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {recentActivity.map(act => (
                          <div key={act.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${act.type === 'JOIN' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                {act.type === 'JOIN' ? 'JS' : 'AC'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#1A2238]">{act.user} <span className="font-normal text-gray-400">joined the collective</span></p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">{act.time}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-bold bg-gray-100 text-gray-400 px-2 py-1 rounded-full uppercase tracking-tighter">New Scholar</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <p className="text-xs text-gray-400 italic">No recent activity recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {adminTab === 'scholars' && (
              <div className="animate-in space-y-6">
                <h3 className="text-xl font-playfair font-bold">Community Registry</h3>
                <div className="overflow-hidden rounded-3xl border border-gray-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Scholar Details</th>
                        <th className="px-6 py-4">Dossier</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {userList.map(u => (
                        <tr key={u.uid} className="group hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            {editingUserId === u.uid ? (
                              <div className="space-y-2 animate-in">
                                <input 
                                  defaultValue={u.name} 
                                  placeholder="Full Name"
                                  className="w-full bg-white border border-[#7FB5B5] px-3 py-1.5 rounded-xl outline-none text-sm"
                                  onChange={(e) => setEditUserBuffer({ ...editUserBuffer, name: e.target.value })}
                                />
                                <input 
                                  defaultValue={u.institution || ''} 
                                  placeholder="Institutional Affiliation"
                                  className="w-full bg-white border border-[#7FB5B5] px-3 py-1.5 rounded-xl outline-none text-sm"
                                  onChange={(e) => setEditUserBuffer({ ...editUserBuffer, institution: e.target.value })}
                                />
                              </div>
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[#1A2238]">{u.name}</span>
                                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${u.isFellow ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-gray-100 text-gray-400'}`}>
                                          {u.isFellow ? 'FELLOW' : 'MEMBER'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono">{u.email}</p>
                                    <p className="text-[10px] text-[#7FB5B5] font-medium uppercase tracking-tight">{u.institution || 'No Institution Linked'}</p>
                                </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingUserId === u.uid ? (
                              <textarea 
                                defaultValue={u.expertise || ''} 
                                placeholder="Expertise Domain"
                                className="w-full bg-white border border-[#7FB5B5] px-3 py-1.5 rounded-xl outline-none text-xs h-16 resize-none"
                                onChange={(e) => setEditUserBuffer({ ...editUserBuffer, expertise: e.target.value })}
                              />
                            ) : (
                              <div className="max-w-[150px]">
                                <p className="text-xs text-gray-500 font-light truncate">{u.expertise || 'No expertise declared'}</p>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {editingUserId === u.uid ? (
                                <>
                                  <button onClick={() => handleAdminUpdateUser(u.uid, editUserBuffer)} className="p-1.5 bg-[#1A2238] text-white rounded-lg shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  </button>
                                  <button onClick={() => setEditingUserId(null)} className="p-1.5 bg-gray-100 text-gray-400 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => { setEditingUserId(u.uid); setEditUserBuffer({ name: u.name, institution: u.institution, expertise: u.expertise }); }} className="p-1.5 bg-gray-50 text-gray-300 hover:text-[#7FB5B5] hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminTab === 'fellowship' && (
              <div className="animate-in space-y-6">
                <h3 className="text-xl font-playfair font-bold">Fellowship Approval Queue</h3>
                {applications.filter(a => a.status === 'PENDING').length > 0 ? (
                  applications.filter(a => a.status === 'PENDING').map(app => (
                    <div key={app.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] space-y-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-[#1A2238]">{app.name}</h4>
                          <p className="text-[10px] uppercase font-bold text-[#7FB5B5] tracking-widest">{app.expertise}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Submitted</p>
                          <p className="text-xs font-medium text-gray-500">{app.submittedAt}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 py-4 border-y border-gray-50">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contact Details</p>
                          <p className="text-sm text-[#1A2238] font-medium">{app.email}</p>
                          <p className="text-sm text-[#1A2238] font-medium">{app.phone}</p>
                          {app.linkedinUrl && (
                            <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#7FB5B5] hover:underline flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                              LinkedIn Profile
                            </a>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Education Background</p>
                          <p className="text-sm text-[#1A2238] font-medium">{app.education}</p>
                        </div>
                      </div>

                      {app.narrative && (
                        <div className="space-y-2">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Academic Narrative</p>
                          <p className="text-sm text-gray-600 italic leading-relaxed bg-gray-50 p-4 rounded-2xl">"{app.narrative}"</p>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => adminHandleApplication(app.id, 'APPROVED')} className="flex-1 bg-[#1A2238] text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#7FB5B5] transition-all active:scale-95 shadow-lg">Approve Fellow</button>
                        <button onClick={() => adminHandleApplication(app.id, 'REJECTED')} className="flex-1 bg-red-50 text-red-400 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95">Decline</button>
                      </div>
                    </div>
                  ))
                ) : <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm italic">No dossiers pending review.</p>
                    </div>}
              </div>
            )}

            {adminTab === 'founding' && (
              <div className="animate-in space-y-6">
                <h3 className="text-xl font-playfair font-bold">Founding Cohort Applications</h3>
                {foundingApplications.filter(a => a.status === 'PENDING').length > 0 ? (
                  foundingApplications.filter(a => a.status === 'PENDING').map(app => (
                    <div key={app.id} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] space-y-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-[#1A2238]">{app.name}</h4>
                          <p className="text-[10px] uppercase font-bold text-[#C5A059] tracking-widest">Founding Applicant</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Submitted</p>
                          <p className="text-xs font-medium text-gray-500">{app.submittedAt}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 py-4 border-y border-gray-50">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contact Details</p>
                          <p className="text-sm text-[#1A2238] font-medium">{app.email}</p>
                          <p className="text-sm text-[#1A2238] font-medium">{app.phone}</p>
                          {app.linkedinUrl && (
                            <a href={app.linkedinUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[#7FB5B5] hover:underline block mt-1">LinkedIn Profile</a>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Education Background</p>
                          <p className="text-sm text-[#1A2238] font-medium">{app.education}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Why Founding Cohort?</p>
                        <p className="text-sm text-gray-600 italic leading-relaxed bg-gray-50 p-4 rounded-2xl">"{app.statement}"</p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => adminHandleFoundingApplication(app.id, 'APPROVED')} className="flex-1 bg-[#1A2238] text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#7FB5B5] transition-all active:scale-95 shadow-lg">Approve Member</button>
                        <button onClick={() => adminHandleFoundingApplication(app.id, 'REJECTED')} className="flex-1 bg-red-50 text-red-400 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95">Decline</button>
                      </div>
                    </div>
                  ))
                ) : <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm italic">No founding applications pending review.</p>
                    </div>}
              </div>
            )}

            {adminTab === 'curriculum' && (
              <div className="animate-in space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-playfair font-bold">Curriculum Control</h3>
                  <button onClick={() => setIsAddingNew(!isAddingNew)} className="bg-[#1A2238] text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-[#7FB5B5] transition">{isAddingNew ? 'Cancel' : 'Add Session'}</button>
                </div>

                {isAddingNew && (
                  <form onSubmit={handleAdminAddSession} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 grid grid-cols-2 gap-4 animate-scale shadow-sm">
                    <input value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} placeholder="Title" required className="col-span-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" />
                    <select value={newSession.category} onChange={e => setNewSession({...newSession, category: e.target.value as any})} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={newSession.timeLabel} onChange={e => setNewSession({...newSession, timeLabel: e.target.value})} placeholder="Time (e.g. LIVE @ 6 PM)" required className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input value={newSession.mentorName} onChange={e => setNewSession({...newSession, mentorName: e.target.value})} placeholder="Mentor Name" required className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input value={newSession.mentorInst} onChange={e => setNewSession({...newSession, mentorInst: e.target.value})} placeholder="Institution" required className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" />
                    <input value={newSession.zoomLink} onChange={e => setNewSession({...newSession, zoomLink: e.target.value})} placeholder="Zoom Link (Optional)" className="col-span-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none" />
                    <textarea value={newSession.description} onChange={e => setNewSession({...newSession, description: e.target.value})} placeholder="Brief Description" className="col-span-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm h-24 outline-none resize-none" />
                    <textarea value={newSession.longDescription} onChange={e => setNewSession({...newSession, longDescription: e.target.value})} placeholder="Full Session Narrative / Long Description" className="col-span-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm h-32 outline-none resize-none" />
                    <button type="submit" className="col-span-2 bg-[#7FB5B5] text-[#1A2238] py-4 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-all">Publish to Curriculum</button>
                  </form>
                )}

                <div className="space-y-4">
                  {sessions.map(s => (
                    <div key={s.id} className="p-6 bg-white border border-gray-100 rounded-[2rem] group hover:shadow-lg transition-all relative">
                      {editingSessionId === s.id ? (
                        <div className="space-y-4 animate-in">
                           <div className="grid grid-cols-2 gap-4">
                             <div className="col-span-2">
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Session Title</label>
                                <input 
                                    defaultValue={s.title} 
                                    className="w-full bg-gray-50 border border-[#7FB5B5]/30 rounded-xl px-3 py-2 text-sm outline-none"
                                    onChange={(e) => setEditSessionBuffer({ ...editSessionBuffer, title: e.target.value })}
                                />
                             </div>
                             <div>
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Category</label>
                                <select 
                                    defaultValue={s.category} 
                                    className="w-full bg-gray-50 border border-[#7FB5B5]/30 rounded-xl px-3 py-2 text-sm outline-none"
                                    onChange={(e) => setEditSessionBuffer({ ...editSessionBuffer, category: e.target.value as any })}
                                >
                                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Time Label</label>
                                <input 
                                    defaultValue={s.timeLabel} 
                                    className="w-full bg-gray-50 border border-[#7FB5B5]/30 rounded-xl px-3 py-2 text-sm outline-none"
                                    onChange={(e) => setEditSessionBuffer({ ...editSessionBuffer, timeLabel: e.target.value })}
                                />
                             </div>
                             <div>
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Mentor Name</label>
                                <input 
                                    defaultValue={s.mentorName} 
                                    className="w-full bg-gray-50 border border-[#7FB5B5]/30 rounded-xl px-3 py-2 text-sm outline-none"
                                    onChange={(e) => setEditSessionBuffer({ ...editSessionBuffer, mentorName: e.target.value })}
                                />
                             </div>
                             <div>
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Institution</label>
                                <input 
                                    defaultValue={s.mentorInst} 
                                    className="w-full bg-gray-50 border border-[#7FB5B5]/30 rounded-xl px-3 py-2 text-sm outline-none"
                                    onChange={(e) => setEditSessionBuffer({ ...editSessionBuffer, mentorInst: e.target.value })}
                                />
                             </div>
                             <div className="col-span-2">
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Zoom Link</label>
                                <input 
                                    defaultValue={s.zoomLink} 
                                    className="w-full bg-gray-50 border border-[#7FB5B5]/30 rounded-xl px-3 py-2 text-sm outline-none"
                                    onChange={(e) => setEditSessionBuffer({ ...editSessionBuffer, zoomLink: e.target.value })}
                                />
                             </div>
                             <div className="col-span-2">
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Short Description</label>
                                <textarea 
                                    defaultValue={s.description} 
                                    className="w-full bg-gray-50 border border-[#7FB5B5]/30 rounded-xl px-3 py-2 text-sm outline-none h-20 resize-none"
                                    onChange={(e) => setEditSessionBuffer({ ...editSessionBuffer, description: e.target.value })}
                                />
                             </div>
                             <div className="col-span-2">
                                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Long Description</label>
                                <textarea 
                                    defaultValue={s.longDescription} 
                                    className="w-full bg-gray-50 border border-[#7FB5B5]/30 rounded-xl px-3 py-2 text-sm outline-none h-32 resize-none"
                                    onChange={(e) => setEditSessionBuffer({ ...editSessionBuffer, longDescription: e.target.value })}
                                />
                             </div>
                           </div>
                           <div className="flex gap-2 pt-2">
                              <button onClick={() => handleAdminUpdateSession(s.id, editSessionBuffer)} className="bg-[#1A2238] text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest">Save Changes</button>
                              <button onClick={() => { setEditingSessionId(null); setEditSessionBuffer({}); }} className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest">Cancel</button>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold group-hover:text-[#7FB5B5] transition">{s.title}</p>
                                    <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-tighter">{s.category}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        {s.mentorName}
                                    </span>
                                    {s.zoomLink && (
                                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.6 11.6L22 7v10l-6.4-4.6v-0.8z"/><rect x="2" y="6" width="12" height="12" rx="2"/></svg>
                                            {s.zoomLink}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingSessionId(s.id)} title="Edit Session" className="p-2 bg-gray-50 text-gray-400 hover:text-[#7FB5B5] rounded-lg transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button onClick={() => setLinkingSessionId(linkingSessionId === s.id ? null : s.id)} title="Link Scholars" className={`p-2 rounded-lg transition-all ${linkingSessionId === s.id ? 'bg-[#C5A059] text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:text-[#C5A059]'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                              </button>
                              <button onClick={() => handleAdminDeleteSession(s.id)} title="Delete" className="p-2 bg-gray-50 text-red-300 hover:text-red-500 rounded-lg transition-all"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                            </div>
                          </div>
                          {linkingSessionId === s.id && (
                            <div className="mt-4 pt-4 border-t border-gray-50 animate-in grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {userList.map(user => (
                                <button key={user.uid} onClick={() => handleToggleScholarLink(s.id, user.email)} className={`text-[10px] text-left p-3 rounded-xl border transition-all ${s.linkedScholarEmails?.includes(user.email) ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059] shadow-sm' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'}`}>
                                  <span className="font-bold block">{user.name}</span>
                                  <span className="opacity-50 font-mono text-[9px]">{user.email}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* AUTH MODAL SIMPLIFIED */}
      <Modal isOpen={modalType === 'auth'} onClose={() => setModalType(null)} title="Join the Collective" size="sm">
        <div className="space-y-6">
          <p className="text-xs text-gray-400 text-center italic">Enter your details to initialize your scholar profile.</p>
          
          <form onSubmit={handleQuickJoin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
              <input name="name" placeholder="E.g., Leonardo da Vinci" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5] transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <input name="email" type="email" placeholder="scholar@gyaan.one" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5] transition-all" />
            </div>
            <button type="submit" className="w-full bg-[#1A2238] text-white py-4 rounded-xl font-bold uppercase text-xs hover:bg-[#7FB5B5] transition shadow-lg active:scale-95 mt-2">
              Initialize Profile
            </button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-gray-100 flex-1"></div>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or use google</span>
            <div className="h-px bg-gray-100 flex-1"></div>
          </div>

          <button 
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-100 py-3.5 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-bold text-[#1A2238]">Continue with Google</span>
          </button>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'founding'} onClose={() => setModalType(null)} title="Founding Cohort Application">
        <form onSubmit={handleFoundingSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
              <input name="name" placeholder="E.g., Leonardo da Vinci" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address *</label>
              <input name="email" type="email" placeholder="scholar@gyaan.one" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Number *</label>
              <input name="phone" type="tel" placeholder="+1 (555) 000-0000" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Education Background *</label>
              <select name="education" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]">
                <option value="">Select Subject</option>
                <option value="Economics">Economics</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Science">Science</option>
                <option value="Arts">Arts</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">LinkedIn URL (Optional)</label>
            <input name="linkedinUrl" placeholder="https://linkedin.com/in/yourprofile" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Why do you want to be a part of the founders cohort? *</label>
            <textarea name="statement" placeholder="Tell us about your ambition and how you want to contribute to Gyaan.one..." required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm h-32 outline-none resize-none focus:ring-1 focus:ring-[#7FB5B5]" />
          </div>

          <button type="submit" className="w-full bg-[#1A2238] text-white py-4 rounded-xl font-bold uppercase text-xs active:scale-95 shadow-xl hover:bg-[#7FB5B5] transition-all">Submit Application</button>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'apply'} onClose={() => setModalType(null)} title="Fellowship Dossier">
        <form onSubmit={handleFellowshipSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name *</label>
              <input name="name" placeholder="E.g., Leonardo da Vinci" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address *</label>
              <input name="email" type="email" placeholder="scholar@gyaan.one" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Number *</label>
              <input name="phone" type="tel" placeholder="+1 (555) 000-0000" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Education Background *</label>
              <select name="education" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]">
                <option value="">Select Subject</option>
                <option value="Economics">Economics</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Science">Science</option>
                <option value="Arts">Arts</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Domain of Expertise *</label>
            <input name="expertise" placeholder="E.g., Quantum Physics, Renaissance Art" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">LinkedIn URL (Optional)</label>
            <input name="linkedinUrl" placeholder="https://linkedin.com/in/yourprofile" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#7FB5B5]" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Academic Narrative (Optional)</label>
            <textarea name="narrative" placeholder="Why do you want to teach at Gyaan.one? / Why do you want to be a mentor?" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm h-32 outline-none resize-none focus:ring-1 focus:ring-[#7FB5B5]" />
          </div>

          <button type="submit" className="w-full bg-[#C5A059] text-white py-4 rounded-xl font-bold uppercase text-xs active:scale-95 shadow-xl hover:bg-[#B48F48] transition-all">Submit for Review</button>
        </form>
      </Modal>

      <Concierge />

      {/* SUCCESS MESSAGE OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFBF7]/90 backdrop-blur-md animate-in">
          <div className="max-w-md w-full p-12 bg-white rounded-[3rem] border border-gray-100 shadow-2xl text-center space-y-8 animate-scale">
            <div className="w-20 h-20 bg-[#C5A059]/10 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-playfair font-bold text-[#1A2238]">Application Received</h2>
              <p className="text-gray-500 font-light leading-relaxed">
                Thanks for showing interest at gyaan.one, we will get back to you shortly.
              </p>
              <div className="pt-4">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C5A059]">Built for the ambitious</p>
              </div>
            </div>
            <div className="pt-4">
              <div className="h-1 w-24 bg-gray-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-[#C5A059] animate-[loading_4s_linear_forwards]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
