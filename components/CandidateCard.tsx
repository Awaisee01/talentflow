"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    User, Mail, Phone, Briefcase, GraduationCap, Star,
    ChevronDown, ChevronUp, FileText, Save, Loader2, CheckCircle2, Award, Edit
} from "lucide-react";
import { base44 } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import AssessmentForm from "./AssessmentForm";
import EditCandidateModal from "./EditCandidateModal";

const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
    not_interested: 'bg-slate-100 text-slate-500 border-slate-200'
};

const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    reviewing: 'bg-purple-100 text-purple-700',
    interview: 'bg-orange-100 text-orange-700',
    offer: 'bg-teal-100 text-teal-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-slate-100 text-slate-500'
};

interface CandidateCardProps {
    candidate: any;
    onUpdate?: () => void;
}

export default function CandidateCard({ candidate, onUpdate }: CandidateCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssessment, setShowAssessment] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: candidate.full_name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        score: candidate.score || '',
        priority: candidate.priority || '',
        notes: candidate.notes || '',
        status: candidate.status || 'new'
    });

    const handleSave = async () => {
        // Validation
        if (!formData.full_name) {
            alert("Name is required");
            return;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            alert("Invalid email format");
            return;
        }

        setSaving(true);
        try {
            await base44.entities.Candidate.update(candidate._id, {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                score: formData.score ? Number(formData.score) : null,
                priority: formData.priority || null,
                notes: formData.notes,
                status: formData.status
            });
            setEditing(false);
            onUpdate?.();
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
        >
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden bg-white mb-4">
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-3 sm:p-5 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-base sm:text-lg shrink-0">
                                    {candidate.full_name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base md:text-lg truncate">{candidate.full_name || 'Unknown'}</h3>
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-slate-500 min-w-0">
                                        {candidate.email && (
                                            <span className="flex items-center gap-1.5 truncate max-w-full">
                                                <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                                <span className="truncate">{candidate.email}</span>
                                            </span>
                                        )}
                                        {candidate.phone && (
                                            <span className="flex items-center gap-1.5 shrink-0">
                                                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                                <span>{candidate.phone}</span>
                                            </span>
                                        )}
                                        {candidate.source && (
                                            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] uppercase font-semibold bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded text-slate-500 shrink-0">
                                                {candidate.source}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end">
                                {candidate.score && (
                                    <div className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-50 rounded-full border border-amber-100">
                                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" />
                                        <span className="font-semibold text-amber-700 text-xs sm:text-sm">{candidate.score}</span>
                                    </div>
                                )}
                                {candidate.priority && (
                                    <Badge variant="outline" className={`${priorityColors[candidate.priority] || 'bg-slate-100 text-slate-600'} border text-[9px] sm:text-[10px] uppercase font-bold tracking-tight px-1.5 sm:px-2 py-0.5`}>
                                        {candidate.priority}
                                    </Badge>
                                )}
                                <Badge className={`${statusColors[candidate.status || 'new'] || 'bg-slate-100'} text-[9px] sm:text-[10px] uppercase font-bold tracking-tight px-1.5 sm:px-2 py-0.5`}>
                                    {candidate.status || 'new'}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400 hover:text-blue-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowEditModal(true);
                                    }}
                                >
                                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </Button>
                            </div>
                        </div>

                    {/* Skills & Matched Jobs */}
                    <div className="mt-3 sm:mt-4 space-y-2">
                        {candidate.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                {candidate.skills.slice(0, expanded ? undefined : 5).map((skill: any, i: number) => {
                                    const skillName = typeof skill === 'string' ? skill : skill.name;
                                    const status = typeof skill === 'string' ? 'unverified' : skill.status;
                                    const statusColor = status === 'verified' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        status === 'certified' ? 'bg-green-100 text-green-700 border-green-200' :
                                            'bg-slate-100 text-slate-600';
                                    return (
                                        <Badge key={i} variant="secondary" className={`${statusColor} font-normal border text-xs sm:text-sm px-1.5 sm:px-2 py-0.5`}>
                                            {status === 'verified' && <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />}
                                            {status === 'certified' && <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />}
                                            {skillName}
                                        </Badge>
                                    );
                                })}
                                {!expanded && candidate.skills.length > 5 && (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5">
                                        +{candidate.skills.length - 5} more
                                    </Badge>
                                )}
                            </div>
                        )}
                        {candidate.matched_jobs?.length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                {candidate.matched_jobs.map((job: string, i: number) => (
                                    <Badge key={i} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5">
                                        <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                        {job}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Expandable Content */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-b border-slate-100"
                            >
                                <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 bg-slate-50/50">
                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                                        {candidate.experience_years && (
                                            <div className="p-2.5 sm:p-3 bg-white rounded-lg">
                                                <div className="text-xs text-slate-500 mb-1">Experience</div>
                                                <div className="font-semibold text-slate-700 text-sm sm:text-base">{candidate.experience_years} years</div>
                                            </div>
                                        )}
                                        {candidate.education && (
                                            <div className="p-2.5 sm:p-3 bg-white rounded-lg">
                                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                    <GraduationCap className="w-3 h-3" /> Education
                                                </div>
                                                <div className="font-semibold text-slate-700 text-sm break-words" title={candidate.education}>{candidate.education}</div>
                                            </div>
                                        )}
                                    </div>

                                    {candidate.previous_companies && (
                                        <div className="p-2.5 sm:p-3 bg-white rounded-lg">
                                            <div className="text-xs text-slate-500 mb-1">Previous Experience</div>
                                            <div className="text-sm text-slate-700 break-words">{candidate.previous_companies}</div>
                                        </div>
                                    )}

                                    {candidate.summary && (
                                        <div className="p-2.5 sm:p-3 bg-white rounded-lg">
                                            <div className="text-xs text-slate-500 mb-1">Summary</div>
                                            <div className="text-sm text-slate-700 break-words">{candidate.summary}</div>
                                        </div>
                                    )}

                                    {/* Scoring Section */}
                                    {editing ? (
                                        <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-white rounded-xl border border-slate-200">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div className="sm:col-span-2 md:col-span-1">
                                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Full Name</label>
                                                    <Input
                                                        value={formData.full_name}
                                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                        placeholder="Name"
                                                        className="h-9 sm:h-10 text-sm"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2 md:col-span-1">
                                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
                                                    <Input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="Email"
                                                        className="h-9 sm:h-10 text-sm"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2 md:col-span-1">
                                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Phone</label>
                                                    <Input
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="Phone"
                                                        className="h-9 sm:h-10 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Score (1-10)</label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={formData.score}
                                                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                                        className="h-9 sm:h-10 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Priority</label>
                                                    <Select
                                                        value={formData.priority}
                                                        onValueChange={(v) => setFormData({ ...formData, priority: v })}
                                                    >
                                                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                                                            <SelectValue placeholder="Select priority" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="high">High</SelectItem>
                                                            <SelectItem value="medium">Medium</SelectItem>
                                                            <SelectItem value="low">Low</SelectItem>
                                                            <SelectItem value="not_interested">Not Interested</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                                                >
                                                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="new">New</SelectItem>
                                                        <SelectItem value="reviewing">Reviewing</SelectItem>
                                                        <SelectItem value="interview">Interview</SelectItem>
                                                        <SelectItem value="offer">Offer</SelectItem>
                                                        <SelectItem value="hired">Hired</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-slate-600 mb-1 block">Notes</label>
                                                <Textarea
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    placeholder="Add your notes about this candidate..."
                                                    className="resize-none text-sm"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 text-sm">
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                                    Save Changes
                                                </Button>
                                                <Button variant="outline" onClick={() => setEditing(false)} className="h-9 sm:h-10 text-sm">Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-slate-200 gap-3 sm:gap-4">
                                            <div className="space-y-1 w-full">
                                                {candidate.notes && (
                                                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 sm:line-clamp-none break-words">{candidate.notes}</p>
                                                )}
                                                {!candidate.notes && !candidate.score && !candidate.priority && (
                                                    <p className="text-xs sm:text-sm text-slate-400">No score or notes yet</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="w-full sm:w-auto h-10 sm:h-9 text-xs sm:text-sm">
                                                    Edit Info
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setShowAssessment(!showAssessment)} className="w-full sm:w-auto h-10 sm:h-9 text-xs sm:text-sm">
                                                    {showAssessment ? 'Hide' : 'Assessment'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {showAssessment && (
                                        <div className="mt-6 pt-6 border-t border-slate-200">
                                            <AssessmentForm candidate={candidate} onUpdate={onUpdate} />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Expand Button */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full py-2.5 sm:py-3 flex items-center justify-center gap-1 text-xs sm:text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Show Less</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Show Details & Score</span>
                            </>
                        )}
                    </button>
                </CardContent>
            </Card>

            <EditCandidateModal
                candidate={candidate}
                open={showEditModal}
                onOpenChange={setShowEditModal}
                onSuccess={onUpdate}
            />
        </motion.div >
    );
}
