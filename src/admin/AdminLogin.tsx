import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/authApi';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Admin Access | Zanzirangi House Sanctuary';
    // Ensure noindex, nofollow is active
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your authorized email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await authApi.login(email, password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleSelectQuickMail = (selected: string) => {
    setEmail(selected);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#141413] text-[#FAF8F5] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans">
      {/* Background ambient luxury glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#B8966C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#C4A27A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#141413] border border-[#C4A27A]/30 flex items-center justify-center text-[#C4A27A] shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#C4A27A] block mb-1">
            ZANZIRANGI HOUSE SANCTUARY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#FAF8F5] tracking-wide">
            Administrative Portal
          </h1>
          <p className="text-xs text-[#A39F98] mt-2 max-w-xs mx-auto leading-relaxed">
            Authorized management console for live website content and property operations.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 rounded-lg flex items-start space-x-3 text-red-200 text-xs animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] block">
              Authorized Business Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8E8B85] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                id="admin-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@zanzirangihouse.com"
                required
                autoComplete="email"
                className="w-full bg-[#141413] border border-[#2C2B28] focus:border-[#C4A27A] focus:ring-1 focus:ring-[#C4A27A] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#FAF8F5] placeholder-[#66645E] transition-all outline-none"
              />
            </div>

            {/* Quick selector pill helper for registered mailboxes */}
            <div className="pt-1 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-[#8E8B85]">Quick:</span>
              {['info@zanzirangihouse.com', 'dominic@zanzirangihouse.com'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => handleSelectQuickMail(m)}
                  className="text-[10px] font-mono text-[#C4A27A] hover:underline bg-[#141413] border border-[#2C2B28] px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  {m.split('@')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#D8CCB8] block">
              Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8E8B85] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-[#141413] border border-[#2C2B28] focus:border-[#C4A27A] focus:ring-1 focus:ring-[#C4A27A] rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#FAF8F5] placeholder-[#66645E] transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8B85] hover:text-[#FAF8F5] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            id="admin-login-submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#B8966C] hover:bg-[#C4A27A] disabled:opacity-50 text-[#141413] font-semibold text-xs tracking-[0.2em] uppercase rounded-lg transition-all shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center space-x-2">
                <span className="w-3.5 h-3.5 border-2 border-[#141413] border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Access CMS Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security watermark footer */}
        <div className="mt-8 pt-4 border-t border-[#2C2B28] text-center text-[10px] text-[#6B6862] font-mono">
          <span>Protected Area • Hostinger Encrypted Session • 256-Bit TLS</span>
        </div>
      </div>
    </div>
  );
};
