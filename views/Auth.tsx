
import React, { useState, useEffect } from 'react';
import { 
    Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, 
    ArrowRight, Loader2, Sparkles, Globe, ShieldCheck, Smartphone
} from 'lucide-react';
import { APP_NAME } from '../constants';
import { useAuth } from '../AuthContext';

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT';

const Auth: React.FC = () => {
    const { login, register, loginWithGoogle, loginWithFacebook, forgotPassword, isLoading, error, clearError } = useAuth();
    const [mode, setMode] = useState<AuthMode>('LOGIN');
    
    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    
    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    // Reset state on mode change
    useEffect(() => {
        clearError();
        setSuccessMsg('');
        // We keep email populated for UX if switching modes
        setPassword('');
        setConfirmPassword('');
    }, [mode]);

    // --- Helpers ---

    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score; // 0-4
    };

    const strength = getPasswordStrength(password);
    const strengthColor = strength < 2 ? 'bg-red-500' : strength < 3 ? 'bg-yellow-500' : 'bg-green-500';
    const strengthLabel = strength < 2 ? 'Weak' : strength < 3 ? 'Medium' : 'Strong';

    const validateForm = () => {
        if (!email.includes('@')) {
            alert("Please enter a valid email.");
            return false;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return false;
        }
        if (mode === 'REGISTER') {
            if (!name.trim()) {
                alert("Please enter your name.");
                return false;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return false;
            }
            if (!termsAccepted) {
                alert("You must accept the terms to register.");
                return false;
            }
        }
        return true;
    };

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        if (mode === 'LOGIN') {
            await login(email, password);
        } else if (mode === 'REGISTER') {
            await register(name, email, password);
        } else if (mode === 'FORGOT') {
            if (!email) return;
            await forgotPassword(email);
            setSuccessMsg(`If an account exists for ${email}, a recovery link has been sent.`);
            setTimeout(() => setMode('LOGIN'), 5000);
        }
    };

    // --- Google / Facebook Icons (Inline SVG for quality) ---
    const GoogleIcon = () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );

    const FacebookIcon = () => (
        <svg className="w-5 h-5 text-blue-600 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );

    return (
        <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Auth Card */}
            <div className="w-full max-w-[420px] bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative z-10 animate-scale-up">
                
                {/* Header */}
                <div className="pt-10 pb-6 px-8 text-center">
                    <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-xl mx-auto flex items-center justify-center shadow-lg mb-4">
                        <span className="text-white font-black text-2xl">V</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                        {mode === 'LOGIN' && 'Welcome Back'}
                        {mode === 'REGISTER' && `Join ${APP_NAME}`}
                        {mode === 'FORGOT' && 'Reset Password'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mode === 'LOGIN' && 'Enter your credentials to access your account.'}
                        {mode === 'REGISTER' && 'Create your account to start your journey.'}
                        {mode === 'FORGOT' && 'Enter your email to receive recovery instructions.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAction} className="px-8 pb-8 space-y-4">
                    
                    {/* Error / Success Messages */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 flex items-start space-x-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 flex items-start space-x-3 animate-fade-in">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">{successMsg}</p>
                        </div>
                    )}

                    {/* Name Input (Register Only) */}
                    {mode === 'REGISTER' && (
                        <div className="space-y-1 animate-slide-up">
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                                    placeholder="Alex Rivera"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-gray-500 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input 
                                type="email" 
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    {mode !== 'FORGOT' && (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">Password</label>
                                {mode === 'LOGIN' && (
                                    <button 
                                        type="button"
                                        onClick={() => setMode('FORGOT')}
                                        className="text-xs font-bold text-primary-600 hover:text-primary-700"
                                        disabled={isLoading}
                                    >
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            
                            {/* Password Strength Meter (Register) */}
                            {mode === 'REGISTER' && password && (
                                <div className="pt-2 animate-fade-in">
                                    <div className="flex space-x-1 h-1 mb-1">
                                        <div className={`flex-1 rounded-full ${strength >= 1 ? strengthColor : 'bg-gray-200 dark:bg-white/10'}`} />
                                        <div className={`flex-1 rounded-full ${strength >= 2 ? strengthColor : 'bg-gray-200 dark:bg-white/10'}`} />
                                        <div className={`flex-1 rounded-full ${strength >= 3 ? strengthColor : 'bg-gray-200 dark:bg-white/10'}`} />
                                        <div className={`flex-1 rounded-full ${strength >= 4 ? strengthColor : 'bg-gray-200 dark:bg-white/10'}`} />
                                    </div>
                                    <p className={`text-[10px] font-bold text-right ${strengthColor.replace('bg-', 'text-')}`}>{strengthLabel}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Confirm Password (Register) */}
                    {mode === 'REGISTER' && (
                        <div className="space-y-1 animate-slide-up">
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input 
                                    type="password" 
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    )}

                    {/* Terms Checkbox (Register) */}
                    {mode === 'REGISTER' && (
                        <div className="flex items-center space-x-2 pt-2 animate-fade-in">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={termsAccepted}
                                onChange={e => setTermsAccepted(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                disabled={isLoading}
                            />
                            <label htmlFor="terms" className="text-xs text-gray-500">
                                I agree to the <a href="#" className="text-primary-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 font-bold hover:underline">Privacy Policy</a>.
                            </label>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading || (mode === 'REGISTER' && !termsAccepted)}
                        className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Wait...</span>
                            </>
                        ) : (
                            <>
                                <span>
                                    {mode === 'LOGIN' && 'Sign In'}
                                    {mode === 'REGISTER' && 'Create Account'}
                                    {mode === 'FORGOT' && 'Send Link'}
                                </span>
                                {mode !== 'FORGOT' && <ArrowRight className="w-5 h-5" />}
                            </>
                        )}
                    </button>

                    {/* Social Login Separator */}
                    {mode !== 'FORGOT' && (
                        <div className="py-4 flex items-center justify-between space-x-2">
                            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                            <span className="text-[10px] uppercase font-bold text-gray-400">Or continue with</span>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                        </div>
                    )}

                    {/* Social Buttons */}
                    {mode !== 'FORGOT' && (
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                type="button"
                                onClick={loginWithGoogle}
                                disabled={isLoading}
                                className="flex items-center justify-center space-x-2 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition shadow-sm disabled:opacity-50"
                            >
                                <GoogleIcon />
                                <span className="text-sm font-bold text-gray-700 dark:text-white">Google</span>
                            </button>
                            <button 
                                type="button"
                                onClick={loginWithFacebook}
                                disabled={isLoading}
                                className="flex items-center justify-center space-x-2 py-3 bg-[#1877F2]/10 border border-[#1877F2]/20 rounded-xl hover:bg-[#1877F2]/20 transition shadow-sm disabled:opacity-50"
                            >
                                <FacebookIcon />
                                <span className="text-sm font-bold text-[#1877F2]">Facebook</span>
                            </button>
                        </div>
                    )}

                    {/* Toggle Mode */}
                    <div className="pt-4 text-center">
                        <p className="text-sm text-gray-500">
                            {mode === 'LOGIN' ? "Don't have an account? " : mode === 'REGISTER' ? "Already have an account? " : "Remembered your password? "}
                            <button 
                                type="button"
                                onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                                className="text-primary-600 font-bold hover:underline"
                                disabled={isLoading}
                            >
                                {mode === 'LOGIN' ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
            
            <div className="absolute bottom-4 text-xs text-gray-400 font-medium">
                © 2024 {APP_NAME}. Secure & Encrypted.
            </div>
        </div>
    );
};

export default Auth;
