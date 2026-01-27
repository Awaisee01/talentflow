"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import {
    Zap,
    Search,
    ShieldCheck,
    Star,
    ChevronRight,
    Users,
    FileText,
    BarChart3,
    ArrowRight
} from 'lucide-react';
import Image from 'next/image';

const LandingPage = () => {
    const features = [
        {
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            title: "Instant AI Parsing",
            description: "Upload resumes in any format and watch our AI extract details with 99% accuracy in seconds."
        },
        {
            icon: <Search className="w-6 h-6 text-purple-500" />,
            title: "Smart Matching",
            description: "Automatically match candidates to open roles based on skills, experience, and cultural fit."
        },
        {
            icon: <Star className="w-6 h-6 text-amber-500" />,
            title: "Predictive Scoring",
            description: "Rank candidates using predictive AI models to find the top 5% talent faster."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
            title: "Secure & Compliant",
            description: "Enterprise-grade security and full GDPR/CCPA compliance for all your candidate data."
        }
    ];

    const stats = [
        { label: "Resumes Parsed", value: "1M+" },
        { label: "Time Saved", value: "85%" },
        { label: "Better Hires", value: "3x" },
        { label: "Happy Clients", value: "500+" }
    ];

    return (
        <div className="bg-slate-50 min-h-screen overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-purple-400 rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex-1 text-center lg:text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                Next-Gen Talent Acquisition
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                                Transform Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Recruitment</span> with AI
                            </h1>
                            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                TalentFlow uses advanced large language models to automate resume parsing, scoring, and candidate matching. Spend less time reading, more time hiring.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <SignInButton mode="modal">
                                    <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-xl shadow-blue-200 hover:scale-105 transition-transform bg-blue-600">
                                        Get Started Free <ChevronRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </SignInButton>
                                <a href="/apply">
                                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl border-slate-200 hover:bg-white hover:shadow-lg transition-all">
                                        Apply as Candidate
                                    </Button>
                                </a>
                            </div>

                            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden ring-2 ring-slate-100">
                                            <Image
                                                src={`https://i.pravatar.cc/100?u=${i}`}
                                                alt="User"
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-sm font-medium text-slate-500">
                                    Joined by <span className="text-slate-900 font-bold">10k+</span> recruiters this month
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex-1 w-full max-w-[600px] relative"
                        >
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white group">
                                <Image
                                    src="/hero.png"
                                    alt="TalentFlow Dashboard"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>

                                {/* Floating Badges */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-10 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Auto-Parsed</div>
                                        <div className="text-sm font-bold text-slate-800">99.8% Accuracy</div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-10 -right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-medium">Candidate Score</div>
                                        <div className="text-sm font-bold text-slate-800">Top 5% Talent</div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full bg-blue-600/5 rounded-2xl"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-white border-y border-slate-200">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{stat.value}</div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">Core Capabilities</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Everything you need to hire the <span className="text-blue-600">best candidates</span></h3>
                        <p className="text-lg text-slate-600">
                            Our platform combines powerful AI with intuitive management tools to modernize your entire hiring workflow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all h-full"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Showcase Section (Visual representation of parsing) */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                                From <span className="text-blue-400">Messy PDF</span> to <span className="text-purple-400">Structured Intelligence</span>
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:bg-blue-500/40">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Omni-Format Support</h4>
                                        <p className="text-slate-400">PDF, DOCX, Images, and even handwritten notes. Our OCR/LLM stack handles it all.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:bg-purple-500/40">
                                        <Users className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Semantic Extraction</h4>
                                        <p className="text-slate-400">We don't just find keywords; we understand roles, seniorities, and specialized clusters.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:bg-blue-500/40">
                                        <BarChart3 className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Automated Assessments</h4>
                                        <p className="text-slate-400">Generate AI interview questions and competency scores automatically for every applicant.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full bg-slate-800/50 rounded-3xl p-6 border border-white/10 backdrop-blur-sm self-stretch lg:self-center">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                <div className="ml-4 text-xs font-mono text-slate-500">RESUME_PARSER.JSON</div>
                            </div>
                            <pre className="font-mono text-xs sm:text-sm text-blue-300 leading-relaxed overflow-x-auto no-scrollbar">
                                {`{
  "candidate": {
    "name": "Sarah Chen",
    "role": "Senior Full-Stack Engineer",
    "experience": "8 years",
    "top_skills": [
      "React", "Node.js", "Python", "AWS"
    ],
    "matching_score": 98.4,
    "assessment": {
      "technical": 9.5,
      "communication": 9.0,
      "leadership": 8.5
    },
    "recommendation": "Strong Hire - Top Match"
  }
}`}
                            </pre>
                            <div className="mt-8 relative h-1 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                                />
                            </div>
                            <div className="mt-4 text-center text-[10px] text-slate-500 tracking-[0.2em] font-black uppercase">
                                AI PROCESSING UNDERWAY
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-[80px]"></div>
                            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-300 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Ready to revolutionize your hiring?</h2>
                            <p className="text-xl text-blue-100 mb-10 opacity-90 leading-relaxed">
                                Join hundreds of forward-thinking companies already using TalentFlow to build world-class teams. Start your 14-day free trial today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <SignInButton mode="modal">
                                    <Button size="lg" variant="secondary" className="h-16 px-10 text-xl font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl">
                                        Get Started Now
                                    </Button>
                                </SignInButton>
                                <div className="text-sm font-medium text-blue-100">
                                    No credit card required. Cancel anytime.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">T</div>
                            <span className="text-xl font-black text-slate-900 tracking-tight">TalentFlow</span>
                        </div>
                        <div className="flex gap-8 text-sm font-semibold text-slate-500">
                            <a href="#" className="hover:text-blue-600">Privacy</a>
                            <a href="#" className="hover:text-blue-600">Terms</a>
                            <a href="#" className="hover:text-blue-600">Contact</a>
                        </div>
                        <div className="text-sm text-slate-400">
                            © 2026 TalentFlow AI. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
