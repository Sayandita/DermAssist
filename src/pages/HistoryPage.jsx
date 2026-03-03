import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, History as HistoryIcon, Search, AlertCircle, FileText } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const HistoryPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Determine status text presentation for styling
    const getStatusType = (diagnosis) => {
        const diagLower = (diagnosis || '').toLowerCase();
        if (diagLower.includes('melanoma') || diagLower.includes('basal cell') || diagLower.includes('carcinoma')) {
            return 'High Risk';
        }
        if (diagLower.includes('actinic')) {
            return 'Monitor';
        }
        return 'Safe';
    };

    useEffect(() => {
        const fetchScans = async () => {
            if (!user?.token) return;
            try {
                setLoading(true);
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get(`${API_BASE}/api/scans`, config);

                // Process data formats implicitly
                const formattedScans = data.map(scan => ({
                    id: scan._id,
                    date: new Date(scan.createdAt).toLocaleString(),
                    diagnosis: scan.diagnosis,
                    statusType: getStatusType(scan.diagnosis),
                    confidence: scan.confidence,
                    imageUrl: scan.imageUrl || 'https://via.placeholder.com/50'
                }));

                setScans(formattedScans);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load records.');
                setLoading(false);
            }
        };

        fetchScans();
    }, [user, API_BASE]);

    const filteredScans = scans.filter(scan => scan.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            <header className="w-full bg-white shadow-sm p-4 flex justify-between items-center max-w-7xl">
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 flex items-center gap-2 font-medium">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </Link>
                <span className="font-bold text-xl text-indigo-700 flex items-center gap-2">
                    <HistoryIcon /> Scan History
                </span>
                <div className="w-24"></div>
            </header>

            <main className="flex-1 w-full max-w-6xl p-6 mt-8">
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100 overflow-hidden border border-gray-100">
                    <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-indigo-900">Your Consultations</h2>
                            <p className="text-indigo-600/80">Monitor your skin health over time with AI insights.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search diagnosis..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-indigo-600">
                                <Clock className="animate-spin w-12 h-12 mb-4" />
                                <p className="text-lg font-medium">Loading your records...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 text-red-500">
                                <AlertCircle className="w-12 h-12 mb-4" />
                                <p className="text-lg font-medium">{error}</p>
                            </div>
                        ) : filteredScans.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <FileText className="w-12 h-12 mb-4" />
                                <p className="text-lg font-medium">No records found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 font-semibold text-gray-700">Preview</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Date & Time</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Diagnosis</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700">Confidence</th>
                                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredScans.map((scan) => (
                                            <tr key={scan.id} className="hover:bg-indigo-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <img src={scan.imageUrl || 'https://via.placeholder.com/50'} alt="Scan preview" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 font-medium">
                                                    {scan.date}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                                                        ${scan.statusType === 'High Risk' ? 'bg-red-100 text-red-700' :
                                                            scan.statusType === 'Monitor' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-green-100 text-green-700'}`}>
                                                        {scan.diagnosis}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 opacity-80 font-bold">
                                                    {(scan.confidence * 100).toFixed(1)}%
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-bold ${scan.statusType === 'High Risk' ? 'text-red-600' :
                                                        scan.statusType === 'Monitor' ? 'text-yellow-600' : 'text-green-600'
                                                        }`}>
                                                        {scan.statusType}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HistoryPage;
