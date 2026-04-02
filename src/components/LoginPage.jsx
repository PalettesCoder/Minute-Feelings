import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, User, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';

const LoginPage = ({ onLogin }) => {
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [step, setStep] = useState('choose'); // For signin: 'choose', 'entry', 'otp'. For signup: 'details', 'otp', 'hobbies'
    
    // Sign-in states
    const [identity, setIdentity] = useState('');
    const [loginType, setLoginType] = useState('phone');
    const [otp, setOtp] = useState('');
    
    // Sign-up states
    const [signupVerifyType, setSignupVerifyType] = useState('email'); // 'email' or 'phone'
    const [signupData, setSignupData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        gender: 'male',
        username: '',
        hobbies: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setStep(mode === 'signin' ? 'details' : 'choose');
        setError('');
    };

    const handleSendOtpSignin = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!identity || identity.length < 3) {
            setError('Please enter a valid email or phone number');
            return;
        }

        const isEmail = identity.includes('@');
        setLoading(true);
        setError('');
        try {
            const payload = isEmail ? { email: identity } : { phoneNumber: identity };
            await authService.sendOtp(payload);
            setStep('otp');
        } catch (err) {
            if (err.response && err.response.data === 'ACCOUNT_NOT_FOUND') {
                setError(
                    <span>
                        Account not found. <button onClick={() => setFormType('signup')} className="text-[#d4af37] underline font-bold cursor-pointer hover:text-white transition-colors duration-200">Create a new account?</button>
                    </span>
                );
            } else {
                setError('Failed to send code. Please check your details.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpSignin = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (otp.length < 4) {
            setError('Please enter the 4-digit code');
            return;
        }

        const isEmail = identity.includes('@');
        setLoading(true);
        setError('');
        try {
            const payload = isEmail 
                ? { email: identity, code: otp } 
                : { phoneNumber: identity, code: otp };
                
            const user = await authService.verifyOtp(payload);
            onLogin(user);
        } catch (err) {
            setError('Incorrect or expired verification code.');
        } finally {
            setLoading(false);
        }
    };


    const handleSignupDetails = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const { fullName, email, phoneNumber, username } = signupData;
        if (!fullName || !email || !phoneNumber || !username) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const payload = signupVerifyType === 'email' 
                ? { email: signupData.email, username: signupData.username } 
                : { phoneNumber: signupData.phoneNumber, username: signupData.username };
            await authService.sendOtp(payload);
            setStep('otp');
        } catch (err) {
            setError(err.response?.data || 'Failed to send verification code. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpSignup = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (otp.length < 4) {
            setError('Please enter the 4-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const payload = signupVerifyType === 'email' 
                ? { email: signupData.email, code: otp, fullName: signupData.fullName, username: signupData.username, gender: signupData.gender } 
                : { phoneNumber: signupData.phoneNumber, code: otp, fullName: signupData.fullName, username: signupData.username, gender: signupData.gender };
            const user = await authService.verifyOtp(payload);
            // Temporarily store the verified user base to update with hobbies later
            setSignupData({ ...signupData, id: user.id });
            setStep('hobbies');
        } catch (err) {
            setError('Incorrect or expired verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSignup = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        try {
            // Save hobbies to the backend
            const user = await authService.updateProfile({ 
                id: signupData.id, 
                hobbies: signupData.hobbies 
            });
            onLogin(user);
        } catch (err) {
            // Fallback: login anyway if update fails, but log error
            onLogin(signupData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen-v2">
            <div className="login-header-v2">
                <h1 className="login-logo-v2">scribbled library</h1>
            </div>

            <div className="login-main-v2">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="login-box-v2"
                >
                    <AnimatePresence mode="wait">
                        {/* SIGN IN FLOW */}
                        {mode === 'signin' ? (
                            <motion.div key="signin-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                                <AnimatePresence mode="wait">
                                    {step === 'choose' && (
                                        <motion.div key="signin-choose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <h2 className="login-title-v2">Sign in to Minute Feelings: The Scribbled Library</h2>
                                            <p className="login-desc-v2">
                                                Enter the library to continue your poetic journey.
                                            </p>
                                            <div className="login-buttons-v2">
                                                <button className="login-btn-v2 login-btn-mobile-v2" onClick={() => { setStep('entry'); setError(''); }}>
                                                    <Mail size={18} />
                                                    <span>Sign in to your account</span>
                                                </button>
                                                <div className="login-footer-links-v2">
                                                    New here? <span className="login-link-v2" onClick={toggleMode}>Create an account</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 'entry' && (
                                        <motion.div key="signin-entry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                            <h2 className="login-title-v2">Sign In</h2>
                                            <p className="login-desc-v2">Enter your email or phone to receive a code.</p>
                                            <div className="login-form-v2">
                                                <div className="login-input-group-v2">
                                                    <label>Email or Mobile</label>
                                                    <input 
                                                        type="text"
                                                        autoFocus
                                                        placeholder="email@example.com or +1234567890"
                                                        value={identity}
                                                        onChange={(e) => setIdentity(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSendOtpSignin(e)}
                                                        className="login-input-v2"
                                                    />
                                                </div>
                                                {error && <p className="login-error-v2">{error}</p>}
                                                <div className="login-form-actions-v2">
                                                    <button onClick={handleSendOtpSignin} className="login-btn-v2 login-btn-mobile-v2" disabled={loading}>
                                                        {loading ? 'Sending...' : 'Continue'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="login-other-ways-v2">
                                                <button className="login-other-link-v2" onClick={() => { setStep('choose'); setError(''); }}>Back</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 'otp' && (
                                        <motion.div key="signin-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                            <h2 className="login-title-v2">Verify Identity</h2>
                                            <p className="login-desc-v2">Code sent to {identity}</p>
                                            <div className="login-form-v2">
                                                <input 
                                                    type="text" autoFocus maxLength={4} placeholder="0 0 0 0" value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtpSignin(e)}
                                                    className="login-input-v2 text-center tracking-[1em] text-xl font-bold"
                                                />
                                                {error && <p className="login-error-v2">{error}</p>}
                                                <button onClick={handleVerifyOtpSignin} className="login-btn-v2 login-btn-mobile-v2" disabled={loading}>
                                                    {loading ? 'Verifying...' : 'Sign In'}
                                                </button>
                                                <div className="login-other-ways-v2 mt-4">
                                                    <button className="login-other-link-v2" onClick={() => { setStep('entry'); setError(''); setOtp(''); }}>
                                                        <ArrowLeft size={14} className="inline mr-1" />
                                                        Change email/phone
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            /* SIGN UP FLOW */
                            <motion.div key="signup-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                                <AnimatePresence mode="wait">
                                    {step === 'details' && (
                                        <motion.div key="signup-details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <h2 className="login-title-v2">Join the Library</h2>
                                            <p className="login-desc-v2">Create your reader profile to get started.</p>
                                            <div className="login-form-v2" style={{ maxWidth: '400px' }}>
                                                <div className="login-input-group-v2">
                                                    <label>Full Name</label>
                                                    <input type="text" placeholder="e.g. John Doe" value={signupData.fullName} onChange={(e) => setSignupData({...signupData, fullName: e.target.value})} className="login-input-v2" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 mt-2">
                                                    <div className="login-input-group-v2">
                                                        <label>Username</label>
                                                        <input type="text" placeholder="reader123" value={signupData.username} onChange={(e) => setSignupData({...signupData, username: e.target.value})} className="login-input-v2" />
                                                    </div>
                                                    <div className="login-input-group-v2">
                                                        <label>Gender</label>
                                                        <select value={signupData.gender} onChange={(e) => setSignupData({...signupData, gender: e.target.value})} className="login-input-v2">
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="login-input-group-v2 mt-2">
                                                    <label>Email Address</label>
                                                    <input type="email" placeholder="email@example.com" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} className="login-input-v2" />
                                                </div>
                                                <div className="login-input-group-v2 mt-2">
                                                    <label>Phone Number</label>
                                                    <input type="tel" placeholder="+1 234 567 890" value={signupData.phoneNumber} onChange={(e) => setSignupData({...signupData, phoneNumber: e.target.value})} className="login-input-v2" />
                                                </div>

                                                <div className="login-input-group-v2 mt-3 block text-left">
                                                    <label className="mb-1 text-xs opacity-60">Receive verification code via:</label>
                                                    <div className="flex gap-4 p-2 bg-gray-50 rounded">
                                                        <label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
                                                            <input type="radio" checked={signupVerifyType === 'email'} onChange={() => setSignupVerifyType('email')} />
                                                            <span>Email</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
                                                            <input type="radio" checked={signupVerifyType === 'phone'} onChange={() => setSignupVerifyType('phone')} />
                                                            <span>Phone</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                {error && <p className="login-error-v2">{error}</p>}
                                                <button onClick={handleSignupDetails} className="login-btn-v2 login-btn-mobile-v2 mt-4" disabled={loading}>
                                                    {loading ? 'Preparing...' : 'Create Account'}
                                                </button>

                                                <div className="login-footer-links-v2">
                                                    Already have an account? <span className="login-link-v2" onClick={toggleMode}>Sign in</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 'otp' && (
                                        <motion.div key="signup-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                            <h2 className="login-title-v2">One Last Check</h2>
                                            <p className="login-desc-v2">
                                                Verify your {signupVerifyType}: <b>{signupVerifyType === 'email' ? signupData.email : signupData.phoneNumber}</b>
                                            </p>
                                            <div className="login-form-v2">
                                                <input 
                                                    type="text" autoFocus maxLength={4} placeholder="0 0 0 0" value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtpSignup(e)}
                                                    className="login-input-v2 text-center tracking-[1em] text-xl font-bold"
                                                />
                                                {error && <p className="login-error-v2">{error}</p>}
                                                <button onClick={handleVerifyOtpSignup} className="login-btn-v2 login-btn-mobile-v2" disabled={loading}>
                                                    {loading ? 'Verifying...' : 'Next'}
                                                </button>
                                                
                                                <div className="flex flex-col gap-2 mt-4">
                                                    <button className="login-other-link-v2 text-xs" onClick={() => { setSignupVerifyType(signupVerifyType === 'email' ? 'phone' : 'email'); setError(''); setOtp(''); }}>
                                                        Verify via {signupVerifyType === 'email' ? 'Phone' : 'Email'} instead
                                                    </button>
                                                    <button className="login-other-link-v2" onClick={() => { setStep('details'); setError(''); setOtp(''); }}>
                                                        <ArrowLeft size={14} className="inline mr-1" />
                                                        Change details
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 'hobbies' && (
                                        <motion.div key="signup-hobbies" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                                            <Heart className="mx-auto mb-4 text-red-500" size={48} />
                                            <h2 className="login-title-v2">What do you love?</h2>
                                            <p className="login-desc-v2">Tell us about your interests to personalize your library.</p>
                                            <div className="login-form-v2">
                                                <textarea 
                                                    placeholder="Reading, writing, poetic walks, vintage books..."
                                                    value={signupData.hobbies}
                                                    onChange={(e) => setSignupData({...signupData, hobbies: e.target.value})}
                                                    className="login-input-v2 min-h-[100px] py-3"
                                                />
                                                <button onClick={handleFinalSignup} className="login-btn-v2 login-btn-email-v2 mt-4">
                                                    <span>Complete Setup</span>
                                                    <ArrowRight size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="login-terms-v2">
                        By using Scribbled Library, you agree to our <span className="login-link-v2">Terms</span> and <span className="login-link-v2">Privacy</span>.
                    </div>
                </motion.div>
            </div>

            <div className="login-copyright-v2">© 2026 Scribbled Library LLC</div>
            <div className="login-shelf-v2"></div>
        </div>
    );
};

export default LoginPage;


