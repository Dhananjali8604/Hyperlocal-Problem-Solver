import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = 3000;

// Initialize Gemini Client Lazily
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI', e);
    }
  }
  return aiClient;
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Classification & Translation Endpoint
app.post('/api/ai/classify', async (req, res) => {
  const { description, locality, pincode } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description required' });
  }

  const ai = getAI();
  if (ai) {
    try {
      const prompt = `You are an AI civic triage officer for PACT (Promised Action).
Analyze this municipal civic issue report:
Description: "${description}"
Locality: "${locality}", PIN: "${pincode}"

Categorize into exactly ONE of these types:
- "Infrastructure" (potholes, broken bridges, public buildings, collapsed walls)
- "Electrical" (streetlights out, dangling wires, transformer sparks, power outage)
- "Water Related" (pipe leaks, sewage overflow, contaminated water, water logging)
- "Roads & Sanitation" (garbage dumps, uncleaned drains, dead animals, blocked traffic)

Determine initial urgency rate from 1 to 5 (1=minor annoyance, 5=immediate public safety hazard).
Create a short, crisp Title (max 8 words).
Also translate the concise Title and Summary into common Indian regional languages (hi, bn, te, mr, ta, gu, kn, ml, pa).

Return strictly JSON with keys:
"type", "urgencyRate" (number), "title", "translatedDescriptions" (object mapping language codes en, hi, bn, te, mr, ta, gu, kn, ml, pa to translated summaries).`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      if (resp.text) {
        const data = JSON.parse(resp.text);
        return res.json(data);
      }
    } catch (err) {
      console.error('Gemini classify error, using fallback:', err);
    }
  }

  // Intelligent Fallback if API key missing or rate limited
  const descLower = description.toLowerCase();
  let type = 'Infrastructure';
  let urgencyRate = 2;

  if (descLower.includes('water') || descLower.includes('leak') || descLower.includes('sewage') || descLower.includes('flood') || descLower.includes('drain')) {
    type = 'Water Related';
    urgencyRate = 4;
  } else if (descLower.includes('electric') || descLower.includes('light') || descLower.includes('wire') || descLower.includes('spark') || descLower.includes('current')) {
    type = 'Electrical';
    urgencyRate = 5;
  } else if (descLower.includes('garbage') || descLower.includes('trash') || descLower.includes('smell') || descLower.includes('sanitation') || descLower.includes('dustbin') || descLower.includes('road')) {
    type = 'Roads & Sanitation';
    urgencyRate = 3;
  }

  res.json({
    type,
    urgencyRate,
    title: description.slice(0, 50) + (description.length > 50 ? '...' : ''),
    translatedDescriptions: {
      en: description,
      hi: `नागरिक शिकायत: ${description}`,
      bn: `নাগরিক অভিযোগ: ${description}`,
      te: `పౌర ఫిర్యాదు: ${description}`,
      mr: `नागरी तक्रार: ${description}`,
      ta: `குடிமக்கள் புகார்: ${description}`,
      gu: `નાગરિક ફરિયાદ: ${description}`,
      kn: `ನಾಗರಿಕ ದೂರು: ${description}`,
      ml: `പൗര പരാതി: ${description}`,
      pa: `ਨਾਗਰਿਕ ਸ਼ਿਕਾਇਤ: ${description}`,
    },
  });
});

// AI Complaint Writing Assistant
app.post('/api/ai/write-assist', async (req, res) => {
  const { roughNotes, languageName } = req.body;
  if (!roughNotes) {
    return res.status(400).json({ error: 'Rough notes required' });
  }

  const ai = getAI();
  if (ai) {
    try {
      const prompt = `You are an AI civic writing assistant for PACT.
A citizen wants to report a municipal issue. Expand their rough notes into a formal, clear, objective civic complaint statement written in ${languageName || 'English'}. Include location placeholders if needed. Keep it under 100 words.
Rough notes: "${roughNotes}"`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      if (resp.text) {
        return res.json({ polishedText: resp.text.trim() });
      }
    } catch (err) {
      console.error('Gemini write assist error:', err);
    }
  }

  // Fallback
  res.json({
    polishedText: `Respected Municipal Authority,\nI would like to bring to your urgent notice the following issue in our locality: ${roughNotes}. Please inspect and take prompt corrective action. Thank you.`,
  });
});

// AI Community Poll Generator
app.post('/api/ai/generate-poll', async (req, res) => {
  const { title, locality, type } = req.body;
  const ai = getAI();
  if (ai) {
    try {
      const prompt = `Generate a community validation poll question for citizens in ${locality}.
Issue: "${title}"
Poll Purpose: ${type === 'issue_validation' ? 'Verify if this problem actually exists currently in the area.' : 'Verify if the municipal authority has truly resolved and fixed this issue.'}
Return JSON: { "question": "Short bilingual question (English + Hindi/Regional)", "options": ["Yes, confirmed", "No, false report"] }`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      if (resp.text) {
        return res.json(JSON.parse(resp.text));
      }
    } catch (err) {
      console.error('Gemini poll generation error:', err);
    }
  }

  res.json({
    question: type === 'issue_validation'
      ? `Civic Alert: Is there "${title}" observed near ${locality}? / क्या आपके क्षेत्र में यह समस्या है?`
      : `Resolution Check: Has "${title}" been satisfactorily solved near ${locality}? / क्या यह कार्य पूरा हो चुका है?`,
    options: ['Yes (हाँ)', 'No (नहीं)'],
  });
});

// AI Monthly Evaluation Remarks
app.post('/api/ai/evaluate-authority', async (req, res) => {
  const { authorityName, resolvedCount, totalComplaints, avgHours } = req.body;
  const ai = getAI();
  if (ai) {
    try {
      const prompt = `Evaluate municipal performance for ${authorityName}.
Stats: Resolved ${resolvedCount} out of ${totalComplaints} total complaints. Average resolution time: ${avgHours} hours.
Write a professional, encouraging 2-sentence monthly evaluation remark. Also compute an efficiency percentage score (0-100).
Return JSON: { "remark": "string", "efficiencyScore": number }`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      if (resp.text) {
        return res.json(JSON.parse(resp.text));
      }
    } catch (err) {
      console.error('Gemini evaluation error:', err);
    }
  }

  const efficiencyScore = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 85;
  res.json({
    remark: `Demonstrated solid commitment to urban affairs with ${resolvedCount} resolved matters averaging ${avgHours}h turnaround. Continued focus on rapid electrical and water infrastructure repairs recommended.`,
    efficiencyScore,
  });
});

// Vite Middleware Setup
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PACT Server running on http://localhost:${PORT}`);
  });
}

setupServer();
