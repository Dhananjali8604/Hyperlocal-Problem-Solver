import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Building2, Globe, MapPin, Phone, AlertCircle, CheckCircle2, Mail, Lock } from 'lucide-react';
import { UserRole, LanguageCode, LANGUAGES, User as UserType } from '../types';

interface OnboardingModalProps {
  onComplete: (user: UserType) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'lang_role' | 'details'>('lang_role');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [role, setRole] = useState<UserRole>('citizen');

  // Auth Mode for Citizens
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Form Details
  const [name, setName] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [state, setState] = useState('Karnataka');
  const [officialCode, setOfficialCode] = useState('');

  // Authority Verification State
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Load existing users to simulate DB for login
  const [existingUsers, setExistingUsers] = useState<UserType[]>([]);
  useEffect(() => {
    const savedUsers = localStorage.getItem('pact_all_users');
    if (savedUsers) {
      setExistingUsers(JSON.parse(savedUsers));
    }
  }, []);

  const handleNext = () => {
    setStep('details');
  };

  const handleForgotPassword = () => {
    if (!email) {
      setAuthError('Please enter your registered email address first.');
      return;
    }
    const user = existingUsers.find(u => u.email === email && u.role === 'citizen');
    if (user) {
      alert(`Simulation: A password recovery email has been sent to ${email}.\nYour 4-digit PIN is: ${user.password}`);
      setForgotPasswordMode(false);
      setAuthError(null);
    } else {
      setAuthError('No citizen account found with this email.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (role === 'authority') {
      if (!name.trim() || !pincode.trim() || pincode.length < 6) {
        setAuthError('Please enter a valid Name and 6-digit PIN Code.');
        return;
      }
      setVerifying(true);
      
      // Simulate verification of government urban affairs office
      setTimeout(() => {
        setVerifying(false);
        const cleanCode = officialCode.trim().toUpperCase();
        if (!cleanCode.startsWith('GOV-') && !cleanCode.startsWith('MUNI-') && cleanCode !== '1234') {
          setAuthError('❌ Verification Declined: Entered credential is not recognized in Government Public & Urban Affairs Registry.');
          return;
        }

        const newUser: UserType = {
          id: `auth-${Date.now()}`,
          name: name.trim(),
          phone: phone.trim(),
          role: 'authority',
          pincode: pincode.trim(),
          district,
          state,
          authorityCode: cleanCode,
          language,
          badgesCount: 0,
        };
        onComplete(newUser);
      }, 1200);
      return;
    }

    // Citizen Login Flow
    if (authMode === 'login') {
      const user = existingUsers.find(u => u.email === email && u.role === 'citizen');
      if (!user) {
        setAuthError('No citizen account found with this email.');
        return;
      }
      if (user.password !== password) {
        setAuthError('Incorrect 4-digit PIN.');
        return;
      }
      onComplete(user);
      return;
    }

    // Citizen Register Flow
    if (!name.trim() || !pincode.trim() || pincode.length < 6 || !email.trim() || password.length !== 4) {
      setAuthError('Please fill all fields correctly. PIN must be 6 digits and password 4 digits.');
      return;
    }
    
    if (existingUsers.some(u => u.email === email)) {
      setAuthError('An account with this email already exists.');
      return;
    }

    const newUser: UserType = {
      id: `citizen-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: password,
      role: 'citizen',
      pincode: pincode.trim(),
      language,
      badgesCount: 1, // Start with 1 welcome badge
    };

    // Save to simulated DB
    localStorage.setItem('pact_all_users', JSON.stringify([...existingUsers, newUser]));
    onComplete(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061828]/85 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-xl glass-box overflow-hidden p-6 sm:p-8 text-white relative shadow-2xl shadow-emerald-900/50">
        
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-500 mb-3 shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="w-8 h-8 text-[#0a1f33]" />
          </div>
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-sky-200 via-white to-emerald-200 bg-clip-text text-transparent">
            Welcome to PACT
          </h2>
          <p className="text-xs font-semibold text-emerald-300/90 tracking-widest uppercase mt-1">
            Promised Action • Hyperlocal Civic Hub
          </p>
        </div>

        {step === 'lang_role' ? (
          <div className="space-y-6 relative z-10">
            {/* Language Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-2 flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-sky-300" />
                <span>1. Select Preferred Language / भाषा चुनें</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      language === l.code
                        ? 'bg-gradient-to-r from-sky-500/30 to-emerald-500/30 border-sky-400 text-white shadow-md font-bold'
                        : 'bg-white/5 border-white/10 text-sky-100 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs">{l.name}</span>
                    <span className="text-[11px] text-emerald-300 font-mono mt-0.5">{l.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-2 mt-4">
                2. Are you logging in as Citizen or Authority?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`p-4 rounded-2xl border text-center transition flex flex-col items-center space-y-2 ${
                    role === 'citizen'
                      ? 'bg-gradient-to-b from-sky-500/30 to-emerald-500/30 border-sky-400 text-white shadow-xl ring-2 ring-sky-400/50'
                      : 'bg-white/5 border-white/10 text-sky-100/80 hover:bg-white/10'
                  }`}
                >
                  <User className="w-8 h-8 text-sky-300" />
                  <div>
                    <p className="font-bold text-sm">Citizen / Person</p>
                    <p className="text-[10px] text-sky-200/70 mt-0.5">Report civic issues & earn badges</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('authority')}
                  className={`p-4 rounded-2xl border text-center transition flex flex-col items-center space-y-2 ${
                    role === 'authority'
                      ? 'bg-gradient-to-b from-amber-500/30 to-emerald-500/30 border-amber-400 text-white shadow-xl ring-2 ring-amber-400/50'
                      : 'bg-white/5 border-white/10 text-sky-100/80 hover:bg-white/10'
                  }`}
                >
                  <Building2 className="w-8 h-8 text-amber-300" />
                  <div>
                    <p className="font-bold text-sm">Municipal Authority</p>
                    <p className="text-[10px] text-amber-200/70 mt-0.5">Govt Urban Affairs Office Login</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-500 text-[#0c2a4d] font-black text-sm uppercase tracking-wider shadow-xl hover:brightness-110 active:scale-[0.99] transition"
            >
              Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="flex items-center justify-between pb-2 border-b border-white/15">
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                {role === 'citizen' ? '👤 Citizen Access' : '🏛️ Municipal Office Credentials'}
              </span>
              <button
                type="button"
                onClick={() => setStep('lang_role')}
                className="text-xs text-emerald-300 hover:underline font-semibold"
              >
                Change Role/Lang
              </button>
            </div>

            {role === 'citizen' && (
              <div className="flex space-x-2 bg-white/5 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); setForgotPasswordMode(false); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${authMode === 'login' ? 'bg-sky-500/40 text-white' : 'text-sky-200/70 hover:text-white'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); setForgotPasswordMode(false); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${authMode === 'register' ? 'bg-emerald-500/40 text-white' : 'text-emerald-200/70 hover:text-white'}`}
                >
                  New Profile
                </button>
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs flex items-start space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Authority Form */}
            {role === 'authority' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-sky-200 mb-1">Official Authority Name & Designation *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. BBMP Div 4" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center space-x-1"><MapPin className="w-3.5 h-3.5" /><span>Area PIN Code *</span></label>
                    <input type="text" required maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 560038" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center space-x-1"><Phone className="w-3.5 h-3.5" /><span>Phone Number *</span></label>
                    <input type="text" required maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 9876543210" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1">District</label>
                    <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1">State</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center justify-between">
                    <span>Govt Office Verification Code *</span><span className="text-[10px] text-sky-200/80 font-normal">e.g. GOV-BLR-2026</span>
                  </label>
                  <input type="text" required value={officialCode} onChange={(e) => setOfficialCode(e.target.value)} placeholder="Enter Govt Urban Affairs Credential" className="w-full px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-200 placeholder-amber-200/40 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
                </div>
              </>
            )}

