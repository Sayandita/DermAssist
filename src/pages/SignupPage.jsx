import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, AlertTriangle, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Access context payload hook
    const { signup, loading, error, setError, user } = useContext(AuthContext);

    // If user is already authenticated, force-navigate to Dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
        // Clean-up generic errors when navigating
        return () => setError(null);
    }, [user, navigate, setError]);

    const handleSignup = async (e) => {
        e.preventDefault();
        // Dispatch real authentication API route
        const success = await signup(name, email, password);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
                <Link to="/" className="flex items-center gap-3 text-indigo-700 font-bold text-2xl mb-2 hover:opacity-80 transition-opacity">
                    <img src="/src/assets/logo.png" alt="DermAssist AI Logo" className="w-10 h-10 object-contain" />
                    DermAssist AI
                </Link>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Log in</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {/* Output authentication errors generated from Express/Axios */}
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            <p className="font-medium text-sm">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSignup}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="text" required className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input type="email" required className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed">
                                {loading ? (
                                    <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                                ) : (
                                    <>Sign up <ArrowRight className="w-5 h-5 ml-2" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
