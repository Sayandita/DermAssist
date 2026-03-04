import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, History, Activity, AlertCircle, ArrowRight, User } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [scans, setScans] = useState([]);
    const [stats, setStats] = useState({
        totalScans: 0,
        highRisk: 0,
        lastScan: 'No scans yet',
    });
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    // Basic Route Protection
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Handle logout dispatch & navigate
    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    // Determine status badge based on diagnosis
    const getStatus = (diagnosis) => {
        const diagLower = (diagnosis || '').toLowerCase();
        if (diagLower.includes('melanoma') || diagLower.includes('basal cell') || diagLower.includes('carcinoma')) {
            return 'High Risk';
        }
        if (diagLower.includes('actinic')) {
            return 'Monitor';
        }
        return 'Safe';
    };

    // Formatter for date display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Fetch user scans from the backend API
    useEffect(() => {
        const fetchScans = async () => {
            if (!user?.token) return;
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get(`${API_BASE}/api/scans`, config);

                setScans(data);

                // Calculate stats
                const totalScans = data.length;
                let highRiskCount = 0;

                const mappedRecent = data.slice(0, 3).map((scan) => {
                    const status = getStatus(scan.diagnosis);
                    if (status === 'High Risk') highRiskCount++;
                    return {
                        id: scan._id,
                        date: formatDate(scan.createdAt),
                        diagnosis: scan.diagnosis,
                        status: status
                    };
                });

                // Count remaining high risk in all scans for accurate stat
                if (data.length > 3) {
                    highRiskCount += data.slice(3).filter(s => getStatus(s.diagnosis) === 'High Risk').length;
                }

                setStats({
                    totalScans,
                    highRisk: highRiskCount,
                    lastScan: data.length > 0 ? formatDate(data[0].createdAt) : 'No scans yet'
                });

                setRecentScans(mappedRecent);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching scans:", error);
                setLoading(false);
            }
        };

        fetchScans();
    }, [user, API_BASE]);

    // Prevent rendering if useEffect is still redirecting unauthenticated users
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200 p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 text-indigo-700 font-bold text-xl">
                        <img src="/src/assets/logo.png" alt="DermAssist AI Logo" className="w-8 h-8 object-contain" />
                        DermAssist AI
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <div className="bg-indigo-100 p-2 rounded-full shadow-inner">
                                <User className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="font-bold hidden sm:block text-indigo-900">{user?.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition whitespace-nowrap">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 mt-4 space-y-8">

                {/* Welcome Section */}
                <div>
                    {/* Dynamically display actual registered user name from Context payload */}
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || ''}!</h1>
                    <p className="text-gray-500 mt-1">Here is the overview of your recent skin health analyses.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Scans</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.totalScans}</h3>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
                            <History className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                        <div>
                            <p className="text-sm font-medium text-gray-500">High Risk Found</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.highRisk}</h3>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl text-red-600">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Last Scan Date</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.lastScan}</h3>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl text-green-600">
                            <History className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Action Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* New Scan Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-lg shadow-indigo-200 flex flex-col justify-between">
                        <div>
                            <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Perform AI Skin Scan</h2>
                            <p className="text-indigo-100 mb-8 max-w-sm">
                                Upload a new image of a skin lesion for an instant, privacy-focused AI analysis.
                            </p>
                        </div>
                        <Link to="/scanner" className="bg-white text-indigo-700 font-bold py-3 px-6 rounded-xl self-start hover:bg-indigo-50 transition shadow-sm flex items-center gap-2">
                            Start Scanner <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col shrink-0 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                            <Link to="/history" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-4 flex-grow">
                            {loading ? (
                                <div className="text-center text-gray-500 py-4">Loading recent activity...</div>
                            ) : recentScans.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">No scans performed yet.</div>
                            ) : (
                                recentScans.map((scan) => (
                                    <div key={scan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition cursor-pointer">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">{scan.diagnosis}</h4>
                                            <p className="text-sm text-gray-500">{scan.date}</p>
                                        </div>
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                                ${scan.status === 'High Risk' ? 'bg-red-100 text-red-700' :
                                                    scan.status === 'Safe' ? 'bg-green-100 text-green-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {scan.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
