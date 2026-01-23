"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/lib/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Star, CheckCircle2, XCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

export default function CandidateDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('profile');

    // Fetch Candidate
    const { data: candidate, isLoading } = useQuery({
        queryKey: ['candidate', id],
        queryFn: async () => {
            const res = await axios.get(`/api/candidates/${id}`); // Fallback to raw ID fetch if base44 list doesn't support get-by-id easily yet, or use list().find
            return res.data;
        }
    });

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!candidate || candidate.error) {
        return <div>Candidate not found</div>;
    }

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
    };

    const statusColors = {
        new: 'bg-blue-100 text-blue-800',
        reviewing: 'bg-yellow-100 text-yellow-800',
        interview: 'bg-purple-100 text-purple-800',
        rejected: 'bg-red-100 text-red-800',
        hired: 'bg-green-100 text-green-800'
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <div className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-lg font-semibold text-slate-800">Candidate Profile</h1>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Header Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="w-24 h-24 text-2xl">
                        <AvatarFallback className="bg-blue-600 text-white">{getInitials(candidate.full_name)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900">{candidate.full_name}</h2>
                                <p className="text-slate-500 text-lg">{candidate.current_role || 'No active role'}</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className={`px-3 py-1 ${statusColors[candidate.status as keyof typeof statusColors] || 'bg-slate-100'}`}>
                                    {candidate.status?.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className={candidate.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' : ''}>
                                    {candidate.priority?.toUpperCase()} PRIORITY
                                </Badge>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-600">
                            {candidate.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 transition-colors">{candidate.email}</a>
                                </div>
                            )}
                            {candidate.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{candidate.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>Added {format(new Date(candidate.created_date || null), 'MMM dd, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-white border p-1 rounded-xl h-auto">
                        <TabsTrigger value="profile" className="px-6 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Profile & Summary</TabsTrigger>
                        <TabsTrigger value="skills" className="px-6 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Skills ({candidate.skills?.length || 0})</TabsTrigger>
                        <TabsTrigger value="jobs" className="px-6 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Jobs Activity</TabsTrigger>
                        <TabsTrigger value="emails" className="px-6 py-2 rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Email History</TabsTrigger>
                    </TabsList>

                    {/* PROFILE TAB */}
                    <TabsContent value="profile" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Summary */}
                            <div className="md:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            Professional Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                            {candidate.summary || "No summary available."}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                                    <CardContent>
                                        {candidate.education && candidate.education.length > 0 ? (
                                            <ul className="space-y-4">
                                                {candidate.education.map((edu: any, i: number) => (
                                                    <li key={i} className="flex gap-4">
                                                        <div className="w-2 h-2 mt-2 rounded-full bg-slate-300" />
                                                        <div>
                                                            <p className="font-medium text-slate-900">{typeof edu === 'string' ? edu : edu.degree}</p>
                                                            {typeof edu !== 'string' && <p className="text-sm text-slate-500">{edu.institution} • {edu.year}</p>}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-slate-500 italic">No education details parsed.</p>}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-400 uppercase">Experience</label>
                                            <p className="font-medium">{candidate.experience_years} Years</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-400 uppercase">Source</label>
                                            <p className="font-medium">{candidate.source || 'Unknown'}</p>
                                        </div>
                                        {candidate.resume_file && (
                                            <Button variant="outline" className="w-full gap-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                                                <Download className="w-4 h-4" />
                                                Download Resume
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SKILLS TAB */}
                    <TabsContent value="skills">
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills & Capabilities</CardTitle>
                                <CardDescription>Verified skills are marked with a checkmark.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills?.map((skill: any, i: number) => {
                                        const name = typeof skill === 'string' ? skill : skill.name;
                                        const isVerified = typeof skill !== 'string' && skill.status === 'verified';

                                        return (
                                            <Badge
                                                key={i}
                                                variant={isVerified ? "default" : "secondary"}
                                                className={`px-3 py-1.5 text-sm gap-2 ${isVerified ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                            >
                                                {name}
                                                {isVerified && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* JOBS TAB */}
                    <TabsContent value="jobs">
                        <Card>
                            <CardHeader><CardTitle>Jobs History</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-center py-12 text-slate-500">
                                    <Briefcase className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                    <p>No job assignments yet.</p>
                                    <Button variant="link" className="text-blue-600">Assign to Job</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* EMAILS TAB */}
                    <TabsContent value="emails">
                        <Card>
                            <CardHeader><CardTitle>Communication Log</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-center py-12 text-slate-500">
                                    <Mail className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                    <p>No emails sent yet.</p>
                                    <Button variant="outline" className="mt-4">Compose Email</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
