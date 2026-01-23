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
    ChevronDown, ChevronUp, FileText, Save, Loader2, CheckCircle2, Award
} from "lucide-react";
import { base44 } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import AssessmentForm from "./AssessmentForm";

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
    const [showAssessment, setShowAssessment] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        score: candidate.score || '',
        priority: candidate.priority || '',
        notes: candidate.notes || '',
        status: candidate.status || 'new'
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            await base44.entities.Candidate.update(candidate._id, {
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
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                                    {candidate.full_name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-slate-800 text-lg truncate">{candidate.full_name || 'Unknown'}</h3>
                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                                        {candidate.email && (
                                            <span className="flex items-center gap-1 shrink-0">
                                                <Mail className="w-3.5 h-3.5" />
                                                {candidate.email}
                                            </span>
                                        )}
                                        {candidate.phone && (
                                            <span className="flex items-center gap-1 shrink-0">
                                                <Phone className="w-3.5 h-3.5" />
                                                {candidate.phone}
                                            </span>
                                        )}
                                        {candidate.source && (
                                            <span className="flex items-center gap-1 text-xs bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                                Source: {candidate.source}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                                {candidate.score && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span className="font-semibold text-amber-700">{candidate.score}</span>
                                    </div>
                                )}
                                {candidate.priority && (
                                    <Badge className={`${priorityColors[candidate.priority] || 'bg-slate-100 text-slate-600'} border`}>
                                        {candidate.priority}
                                    </Badge>
                                )}
                                <Badge className={statusColors[candidate.status || 'new'] || 'bg-slate-100'}>
                                    {candidate.status || 'new'}
                                </Badge>
                            </div>
                        </div>

                        {/* Skills & Matched Jobs */}
                        <div className="mt-4 space-y-2">
                            {candidate.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {candidate.skills.slice(0, expanded ? undefined : 5).map((skill: any, i: number) => {
                                        const skillName = typeof skill === 'string' ? skill : skill.name;
                                        const status = typeof skill === 'string' ? 'unverified' : skill.status;
                                        const statusColor = status === 'verified' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            status === 'certified' ? 'bg-green-100 text-green-700 border-green-200' :
                                                'bg-slate-100 text-slate-600';
                                        return (
                                            <Badge key={i} variant="secondary" className={`${statusColor} font-normal border`}>
                                                {status === 'verified' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                {status === 'certified' && <Award className="w-3 h-3 mr-1" />}
                                                {skillName}
                                            </Badge>
                                        );
                                    })}
                                    {!expanded && candidate.skills.length > 5 && (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                                            +{candidate.skills.length - 5} more
                                        </Badge>
                                    )}
                                </div>
                            )}
                            {candidate.matched_jobs?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {candidate.matched_jobs.map((job: string, i: number) => (
                                        <Badge key={i} className="bg-blue-50 text-blue-700 border border-blue-200">
                                            <Briefcase className="w-3 h-3 mr-1" />
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
                                <div className="p-5 space-y-4 bg-slate-50/50">
                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {candidate.experience_years && (
                                            <div className="p-3 bg-white rounded-lg">
                                                <div className="text-xs text-slate-500 mb-1">Experience</div>
                                                <div className="font-semibold text-slate-700">{candidate.experience_years} years</div>
                                            </div>
                                        )}
                                        {candidate.education && (
                                            <div className="p-3 bg-white rounded-lg">
                                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                                    <GraduationCap className="w-3 h-3" /> Education
                                                </div>
                                                <div className="font-semibold text-slate-700 text-sm truncate" title={candidate.education}>{candidate.education}</div>
                                            </div>
                                        )}
                                    </div>

                                    {candidate.previous_companies && (
                                        <div className="p-3 bg-white rounded-lg">
                                            <div className="text-xs text-slate-500 mb-1">Previous Experience</div>
                                            <div className="text-sm text-slate-700">{candidate.previous_companies}</div>
                                        </div>
                                    )}

                                    {candidate.summary && (
                                        <div className="p-3 bg-white rounded-lg">
                                            <div className="text-xs text-slate-500 mb-1">Summary</div>
                                            <div className="text-sm text-slate-700">{candidate.summary}</div>
                                        </div>
                                    )}

                                    {/* Scoring Section */}
                                    {editing ? (
                                        <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Score (1-10)</label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={formData.score}
                                                        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                                        className="h-10"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 mb-1 block">Priority</label>
                                                    <Select
                                                        value={formData.priority}
                                                        onValueChange={(v) => setFormData({ ...formData, priority: v })}
                                                    >
                                                        <SelectTrigger className="h-10">
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
                                                    <SelectTrigger className="h-10">
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
                                                    className="resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                                    Save
                                                </Button>
                                                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                                            <div className="space-y-1">
                                                {candidate.notes && (
                                                    <p className="text-sm text-slate-600">{candidate.notes}</p>
                                                )}
                                                {!candidate.notes && !candidate.score && !candidate.priority && (
                                                    <p className="text-sm text-slate-400">No score or notes yet</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                                                    Edit Score & Notes
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setShowAssessment(!showAssessment)}>
                                                    {showAssessment ? 'Hide' : 'Show'} Full Assessment
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
                        className="w-full py-3 flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                Show Details & Score
                            </>
                        )}
                    </button>
                </CardContent>
            </Card>
        </motion.div>
    );
}
