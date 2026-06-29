import { Complaint, CommunityPost, MunicipalRanking, Badge, User } from './types';

export const INITIAL_USER: User = {
  id: 'user-curr',
  name: 'Arjun Mehra',
  email: 'arjun@example.com',
  role: 'citizen',
  pincode: '110070',
  language: 'hi',
  badgesEarned: 12
};

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-101',
    pincode: '110070',
    locality: 'Sector C-8, Vasant Kunj, DL',
    category: 'water',
    type: 'Water',
    urgency: 'high',
    urgencyScore: 95,
    similarReportsCount: 4,
    title: 'Burst Main Water Pipeline Flooding Street',
    description: 'High pressure water pipeline has ruptured near Block C market. Lakhs of litres being wasted and road surface eroding rapidly. Urgent municipal dispatch required.',
    mediaUrl: 'https://images.unsplash.com/photo-1542013936693-859e53936323?auto=format&fit=crop&w=800&q=80',
    status: 'investigating',
    createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    reporterId: 'user-curr',
    reporterName: 'Arjun Mehra',
    reporterPhone: '+91 98765 43210',
    verificationCount: 14,
    verifiedBy: ['u-1', 'u-2', 'u-3'],
    authorityComments: ['Junior Engineer (Water Dept) dispatched to site for emergency valve shutdown.'],
    aiSummary: 'Critical water infrastructure failure in Vasant Kunj residential cluster. High water loss risk.'
  },
  {
    id: 'cmp-102',
    pincode: '110070',
    locality: 'Nelson Mandela Marg, Vasant Kunj',
    category: 'electrical',
    type: 'Electrical',
    urgency: 'high',
    urgencyScore: 98,
    similarReportsCount: 6,
    title: 'Exposed Live HT Transformer Wires Near Park',
    description: 'Transformer enclosure door is broken and high voltage wires are hanging at 4 feet height next to children play park. Extreme electrocution hazard.',
    mediaUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    status: 'reported',
    createdAt: Date.now() - 1000 * 60 * 180, // 3 hours ago
    reporterId: 'user-priya',
    reporterName: 'Priya Singh',
    reporterPhone: '+91 98111 22233',
    verificationCount: 22,
    verifiedBy: ['u-1', 'user-curr'],
    authorityComments: [],
    aiSummary: 'Severe public safety hazard: live electrical equipment accessible to pedestrians.'
  },
  {
    id: 'cmp-103',
    pincode: '110070',
    locality: 'Masoodpur Market Road, DL',
    category: 'garbage',
    type: 'Sanitation',
    urgency: 'medium',
    urgencyScore: 72,
    similarReportsCount: 2,
    title: 'Overflowing Dhalao & Irregular Garbage Trucks',
    description: 'Municipal solid waste collection has been stalled for 4 days. Foul smell and stray cattle hazard across the main arterial market road.',
    mediaUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    status: 'in_progress',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    reporterId: 'u-rohan',
    reporterName: 'Rohan Verma',
    reporterPhone: '+91 99887 76655',
    verificationCount: 8,
    verifiedBy: ['user-curr'],
    authorityComments: ['Two compactors allocated for clearance today evening.'],
    aiSummary: 'Sanitation deficit affecting commercial and pedestrian zone.'
  },
  {
    id: 'cmp-104',
    pincode: '110070',
    locality: 'Gate 2, Pocket 1, Vasant Kunj',
    category: 'infrastructure',
    type: 'Infra',
    urgency: 'medium',
    urgencyScore: 65,
    similarReportsCount: 3,
    title: 'Deep Hazardous Pothole at Colony Entry',
    description: 'Monsoon rains caused a 1.5 ft deep crater at the entry gate causing 2 two-wheeler skidding accidents yesterday.',
    mediaUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    status: 'resolved',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    resolvedAt: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    completionPicture: 'https://images.unsplash.com/photo-1584463623578-3df8d3617be3?auto=format&fit=crop&w=800&q=80',
    reporterId: 'user-curr',
    reporterName: 'Arjun Mehra',
    reporterPhone: '+91 98765 43210',
    verificationCount: 19,
    verifiedBy: ['u-1', 'u-2'],
    authorityComments: ['Bitumen cold mix compaction completed by PWD road maintenance squad.'],
    aiSummary: 'Road surface hazard rectified satisfactorily within SLA turnaround.'
  },
  {
    id: 'cmp-105',
    pincode: '452001',
    locality: 'MG Road, Palasia, Indore',
    category: 'infrastructure',
    type: 'Infra',
    urgency: 'low',
    urgencyScore: 35,
    similarReportsCount: 1,
    title: 'Pedestrian Tactile Tile Alignment',
    description: 'Footpath tactile paving for visually impaired pedestrians is broken near bus stop.',
    mediaUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
    status: 'resolved',
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    resolvedAt: Date.now() - 1000 * 60 * 60 * 12,
    completionPicture: 'https://images.unsplash.com/photo-1584463623578-3df8d3617be3?auto=format&fit=crop&w=800&q=80',
    reporterId: 'ind-user',
    reporterName: 'Sunil Sharma',
    reporterPhone: '+91 94222 11111',
    verificationCount: 11,
    verifiedBy: [],
    authorityComments: ['Replaced tactile pavers.'],
    aiSummary: 'Urban accessibility compliance repair completed.'
  }
];

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    pincode: '110070',
    title: '🗳️ Work Verification Poll: Gate 2 Pothole Repair',
    content: 'South Delhi Municipal Corporation (PWD Dept) has marked the deep crater at Pocket 1 Gate 2 as resolved and attached completion photos. Residents, please inspect the patch work and cast your verification vote below!',
    type: 'resolution_poll',
    authorName: 'AI Civic Dispatcher',
    createdAt: Date.now() - 1000 * 60 * 120,
    complaintId: 'cmp-104',
    poll: {
      question: 'Is the pothole at Gate 2 repaired smoothly without gravel looseness?',
      yesVotes: 34,
      noVotes: 2,
      voters: ['u-1', 'u-2']
    }
  },
  {
    id: 'post-2',
    pincode: '110070',
    title: '⚠️ Neighbor Hazard Alert: Live HT Wires on Mandela Marg',
    content: 'Priya Singh reported exposed live 11kV transformer cables near the children park. 22 neighbors within 500m radius have corroborated this alert. Avoid walking dogs or allowing children near Transformer Cabin #4.',
    type: 'triage_poll',
    authorName: 'Locality Safety Bot',
    createdAt: Date.now() - 1000 * 60 * 150,
    complaintId: 'cmp-102',
    poll: {
      question: 'Are municipal barricades installed around the broken transformer yet?',
      yesVotes: 4,
      noVotes: 18,
      voters: []
    }
  },
  {
    id: 'post-3',
    pincode: '110070',
    title: '🏆 Civic Hero Honor: Arjun Mehra Awarded PACT Badge #12',
    content: 'Congratulations to our neighbor Arjun Mehra! By reporting 12 verified civic infrastructure defects that led to successful municipal intervention, Arjun has been awarded official PACT Social Service Recognition.',
    type: 'hero_congrats',
    authorName: 'Civic Square Administrator',
    createdAt: Date.now() - 1000 * 60 * 300
  },
  {
    id: 'post-4',
    pincode: '110070',
    title: '📢 Sunday Morning Citizen Cleanliness Volunteer Drive',
    content: 'Join Sector C-8 RWA members this Sunday at 7:30 AM at the central amphitheatre for our quarterly plastic sorting and neighborhood beautification initiative. Gloves and garbage bags provided.',
    type: 'announcement',
    authorName: 'Vasant Kunj RWA Committee',
    createdAt: Date.now() - 1000 * 60 * 600
  }
];

