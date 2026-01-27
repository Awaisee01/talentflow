"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/lib/api-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Upload, Briefcase, BarChart3, LogIn, CheckCircle2, XCircle, Trash2, Loader2, Menu, X, ExternalLink } from "lucide-react";
import ResumeUploader from '@/components/ResumeUploader';
import CandidateCard from '@/components/CandidateCard';
import CandidateFilters from '@/components/CandidateFilters';
import JobManager from '@/components/JobManager';
import ExportButton from '@/components/ExportButton';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from 'axios';
import SearchBar from '@/components/SearchBar';
import AddCandidateModal from '@/components/AddCandidateModal';
import DuplicateManager from '@/components/DuplicateManager';
import { Input } from '@/components/ui/input';
import LandingPage from '@/components/LandingPage';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
          {/* Header */}
          <header className="bg-white/70 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                    Resume Processor
                  </h1>
                </div>

                <div className="hidden sm:block flex-1 max-w-md mx-4">
                  <SearchBar />
                </div>

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <div className="hidden lg:flex items-center gap-3">
                    <a href="/apply" target="_blank" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                      <ExternalLink className="w-4 h-4" />
                      <span>Apply Page</span>
                    </a>
                    <DuplicateManager onUpdate={refreshData} />
                    <AddCandidateModal onSuccess={refreshData} />
                    <ExportButton candidates={filteredCandidates} />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </Button>

                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden border-t border-slate-100 bg-white"
                >
                  <div className="px-4 py-6 space-y-4">
                    <div className="flex flex-col gap-3">
                      <DuplicateManager onUpdate={refreshData} />
                      <AddCandidateModal onSuccess={refreshData} />
                      <ExportButton candidates={filteredCandidates} />
                      <a href="/apply" target="_blank" className="flex items-center justify-center gap-2 w-full p-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50">
                        <ExternalLink className="w-4 h-4" />
                        Apply Page
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Talent Pipeline</h2>
                <p className="text-sm text-slate-500 font-medium">Manage and process your candidate pool with AI</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm w-fit">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Online
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Candidates', value: stats.total, icon: Users, color: 'blue' },
                { label: 'New', value: stats.new, icon: Upload, color: 'green' },
                { label: 'Verified', value: stats.verified, icon: CheckCircle2, color: 'indigo' },
                { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/80 backdrop-blur rounded-xl p-4 md:p-5 shadow-lg border border-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="w-full justify-start overflow-x-auto no-scrollbar bg-white/80 backdrop-blur p-1 rounded-xl shadow-md flex-nowrap border border-slate-100">
                <TabsTrigger value="candidates" className="flex-1 lg:flex-none rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 font-bold transition-all">
                  <Users className="w-4 h-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Candidates</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex-1 lg:flex-none rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 font-bold transition-all">
                  <Upload className="w-4 h-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Upload Resumes</span>
                </TabsTrigger>
                <TabsTrigger value="jobs" className="flex-1 lg:flex-none rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 font-bold transition-all">
                  <Briefcase className="w-4 h-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Job Positions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="candidates" className="space-y-6 outline-none">
                <CandidateFilters
                  filters={filters}
                  setFilters={setFilters}
                  jobs={jobs}
                  allSkills={allSkills}
                />

                {loadingCandidates ? (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-bold">Syncing data...</p>
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="text-center py-24 bg-white/50 backdrop-blur rounded-3xl border border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No candidates found</h3>
                    <p className="text-slate-500 mt-2">Adjust your filters or upload some resumes to start.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                      {selectedIds.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="sticky top-24 z-40 bg-blue-600 text-white shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-500"
                        >
                          <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <span className="font-bold text-lg">{selectedIds.length} Selected</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="hover:bg-blue-500 text-white">Deselect</Button>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(filteredCandidates.map((c: any) => c._id || c.id))} className="hover:bg-blue-500 text-white">Select All</Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                            <Select onValueChange={(v) => handleBulkUpdate({ status: v })}>
                              <SelectTrigger className="w-[120px] h-9 bg-blue-500 border-blue-400 text-white placeholder:text-blue-100">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="reviewing">Reviewing</SelectItem>
                                <SelectItem value="interview">Interview</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select onValueChange={(v) => handleBulkUpdate({ priority: v })}>
                              <SelectTrigger className="w-[120px] h-9 bg-blue-500 border-blue-400 text-white placeholder:text-blue-100">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              type="number"
                              placeholder="Score"
                              className="w-20 h-9 bg-blue-500 border-blue-400 text-white placeholder:text-blue-200"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value;
                                  if (val) handleBulkUpdate({ score: parseInt(val) });
                                }
                              }}
                            />

                            <ExportButton
                              candidates={filteredCandidates.filter((c: any) => selectedIds.includes(c._id || c.id))}
                              label="Export"
                              variant="secondary"
                            />

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleBulkDelete}
                              disabled={bulkActionLoading}
                              className="bg-red-500 hover:bg-red-600 text-white border-none shadow-lg"
                            >
                              {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 md:mr-2" />}
                              <span className="hidden md:inline font-bold">Delete</span>
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {filteredCandidates.map((candidate: any) => (
                        <motion.div
                          layout
                          key={candidate._id || candidate.id}
                          className="flex gap-2 sm:gap-4 items-start group"
                        >
                          <div className="pt-6 sm:pt-8 shrink-0">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                              checked={selectedIds.includes(candidate._id || candidate.id)}
                              onChange={(e) => {
                                const id = candidate._id || candidate.id;
                                if (e.target.checked) setSelectedIds([...selectedIds, id]);
                                else setSelectedIds(selectedIds.filter(i => i !== id));
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CandidateCard
                              candidate={candidate}
                              onUpdate={refreshData}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload" className="outline-none">
                <div className="max-w-3xl mx-auto py-8">
                  <ResumeUploader jobs={jobs} onSuccess={refreshData} />
                </div>
              </TabsContent>

              <TabsContent value="jobs" className="outline-none">
                <div className="max-w-4xl mx-auto py-8">
                  <JobManager jobs={jobs} onUpdate={refreshData} />
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </SignedIn>

      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}
