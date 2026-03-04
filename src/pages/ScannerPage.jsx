import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2, ArrowLeft, Info, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Helper for mapping labels to professional names
const LABEL_MAP = {
    'akiec': 'Actinic Keratosis',
    'bcc': 'Basal Cell Carcinoma',
    'bkl': 'Benign Keratosis',
    'df': 'Dermatofibroma',
    'mel': 'Melanoma',
    'nv': 'Melanocytic Nevus',
    'vasc': 'Vascular Lesion'
};

const ScannerPage = () => {
    const [imageSrc, setImageSrc] = useState(null);
    const [result, setResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState(null);
    const [progress, setProgress] = useState(0);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Configure base URL for axios if not done globally
    // Using default proxy or local port 5000
    const API_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Progress simulation during scanning
    useEffect(() => {
        let interval;
        if (isScanning) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => (prev < 90 ? prev + Math.random() * 15 : prev));
            }, 300);
        } else {
            setProgress(0);
        }
        return () => clearInterval(interval);
    }, [isScanning]);

    if (!user) return null;

    const processFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
                setResult(null);
                setScanError(null);
            };
            reader.readAsDataURL(file);
        } else {
            setScanError("Please select a valid image file (JPEG, PNG).");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const handleScan = async () => {
        if (!imageSrc) return;
        setIsScanning(true);
        setResult(null);
        setScanError(null);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Call the Node server bridge
            const { data } = await axios.post(`${API_BASE}/api/ai/analyze`, { imageBase64: imageSrc }, config);

            // Artificial delay to show the "professional" progress ring
            setTimeout(() => {
                setResult(data);
                setIsScanning(false);
                setProgress(100);
            }, 1000);

        } catch (error) {
            console.error(error);
            setScanError(error.response?.data?.message || 'Server connection failed. Ensure AI backend is running.');
            setIsScanning(false);
        }
    };

    const ProgressRing = ({ radius, stroke, progress }) => {
        const normalizedRadius = radius - stroke * 2;
        const circumference = normalizedRadius * 2 * Math.PI;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        return (
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                    stroke="#E2E8F0"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="#4F46E5"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition">
                        <ArrowLeft size={18} /> Back
                    </Link>
                    <div className="flex items-center gap-3">
                        <img src="/src/assets/logo.png" alt="DermAssist AI Logo" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-xl tracking-tight text-slate-800">DermAssist<span className="text-indigo-600">AI</span></span>
                    </div>
                    <div className="w-20"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">AI Skin Diagnostic</h1>
                    <p className="text-slate-500 text-lg max-w-xl mx-auto">Upload a clear photo of the skin lesion for a detailed dermatological analysis using our local EfficientNet-B0 engine.</p>
                </div>

                {scanError && (
                    <div className="mb-8 bg-rose-50 border border-rose-100 text-rose-800 p-5 rounded-2xl flex items-start gap-3 shadow-sm">
                        <AlertTriangle className="text-rose-500 shrink-0" size={24} />
                        <div>
                            <p className="font-bold text-rose-900">Analysis Halted</p>
                            <p className="text-sm opacity-90">{scanError}</p>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left: Upload Section */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div
                            className={`border-3 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center min-h-[350px] cursor-pointer 
                            ${!imageSrc ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300' : 'border-indigo-100 bg-white'}`}
                            onClick={() => !isScanning && document.getElementById('fileInput').click()}
                        >
                            {!imageSrc ? (
                                <>
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-indigo-500 mb-4">
                                        <UploadCloud size={32} />
                                    </div>
                                    <p className="text-xl font-bold text-slate-800 mb-1">Click or Drop Image</p>
                                    <p className="text-slate-400 text-sm">PNG, JPG or JPEG up to 10MB</p>
                                </>
                            ) : (
                                <div className="relative w-full h-full group">
                                    <img src={imageSrc} alt="Preview" className="w-full h-64 object-cover rounded-xl shadow-lg" />
                                    {!isScanning && (
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                                            <span className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-xl">Change Image</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <input type="file" id="fileInput" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isScanning} />
                        </div>

                        <button
                            onClick={handleScan}
                            disabled={!imageSrc || isScanning}
                            className="w-full mt-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                        >
                            {isScanning ? (
                                <><Loader2 className="animate-spin" size={20} /> Processing...</>
                            ) : (
                                'Initiate Neural Scan'
                            )}
                        </button>
                    </div>

                    {/* Right: Results Section */}
                    <div className="space-y-6">
                        {isScanning ? (
                            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center h-[520px]">
                                <div className="relative flex items-center justify-center mb-8">
                                    <div className="absolute">
                                        <ProgressRing radius={80} stroke={8} progress={progress} />
                                    </div>
                                    <span className="text-2xl font-black text-indigo-600">{Math.round(progress)}%</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Pixels...</h3>
                                <p className="text-slate-400 text-center px-4">Local inference engine is scanning for morphological patterns.</p>
                            </div>
                        ) : result ? (
                            <div className="bg-white overflow-hidden rounded-3xl shadow-xl border border-indigo-50 animate-in zoom-in-95 duration-500">
                                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={20} />
                                        <span className="font-semibold tracking-wide uppercase text-xs">Diagnostic Result</span>
                                    </div>
                                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">Verified Local Engine</span>
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 mb-1">{LABEL_MAP[result.id] || result.diagnosis}</h2>
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                                                <span className="text-sm font-bold">{(result.confidence * 100).toFixed(1)}% Confidence Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
                                            <Info size={16} className="text-indigo-500" />
                                            <span>Medical Insight</span>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {result.insight}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Probability Distribution</p>
                                        {(result.all_predictions || []).sort((a, b) => b.confidence - a.confidence).slice(0, 3).map((p, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <div className="flex justify-between text-xs font-medium text-slate-600">
                                                    <span>{p.name}</span>
                                                    <span>{Math.round(p.confidence * 100)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${p.confidence * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-1 italic"><ShieldCheck size={12} /> Auto-saved to History</span>
                                        <span>Scan ID: {result.scanId?.substring(0, 8)}...</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-indigo-50/50 border border-indigo-100 p-10 rounded-3xl h-[520px] flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 mb-6">
                                    <ShieldCheck size={40} className="text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready for Analysis</h3>
                                <p className="text-slate-500 max-w-[250px]">Upload an image to start the neural diagnostic engine.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 p-6 bg-slate-100 rounded-2xl border border-slate-200">
                    <p className="text-xs text-slate-500 leading-relaxed text-center">
                        <strong>Disclaimer:</strong> This tool is powered by an AI neural network for educational purposes only.
                        It is not a substitute for professional medical advice, diagnosis, or treatment.
                        Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default ScannerPage;