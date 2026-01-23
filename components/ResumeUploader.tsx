"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { base44 } from '@/lib/api-client';

interface ResumeUploaderProps {
    jobs: any[];
    onSuccess?: () => void;
}

export default function ResumeUploader({ jobs, onSuccess }: ResumeUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [emailText, setEmailText] = useState('');
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files as FileList)]);
        }
    }, []);

    const handleFileSelect = (e: any) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const processResumes = async () => {
        setProcessing(true);
        setResults([]);

        const processFile = async (file: File) => {
            try {
                const formData = new FormData();
                formData.append('resume', file);

                // Call server-side parsing API
                const response = await axios.post('/api/parse-resume', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                const { candidates } = response.data;
                const items = candidates || [];

                // Prepare all candidates for batch insert
                const candidatesToCreate = items.map((item: any) => ({
                    ...item,
                    full_name: item.full_name || item.email || "Unknown Candidate",
                    status: 'new',
                    summary: item.summary || `Imported via Resume Upload`,
                    source: 'Upload'
                }));

                // BATCH CREATE: Send all candidates in a single request
                console.log(`[UPLOADER] Attempting to create ${candidatesToCreate.length} candidates via batch insert`);
                if (candidatesToCreate.length > 0) {
                    const result = await base44.entities.Candidate.create(candidatesToCreate);
                    console.log('[UPLOADER] Batch create result:', result);
                }

                return {
                    success: true,
                    name: `${file.name} (${candidatesToCreate.length} candidates)`
                };
            } catch (error: any) {
                console.error('Process error:', error);
                return { success: false, name: file.name, error: error.message || 'Failed' };
            }
        };

        const allResults = [];

        for (const file of files) {
            const result = await processFile(file);
            allResults.push(result);
            setResults([...allResults]);
        }

        // TODO job for later: implement text-based processing via API if needed, for now sticking to file upload as primary.

        setProcessing(false);
        setFiles([]);

        if (allResults.some(r => r.success)) {
            onSuccess?.();
        }
    };

    const hasContent = files.length > 0 || emailText.trim().length > 0;

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    Upload Resumes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* File Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                        ${dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }
                    `}
                >
                    <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-700 font-medium">Drop files here or click to browse</p>
                            <p className="text-sm text-slate-500 mt-1">PDF, Word, Images supported</p>
                        </div>
                    </div>
                </div>

                {/* Selected Files */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            {files.map((file, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-slate-500" />
                                        <span className="text-sm text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        ×
                                    </Button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Email Text Input - Placeholder for now until Text API is ready */}
                {/* <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Mail className="w-4 h-4 text-slate-500" />
                        Or paste email/resume text
                    </label>
                    <Textarea
                        value={emailText}
                        onChange={(e) => setEmailText(e.target.value)}
                        placeholder="Paste resume content or email with candidate information..."
                        className="min-h-[120px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div> */}

                {/* Process Button */}
                <Button
                    onClick={processResumes}
                    disabled={!hasContent || processing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-base font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
                >
                    {processing ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5 mr-2" />
                            Process {files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : ''}
                        </>
                    )}
                </Button>

                {/* Results */}
                <AnimatePresence>
                    {results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-2 pt-4 border-t border-slate-100"
                        >
                            <p className="text-sm font-medium text-slate-600">Processing Results:</p>
                            {results.map((result, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-center gap-2 p-3 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'
                                        }`}
                                >
                                    {result.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <span className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                        {result.name}: {result.success ? 'Added successfully' : result.error}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
