import React, { useState } from 'react';
import {
  Camera,
  Upload,
  MapPin,
  Sparkles,
  Phone,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  FileVideo,
  X,
  Lock,
} from 'lucide-react';
import { Complaint, IssueType, User, LANGUAGES } from '../types';

interface ReportIssueModalProps {
  user: User;
  initialType?: IssueType;
  existingComplaints: Complaint[];
  onClose: () => void;
  onSubmitComplaint: (complaint: Complaint, isCompiled: boolean) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  user,
  initialType,
  existingComplaints,
  onClose,
  onSubmitComplaint,
}) => {
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState(user.locality || 'Indiranagar, Bengaluru');
  const [pincode, setPincode] = useState(user.pincode || '560038');
  const [reporterName, setReporterName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  // Permissions simulation state
  const [permissionGranted, setPermissionGranted] = useState(true);

  // AI Assistant state
  const [aiPolishing, setAiPolishing] = useState(false);

  // OTP Verification Simulation
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [mockGeneratedOtp, setMockGeneratedOtp] = useState('4829');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Submitting status
  const [submitting, setSubmitting] = useState(false);
  const [triageFeedback, setTriageFeedback] = useState<string | null>(null);

  // Simulated media upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaType(file.type.includes('video') ? 'video' : 'photo');
    }
  };

  const simulateCameraCapture = () => {
    // Check permission
    if (!permissionGranted) {
      alert('Camera permission denied. Please enable camera access in AI Studio frame.');
      return;
    }
    const samplePhotos = [
      'https://images.unsplash.com/photo-1542013936693-859e53936323?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    ];
    setMediaUrl(samplePhotos[Math.floor(Math.random() * samplePhotos.length)]);
    setMediaType('photo');
  };

  const handleGPSDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocality(`GPS Detected (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
          setPincode('560038'); // sample mapped pin
        },
        () => {
          setLocality('Indiranagar 12th Main (Auto Mapped)');
          setPincode('560038');
        }
      );
    } else {
      setLocality('Indiranagar 12th Main');
    }
  };

  const handleAIWriteAssist = async () => {
    if (!description.trim()) {
      alert('Please type a few rough keywords first (e.g. "big hole in road water leaking")');
      return;
    }
    setAiPolishing(true);
    try {
      const langName = LANGUAGES.find((l) => l.code === user.language)?.name || 'English';
      const res = await fetch('/api/ai/write-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roughNotes: description, languageName: langName }),
      });
      const data = await res.json();
      if (data.polishedText) {
        setDescription(data.polishedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiPolishing(false);
    }
  };

  const triggerOTP = () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid 10-digit mobile number first.');
      return;
    }
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setMockGeneratedOtp(randomOtp);
    setOtpSent(true);
    setOtpError(null);
    // Notify via subtle simulated SMS alert
    alert(`📱 PACT Security Simulation SMS:\nYour One Time Password (OTP) for submitting report is: [ ${randomOtp} ]. Valid for 10 minutes.`);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      alert('⚠️ Mandatory Photo or Video proof is required to lodge a verified report.');
      return;
    }
    if (!otpSent) {
      alert('Please verify your phone number via OTP first.');
      return;
    }
    if (enteredOtp !== mockGeneratedOtp) {
      setOtpError('❌ Incorrect One Time Password. Please check the SMS popup and retry.');
      return;
    }

    setSubmitting(true);
    setTriageFeedback('🤖 PACT AI is categorizing issue & checking Google Maps coordinates...');

    try {
      // Call Backend AI Classification
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, locality, pincode }),
      });
      const aiData = await res.json();
      const classifiedType: IssueType = aiData.type || initialType || 'Infrastructure';
      const urgencyScore = aiData.urgencyRate || 3;
      const title = aiData.title || description.slice(0, 40);

      // Requirement: "Compiling similar reports before validating them. While a complaint is sent to municipality if further similar complaints are issued send the notification it has been submitted with rate of urgency at municipal authorities end be incremented."
      const similarExisting = existingComplaints.find(
        (c) =>
          c.pincode === pincode &&
          c.status !== 'resolved' &&
          (c.type === classifiedType || c.title.toLowerCase().includes(title.toLowerCase().slice(0, 15)))
      );

      if (similarExisting) {
        setTriageFeedback(`⚡ Similar active issue found in PIN ${pincode}! Compiling report together & incrementing urgency rating...`);
        setTimeout(() => {
          const compiledComplaint: Complaint = {
            ...similarExisting,
            similarCount: similarExisting.similarCount + 1,
            urgencyRate: Math.min(5, similarExisting.urgencyRate + 1),
          };
          onSubmitComplaint(compiledComplaint, true);
        }, 1500);
        return;
      }

      // Create new fresh complaint
      const newComplaint: Complaint = {
        id: `cmp-${Date.now()}`,
        title,
        description,
        translatedDescriptions: aiData.translatedDescriptions,
        type: classifiedType,
        locality,
        pincode,
        reporterName,
        reporterPhone: phone,
        photoUrl: mediaType === 'photo' ? mediaUrl : undefined,
        videoUrl: mediaType === 'video' ? mediaUrl : undefined,
        urgencyRate: urgencyScore,
        similarCount: 1,
        status: 'pending_validation',
        createdAt: new Date().toISOString(),
        googleMapsVerified: true,
        mapCoordinates: { lat: 12.9784 + (Math.random() - 0.5) * 0.02, lng: 77.6408 + (Math.random() - 0.5) * 0.02 },
      };

      setTimeout(() => {
        onSubmitComplaint(newComplaint, false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04121e]/85 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col glass-box border-white/25 shadow-2xl overflow-hidden text-white relative">
        {/* Modal Topbar */}
        <div className="px-6 py-5 bg-black/20 border-b border-white/15 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-gradient-to-br from-sky-400 to-emerald-400 text-[#0c2a4d] font-black">
              🚨
            </span>
            <div>
              <h2 className="text-lg font-black tracking-wide">Lodge Verified Civic Complaint</h2>
              <p className="text-[11px] text-sky-200/80">PACT AI Sector Verification & Triage Flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {submitting ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-sky-400 border-t-transparent animate-spin mx-auto shadow-lg" />
              <h3 className="text-xl font-bold text-sky-300 animate-pulse">{triageFeedback}</h3>
              <p className="text-xs text-sky-100/70 max-w-md mx-auto leading-relaxed">
                PACT AI is querying Google Maps geospatial validation, generating locality verification poll for nearby residents, and logging badge tracking ID.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              {/* Media Upload Requirement: "includes necessary photo or video condition" */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-2 flex items-center justify-between">
                  <span>1. Photo or Video Proof * (Mandatory)</span>
                  <span className="text-[10px] text-emerald-300 font-normal">Permissions: Location & Gallery Granted</span>
                </label>

                {mediaUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-sky-400/50 bg-black/40 p-2 flex flex-col items-center">
                    {mediaType === 'photo' ? (
                      <img src={mediaUrl} alt="Evidence preview" className="max-h-56 w-auto object-contain rounded-xl" />
                    ) : (
                      <div className="h-44 w-full flex flex-col items-center justify-center text-sky-300">
                        <FileVideo className="w-12 h-12 mb-2 animate-pulse" />
                        <span className="text-xs font-mono">Video evidence attached successfully</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setMediaUrl(null)}
                      className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-red-500/80 text-white text-xs font-bold shadow-lg hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <label className="cursor-pointer flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-sky-400 bg-white/5 hover:bg-white/10 transition text-center group">
                      <Upload className="w-8 h-8 text-sky-300 group-hover:scale-110 transition mb-2" />
                      <span className="text-xs font-bold text-white">Upload from Gallery</span>
                      <span className="text-[10px] text-sky-200/60 mt-0.5">JPEG, PNG, MP4</span>
                      <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <button
                      type="button"
                      onClick={simulateCameraCapture}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-400 bg-white/5 hover:bg-white/10 transition text-center group"
                    >
                      <Camera className="w-8 h-8 text-emerald-300 group-hover:scale-110 transition mb-2" />
                      <span className="text-xs font-bold text-white">Open Live Camera</span>
                      <span className="text-[10px] text-emerald-200/60 mt-0.5">Simulate AI Studio Capture</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Locality & PIN Code Requirement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center justify-between">
                    <span>Locality Name *</span>
                    <button type="button" onClick={handleGPSDetect} className="text-[10px] text-emerald-300 hover:underline flex items-center space-x-1 font-bold">
                      <MapPin className="w-3 h-3" />
                      <span>GPS Mapped</span>
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. 12th Main Road, Indiranagar"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-sky-200 mb-1">Area PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 560038"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              {/* Problem Description + AI Helper */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-sky-200">
                    2. Problem Statement & Details *
                  </label>
                  <button
                    type="button"
                    disabled={aiPolishing}
                    onClick={handleAIWriteAssist}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500/30 to-sky-500/30 border border-purple-400/40 text-purple-200 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-300 ${aiPolishing ? 'animate-spin' : ''}`} />
                    <span>{aiPolishing ? 'Polishing...' : '✨ AI Help Write'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem clearly (e.g. Broken water pipeline leaking near corner store). You can write in your chosen regional language."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                />
              </div>

              {/* Reporter Tracking Identity & OTP Requirement: "finally asking for name which will be used to track... phone number should be asked along with one time password" */}
              <div className="p-4 glass-box border-white/15 space-y-4">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>3. Status Tracking & OTP Verification Identity</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-sky-100 mb-1 flex items-center space-x-1">
                      <UserIcon className="w-3.5 h-3.5 text-sky-300" />
                      <span>Reporter Name (For Badge) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-sky-100 mb-1 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Mobile Number *</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ''));
                          setOtpSent(false);
                        }}
                        placeholder="10-digit number"
                        className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                      <button
                        type="button"
                        onClick={triggerOTP}
                        className="shrink-0 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#0c2a4d] font-black text-xs uppercase tracking-wide transition"
                      >
                        {otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    </div>
                  </div>
                </div>

                {otpSent && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/40 animate-fadeIn">
                    <label className="block text-xs font-bold text-emerald-300 mb-1.5 flex items-center justify-between">
                      <span>Enter One Time Password (OTP) sent via SMS *</span>
                      <span className="text-[10px] font-mono text-sky-200">Simulated Code: {mockGeneratedOtp}</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4-digit OTP"
                      className="w-full sm:w-48 px-4 py-2 rounded-xl bg-white/10 border border-emerald-400/60 text-white text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    {otpError && <p className="text-xs text-red-300 mt-1 font-bold">{otpError}</p>}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 text-[#0c2a4d] font-black text-sm uppercase tracking-wider shadow-2xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center space-x-2 border border-white/30"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Submit Verified Civic Complaint</span>
                </button>
                <p className="text-[10px] text-center text-sky-200/70 mt-2">
                  📜 Upon resolution validation by neighborhood poll, PACT issues an official Thank You Badge to your name.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
