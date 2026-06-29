export type UserRole = 'citizen' | 'authority';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  role: UserRole;
  pincode: string;
  locality?: string;
  district?: string;
  state?: string;
  authorityCode?: string;
  language: LanguageCode;
  badgesCount: number;
}

export type IssueType = 'Infrastructure' | 'Electrical' | 'Water Related' | 'Roads & Sanitation';

export type ComplaintStatus =
  | 'pending_validation'
  | 'validated_compiled'
  | 'in_progress'
  | 'pending_resolution_poll'
  | 'resolved'
  | 'declined';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  translatedDescriptions?: Record<string, string>;
  type: IssueType;
  locality: string;
  pincode: string;
  reporterName: string;
  reporterPhone: string;
  photoUrl?: string;
  videoUrl?: string;
  urgencyRate: number;
  similarCount: number;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
  proofPhotoUrl?: string;
  pollId?: string;
  resolutionPollId?: string;
  googleMapsVerified: boolean;
  mapCoordinates?: { lat: number; lng: number };
}

export type PollType = 'issue_validation' | 'resolution_validation';

export interface Poll {
  id: string;
  complaintId: string;
  pincode: string;
  locality: string;
  question: string;
  type: PollType;
  yesVotes: number;
  noVotes: number;
  votedUserIds: string[];
  createdAt: string;
  status: 'active' | 'closed';
  result?: 'yes' | 'no';
}

export interface Badge {
  id: string;
  complaintId: string;
  complaintTitle: string;
  citizenName: string;
  citizenId: string;
  pincode: string;
  locality: string;
  issuedAt: string;
  badgeType: string;
}

export interface AuthorityEvaluation {
  id: string;
  name: string;
  district: string;
  state: string;
  pincode: string;
  resolvedCount: number;
  totalComplaints: number;
  avgResolutionTimeHours: number;
  efficiencyScore: number;
  aiMonthlyRemark: string;
  rank: number;
}

export interface CommunityPost {
  id: string;
  pincode: string;
  locality: string;
  type: 'poll' | 'hero_congrats' | 'system_alert' | 'resolution_showcase';
  title: string;
  content: string;
  createdAt: string;
  pollId?: string;
  photoUrl?: string;
  heroNames?: string[];
}
