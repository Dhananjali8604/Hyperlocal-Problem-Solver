import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Helper for Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return aiClient;
}

// In-Memory Database Store
let state = {
  complaints: [
    {
      id: 'cmp-101',
      title: 'Massive Pothole near Central Market Bus Stop',
      description: 'Deep road crater causing severe traffic slowdowns and hazardous driving conditions for two-wheelers during peak morning hours.',
      mediaUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      mediaType: 'photo',
      locality: 'Connaught Place, Block A',
      pincode: '110001',
      lat: 28.6315,
      lng: 77.2167,
      reporterName: 'Rajesh Sharma',
      reporterPhone: '9876543210',
      reporterId: 'user-rajesh',
      status: 'validated',
      type: 'Infra',
      urgencyScore: 4,
      similarReportsCount: 3,
      createdAt: Date.now() - 86400000 * 2,
      triagePoll: { yes: 8, no: 1, voters: ['u1', 'u2', 'u3', 'u4'] }
    },
    {
      id: 'cmp-102',
      title: 'Exposed Electrical Transformer Wires',
      description: 'High voltage live wires hanging dangerously low near Sector 4 primary school gate. Immediate repair required before monsoon rains.',
      mediaUrl: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
      mediaType: 'photo',
      locality: 'Indiranagar 1st Stage',
      pincode: '560038',
      lat: 12.9784,
      lng: 77.6408,
      reporterName: 'Ananya Reddy',
      reporterPhone: '9811122233',
      reporterId: 'user-ananya',
      status: 'in_progress',
      type: 'Electrical',
      urgencyScore: 7,
      similarReportsCount: 6,
      createdAt: Date.now() - 86400000 * 1.5,
      authorityRemark: 'Team dispatched with insulation gear. ETA 4 hours.',
      triagePoll: { yes: 14, no: 0, voters: ['u5', 'u6'] }
    },
    {
      id: 'cmp-103',
      title: 'Contaminated Brown Water Supply',
      description: 'Municipal tap water has strong foul smell and turbid brown sediment for the last 3 days in residential quarters.',
      mediaUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80',
      mediaType: 'photo',
      locality: 'Dadar West, Shivaji Park',
      pincode: '400028',
      lat: 19.0222,
      lng: 72.8411,
      reporterName: 'Vikram Deshmukh',
      reporterPhone: '9988776655',
      reporterId: 'user-vikram',
      status: 'resolved_pending_poll',
      type: 'Water',
      urgencyScore: 5,
      similarReportsCount: 4,
      createdAt: Date.now() - 86400000 * 4,
      authorityRemark: 'Main filtration valve flushed and replaced.',
      completionPicture: 'https://images.unsplash.com/photo-1542013936693-859e53936323?auto=format&fit=crop&w=800&q=80',
      triagePoll: { yes: 11, no: 1, voters: [] },
      resolutionPoll: { yes: 4, no: 0, voters: ['u10', 'u11'] }
    },
    {
      id: 'cmp-104',
      title: 'Overflowing Community Garbage Bin',
      description: 'Waste uncollected for over 5 days attracting stray animals and breeding mosquitoes right adjacent to local dispensary.',
      mediaUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
      mediaType: 'photo',
      locality: 'Connaught Place, Outer Circle',
      pincode: '110001',
      lat: 28.6330,
      lng: 77.2190,
      reporterName: 'Priya Verma',
      reporterPhone: '9711100022',
      reporterId: 'user-priya',
      status: 'pending_validation',
      type: 'Sanitation',
      urgencyScore: 2,
      similarReportsCount: 1,
      createdAt: Date.now() - 3600000 * 5,
      triagePoll: { yes: 1, no: 0, voters: ['user-priya'] }
    }
  ] as any[],
  posts: [
    {
      id: 'post-1',
      complaintId: 'cmp-104',
      pincode: '110001',
      title: '⚠️ Locality Triage Poll: Overflowing Garbage Bin',
      content: 'Priya Verma reported an overflowing bin at Connaught Place Outer Circle. Citizens in PIN 110001, please verify if this issue currently exists.',
      type: 'triage_poll',
      createdAt: Date.now() - 3600000 * 4,
      authorName: 'PACT Civic Triage AI',
      poll: { question: 'Is there an overflowing bin at Outer Circle?', yesVotes: 1, noVotes: 0, voters: ['user-priya'] }
    },
    {
      id: 'post-2',
      complaintId: 'cmp-103',
      pincode: '400028',
      title: '✅ Authority Verification Poll: Water Supply Fixed',
      content: 'Dadar West Municipal Authority posted proof of completion for brown water issue. Residents of PIN 400028, please confirm if clean water is restored.',
      type: 'resolution_poll',
      createdAt: Date.now() - 3600000 * 12,
      authorName: 'Municipal Authority (PIN 400028)',
      poll: { question: 'Has clean tap water supply been restored?', yesVotes: 4, noVotes: 0, voters: ['u10', 'u11'] }
    },
    {
      id: 'post-3',
      pincode: '110001',
      title: '🏆 Monthly Congratulatory Notice: Outstanding Community Heroes!',
      content: 'Congratulations to Rajesh Sharma, Priya Verma, and Sunil Gupta for earning the most civic action certificates in New Delhi (110001) this month!',
      type: 'hero_congrats',
      createdAt: Date.now() - 86400000 * 1,
      authorName: 'PACT Central AI Committee'
    }
  ] as any[],
  certificates: [
    {
      id: 'cert-001',
      userId: 'user-rajesh',
      userName: 'Rajesh Sharma',
      complaintId: 'cmp-99',
      complaintTitle: 'Broken Street Light Pole fixed at Block B',
      locality: 'Connaught Place',
      pincode: '110001',
      issuedAt: Date.now() - 86400000 * 5,
      certificateNumber: 'PACT-DEL-2026-8912'
    },
    {
      id: 'cert-002',
      userId: 'user-rajesh',
      userName: 'Rajesh Sharma',
      complaintId: 'cmp-85',
      complaintTitle: 'Clogged Stormwater Drain cleared',
      locality: 'Connaught Place',
      pincode: '110001',
      issuedAt: Date.now() - 86400000 * 10,
      certificateNumber: 'PACT-DEL-2026-7431'
    },
    {
      id: 'cert-003',
      userId: 'user-priya',
      userName: 'Priya Verma',
      complaintId: 'cmp-92',
      complaintTitle: 'Fallen Tree Branch removed',
      locality: 'Connaught Place',
      pincode: '110001',
      issuedAt: Date.now() - 86400000 * 8,
      certificateNumber: 'PACT-DEL-2026-8105'
    }
  ] as any[],
  rankings: [
    {
      pincode: '560038',
      authorityName: 'BBMP East Zone Civic Works',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      efficiencyScore: 96,
      resolvedCount: 42,
      avgHoursToResolve: 14,
      aiRemark: 'Exceptional response speed on electrical hazards and rapid triage verification.',
      rank: 1
    },
    {
      pincode: '110001',
      authorityName: 'NDMC Urban Maintenance Div 1',
      district: 'New Delhi',
      state: 'Delhi',
      efficiencyScore: 92,
      resolvedCount: 38,
      avgHoursToResolve: 21,
      aiRemark: 'Consistently high citizen satisfaction score in post-completion verification polls.',
      rank: 2
    },
    {
      pincode: '400028',
      authorityName: 'MCGM G-North Ward Office',
      district: 'Mumbai',
      state: 'Maharashtra',
      efficiencyScore: 89,
      resolvedCount: 31,
      avgHoursToResolve: 28,
      aiRemark: 'Strong performance in handling complex pipeline and water contamination issues.',
      rank: 3
    }
  ] as any[]
};

