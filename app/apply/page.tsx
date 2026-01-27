"use client";

import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, CheckCircle, Loader2, FileText, Search, Clock } from "lucide-react";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from 'next/navigation';

function ApplyPageContent() {
    const searchParams = useSearchParams();
    const jobTitle = searchParams.get('job');
    const [activeTab, setActiveTab] = useState('apply');
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Status Check state
    const [identifier, setIdentifier] = useState('');
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [statusResult, setStatusResult] = useState<any>(null);
    const [statusError, setStatusError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Please upload a resume");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            if (jobTitle) formData.append('jobTitle', jobTitle);

            await axios.post('/api/public/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCheckStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier) return;

        setCheckingStatus(true);
        setStatusError('');
        setStatusResult(null);
        try {
            const res = await axios.get(`/api/public/status?identifier=${encodeURIComponent(identifier)}`);
            setStatusResult(res.data);
        } catch (error: any) {
            console.error(error);
            setStatusError(error.response?.data?.error || "Failed to check status");
        } finally {
            setCheckingStatus(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Received!</h2>
                    <p className="text-slate-600 mb-6">
                        Thank you for applying. We have received your information and resume.
                    </p>
                    <Button onClick={() => setSuccess(false)} variant="outline">
                        Return
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Talent Portal</h1>
                    <p className="mt-3 text-lg text-slate-600">
                        Join our mission or track your journey with us.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur p-1 rounded-xl">
                        <TabsTrigger value="apply" className="rounded-lg">Apply Now</TabsTrigger>
                        <TabsTrigger value="status" className="rounded-lg">Check Status</TabsTrigger>
                    </TabsList>

                    <TabsContent value="apply">
                        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="flex items-center justify-between">
                                    Application Form
                                    {jobTitle && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {jobTitle}
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    {jobTitle ? `You are applying for the ${jobTitle} position.` : "Please fill in your details and upload your resume."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                                className="bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="john@example.com"
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Resume (PDF/Word)</Label>
                                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center cursor-pointer relative group">
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                required
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            />
                                            {file ? (
                                                <div className="flex flex-col items-center gap-2 text-blue-600">
                                                    <FileText className="w-10 h-10" />
                                                    <span className="font-medium">{file.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-500">
                                                    <Upload className="w-10 h-10 text-slate-300 group-hover:text-blue-300 transition-colors" />
                                                    <span className="font-medium">Click or drag to upload resume</span>
                                                    <span className="text-xs text-slate-400">PDF, DOC, DOCX up to 10MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 h-12 text-lg"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit Application'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="status">
                        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle>Check Status</CardTitle>
                                <CardDescription>Enter your email or phone number to view your application status.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleCheckStatus} className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="Email or Phone Number"
                                            className="bg-white h-12"
                                            required
                                        />
                                        <Button type="submit" disabled={checkingStatus} className="h-12 px-6">
                                            {checkingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        </Button>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {statusError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100"
                                            >
                                                {statusError}
                                            </motion.div>
                                        )}

                                        {statusResult && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="mt-6 p-6 border border-slate-100 rounded-xl bg-slate-50/50"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-xl">{statusResult.full_name}</h3>
                                                        <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                                                            <Clock className="w-4 h-4" />
                                                            Applied on {new Date(statusResult.applied_on).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider ${statusResult.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        statusResult.status === 'hired' ? 'bg-green-100 text-green-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {statusResult.status}
                                                    </div>
                                                </div>

                                                <div className="mt-8">
                                                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${statusResult.status === 'new' ? 'w-1/4 bg-blue-400' :
                                                            statusResult.status === 'screening' ? 'w-2/4 bg-blue-500' :
                                                                statusResult.status === 'interview' ? 'w-3/4 bg-blue-600' :
                                                                    statusResult.status === 'offer' ? 'w-[90%] bg-blue-600' :
                                                                        statusResult.status === 'hired' ? 'w-full bg-green-500' :
                                                                            'w-full bg-slate-400'
                                                            }`} />
                                                    </div>
                                                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        <span>Applied</span>
                                                        <span>Screening</span>
                                                        <span>Interview</span>
                                                        <span>Hired</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default function ApplyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <ApplyPageContent />
        </Suspense>
    );
}