export const INITIAL_RANKINGS: MunicipalRanking[] = [
  {
    pincode: '110070',
    authorityName: 'South Delhi Municipal Corporation (MCD South)',
    district: 'New Delhi',
    state: 'Delhi NCR',
    efficiencyScore: 98,
    resolvedCount: 142,
    avgHoursToResolve: 14,
    rank: 1,
    aiRemark: 'Exceptional SLA adherence. Citizen work verification approval rating is at 96.4%.'
  },
  {
    pincode: '452001',
    authorityName: 'Indore Municipal Corporation (IMC)',
    district: 'Indore',
    state: 'Madhya Pradesh',
    efficiencyScore: 94,
    resolvedCount: 310,
    avgHoursToResolve: 18,
    rank: 2,
    aiRemark: 'Consistently India No.1 in solid waste management and rapid drainage declogging.'
  },
  {
    pincode: '411001',
    authorityName: 'Pune Municipal Corporation (PMC)',
    district: 'Pune',
    state: 'Maharashtra',
    efficiencyScore: 91,
    resolvedCount: 204,
    avgHoursToResolve: 22,
    rank: 3,
    aiRemark: 'Strong civic digital integration. Rapid response in electrical repair tickets.'
  },
  {
    pincode: '560001',
    authorityName: 'Bruhat Bengaluru Mahanagara Palike (BBMP Central)',
    district: 'Bengaluru',
    state: 'Karnataka',
    efficiencyScore: 86,
    resolvedCount: 189,
    avgHoursToResolve: 29,
    rank: 4,
    aiRemark: 'Significant improvement in pothole patching following AI geotag verification.'
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'cert-1',
    userId: 'user-curr',
    userName: 'Arjun Mehra',
    pincode: '110070',
    complaintId: 'cmp-104',
    complaintTitle: 'Deep Hazardous Pothole at Gate 2 Entry',
    issuedAt: Date.now() - 1000 * 60 * 60 * 5,
    badgeNumber: 'PACT-DL-2026-8891',
    badgeType: 'Gold'
  },
  {
    id: 'cert-2',
    userId: 'user-priya',
    userName: 'Priya Singh',
    pincode: '110070',
    complaintId: 'cmp-099',
    complaintTitle: 'Clogged Stormwater Drain Sector C',
    issuedAt: Date.now() - 1000 * 60 * 60 * 36,
    badgeNumber: 'PACT-DL-2026-8812',
    badgeType: 'Silver'
  },
  {
    id: 'cert-3',
    userId: 'u-rohan',
    userName: 'Rohan Verma',
    pincode: '110070',
    complaintId: 'cmp-095',
    complaintTitle: 'Broken Street Light Pole B-7',
    issuedAt: Date.now() - 1000 * 60 * 60 * 72,
    badgeNumber: 'PACT-DL-2026-8740',
    badgeType: 'Bronze'
  }
];
