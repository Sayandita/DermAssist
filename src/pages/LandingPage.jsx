import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, ShieldCheck, Activity, BrainCircuit, Info } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import DotGrid from './DotGrid';
import logoImg from '../assets/logo.png';
const LandingPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // If user is already authenticated, force-navigate to Dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
            <nav className="w-full p-4 sm:p-6 flex justify-between items-center bg-white shadow-sm">
                {/* 
                  Increased navbar logo size by 1.2x 
                  Original: w-8 h-8 sm:w-10 sm:h-10 
                  New: w-[38px] h-[38px] sm:w-12 sm:h-12
                */}
                <div className="flex items-center gap-2 sm:gap-3 text-indigo-700 font-bold text-xl sm:text-2xl">
                    <img src={logoImg} alt="DermAssist AI Logo" className="w-[38px] h-[38px] sm:w-12 sm:h-12 object-contain" />
                    <span className="hidden sm:inline">DermAssist AI</span>
                </div>
                <div className="space-x-4">
                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                    <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Get Started</Link>
                </div>
            </nav>

            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12 sm:py-20 relative overflow-hidden">
                {/* Background Animation */}
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-auto">
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <DotGrid
                            dotSize={3}
                            gap={29}
                            baseColor="#A5B4FC"
                            activeColor="#4F46E5"
                            proximity={100}
                            shockRadius={190}
                            shockStrength={5}
                            resistance={750}
                            returnDuration={1.5}
                        />
                    </div>
                </div>

                <div className="relative z-10 w-full flex flex-col items-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 drop-shadow-sm">
                        Next-Generation <span className="text-indigo-600">Skin Analysis</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-8 sm:mb-10 px-2">
                        Empowering your health with fast, AI-driven dermatological insights. Secure, and privacy-focused.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-16 sm:mb-20 w-full sm:w-auto px-4">
                        <Link to="/scanner" className="w-full sm:w-auto bg-indigo-600 flex items-center justify-center gap-2 text-white px-8 py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-indigo-700 hover:shadow-lg transition">
                            <BrainCircuit /> Try the Scanner
                        </Link>
                        <Link to="/about" className="w-full sm:w-auto bg-white text-indigo-600 border border-indigo-200 flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-indigo-50 transition">
                            <Info /> Contact Us
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
                        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Instant AI Inference</h3>
                            <p className="text-gray-600">Powered by a server-side DenseNet-121 model, our AI processes images on our secure backend for high accuracy.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                            <p className="text-gray-600">Images are securely analyzed by our advanced backend. We only store your scan results if you choose to save them securely.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Track Your Health</h3>
                            <p className="text-gray-600">Securely back up your scan history to track changes over time with your personal dashboard.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full text-center py-6 text-gray-500 bg-white border-t border-gray-200">
                <p>© 2026 DermAssist AI. This tool is for informational purposes and not a substitute for professional medical advice.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
