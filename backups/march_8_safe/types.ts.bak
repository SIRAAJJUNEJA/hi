
export type UserRole = 'member' | 'admin';

export interface Review {
  id: string;
  sessionId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Session {
  id: string;
  title: string;
  category: 'Economics' | 'Engineering' | 'Career' | 'Design' | 'Science';
  timeLabel: string;
  status: 'LIVE' | 'UPCOMING' | 'NOW';
  mentorName: string;
  mentorInst: string;
  mentorTitle: string;
  mentorBio: string;
  avatarUrl: string;
  description: string;
  longDescription: string;
  zoomLink?: string;
  relatedSessionIds?: string[];
  linkedScholarEmails?: string[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface UserRecord {
  uid: string;
  email: string;
  name: string;
  date: string;
  expertise?: string;
  institution?: string;
  isFellow?: boolean;
  isAdmin?: boolean;
  role: UserRole;
  lastLogin?: number;
  photoURL?: string;
}

export interface FellowshipApplication {
  id: string;
  email: string;
  name: string;
  phone: string;
  expertise: string;
  education: string;
  narrative?: string;
  linkedinUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface FoundingCohortApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  statement: string;
  linkedinUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

export interface AdminLog {
  id: string;
  adminUid: string;
  adminName: string;
  action: string;
  targetId: string;
  timestamp: number;
  details: string;
}

export interface AnalyticsSnapshot {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  totalPosts: number;
  totalComments: number;
  sessionAttendanceRate: number;
  conversionRate: number;
}