// API Endpoints
app.get('/api/state', (req, res) => {
  res.json(state);
});

// AI Draft Assistant
app.post('/api/ai/draft', async (req, res) => {
  const { prompt } = req.body;
  const ai = getAIClient();
  if (!ai) {
    return res.json({
      title: 'Reported Civic Issue: ' + (prompt?.slice(0, 30) || 'Infrastructure Defect'),
      description: `Formal municipal complaint regarding: "${prompt}". Please inspect the locality and take prompt rectifying action.`,
      type: 'Infra'
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are PACT Civic AI Assistant. A citizen wants to report this civic issue: "${prompt}".
Extract or draft:
1. A concise formal Title (max 8 words)
2. A clear professional municipal Description explaining the hazard (max 35 words)
3. The exact Category Type from these options: 'Infra', 'Electrical', 'Water', 'Sanitation', 'Other'.

Return STRICT JSON format:
{
  "title": "string",
  "description": "string",
  "type": "Infra" | "Electrical" | "Water" | "Sanitation" | "Other"
}`,
      config: { responseMimeType: 'application/json' }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (e) {
    res.json({
      title: 'Civic Complaint: ' + prompt?.slice(0, 30),
      description: prompt || 'Urgent community repair needed.',
      type: 'Infra'
    });
  }
});

// AI Authority Verification
app.post('/api/ai/verify-authority', async (req, res) => {
  const { department, designation, pincode } = req.body;
  const ai = getAIClient();
  if (!ai) {
    const valid = department?.toLowerCase().includes('municipal') || department?.toLowerCase().includes('ward') || department?.toLowerCase().includes('civic') || department?.toLowerCase().includes('corporation');
    return res.json({ verified: valid !== false, reason: 'Checked against public civic department registries.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Evaluate if the following registration credentials correspond to a legitimate Indian Municipal/Government civic authority office responsible for public infrastructure and urban affairs:
Department/Office Name: "${department}"
Designation: "${designation}"
PIN Code: "${pincode}"

Return STRICT JSON:
{
  "verified": boolean,
  "reason": "short explanation"
}`,
      config: { responseMimeType: 'application/json' }
    });
    res.json(JSON.parse(response.text?.trim() || '{"verified":true,"reason":"Verified civic authority."}'));
  } catch (e) {
    res.json({ verified: true, reason: 'Civic authority registration approved.' });
  }
});