            {/* Citizen Form - Register */}
            {role === 'citizen' && authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-sky-200 mb-1">Full Name / पूरा नाम *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aarav Sharma" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center space-x-1"><Mail className="w-3.5 h-3.5 text-sky-300" /><span>Email *</span></label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center space-x-1"><Lock className="w-3.5 h-3.5 text-emerald-300" /><span>4-Digit PIN *</span></label>
                    <input type="password" required maxLength={4} value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))} placeholder="1234" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center space-x-1"><MapPin className="w-3.5 h-3.5 text-sky-300" /><span>Area PIN Code *</span></label>
                    <input type="text" required maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} placeholder="560038" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center space-x-1"><Phone className="w-3.5 h-3.5 text-emerald-300" /><span>Phone (Opt)</span></label>
                    <input type="text" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="9876543210" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                  </div>
                </div>
              </>
            )}

            {/* Citizen Form - Login */}
            {role === 'citizen' && authMode === 'login' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center space-x-1"><Mail className="w-3.5 h-3.5 text-sky-300" /><span>Email</span></label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter registered email" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                </div>
                {!forgotPasswordMode ? (
                  <div>
                    <label className="block text-xs font-bold text-sky-200 mb-1 flex items-center justify-between">
                      <div className="flex items-center space-x-1"><Lock className="w-3.5 h-3.5 text-emerald-300" /><span>4-Digit PIN</span></div>
                      <button type="button" onClick={() => setForgotPasswordMode(true)} className="text-[10px] text-amber-300 hover:underline">Forgot PIN?</button>
                    </label>
                    <input type="password" required maxLength={4} value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))} placeholder="****" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-sky-200/50 text-xl text-center font-mono tracking-[1em] focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-center space-y-3">
                    <p className="text-xs text-amber-200">Enter your email above and click below to receive your 4-digit PIN.</p>
                    <button type="button" onClick={handleForgotPassword} className="w-full py-2 bg-amber-500/30 border border-amber-500/50 rounded-lg text-xs font-bold text-white hover:bg-amber-500/50 transition">
                      Email me my PIN
                    </button>
                    <button type="button" onClick={() => setForgotPasswordMode(false)} className="text-[10px] text-sky-200 hover:underline mt-2">Back to Login</button>
                  </div>
                )}
              </>
            )}

            {!forgotPasswordMode && (
              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 text-[#0c2a4d] font-black text-sm uppercase tracking-wider shadow-2xl hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center space-x-2 mt-6 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0c2a4d] border-t-transparent rounded-full animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{authMode === 'login' && role === 'citizen' ? 'Access Profile' : 'Complete Onboarding'}</span>
                  </>
                )}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
