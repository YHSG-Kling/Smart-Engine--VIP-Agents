
import React, { useState } from 'react';
import { Bot, BrainCircuit, Lock, Mail, ArrowRight, Loader2, ShieldCheck, User, Building, Home, Key, Plane, TrendingUp, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginPageProps {
  onLogin: (role: UserRole, email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'magic'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Test Credentials
  const testAccounts = [
    { role: UserRole.BROKER, email: 'broker@nexus.com', label: 'Broker / Admin', icon: Building, color: 'bg-indigo-600' },
    { role: UserRole.AGENT, email: 'sarah@nexus.com', label: 'Top Agent', icon: User, color: 'bg-emerald-600' },
    { role: UserRole.BUYER, email: 'buyer@gmail.com', label: 'First-Time Buyer', icon: Home, color: 'bg-blue-600' },
    { role: UserRole.SELLER, email: 'seller@gmail.com', label: 'Home Seller', icon: Key, color: 'bg-orange-600' },
    { role: UserRole.BUYER, email: 'investor@nexus.com', label: 'Investor', icon: TrendingUp, color: 'bg-purple-600' },
    { role: UserRole.BUYER, email: 'relo@nexus.com', label: 'Relocation', icon: Plane, color: 'bg-teal-600' },
  ];

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      // Determine role based on email for demo purposes, fallback to AGENT
      const matchedAccount = testAccounts.find(acc => acc.email === email);
      const matchedRole = matchedAccount?.role || UserRole.AGENT;
      onLogin(matchedRole, email);
    }, 1000);
  };

  const handleRequestMagicLink = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      // Workflow 132 Whitelist Check
      await new Promise(r => setTimeout(r, 1200));
      setIsLoading(false);
      setMagicLinkSent(true);
  };

  const fillAndLogin = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    // Determine role immediately for smoother UX in demo
    setIsLoading(true);
    setTimeout(() => {
        onLogin(role, demoEmail);
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-xl shadow-lg mb-4">
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase italic">
          VIP AGENTS SMART ENGINE
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          The Intelligent Operating System for Real Estate
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-slate-100 transition-all">
          
          {magicLinkSent ? (
              <div className="text-center py-8 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
                      <CheckCircle2 size={32}/>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Check your Inbox.</h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                      If your email is in our Whitelist, you will receive a personalized onboarding link in 30 seconds.
                  </p>
                  <button onClick={() => setMagicLinkSent(false)} className="mt-8 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Return to Login</button>
              </div>
          ) : (
            <>
              {/* Login Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                <button onClick={() => setLoginMode('password')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginMode === 'password' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Standard</button>
                <button onClick={() => setLoginMode('magic')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginMode === 'magic' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>Magic Link</button>
              </div>

              {loginMode === 'password' ? (
                  <>
                    {/* Quick Login Section */}
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">
                        ⚡️ Select Persona to Test
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                        {testAccounts.map((acc) => {
                            const Icon = acc.icon;
                            return (
                            <button
                                key={acc.email}
                                onClick={() => fillAndLogin(acc.role, acc.email)}
                                disabled={isLoading}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`p-2 rounded-full mb-2 text-white ${acc.color} group-hover:scale-110 transition-transform`}>
                                <Icon size={16} />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{acc.label}</span>
                            </button>
                            );
                        })}
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email address
                        </label>
                        <div className="mt-1 relative">
                            <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-3 pl-10 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            placeholder="name@brokerage.com"
                            />
                            <Mail className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                        </div>
                        </div>

                        <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="mt-1 relative">
                            <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-3 pl-10 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                        </div>
                        </div>

                        <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                            <span className="flex items-center gap-2">
                                Sign In <ArrowRight size={16} />
                            </span>
                            )}
                        </button>
                        </div>
                    </form>
                  </>
              ) : (
                  <form className="space-y-6 animate-fade-in" onSubmit={handleRequestMagicLink}>
                      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Bot className="text-indigo-600" size={20}/>
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Portal Access Only</h4>
                        </div>
                        <p className="text-xs text-indigo-700 font-medium leading-relaxed italic">
                            Clients and Vendors must be invited by their Agent to enter. Enter your whitelisted email to receive a Magic Link.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Verify Email</label>
                        <div className="relative">
                            <input 
                                required
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="CLIENT_EMAIL@GMAIL.COM"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 border-b-4 border-indigo-600"
                      >
                          {isLoading ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
                          Request Secure Entry
                      </button>
                  </form>
              )}
            </>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" /> 
            <span>Secure System • Workflow 132 Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
