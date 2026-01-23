import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

interface CandidateFiltersProps {
    filters: any;
    setFilters: (filters: any) => void;
    jobs: any[];
    allSkills: string[];
}

export default function CandidateFilters({ filters, setFilters, jobs, allSkills }: CandidateFiltersProps) {
    const clearFilters = () => {
        setFilters({
            search: '',
            job: '',
            priority: '',
            status: '',
            skill: '',
            minScore: ''
        });
    };

    const hasFilters = Object.values(filters).some(v => v);

    return (
        <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                </h3>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                        <X className="w-4 h-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {/* Search */}
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search name, email, skills..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10 border-slate-200"
                    />
                </div>

                {/* Job Filter */}
                <Select
                    value={filters.job}
                    onValueChange={(v) => setFilters({ ...filters, job: v })}
                >
                    <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="All Jobs" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        {jobs.map((job: any) => (
                            <SelectItem key={job._id || job.id} value={job.title}>{job.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select
                    value={filters.priority}
                    onValueChange={(v) => setFilters({ ...filters, priority: v })}
                >
                    <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="not_interested">Not Interested</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={filters.status}
                    onValueChange={(v) => setFilters({ ...filters, status: v })}
                >
                    <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                {/* Min Score */}
                <Select
                    value={filters.minScore}
                    onValueChange={(v) => setFilters({ ...filters, minScore: v })}
                >
                    <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Min Score" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Score</SelectItem>
                        <SelectItem value="7">7+</SelectItem>
                        <SelectItem value="8">8+</SelectItem>
                        <SelectItem value="9">9+</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Skills */}
            {allSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 self-center mr-2">Skills:</span>
                    {allSkills.slice(0, 10).map(skill => (
                        <button
                            key={skill}
                            onClick={() => setFilters({
                                ...filters,
                                skill: filters.skill === skill ? '' : skill
                            })}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${filters.skill === skill
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
