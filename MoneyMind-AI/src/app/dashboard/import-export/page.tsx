'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function ImportExportPage() {
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportResult(null);

        try {
            const text = await file.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const supabase = createClient();
            let success = 0;
            let failed = 0;

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const values = lines[i].split(',').map(v => v.trim());
                const row: any = {};
                headers.forEach((h, idx) => {
                    row[h] = values[idx];
                });

                try {
                    const { error } = await supabase.from('transactions').insert({
                        description: row.description || row.Description,
                        amount: parseFloat(row.amount || row.Amount),
                        type: (row.type || row.Type || 'expense').toLowerCase(),
                        category: row.category || row.Category || 'Other',
                        occurred_at: row.date || row.Date || new Date().toISOString(),
                        status: 'completed',
                    });

                    if (error) {
                        failed++;
                    } else {
                        success++;
                    }
                } catch {
                    failed++;
                }
            }

            setImportResult({ success, failed });
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import CSV. Please check the file format.');
        } finally {
            setImporting(false);
        }
    };

    const handleExport = async (format: 'csv' | 'pdf') => {
        setExporting(true);

        try {
            const supabase = createClient();
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .order('occurred_at', { ascending: false });

            if (!transactions || transactions.length === 0) {
                alert('No transactions to export');
                return;
            }

            if (format === 'csv') {
                // Generate CSV
                const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Status'];
                const rows = transactions.map(t => [
                    new Date(t.occurred_at).toLocaleDateString(),
                    t.description,
                    t.amount,
                    t.type,
                    t.category,
                    t.status,
                ]);

                const csv = [
                    headers.join(','),
                    ...rows.map(row => row.join(','))
                ].join('\n');

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `moneymind-transactions-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                alert('PDF export coming soon! Use CSV export for now.');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export transactions');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Import & Export</h1>
                <p className="text-[var(--muted-text)]">Manage your transaction data</p>
            </div>

            {/* Import Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-6"
            >
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <Upload className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Import Transactions</h3>
                        <p className="text-sm text-[var(--muted-text)]">
                            Upload a CSV file to bulk import your transactions. The file should have columns: date, description, amount, type, category
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className={cn(
                        'block p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all',
                        'hover:border-indigo-500/50 hover:bg-indigo-500/5',
                        importing && 'opacity-50 cursor-not-allowed'
                    )}>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            disabled={importing}
                            className="hidden"
                        />
                        <div className="text-center">
                            <Upload className="w-12 h-12 text-[var(--muted-text)] mx-auto mb-3" />
                            <p className="font-medium mb-1">
                                {importing ? 'Importing...' : 'Click to upload CSV file'}
                            </p>
                            <p className="text-sm text-[var(--muted-text)]">
                                or drag and drop your file here
                            </p>
                        </div>
                    </label>

                    {importResult && (
                        <div className={cn(
                            'p-4 rounded-lg border',
                            importResult.failed === 0
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-amber-500/10 border-amber-500/30'
                        )}>
                            <div className="flex items-start gap-3">
                                {importResult.failed === 0 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className="font-medium mb-1">Import Complete</p>
                                    <p className="text-sm text-[var(--muted-text)]">
                                        Successfully imported {importResult.success} transactions
                                        {importResult.failed > 0 && `, ${importResult.failed} failed`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-sm text-indigo-400 mb-2">📋 CSV Format Example:</p>
                        <pre className="text-xs bg-black/20 p-3 rounded overflow-x-auto">
                            date,description,amount,type,category{'\n'}
                            2026-02-20,Grocery Shopping,2500,expense,Groceries{'\n'}
                            2026-02-21,Salary,50000,income,Salary
                        </pre>
                    </div>
                </div>
            </motion.div>

            {/* Export Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-glass p-6"
            >
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Download className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Export Transactions</h3>
                        <p className="text-sm text-[var(--muted-text)]">
                            Download your transaction history in CSV or PDF format
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={exporting}
                        className={cn(
                            'p-6 rounded-xl border-2 border-[var(--glass-border)] hover:border-emerald-500/30',
                            'transition-all text-left group',
                            exporting && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <FileText className="w-8 h-8 text-emerald-400 mb-3" />
                        <h4 className="font-semibold mb-1">Export as CSV</h4>
                        <p className="text-sm text-[var(--muted-text)]">
                            Download transactions in spreadsheet format
                        </p>
                    </button>

                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={exporting}
                        className={cn(
                            'p-6 rounded-xl border-2 border-[var(--glass-border)] hover:border-rose-500/30',
                            'transition-all text-left group',
                            exporting && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <FileText className="w-8 h-8 text-rose-400 mb-3" />
                        <h4 className="font-semibold mb-1">Export as PDF</h4>
                        <p className="text-sm text-[var(--muted-text)]">
                            Generate a formatted PDF report
                        </p>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
