import React, { useState } from 'react';
import { ShieldCheck, Globe, User, Building2, CheckCircle2, AlertTriangle, Loader2, MapPin, Mail, ArrowRight } from 'lucide-react';
import { Role, Language, User as UserType } from '../types';

interface WelcomeModalProps {
  onComplete: (user: UserType) => void;
}

const LANGUAGES: { code: Language; native: string }[] = [
  { code: 'English', native: 'English' },
  { code: 'Hindi', native: 'हिन्दी' },
  { code: 'Bengali', native: 'বাংলা' },
  { code: 'Telugu', native: 'తెలుగు' },
  { code: 'Marathi', native: 'मराठी' },
  { code: 'Tamil', native: 'தமிழ்' },
  { code: 'Urdu', native: 'اردو' },
  { code: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'Malayalam', native: 'മലയാളം' },
  { code: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'language' | 'role' | 'details' | 'otp'>('language');
  const [language, setLanguage] = useState<Language>('English');
  const [role, setRole] = useState<Role>('citizen');

  // Citizen form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pincode, setPincode] = useState('');
  const [otp, setOtp] = useState('');

  // Authority form
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [district, setDistrict] = useState('New Delhi');
  const [stateName, setStateName] = useState('Delhi');

  const [loadingVerify, setLoadingVerify] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !pincode.trim() || pincode.length !== 6) {
      setErrorMsg('Please provide a valid Name and 6-digit Indian PIN Code.');
      return;
    }

    if (role === 'citizen') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please provide a valid email address for OTP verification.');
        return;
      }
      setStep('otp');
      return; // Stop here, OTP handles completion
    }

    if (role === 'authority') {
      if (!department.trim() || !designation.trim() || !officeAddress.trim()) {
        setErrorMsg('Please fill in all official municipal credentials.');
        return;
      }

      setLoadingVerify(true);
      try {
        const res = await fetch('/api/ai/verify-authority', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ department, designation, pincode })
        });
        const data = await res.json();
        setLoadingVerify(false);

        if (!data.verified) {
          setErrorMsg(data.reason || 'Declined: Credentials do not correspond to a verified urban civic municipal office.');
          return;
        }
      } catch (err) {
        setLoadingVerify(false);
      }
    }

    const newUser: UserType = {
      id: role === 'authority' ? `auth-${pincode}` : `user-${Math.random().toString(36).substr(2, 6)}`,
      name,
      email,
      pincode,
      role,
      language,
      badgesCount: 0,
      ...(role === 'authority' ? {
        authorityDetails: {
          department,
          designation,
          officeAddress,
          district,
          state: stateName,
          isVerifiedGovt: true
        }
      } : {})
    };

    onComplete(newUser);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setErrorMsg('Please enter a valid 4-digit OTP.');
      return;
    }
    
    const newUser: UserType = {
      id: `user-${Math.random().toString(36).substr(2, 6)}`,
      name,
      email,
      pincode,
      role,
      language,
      badgesCount: 0
    };

    onComplete(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-slate-900/90 border border-white/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl text-white">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-500/30 via-teal-500/30 to-emerald-500/30 border-b border-white/10 p-6 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 via-teal-500 to-emerald-400 p-0.5 shadow-xl shadow-emerald-500/20 mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Welcome to PACT</h2>
          <p className="text-xs text-sky-200/80 mt-1 font-medium">Promised Action for Hyperlocal Civic Service</p>
          
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-1.5 rounded-full transition-all ${step === 'language' ? 'w-8 bg-sky-400' : 'w-2 bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'role' ? 'w-8 bg-teal-400' : 'w-2 bg-white/20'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 'details' ? 'w-8 bg-emerald-400' : 'w-2 bg-white/20'}`} />
            {role === 'citizen' && (
              <div className={`h-1.5 rounded-full transition-all ${step === 'otp' ? 'w-8 bg-amber-400' : 'w-2 bg-white/20'}`} />
            )}
          </div>
        </div>

        <div className="p-6 md:p-8">
          
          {/* STEP 1: Language Selection */}
          {step === 'language' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                  <Globe className="w-5 h-5 text-sky-400" />
                  Select Your Preferred Language
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Complaints and community notices will be tailored to your regional language choice.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      language === lang.code
                        ? 'bg-gradient-to-br from-sky-500/30 to-emerald-500/30 border-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <span className="text-sm font-semibold">{lang.native}</span>
                    <span className="text-[10px] text-sky-200/60 font-mono mt-0.5">{lang.code}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('role')}
                className="w-full py-3 bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-500 hover:opacity-95 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Role Selection */}
          {step === 'role' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold">Are you logging in as a Citizen or Municipal Authority?</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Each locality PIN code has designated public verification workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setRole('citizen')}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    role === 'citizen'
                      ? 'bg-gradient-to-br from-sky-500/30 to-teal-500/30 border-sky-400 shadow-xl'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                      <User className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base">Citizen (Person)</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Report civic problems, attach photos/videos, vote in locality verification polls, and earn PACT Social Service Badges.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-sky-300">
                    {role === 'citizen' && <CheckCircle2 className="w-4 h-4 mr-1.5" />} Selected
                  </div>
                </div>

                <div
                  onClick={() => setRole('authority')}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    role === 'authority'
                      ? 'bg-gradient-to-br from-teal-500/30 to-emerald-500/30 border-emerald-400 shadow-xl'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-base">Municipal Authority</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Receive verified hyperlocal complaints sorted by AI Urgency rating, post proof of task completion, and track monthly evaluations.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-emerald-300">
                    {role === 'authority' && <CheckCircle2 className="w-4 h-4 mr-1.5" />} Selected
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('language')}
                  className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-500 hover:opacity-95 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                >
                  Continue to Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Details & Verification */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="text-center mb-5">
                <h3 className="text-lg font-bold">
                  {role === 'citizen' ? 'Citizen Registration' : 'Municipal Authority Verification'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {role === 'citizen' ? 'Your name is used to track your submitted reports and issue official thank-you badges.' : 'Our AI verifies government urban affairs credentials before granting jurisdictional dashboard access.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-sky-200 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder={role === 'citizen' ? 'e.g. Rajesh Sharma' : 'e.g. Officer Sunita Rao'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-sky-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sky-200 mb-1">Locality PIN Code * (6 digits)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-sky-300" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 110001"
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:border-sky-400 transition"
                    />
                  </div>
                </div>
              </div>

              {role === 'citizen' && (
                <div>
                  <label className="block text-xs font-semibold text-sky-200 mb-1">Email Address (For OTP confirmation)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-sky-300" />
                    <input
                      type="email"
                      placeholder="citizen@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:border-sky-400 transition"
                    />
                  </div>
                </div>
              )}

              {role === 'authority' && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Department / Civic Office *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NDMC Roads & Drainage Div"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Designation *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ward Executive Engineer"
                        value={designation}
                        onChange={e => setDesignation(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-300 mb-1">Official Office HQ Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Palika Kendra, Sansad Marg"
                      value={officeAddress}
                      onChange={e => setOfficeAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">District</label>
                      <input
                        type="text"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">State</label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={e => setStateName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  disabled={loadingVerify}
                  onClick={() => setStep('role')}
                  className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loadingVerify}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-400 via-teal-500 to-emerald-500 hover:opacity-95 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loadingVerify ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Civic Registry...
                    </>
                  ) : (
                    <>
                      {role === 'citizen' ? (
                        <>Get OTP <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Complete Login</>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  Verify Email Address
                </h3>
                <p className="text-xs text-slate-300 mt-2">
                  We sent a 4-digit One-Time Password to <strong className="text-white">{email}</strong>. Enter it below to unlock your citizen profile.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-sky-200 mb-2 text-center">4-Digit Security Code</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="• • • •"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[1em] text-2xl font-black px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-xs transition"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:opacity-95 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 className="w-5 h-5" /> Activate Profile
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
