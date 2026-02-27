import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, FileText, User, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OfflineAuthManager } from '../../utils/offlineAuth';

export default function LoginPage() {
    const { handleLogin, handleSignup, isLoading, isAuthenticated } = useAuth();
    const [isSignup, setIsSignup] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to where the user came from or to lectures if they are already logged in
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/lectures';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupName, setSignupName] = useState('');
    const [loginError, setLoginError] = useState('');
    const [signupError, setSignupError] = useState('');
    const [loading, setLoading] = useState(false);

    const sessionInfo = OfflineAuthManager.getSessionInfo();
    const hasOfflineSession = sessionInfo.hasCache;
    const isOffline = !sessionInfo.isOnline;

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);
        const result = await handleLogin(loginEmail, loginPassword);
        if (result.error) {
            setLoginError(result.error);
            setLoading(false);
        }
    };

    const onSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError('');
        setLoading(true);
        const result = await handleSignup(signupEmail, signupPassword, signupName);
        if (result.error) {
            setSignupError(result.error);
            setLoading(false);
        } else {
            setSignupEmail('');
            setSignupPassword('');
            setSignupName('');
            setIsSignup(false);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="auth-logo">
                    <div className="auth-logo-circle">
                        <FileText size={32} color="white" />
                    </div>
                </div>
                <h2>Lecture Management System</h2>
                <p>{isSignup ? 'Create your account' : 'Login to your account'}</p>

                {isOffline && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
                        <p className="text-orange-800 dark:text-orange-300 text-sm">
                            ⚠️ You are currently offline.
                            {hasOfflineSession ? (
                                <span className="block mt-1">Your previous session is still active. Please wait while we restore it...</span>
                            ) : (
                                <span className="block mt-1">Please connect to the internet to sign in.</span>
                            )}
                        </p>
                    </div>
                )}

                {isSignup ? (
                    <form onSubmit={onSignup}>
                        {signupError && <div className="error-message">{signupError}</div>}
                        <div className="form-group">
                            <label htmlFor="signupName">Full Name</label>
                            <div className="input-with-icon">
                                <User className="input-icon" size={18} />
                                <input type="text" id="signupName" value={signupName} onChange={(e) => setSignupName(e.target.value)} required className="input-field pl-10" placeholder="Enter your full name" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="signupEmail">Email</label>
                            <div className="input-with-icon">
                                <User className="input-icon" size={18} />
                                <input type="email" id="signupEmail" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required className="input-field pl-10" placeholder="Enter your email" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="signupPassword">Password</label>
                            <div className="input-with-icon">
                                <Lock className="input-icon" size={18} />
                                <input type="password" id="signupPassword" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required className="input-field pl-10" placeholder="Create a password" />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full" disabled={loading || isLoading}>
                            {loading ? <span className="loading-spinner"></span> : <><LogIn size={18} /> Sign Up</>}
                        </button>
                        <p className="text-center mt-4">
                            Already have an account?{' '}
                            <button type="button" onClick={() => { setIsSignup(false); setSignupError(''); }} className="text-primary-color hover:underline">Sign In</button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={onLogin}>
                        {loginError && <div className="error-message">{loginError}</div>}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-with-icon">
                                <User className="input-icon" size={18} />
                                <input type="email" id="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="input-field pl-10" placeholder="Enter your email" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <Lock className="input-icon" size={18} />
                                <input type="password" id="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="input-field pl-10" placeholder="Enter your password" />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full" disabled={loading || isLoading}>
                            {loading ? <span className="loading-spinner"></span> : <><LogIn size={18} /> Sign In</>}
                        </button>
                        <p className="text-center mt-4">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => { setIsSignup(true); setLoginError(''); }} className="text-primary-color hover:underline">Sign Up</button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