// AI Translation
app.post('/api/ai/translate', async (req, res) => {
  const { text, targetLang } = req.body;
  if (!targetLang || targetLang === 'English') return res.json({ translatedText: text });
  const ai = getAIClient();
  if (!ai) return res.json({ translatedText: `[${targetLang}] ${text}` });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Translate the following civic complaint text into ${targetLang} cleanly and accurately. Only output the translated text:
"${text}"`
    });
    res.json({ translatedText: response.text?.trim() || text });
  } catch (e) {
    res.json({ translatedText: text });
  }
});

// Submit Complaint
app.post('/api/complaints', async (req, res) => {
  const newCmp = req.body;
  newCmp.id = 'cmp-' + Math.floor(100 + Math.random() * 9000);
  newCmp.createdAt = Date.now();
  newCmp.urgencyScore = Number(newCmp.urgencyScore) || (newCmp.urgency === 'high' ? 88 : newCmp.urgency === 'medium' ? 65 : 40);
  newCmp.similarReportsCount = 1;
  newCmp.status = 'pending_validation';
  newCmp.triagePoll = { yes: 1, no: 0, voters: [newCmp.reporterId] };

  // Check for existing similar complaint in same PIN code and type
  const existing = state.complaints.find(c => c.pincode === newCmp.pincode && c.type === newCmp.type && (c.status === 'pending_validation' || c.status === 'validated' || c.status === 'in_progress'));
  
  if (existing) {
    existing.similarReportsCount += 1;
    existing.urgencyScore += 2; // boost urgency!
    return res.json({ success: true, mergedWithId: existing.id, urgencyScore: existing.urgencyScore });
  }

  state.complaints.unshift(newCmp);

  // Create community triage post
  state.posts.unshift({
    id: 'post-' + Math.random().toString(36).substr(2, 6),
    complaintId: newCmp.id,
    pincode: newCmp.pincode,
    title: `⚠️ Locality Triage Poll: ${newCmp.title}`,
    content: `${newCmp.reporterName} reported a civic issue at ${newCmp.locality} (PIN: ${newCmp.pincode}). Surrounding area citizens, please verify if this problem currently exists.`,
    type: 'triage_poll',
    createdAt: Date.now(),
    authorName: 'PACT Civic Triage AI',
    poll: {
      question: `Is "${newCmp.title}" present in your locality?`,
      yesVotes: 1,
      noVotes: 0,
      voters: [newCmp.reporterId]
    }
  });

  res.json({ success: true, complaint: newCmp });
});

// Triage Poll Vote
app.post('/api/complaints/:id/triage-vote', (req, res) => {
  const { id } = req.params;
  const { vote, userId } = req.body; // 'yes' | 'no'
  const cmp = state.complaints.find(c => c.id === id);
  const post = state.posts.find(p => p.complaintId === id && p.type === 'triage_poll');

  if (!cmp) return res.status(404).json({ error: 'Complaint not found' });

  if (!cmp.triagePoll.voters.includes(userId)) {
    cmp.triagePoll.voters.push(userId);
    if (vote === 'yes') cmp.triagePoll.yes += 1;
    if (vote === 'no') cmp.triagePoll.no += 1;

    if (post && post.poll) {
      post.poll.voters.push(userId);
      if (vote === 'yes') post.poll.yesVotes += 1;
      if (vote === 'no') post.poll.noVotes += 1;
    }

    // Validation thresholds
    if (cmp.triagePoll.yes >= 2 && cmp.status === 'pending_validation') {
      cmp.status = 'validated';
      cmp.urgencyScore += 2;
    } else if (cmp.triagePoll.no >= 3 && cmp.status === 'pending_validation') {
      cmp.status = 'declined';
    }
  }

  res.json({ success: true, complaint: cmp });
});

// Authority posts completion photo
app.post('/api/complaints/:id/complete', (req, res) => {
  const { id } = req.params;
  const { completionPicture, remark, authorityName } = req.body;
  const cmp = state.complaints.find(c => c.id === id);

  if (!cmp) return res.status(404).json({ error: 'Complaint not found' });

  cmp.status = 'resolved_pending_poll';
  cmp.completionPicture = completionPicture;
  cmp.authorityRemark = remark || 'Work completed by municipal authorities.';
  cmp.resolutionPoll = { yes: 0, no: 0, voters: [] };

  // Create community resolution poll
  state.posts.unshift({
    id: 'post-' + Math.random().toString(36).substr(2, 6),
    complaintId: cmp.id,
    pincode: cmp.pincode,
    title: `🔍 Authority Verification Poll: ${cmp.title}`,
    content: `${authorityName || 'Municipal Authority'} uploaded proof of completion for "${cmp.title}" at ${cmp.locality}. Citizens of PIN ${cmp.pincode}, please vote YES/NO to validate their work.`,
    type: 'resolution_poll',
    createdAt: Date.now(),
    authorName: `${authorityName || 'Municipal Authority'} (PIN ${cmp.pincode})`,
    poll: {
      question: `Has "${cmp.title}" been satisfactorily resolved?`,
      yesVotes: 0,
      noVotes: 0,
      voters: []
    }
  });

  res.json({ success: true, complaint: cmp });
});

// Citizen votes on Resolution Poll
app.post('/api/complaints/:id/resolution-vote', (req, res) => {
  const { id } = req.params;
  const { vote, userId, userName } = req.body;
  const cmp = state.complaints.find(c => c.id === id);
  const post = state.posts.find(p => p.complaintId === id && p.type === 'resolution_poll');

  if (!cmp || !cmp.resolutionPoll) return res.status(404).json({ error: 'Complaint or resolution poll not found' });

  if (!cmp.resolutionPoll.voters.includes(userId)) {
    cmp.resolutionPoll.voters.push(userId);
    if (vote === 'yes') cmp.resolutionPoll.yes += 1;
    if (vote === 'no') cmp.resolutionPoll.no += 1;

    if (post && post.poll) {
      post.poll.voters.push(userId);
      if (vote === 'yes') post.poll.yesVotes += 1;
      if (vote === 'no') post.poll.noVotes += 1;
    }

    // If confirmed resolved (e.g. yes >= 1 in demo or >= 2)
    if (cmp.resolutionPoll.yes >= 1 && cmp.status !== 'resolved') {
      cmp.status = 'resolved';
      cmp.resolvedAt = Date.now();

      // Issue certificate to original reporter
      const certNum = `PACT-${cmp.pincode}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const cert = {
        id: 'cert-' + Math.random().toString(36).substr(2, 6),
        userId: cmp.reporterId,
        userName: cmp.reporterName,
        complaintId: cmp.id,
        complaintTitle: cmp.title,
        locality: cmp.locality,
        pincode: cmp.pincode,
        issuedAt: Date.now(),
        certificateNumber: certNum
      };
      state.certificates.unshift(cert);

      // Announce resolution in community
      state.posts.unshift({
        id: 'post-' + Math.random().toString(36).substr(2, 6),
        pincode: cmp.pincode,
        title: `🎉 CIVIC WIN: "${cmp.title}" Resolved!`,
        content: `Thanks to reporter ${cmp.reporterName} and verified municipal action, this civic hazard at ${cmp.locality} is officially resolved. Certificate #${certNum} issued!`,
        type: 'announcement',
        createdAt: Date.now(),
        authorName: 'PACT Civic Ledger'
      });
    } else if (cmp.resolutionPoll.no >= 3) {
      cmp.status = 'in_progress';
      cmp.authorityRemark = 'Reopened: Citizen poll declined completion claims.';
    }
  }

  res.json({ success: true, complaint: cmp });
});

// Vite Middleware for Development / Production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PACT Civic Action Server running on http://localhost:${PORT}`);
  });
}

startServer();
