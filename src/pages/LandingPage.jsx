import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, ShieldCheck, Activity, BrainCircuit, Info } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

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
            <nav className="w-full p-6 flex justify-between items-center bg-white shadow-sm">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-2xl">
                    <Stethoscope className="w-8 h-8" />
                    DermAssist AI
                </div>
                <div className="space-x-4">
                    <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                    <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">Get Started</Link>
                </div>
            </nav>

            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 drop-shadow-sm">
                    Next-Generation <span className="text-indigo-600">Skin Analysis</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mb-10">
                    Empowering your health with real-time, AI-driven dermatological insights directly in your browser. Fast, secure, and privacy-focused.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <Link to="/scanner" className="bg-indigo-600 flex items-center gap-2 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 hover:shadow-lg transition">
                        <BrainCircuit /> Try the Scanner
                    </Link>
                    <Link to="/about" className="bg-white text-indigo-600 border border-indigo-200 flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition">
                        <Info /> About Us
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Instant AI Inference</h3>
                        <p className="text-gray-600">Powered by MobileNetV2, our client-side AI processes images entirely in your browser without compromising speed.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                        <p className="text-gray-600">Images are analyzed directly on your device. We only store your scan results if you choose to save them securely.</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Track Your Health</h3>
                        <p className="text-gray-600">Securely back up your scan history to track changes over time with your personal dashboard.</p>
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
