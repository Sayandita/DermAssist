import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Linkedin, Mail, Send, CheckCircle, Activity } from 'lucide-react';

const AboutPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const developers = [
        {
            name: "John Doe",
            role: "Lead Full Stack Developer",
            bio: "Passionate about AI-driven applications and building scalable Node.js architectures.",
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            email: "john@example.com"
        },
        {
            name: "Jane Smith",
            role: "Machine Learning Engineer",
            bio: "Specializing in Convolutional Neural Networks and optimizing models for edge inference.",
            github: "https://github.com",
            linkedin: "https://linkedin.com",
            email: "jane@example.com"
        }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate an API call
        setTimeout(() => setSubmitted(true), 500);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition">
                        <ArrowLeft size={18} /> Back to Home
                    </Link>
                    <div className="flex items-center gap-2">
                        <Activity className="text-indigo-600 w-6 h-6" />
                        <span className="font-bold text-xl tracking-tight text-slate-800">DermAssist<span className="text-indigo-600">AI</span></span>
                    </div>
                    <div className="w-24"></div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Meet the Team</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        We developed DermAssist AI to bridge the gap between cutting-edge artificial intelligence and accessible, private dermatological care.
                    </p>
                </div>

                {/* Developers Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {developers.map((dev, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-6 font-bold text-3xl">
                                {dev.name.charAt(0)}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{dev.name}</h3>
                            <p className="font-semibold text-indigo-600 mb-4">{dev.role}</p>
                            <p className="text-slate-600 mb-6">{dev.bio}</p>
                            <div className="flex items-center gap-4 text-slate-400">
                                <a href={dev.github} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition"><Github size={24} /></a>
                                <a href={dev.linkedin} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition"><Linkedin size={24} /></a>
                                <a href={`mailto:${dev.email}`} className="hover:text-indigo-600 transition"><Mail size={24} /></a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Get in Touch</h2>
                        <p className="text-slate-500">Have questions about our AI models, project collaboration, or just want to say hi? Drop us a line.</p>
                    </div>

                    {submitted ? (
                        <div className="bg-green-50 border border-green-200 flex flex-col items-center justify-center p-8 rounded-2xl text-center">
                            <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
                            <h3 className="text-2xl font-bold text-green-900 mb-2">Message Sent!</h3>
                            <p className="text-green-700">Thank you for reaching out. We will get back to you shortly.</p>
                            <button onClick={() => setSubmitted(false)} className="mt-6 text-sm font-semibold text-green-600 hover:text-green-800">Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Alex Mercer"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="alex@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea
                                    required
                                    rows="5"
                                    placeholder="Write your message here..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition resize-y"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                <Send size={20} /> Send Message
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AboutPage;
