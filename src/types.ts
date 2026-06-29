export type Role = 'citizen' | 'authority';

export type Language = 
  | 'English' | 'Hindi' | 'Bengali' | 'Telugu' | 'Marathi' | 'Tamil' | 'Urdu' | 'Gujarati' | 'Kannada' | 'Malayalam' | 'Punjabi'
  | 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'ur' | 'gu' | 'kn' | 'ml' | 'pa';

export interface AuthorityDetails {
  department: string;
  designation: string;
  officeAddress: string;
  district: string;
  state: string;
  isVerifiedGovt: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  pincode: string;
  role: Role;
  language: Language;
  locality?: string;
  authorityDetails?: AuthorityDetails;
  badgesCount?: number;
  badgesEarned?: number;
}

export type ComplaintType = 'Infra' | 'Electrical' | 'Water' | 'Sanitation' | 'Other' | string;
export type ComplaintCategory = 'water' | 'electrical' | 'garbage' | 'infrastructure' | 'sanitation' | 'other' | string;

export type ComplaintStatus = 
  | 'reported'
  | 'investigating'
  | 'pending_validation'
  | 'validated'
  | 'declined'
  | 'in_progress'
  | 'resolved_pending_poll'
  | 'resolved';

export interface TriagePoll {
  yes: number;
  no: number;
  voters: string[];
}

export interface ResolutionPoll {
  yes: number;
  no: number;
  voters: string[];
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  locality: string;
  pincode: string;
  lat?: number;
  lng?: number;
  reporterName: string;
  reporterPhone?: string;
  reporterId: string;
  status: ComplaintStatus;
  type?: ComplaintType;
  category?: ComplaintCategory;
  urgency?: 'high' | 'medium' | 'low' | string;
  urgencyScore?: number;
  similarReportsCount?: number;
  verificationCount?: number;
  verifiedBy?: string[];
  authorityComments?: string[];
  authorityRemark?: string;
  completionPicture?: string;
  triagePoll?: TriagePoll;
  resolutionPoll?: ResolutionPoll;
  aiSummary?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface CommunityPost {
  id: string;
  complaintId?: string;
  pincode: string;
  title: string;
  content: string;
  type: 'triage_poll' | 'resolution_poll' | 'hero_congrats' | 'announcement';
  createdAt: number;
  authorName: string;
  poll?: {
    question: string;
    yesVotes: number;
    noVotes: number;
    voters: string[];
  };
}

export interface Badge {
  id: string;
  userId: string;
  userName: string;
  complaintId: string;
  complaintTitle: string;
  locality?: string;
  pincode: string;
  issuedAt: number;
  badgeNumber: string;
  badgeType?: 'Bronze' | 'Silver' | 'Gold';
}

export interface MunicipalRanking {
  pincode: string;
  authorityName: string;
  district: string;
  state: string;
  efficiencyScore: number;
  resolvedCount: number;
  avgHoursToResolve: number;
  aiRemark: string;
  rank: number;
}

export interface SeedData {
  complaints: Complaint[];
  posts: CommunityPost[];
  badges: Badge[];
  rankings: MunicipalRanking[];
}
