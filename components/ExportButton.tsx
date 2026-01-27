import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
    candidates: any[];
    label?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function ExportButton({ candidates, label, variant = "outline" }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false);

    const exportToCSV = () => {
        setExporting(true);

        const headers = [
            'Full Name',
            'Email',
            'Phone',
            'Skills',
            'Experience (Years)',
            'Education',
            'Previous Companies',
            'Matched Jobs',
            'Score',
            'Priority',
            'Status',
            'Notes',
            'Summary'
        ];

        const rows = candidates.map(c => [
            c.full_name || '',
            c.email || '',
            c.phone || '',
            (c.skills || []).map((s: any) => typeof s === 'string' ? s : s.name).join('; '),
            c.experience_years || '',
            c.education || '',
            c.previous_companies || '',
            (c.matched_jobs || []).join('; '),
            c.score || '',
            c.priority || '',
            c.status || '',
            c.notes || '',
            c.summary || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row =>
                row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExporting(false);
    };

    return (
        <Button
            onClick={exportToCSV}
            disabled={exporting || candidates.length === 0}
            variant={variant}
            size="sm"
            className={variant === "outline" ? "border-slate-200" : ""}
        >
            {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4 mr-0 sm:mr-2" />
            )}
            <span className="hidden sm:inline">
                {label || `Export (${candidates.length})`}
            </span>
        </Button>
    );
}
