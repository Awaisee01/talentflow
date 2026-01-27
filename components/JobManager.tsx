import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, Plus, X, Trash2, Loader2, Copy } from "lucide-react";
import { base44 } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

interface JobManagerProps {
    jobs: any[];
    onUpdate?: () => void;
}

export default function JobManager({ jobs, onUpdate }: JobManagerProps) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', required_skills: [] as string[] });
    const [skillInput, setSkillInput] = useState('');

    const addSkill = () => {
        if (skillInput.trim() && !newJob.required_skills.includes(skillInput.trim())) {
            setNewJob({ ...newJob, required_skills: [...newJob.required_skills, skillInput.trim()] });
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setNewJob({ ...newJob, required_skills: newJob.required_skills.filter(s => s !== skill) });
    };

    const saveJob = async () => {
        if (!newJob.title.trim()) return;
        setSaving(true);
        try {
            await base44.entities.JobPosition.create({
                title: newJob.title,
                description: newJob.description,
                required_skills: newJob.required_skills,
                is_active: true
            });
            setNewJob({ title: '', description: '', required_skills: [] });
            setOpen(false);
            onUpdate?.();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // Note: Delete method might not be implemented in client wrapper yet, let's assume it exits or add logic later.
    // For now, simple console log if missing.
    const deleteJob = async (jobId: string) => {
        if (confirm("Are you sure you want to delete this job?")) {
            // Mock delete or implement API route for DELETE.
            // base44.entities.JobPosition.delete(jobId);
            console.warn("Delete job not fully implemented in client wrapper, add API route for DELETE /api/jobs/[id]");
        }
        onUpdate?.();
    };

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        Job Positions ({jobs.length})
                    </CardTitle>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-1" />
                                Add Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Job Position</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Job Title</label>
                                    <Input
                                        value={newJob.title}
                                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                        placeholder="e.g., Senior Developer"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
                                    <Textarea
                                        value={newJob.description}
                                        onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                        placeholder="Job description..."
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Required Skills</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            placeholder="Add a skill"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        />
                                        <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {newJob.required_skills.map(skill => (
                                            <Badge key={skill} variant="secondary" className="pr-1">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-500">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={saveJob} disabled={saving || !newJob.title.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Job Position'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {jobs.length === 0 ? (
                        <p className="text-center text-slate-500 py-6">No job positions yet. Add your first one!</p>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map((job: any) => (
                                <motion.div
                                    key={job._id || job.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-4 bg-slate-50 rounded-xl"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-700">{job.title}</h4>
                                            {job.description && (
                                                <p className="text-sm text-slate-500 mt-1">{job.description}</p>
                                            )}
                                            {job.required_skills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {job.required_skills.map((skill: string) => (
                                                        <Badge key={skill} variant="secondary" className="bg-white text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const url = `${window.location.origin}/apply?job=${encodeURIComponent(job.title)}`;
                                                    navigator.clipboard.writeText(url);
                                                    alert('Apply link copied to clipboard!');
                                                }}
                                                className="text-slate-400 hover:text-blue-600 h-8 px-2"
                                            >
                                                <Copy className="w-4 h-4 mr-1" />
                                                Copy Link
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteJob(job._id || job.id)}
                                                className="text-slate-400 hover:text-red-500 h-8 w-8"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
