'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                        setIsOpen(true);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = () => {
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md mx-auto md:mx-0">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search candidates, skills, jobs..."
                    className="w-full pl-10 pr-10 py-2 text-sm bg-muted/50 border border-transparent focus:border-primary/50 focus:bg-background rounded-full transition-all outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (query.length >= 2) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[80vh] flex flex-col">

                    {results.length === 0 && !loading ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <>
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 uppercase tracking-wider">
                                Candidates ({results.length})
                            </div>
                            <div className="overflow-y-auto">
                                {results.map((candidate) => (
                                    <Link
                                        key={candidate._id}
                                        href={`/candidates/${candidate._id}`}
                                        onClick={handleSelect}
                                        className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate flex items-center gap-2">
                                                {candidate.full_name}
                                                {candidate.status === 'verified' && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Verified" />
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {candidate.email} • {candidate.phone}
                                            </div>
                                            {candidate.skills && candidate.skills.length > 0 && (
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {candidate.skills.slice(0, 3).map((s: any, i: number) => {
                                                        const skillName = typeof s === 'string' ? s : s.name;
                                                        // Highlight match if skill matches query
                                                        const isMatch = skillName.toLowerCase().includes(query.toLowerCase());
                                                        return (
                                                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-md ${isMatch ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' : 'bg-secondary text-secondary-foreground'}`}>
                                                                {skillName}
                                                            </span>
                                                        );
                                                    })}
                                                    {candidate.skills.length > 3 && (
                                                        <span className="text-[10px] text-muted-foreground px-1">+{candidate.skills.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="p-2 border-t border-border bg-muted/10">
                        <button className="w-full py-2 text-xs text-center text-primary font-medium hover:underline">
                            View all results for "{query}"
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
