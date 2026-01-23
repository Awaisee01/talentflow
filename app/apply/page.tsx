"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Upload, CheckCircle, Loader2, FileText } from "lucide-react";
import axios from 'axios';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

export default function ApplyPage() {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

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
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Submit Another
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">Join Our Talent Pool</h1>
                    <p className="mt-2 text-lg text-slate-600">
                        Submit your resume to be considered for future opportunities.
                    </p>
                </div>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Application Form</CardTitle>
                        <CardDescription>Please fill in your details and upload your resume.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Resume (PDF/Word)</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        required
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                                            <FileText className="w-5 h-5" />
                                            {file.name}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                            <Upload className="w-8 h-8 text-slate-400" />
                                            <span>Click or drag to upload resume</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
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
            </div>
        </div>
    );
}
