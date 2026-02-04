import React, { useState, useEffect } from 'react';
import { getProcessingCandidates } from '@/api/hr/candidates.api';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronUp, ChevronDown, CheckCircle2, History, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ParsingStatusWidget = () => {
    const [processing, setProcessing] = useState<any[]>([]);
    const [minimized, setMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await getProcessingCandidates();
            if (res.data.success) {
                const candidates = res.data.candidates;
                setProcessing(candidates);
                setIsVisible(candidates.length > 0);
            }
        } catch (error) {
            console.error('Failed to fetch parsing status', error);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
            "w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden",
            minimized ? "h-12" : "h-auto max-h-[400px]"
        )}>
            {/* Header */}
            <div className="bg-indigo-600 px-4 py-2.5 flex items-center justify-between text-white cursor-pointer"
                onClick={() => setMinimized(!minimized)}>
                <div className="flex items-center gap-2 font-semibold text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing ({processing.length})</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); fetchStatus(); }}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Sync Now"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" />
                    </button>
                    {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            {/* List */}
            {!minimized && (
                <div className="p-3 overflow-y-auto max-h-[350px] space-y-4">
                    {processing.map((c) => (
                        <div key={c._id} className="space-y-1.5 p-2 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-gray-700 truncate max-w-[180px]">
                                    {c.name}
                                </span>
                                <Badge variant="secondary" className="text-[9px] px-1 h-4 bg-yellow-100 text-yellow-700 border-yellow-200">
                                    {c.parsingProgress}%
                                </Badge>
                            </div>
                            <Progress value={c.parsingProgress} className="h-1" />
                            <p className="text-[10px] text-gray-500 italic truncate">
                                {c.parsingStatusMessage || "Waiting in queue..."}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
