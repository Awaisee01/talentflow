"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Merge, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface DuplicateManagerProps {
    onUpdate?: () => void;
}

export default function DuplicateManager({ onUpdate }: DuplicateManagerProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [duplicates, setDuplicates] = useState<any>({ byEmail: [], byPhone: [] });
    const [merging, setMerging] = useState(false);

    const fetchDuplicates = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/candidates/duplicates');
            setDuplicates(res.data);
        } catch (error) {
            console.error('Failed to fetch duplicates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchDuplicates();
    }, [open]);

    const handleMerge = async (primaryId: string, secondaryId: string) => {
        if (!confirm('Are you sure you want to merge these candidates? This action is permanent.')) return;

        setMerging(true);
        try {
            await axios.post('/api/candidates/merge', { primaryId, secondaryId });
            await fetchDuplicates();
            onUpdate?.();
        } catch (error) {
            console.error('Merge failed:', error);
            alert('Merge failed');
        } finally {
            setMerging(false);
        }
    };

    const totalDuplicates = duplicates.byEmail.length + duplicates.byPhone.length;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="hidden sm:inline">Duplicates</span>
                    {totalDuplicates > 0 && (
                        <Badge variant="destructive" className="ml-1 h-5 px-1.5 min-w-[20px] text-[10px] flex items-center justify-center">
                            {totalDuplicates}
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Copy className="w-5 h-5 text-blue-600" />
                        Potential Duplicates
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-slate-500">Scanning for duplicates...</p>
                    </div>
                ) : totalDuplicates === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
                        <p className="font-medium text-slate-700">No duplicates found!</p>
                        <p className="text-sm mt-1">Your candidate pool is clean.</p>
                    </div>
                ) : (
                    <div className="space-y-6 pt-4">
                        {duplicates.byEmail.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Duplicate Emails</h3>
                                <div className="space-y-3">
                                    {duplicates.byEmail.map((group: any) => (
                                        <div key={group._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                                            <div className="font-bold text-slate-800 flex items-center justify-between mb-2">
                                                <span>{group._id}</span>
                                                <Badge variant="outline" className="bg-white">{group.count} Candidates</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                {group.names.map((name: string, i: number) => (
                                                    <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-slate-100">
                                                        <span>{name}</span>
                                                        {i > 0 && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs gap-1"
                                                                disabled={merging}
                                                                onClick={() => handleMerge(group.ids[0], group.ids[i])}
                                                            >
                                                                <Merge className="w-3 h-3" />
                                                                Merge into first
                                                            </Button>
                                                        )}
                                                        {i === 0 && <span className="text-[10px] font-bold text-blue-600 uppercase">Primary</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {duplicates.byPhone.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Duplicate Phone Numbers</h3>
                                <div className="space-y-3">
                                    {duplicates.byPhone.map((group: any) => (
                                        <div key={group._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                                            <div className="font-bold text-slate-800 flex items-center justify-between mb-2">
                                                <span>{group._id}</span>
                                                <Badge variant="outline" className="bg-white">{group.count} Candidates</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                {group.names.map((name: string, i: number) => (
                                                    <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-slate-100">
                                                        <span>{name}</span>
                                                        {i > 0 && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 text-xs gap-1"
                                                                disabled={merging}
                                                                onClick={() => handleMerge(group.ids[0], group.ids[i])}
                                                            >
                                                                <Merge className="w-3 h-3" />
                                                                Merge into first
                                                            </Button>
                                                        )}
                                                        {i === 0 && <span className="text-[10px] font-bold text-blue-600 uppercase">Primary</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
