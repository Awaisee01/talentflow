"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { base44 } from '@/lib/api-client';

interface EditCandidateModalProps {
    candidate: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function EditCandidateModal({ candidate, open, onOpenChange, onSuccess }: EditCandidateModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        score: '',
        priority: 'medium',
        status: 'new',
        notes: ''
    });

    useEffect(() => {
        if (candidate) {
            setFormData({
                full_name: candidate.full_name || '',
                email: candidate.email || '',
                phone: candidate.phone || '',
                score: candidate.score?.toString() || '',
                priority: candidate.priority || 'medium',
                status: candidate.status || 'new',
                notes: candidate.notes || ''
            });
        }
    }, [candidate, open]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone: string) => {
        // Basic phone validation: digits, spaces, hyphens, plus sign
        return /^[+\d\s-]{7,20}$/.test(phone);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (formData.email && !validateEmail(formData.email)) {
            alert("Please enter a valid email address");
            return;
        }
        if (formData.phone && !validatePhone(formData.phone)) {
            alert("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            await base44.entities.Candidate.update(candidate._id || candidate.id, {
                ...formData,
                score: formData.score ? parseInt(formData.score) : undefined
            });
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to update candidate:', error);
            alert('Failed to update candidate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Candidate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit_full_name">Full Name</Label>
                        <Input
                            id="edit_full_name"
                            required
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_email">Email</Label>
                            <Input
                                id="edit_email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_phone">Phone Number</Label>
                            <Input
                                id="edit_phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_score">Score</Label>
                            <Input
                                id="edit_score"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.score}
                                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(v) => setFormData({ ...formData, priority: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => setFormData({ ...formData, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="screening">Screening</SelectItem>
                                    <SelectItem value="interview">Interview</SelectItem>
                                    <SelectItem value="offer">Offer</SelectItem>
                                    <SelectItem value="hired">Hired</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_notes">Notes</Label>
                        <Textarea
                            id="edit_notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <Save className="w-4 h-4 mr-2" />
                            Update Candidate
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
