"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/lib/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Upload, Briefcase, BarChart3, LogIn, CheckCircle2, XCircle } from "lucide-react";
import ResumeUploader from '@/components/ResumeUploader';
import CandidateCard from '@/components/CandidateCard';
import CandidateFilters from '@/components/CandidateFilters';
import JobManager from '@/components/JobManager';
import ExportButton from '@/components/ExportButton';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2 } from "lucide-react";
import axios from 'axios';
import SearchBar from '@/components/SearchBar';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('candidates');
  const [filters, setFilters] = useState({
    search: '',
    job: '',
    priority: '',
    status: '',
    skill: '',
    minScore: ''
  });

  // Fetch Candidates
  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => base44.entities.Candidate.list('-created_date')
  });

  // Fetch Jobs
  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.JobPosition.list()
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['candidates'] });
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} candidates?`)) return;
    setBulkActionLoading(true);
    try {
      await axios.delete('/api/candidates/bulk', { data: { ids: selectedIds } });
      setSelectedIds([]);
      refreshData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete candidates');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkUpdate = async (updates: any) => {
    if (!confirm(`Update ${selectedIds.length} candidates?`)) return;
    setBulkActionLoading(true);
    try {
      await axios.patch('/api/candidates/bulk', { ids: selectedIds, updates });
      setSelectedIds([]);
      refreshData();
    } catch (e) {
      console.error(e);
      alert('Failed to update candidates');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    candidates.forEach((c: any) => c.skills?.forEach((s: any) => skills.add(typeof s === 'string' ? s : s.name)));
    return Array.from(skills);
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c: any) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          c.full_name?.toLowerCase().includes(search) ||
          c.email?.toLowerCase().includes(search) ||
          c.skills?.some((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }
      if (filters.job && filters.job !== 'all') {
        if (!c.matched_jobs?.includes(filters.job)) return false;
      }
      if (filters.priority && filters.priority !== 'all') {
        if (c.priority !== filters.priority) return false;
      }
      if (filters.status && filters.status !== 'all') {
        if (c.status !== filters.status) return false;
      }
      if (filters.skill) {
        if (!c.skills?.some((s: any) => (typeof s === 'string' ? s : s.name) === filters.skill)) return false;
      }
      if (filters.minScore && filters.minScore !== 'all') {
        if (!c.score || c.score < parseInt(filters.minScore)) return false;
      }
      return true;
    });
  }, [candidates, filters]);

  const stats = useMemo(() => ({
    total: candidates.length,
    new: candidates.filter((c: any) => c.status === 'new').length,
    verified: candidates.filter((c: any) => c.skills?.some((s: any) => typeof s !== 'string' && s.status === 'verified')).length,
    rejected: candidates.filter((c: any) => c.status === 'rejected').length
  }), [candidates]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">


      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Resume Processor
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">AI-powered candidate management</p>
            </div>

            {/* Global Search */}
            <SignedIn>
              <div className="flex-1 max-w-md mx-4">
                <SearchBar />
              </div>
            </SignedIn>

            <div className="flex items-center gap-4 shrink-0">
              <SignedIn>
                <ExportButton candidates={filteredCandidates} />
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignedIn>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Candidates', value: stats.total, icon: Users, color: 'blue' },
              { label: 'New Results', value: stats.new, icon: Upload, color: 'green' },
              { label: 'Verified Skills', value: stats.verified, icon: CheckCircle2, color: 'indigo' },
              { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur rounded-xl p-5 shadow-lg border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur p-1 rounded-xl shadow-md">
              <TabsTrigger value="candidates" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Candidates
              </TabsTrigger>
              <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="candidates" className="space-y-6">
              <CandidateFilters
                filters={filters}
                setFilters={setFilters}
                jobs={jobs}
                allSkills={allSkills}
              />

              {loadingCandidates ? (
                <div className="text-center py-12 text-slate-500">Loading candidates...</div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No candidates found</p>
                  <p className="text-sm text-slate-400 mt-1">Upload resumes to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence>
                    {/* Bulk Action Bar */}
                    {selectedIds.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="sticky top-20 z-40 bg-white border border-blue-200 shadow-xl rounded-xl p-4 mb-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-slate-800">{selectedIds.length} Selected</span>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Deselect All</Button>

                          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(filteredCandidates.map((c: any) => c._id || c.id))}>Select All</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Bulk Status */}
                          <Select onValueChange={(v) => handleBulkUpdate({ status: v })}>
                            <SelectTrigger className="w-[140px] h-9">
                              <SelectValue placeholder="Set Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Bulk Priority */}
                          <Select onValueChange={(v) => handleBulkUpdate({ priority: v })}>
                            <SelectTrigger className="w-[140px] h-9">
                              <SelectValue placeholder="Set Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="h-6 w-px bg-slate-200 mx-2" />

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={bulkActionLoading}
                          >
                            {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete Selected
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {filteredCandidates.map((candidate: any) => (
                      <div key={candidate._id || candidate.id} className="flex gap-3">
                        <div className="pt-4">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedIds.includes(candidate._id || candidate.id)}
                            onChange={(e) => {
                              const id = candidate._id || candidate.id;
                              if (e.target.checked) setSelectedIds([...selectedIds, id]);
                              else setSelectedIds(selectedIds.filter(i => i !== id));
                            }}
                          />
                        </div>
                        <CandidateCard
                          candidate={candidate}
                          onUpdate={refreshData}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload">
              <div className="max-w-2xl mx-auto">
                <ResumeUploader jobs={jobs} onSuccess={refreshData} />
              </div>
            </TabsContent>

            <TabsContent value="jobs">
              <div className="max-w-2xl mx-auto">
                <JobManager jobs={jobs} onUpdate={refreshData} />
              </div>
            </TabsContent>
          </Tabs>
        </SignedIn>

        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome to Resume Processor</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-lg">
              AI-powered candidate management and resume parsing.
            </p>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
            </SignInButton>
          </div>
        </SignedOut>
      </main>
    </div >
  );
}
