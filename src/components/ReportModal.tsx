import React, { useState } from 'react';
import { Camera, Image as ImageIcon, MapPin, Sparkles, Loader2, Send, CheckCircle2, AlertCircle, KeyRound, Mail, X, ShieldAlert } from 'lucide-react';
import { User, ComplaintType, Complaint } from '../types';

interface ReportModalProps {
  user: User | null;
  onClose: () => void;
  onSubmitSuccess?: (newComplaint: Complaint, mergedWithId?: string) => void;
  onSubmit?: (newComplaint: any) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ user, onClose, onSubmitSuccess, onSubmit }) => {
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const [askingPerms, setAskingPerms] = useState<boolean>(true);

  // Form state
  const [roughNotes, setRoughNotes] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ComplaintType>('Infra');
  const [urgencyScore, setUrgencyScore] = useState<number>(80);
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'low'>('high');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  const [reporterName, setReporterName] = useState(user?.name || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');

  // AI drafting state
  const [drafting, setDrafting] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGrantPermissions = () => {
    setPermissionsGranted(true);
    setAskingPerms(false);
  };

  const handleAIDraft = async () => {
    if (!roughNotes.trim()) return;
    setDrafting(true);
    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: roughNotes })
      });
      const data = await res.json();
      setDrafting(false);
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.type) setType(data.type as ComplaintType);
    } catch (e) {
      setDrafting(false);
      setTitle(roughNotes.slice(0, 30));
      setDescription(roughNotes);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrl(reader.result as string);
        setMediaType(file.type.includes('video') ? 'video' : 'photo');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = () => {
    if (!reporterEmail || !reporterEmail.includes('@')) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    setOtpError('');
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    alert(`[SIMULATED PACT Civic Email]\nYour One Time Password (OTP) for complaint submission is: ${code}`);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (enteredOtp !== generatedOtp) {
      setOtpError('Incorrect OTP. Please enter the exact 4-digit code sent to your email.');
      return;
    }

    if (!title.trim() || !description.trim() || !locality.trim() || !pincode.trim()) {
      setOtpError('Please fill in all complaint details.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        mediaUrl,
        mediaType,
        locality,
        pincode,
        reporterName,
        reporterEmail,
        reporterId: user?.id || 'anon',
        type,
        urgency,
        urgencyScore
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        const finalComplaint = data.complaint || payload as any;
        if (onSubmitSuccess) {
          onSubmitSuccess(finalComplaint, data.mergedWithId);
        } else if (onSubmit) {
          onSubmit(finalComplaint);
        }
      }
    } catch (err) {
      setSubmitting(false);
      setOtpError('Failed to submit complaint. Please check network.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-white/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl text-white my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-500/30 via-teal-500/30 to-emerald-500/30 border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Submit Promised Action Report</h2>
              <p className="text-xs text-sky-200/80 mt-0.5">Report Hyperlocal Civic Problem with Photo/Video Evidence</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto pr-2">
          
          {/* STEP 1: Permission Dialog */}
          {askingPerms ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/15 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold">Location & Gallery Access Required</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                To accurately map civic hazards and attach photographic evidence for municipal validation, PACT requests access to your device Geolocation and Photo Gallery.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
                >
                  Deny
                </button>
                <button
                  onClick={handleGrantPermissions}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Allow Device Access
                </button>
              </div>
            </div>
          ) : null}

          {/* STEP 2: Main Form */}
          {!askingPerms ? (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              
              {/* AI Drafting Assistant Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/15 via-teal-500/10 to-emerald-500/15 border border-sky-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                    <Sparkles className="w-4 h-4 animate-spin" /> AI Complaint Draft Assistant
                  </div>
                  <span className="text-[10px] font-mono text-sky-200/60">Powered by Gemini</span>
                </div>
                <p className="text-xs text-slate-300">
                  Type simple keywords in any language (e.g., &quot;broken drainage pipe leaking near market block b&quot;) and let AI format formal municipal documentation.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Describe issue roughly..."
                    value={roughNotes}
                    onChange={e => setRoughNotes(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="button"
                    disabled={drafting || !roughNotes.trim()}
                    onClick={handleAIDraft}
                    className="px-4 py-2 bg-gradient-to-r from-sky-400 to-teal-500 hover:opacity-95 text-white rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {drafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Draft
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-sky-200 mb-1">Issue Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hazardous Deep Pothole on Main Road"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sky-200 mb-1">Category Type *</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as ComplaintType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-xs text-white focus:outline-none focus:border-sky-400 font-semibold"
                  >
                    <option value="Infra">🚧 Infra (Roads/Bridges)</option>
                    <option value="Electrical">⚡ Electrical (Wires/Lights)</option>
                    <option value="Water">💧 Water &amp; Sewage</option>
                    <option value="Sanitation">🗑️ Sanitation &amp; Garbage</option>
                    <option value="Other">📌 Other Civic Issue</option>
                  </select>
                </div>
              </div>

              {/* Emergency / Urgency Score */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Emergency / Urgency Score
                  </label>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    urgency === 'high' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' :
                    urgency === 'medium' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {urgency.toUpperCase()} ({urgencyScore}/100)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['high', 'medium', 'low'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setUrgency(lvl);
                        setUrgencyScore(lvl === 'high' ? 90 : lvl === 'medium' ? 60 : 30);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                        urgency === lvl
                          ? lvl === 'high' ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20' :
                            lvl === 'medium' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20' :
                            'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                          : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      {lvl === 'high' ? '🚨 High Emergency' : lvl === 'medium' ? '⚠️ Medium Urgency' : '🟢 Low / Routine'}
                    </button>
                  ))}
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Routine (1)</span>
                    <span>Severe Emergency (100)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={urgencyScore}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setUrgencyScore(val);
                      if (val >= 75) setUrgency('high');
                      else if (val >= 40) setUrgency('medium');
                      else setUrgency('low');
                    }}
                    className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-sky-200 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the problem, urgency, and exact impact on community residents..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>

              {/* Locality & PIN code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sky-200 mb-1">Locality / Landmark Name *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-sky-300" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Connaught Place, Block C"
                      value={locality}
                      onChange={e => setLocality(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sky-200 mb-1">PIN Code * (6 digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="110001"
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Photo / Video Attachment Condition */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-sky-200">Necessary Photo or Video Attachment *</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-dashed border-white/25">
                  <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-slate-950 border border-white/10 shrink-0">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={mediaUrl} alt="Complaint Evidence" className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono uppercase bg-slate-900/90 text-emerald-300 px-1.5 py-0.5 rounded backdrop-blur">
                      {mediaType} Attached
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 w-full text-center sm:text-left">
                    <p className="text-xs font-medium text-slate-300">
                      Upload clear photo or video proof from camera or gallery. Municipal authorities verify work against this baseline.
                    </p>
                    <div className="flex justify-center sm:justify-start gap-2 pt-1">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition">
                        <ImageIcon className="w-3.5 h-3.5 text-sky-300" /> Choose Gallery Photo/Video
                        <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Camera simulated: Using standard civic inspection snapshot.')}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Camera className="w-3.5 h-3.5" /> Take Camera Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reporter Tracking Info & OTP */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/15 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" /> Identity &amp; OTP Tracking Verification
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Status &amp; Badge Delivery</span>
                </div>

                {otpError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name (For Status Tracking) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rajesh Sharma"
                      value={reporterName}
                      onChange={e => setReporterName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (For OTP) *</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="citizen@example.com"
                          value={reporterEmail}
                          onChange={e => setReporterEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0 transition"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                  </div>
                </div>

                {otpSent && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-amber-300 mb-1">Enter 4-Digit One Time Password (OTP) *</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="e.g. 4821"
                        value={enteredOtp}
                        onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-36 text-center tracking-widest text-lg font-mono font-bold px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-xs text-slate-300">
                        {enteredOtp.length === 4 ? <CheckCircle2 className="w-5 h-5 text-emerald-400 inline" /> : 'Awaiting SMS verification...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!otpSent || submitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-500 hover:opacity-95 text-white font-black text-xs shadow-xl shadow-sky-500/25 flex items-center gap-2 transition disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Report &amp; Track Status
                </button>
              </div>

            </form>
          ) : null}

        </div>

      </div>
    </div>
  );
};
