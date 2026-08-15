import React, { useEffect, useState } from 'react';
import { useCandidateReview } from '../hooks/useCandidateReview.js';
import { REVIEW_STATES } from '../config/constants.js';
import { TIMELINE_EVENT_TYPES } from '../../replay/config/constants.js';
import { useReplay } from '../../replay/hooks/useReplay.js';
import { ReplayPlayer } from '../../replay/components/ReplayPlayer.jsx';
import toast from 'react-hot-toast';
import {
    Mail, Briefcase, Building2, Calendar, ThumbsUp, AlertCircle,
    ChevronDown, Sparkles, RotateCcw, FileText, PlayCircle,
    Share2, CheckCircle2, BarChart3, Clock, Video
} from 'lucide-react';

export const CandidateWorkspace = ({ resultData, onReEnroll, onViewResume }) => {
    const { state, actions } = useCandidateReview();
    const { currentTime, controls, timeline, activeEntries } = useReplay();
    const [activeTab, setActiveTab] = useState('evaluation'); // 'evaluation' | 'session-details'
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    useEffect(() => {
        if (resultData) {
            actions.loadSession(resultData);
        }
    }, [resultData, actions]);

    if (!resultData) return null;

    if (state === REVIEW_STATES.LOADING) {
        return (
            <div className="p-12 text-center text-[var(--color-text-muted)] animate-pulse text-xs font-medium">
                Loading candidate workspace...
            </div>
        );
    }

    if (state === REVIEW_STATES.ERROR) {
        return (
            <div className="p-12 text-center text-[var(--color-danger)] font-medium text-xs">
                Failed to load candidate data.
            </div>
        );
    }

    const { candidate, interview, summary, evaluation, charts, questionBreakdown } = resultData;

    const formattedDate = interview?.createdAt
        ? new Date(interview.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Unknown Date';

    const overallScore = Number(summary?.overallScore ?? evaluation?.score ?? 0);

    // Dynamic 3-tier score threshold
    const getScoreStatus = (score) => {
        const num = Number(score);
        if (num >= 7) {
            return {
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
                label: 'Strong / Passing'
            };
        }
        if (num >= 4) {
            return {
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
                label: 'Borderline'
            };
        }
        return {
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
            label: 'Needs Improvement'
        };
    };

    const overallStatus = getScoreStatus(overallScore);

    // Grouped metric breakdown
    const metrics = [
        { label: 'Technical ability', score: charts?.technical ?? 0 },
        { label: 'Communication', score: charts?.communication ?? 0 },
        { label: 'Confidence', score: charts?.confidence ?? 0 },
        { label: 'Problem solving', score: charts?.problemSolving ?? 0 },
    ];

    // Extract actual question timestamps from Replay Timeline
    const questionsTimeline = timeline?.filter(t => t.type === TIMELINE_EVENT_TYPES.QUESTION) || [];

    // Find active question based on useReplay activeEntries
    const activeQuestionId = activeEntries?.find(e => e.type === TIMELINE_EVENT_TYPES.QUESTION)?.id;

    const handleShareLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Evaluation link copied to clipboard. Anyone with this link can view this candidate's evaluation — link does not expire.", {
            duration: 4500,
            icon: '🔗',
            style: {
                background: 'var(--color-surface, #16161E)',
                color: 'var(--color-text-primary, #FFFFFF)',
                border: '1px solid var(--color-border, #232330)',
                fontSize: '12px',
            }
        });
    };

    return (
        <div className="w-full bg-transparent text-[var(--color-text-primary)] font-['Inter'] space-y-6">
            {/* Candidate Info Header */}
                <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 relative overflow-hidden transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-5 sm:gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center text-2xl sm:text-3xl font-medium text-[var(--color-primary)] border border-[var(--color-border)] shrink-0">
                                {candidate?.name ? candidate.name.charAt(0).toUpperCase() : 'C'}
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] tracking-tight">
                                        {candidate?.name || 'Candidate'}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-0.5">
                                        <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                                        <span>{candidate?.email || 'N/A'}</span>

                                        {onViewResume && (
                                            <button
                                                onClick={onViewResume}
                                                className="ml-2 px-2.5 py-0.5 bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] hover:bg-[var(--primary-tint)]/80 border border-[var(--color-border-active,#6338F6)]/30 rounded-lg text-[11px] font-medium transition-colors inline-flex items-center gap-1.5"
                                            >
                                                <FileText className="w-3 h-3" />
                                                <span>View resume</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-0.5">
                                    <div className="px-3 py-1 bg-[var(--color-surface-hover)] rounded-xl flex items-center gap-1.5 border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
                                        <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                        <span>{interview?.jobRole || 'Applicant'}</span>
                                    </div>
                                    <div className="px-3 py-1 bg-[var(--color-surface-hover)] rounded-xl flex items-center gap-1.5 border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
                                        <Building2 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                                        <span>IntervuOS</span>
                                    </div>
                                    <div className="px-3 py-1 bg-[var(--color-surface-hover)] rounded-xl flex items-center gap-1.5 border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
                                        <Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                                        <span>{formattedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Console */}
                        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                            <button
                                onClick={handleShareLink}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-xl transition-colors text-xs font-medium"
                                title="Copy evaluation link (does not expire)"
                            >
                                <Share2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                <span>Share link</span>
                            </button>

                            {onReEnroll && (
                                <button
                                    onClick={onReEnroll}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--primary-tint)]/80 text-[var(--color-text-accent,#C4B5FD)] border border-[var(--color-border-active,#6338F6)]/40 rounded-xl transition-colors text-xs font-medium"
                                    title="Re-enroll candidate for a new attempt"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Re-enroll</span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex gap-2 border-b border-[var(--color-border)] overflow-x-auto pb-0">
                    <button
                        onClick={() => setActiveTab('evaluation')}
                        className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'evaluation'
                            ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                            : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                    >
                        Evaluation
                    </button>
                    <button
                        onClick={() => setActiveTab('session-details')}
                        className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'session-details'
                            ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                            : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                    >
                        Session details
                    </button>
                </div>

                {/* Tab Content: Evaluation */}
                {activeTab === 'evaluation' && (
                    <div className="space-y-6">

                        {/* Top Performance Row: AI Summary + Grouped Horizontal Metric Bars & Score Trend */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* AI Summary Card (5 Cols) */}
                            <section className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] flex items-center justify-center text-[var(--color-text-accent,#C4B5FD)]">
                                                <Sparkles className="w-3.5 h-3.5" />
                                            </div>
                                            <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                                                AI Summary
                                            </h2>
                                        </div>

                                        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border inline-flex items-center gap-1.5 ${overallStatus.bg}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${overallStatus.dot}`}></span>
                                            <span>{summary?.recommendation ? summary.recommendation.replace('_', ' ') : overallStatus.label}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className={`text-5xl sm:text-6xl font-medium leading-none tracking-tight ${overallStatus.color}`}>
                                            {overallScore.toFixed(1)}
                                        </span>
                                        <span className="text-sm text-[var(--color-text-secondary)] font-normal">/ 10</span>
                                    </div>

                                    {summary?.interpretation && (
                                        <div className="text-xs text-[var(--color-text-secondary)] mb-3 font-normal">
                                            {summary.interpretation}
                                        </div>
                                    )}
                                </div>

                                {summary?.reasoning && (
                                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic border-l-2 border-[var(--color-primary)]/50 pl-3.5 py-0.5">
                                        "{summary.reasoning}"
                                    </p>
                                )}
                            </section>

                            {/* Performance Analytics: Grouped Horizontal Bars + Trend (7 Cols) */}
                            <section className="lg:col-span-7 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col justify-between space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] flex items-center justify-center text-[var(--color-text-accent,#C4B5FD)]">
                                                <BarChart3 className="w-3.5 h-3.5" />
                                            </div>
                                            <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                                                Performance Analytics
                                            </h2>
                                        </div>
                                        <span className="text-[11px] text-[var(--color-text-muted)]">
                                            Scale 0 – 10
                                        </span>
                                    </div>

                                    {/* Grouped Horizontal Metric Bars */}
                                    <div className="space-y-3.5">
                                        {metrics.map((metric, idx) => {
                                            const scoreVal = Number(metric.score);
                                            const status = getScoreStatus(scoreVal);
                                            const percent = Math.min(100, Math.max(0, (scoreVal / 10) * 100));

                                            return (
                                                <div key={idx} className="space-y-1.5">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-[var(--color-text-secondary)] font-normal">
                                                            {metric.label}
                                                        </span>
                                                        <span className={`font-medium ${status.color}`}>
                                                            {scoreVal.toFixed(1)} <span className="text-[10px] text-[var(--color-text-muted)] font-normal">/ 10</span>
                                                        </span>
                                                    </div>

                                                    <div className="h-2 w-full bg-[var(--color-surface-hover)] rounded-full overflow-hidden border border-[var(--color-border)]/40">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700 bg-[var(--primary)]"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Strengths and Weaknesses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Key Strengths */}
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 border-l-4 border-l-[var(--color-success)] space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                    </div>
                                    <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                                        Key Strengths
                                    </h2>
                                </div>

                                <ul className="space-y-3">
                                    {summary?.strengths?.map((strength, i) => (
                                        <li key={i} className="flex gap-3 text-xs">
                                            <span className="text-emerald-400 font-medium shrink-0">
                                                0{i + 1}
                                            </span>
                                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                                {strength}
                                            </p>
                                        </li>
                                    ))}
                                    {(!summary?.strengths || summary.strengths.length === 0) && (
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            No specific strengths recorded.
                                        </p>
                                    )}
                                </ul>
                            </div>

                            {/* Areas For Growth */}
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 border-l-4 border-l-[var(--color-danger)] space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                                        Areas for Growth
                                    </h2>
                                </div>

                                <ul className="space-y-3">
                                    {summary?.weaknesses?.map((weakness, i) => (
                                        <li key={i} className="flex gap-3 text-xs">
                                            <span className="text-rose-400 font-medium shrink-0">
                                                0{i + 1}
                                            </span>
                                            <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                                {weakness}
                                            </p>
                                        </li>
                                    ))}
                                    {(!summary?.weaknesses || summary.weaknesses.length === 0) && (
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            No specific areas for improvement recorded.
                                        </p>
                                    )}
                                </ul>
                            </div>

                        </div>

                        {/* Question-by-Question Deep Dive */}
                        <section className="space-y-4 pt-2">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-[var(--color-primary)] rounded-full" />
                                    <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                                        Question Breakdown
                                    </h2>
                                </div>
                                <span className="text-xs text-[var(--color-text-muted)]">
                                    {questionBreakdown?.length || 0} Questions evaluated
                                </span>
                            </div>

                            <div className="space-y-3">
                                {questionBreakdown?.map((q, idx) => {
                                    const qScore = Number(q.scores?.overall ?? q.scores?.technical ?? q.score ?? 0);
                                    const qStatus = getScoreStatus(qScore);
                                    const matchingEvent = questionsTimeline.find(t => t.payload?.index === idx + 1 || t.payload?.question === q.question);
                                    const qStartSec = matchingEvent?.startTime ?? (idx * 45);
                                    const min = Math.floor(qStartSec / 60);
                                    const sec = Math.floor(qStartSec % 60);
                                    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

                                    const handleSeekToQuestion = (e) => {
                                        e.stopPropagation();
                                        setActiveTab('session-details');
                                        setTimeout(() => {
                                            controls.seek(qStartSec);
                                        }, 100);
                                    };

                                    const isExpanded = expandedQuestion === idx;

                                    return (
                                        <div
                                            key={idx}
                                            className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-active,#6338F6)]/50 transition-colors overflow-hidden"
                                        >
                                            <div
                                                className="p-5 flex items-center justify-between cursor-pointer gap-4"
                                                onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${isExpanded
                                                        ? 'bg-[var(--primary)] text-white'
                                                        : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
                                                        }`}>
                                                        0{idx + 1}
                                                    </div>
                                                    <h3 className="text-xs sm:text-sm font-medium text-[var(--color-text-primary)] truncate">
                                                        {q.question}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    {/* Replay Timestamp Pill */}
                                                    <button
                                                        type="button"
                                                        onClick={handleSeekToQuestion}
                                                        className="px-2.5 py-1 rounded-xl bg-[var(--primary-tint,rgba(99,56,246,0.15))] hover:bg-[var(--primary-tint)]/80 border border-[var(--color-border-active,#6338F6)]/30 text-[var(--color-text-accent,#C4B5FD)] text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                                                        title="Jump to recording"
                                                    >
                                                        <PlayCircle className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                                        <span>{timeStr}</span>
                                                    </button>

                                                    {/* Inline Colored Score Badge with Status Dot */}
                                                    <div className={`px-2.5 py-1 rounded-xl text-xs font-medium border inline-flex items-center gap-1.5 ${qStatus.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${qStatus.dot}`}></span>
                                                        <span>{qScore.toFixed(1)} <span className="text-[10px] opacity-75 font-normal">/ 10</span></span>
                                                    </div>

                                                    <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[var(--color-text-primary)]' : ''}`} />
                                                </div>
                                            </div>

                                            {/* Expandable Question Details */}
                                            {isExpanded && (
                                                <div className="px-5 pb-5 pt-0 border-t border-[var(--color-border)] space-y-4">
                                                    {/* Metadata Pills */}
                                                    <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <div className="bg-[var(--color-canvas)] p-2.5 rounded-xl border border-[var(--color-border)]">
                                                            <div className="text-[10px] text-[var(--color-text-muted)]">Topic</div>
                                                            <div className="text-xs font-medium text-[var(--color-text-primary)] truncate mt-0.5">
                                                                {q.category || q.topic || 'General'}
                                                            </div>
                                                        </div>

                                                        <div className="bg-[var(--color-canvas)] p-2.5 rounded-xl border border-[var(--color-border)]">
                                                            <div className="text-[10px] text-[var(--color-text-muted)]">Difficulty</div>
                                                            <div className="text-xs font-medium text-[var(--color-text-primary)] truncate mt-0.5">
                                                                {q.difficulty || 'Intermediate'}
                                                            </div>
                                                        </div>

                                                        <div className="bg-[var(--color-canvas)] p-2.5 rounded-xl border border-[var(--color-border)]">
                                                            <div className="text-[10px] text-[var(--color-text-muted)]">Score rating</div>
                                                            <div className={`text-xs font-medium truncate mt-0.5 ${qStatus.color}`}>
                                                                {qScore.toFixed(1)} / 10 ({qStatus.label})
                                                            </div>
                                                        </div>

                                                        <div className="bg-[var(--color-canvas)] p-2.5 rounded-xl border border-[var(--color-border)]">
                                                            <div className="text-[10px] text-[var(--color-text-muted)]">Status</div>
                                                            <div className="text-xs font-medium text-emerald-400 truncate mt-0.5">
                                                                Evaluated
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Candidate Transcribed Answer */}
                                                    <div className="bg-[var(--color-canvas)] p-4 rounded-xl border border-[var(--color-border)] space-y-1.5">
                                                        <div className="text-[10px] font-medium text-[var(--color-text-muted)]">
                                                            Candidate answer
                                                        </div>
                                                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">
                                                            "{q.answer || 'No spoken answer recorded.'}"
                                                        </p>
                                                    </div>

                                                    {/* AI Feedback & Coaching */}
                                                    <div className="bg-[var(--color-surface-hover)] p-4 rounded-xl border border-[var(--color-border)] space-y-2">
                                                        <div className="text-[10px] font-medium text-[var(--color-primary)] flex items-center gap-1.5">
                                                            <Sparkles className="w-3 h-3" />
                                                            <span>AI feedback</span>
                                                        </div>
                                                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                                            {q.feedback}
                                                        </p>

                                                        {q.reasoning && (
                                                            <div className="mt-2 pt-2 border-t border-[var(--color-border)]/60">
                                                                <div className="text-[10px] text-[var(--color-text-muted)] mb-1">
                                                                    Technical reasoning:
                                                                </div>
                                                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic border-l-2 border-[var(--color-primary)]/50 pl-3">
                                                                    {q.reasoning}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                    </div>
                )}

                {/* Tab Content: Session Details (Replay) */}
                {activeTab === 'session-details' && (
                    <div className="space-y-6">
                        <section className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)]">
                            <div className="border-b border-[var(--color-border)]">
                                <div className="grid grid-cols-1 lg:grid-cols-5">
                                    <div className="lg:col-span-3 p-4 sm:p-5 flex items-center justify-between border-r border-[var(--color-border)]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-[var(--color-primary)] rounded-full"></div>
                                            <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                                                Session Replay
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Verified session</span>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 p-4 sm:p-5 flex items-center justify-between">
                                        <h2 className="text-sm font-medium text-[var(--color-text-primary)]">
                                            Interview Timestamps
                                        </h2>
                                        <span className="text-[11px] text-[var(--color-text-muted)]">
                                            {questionsTimeline.length} Markers
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[360px]">
                                {/* Video Player Frame */}
                                <div className="lg:col-span-3 bg-black border-r border-[var(--color-border)] flex items-center justify-center p-4">
                                    <div className="w-full max-w-2xl h-full flex flex-col justify-center rounded-xl overflow-hidden">
                                        <ReplayPlayer />
                                    </div>
                                </div>

                                {/* Timestamps List */}
                                <div className="lg:col-span-2 bg-[var(--color-canvas)] p-4 sm:p-5 overflow-y-auto max-h-[500px] flex flex-col gap-2.5">
                                    {questionsTimeline.length === 0 ? (
                                        <div className="text-center py-12 text-xs text-[var(--color-text-muted)]">
                                            No question timestamps recorded for this session.
                                        </div>
                                    ) : (
                                        questionsTimeline.map((q, idx) => {
                                            const isActive = activeQuestionId === q.id;
                                            const m = Math.floor(q.startTime / 60);
                                            const s = Math.floor(q.startTime % 60);
                                            const timeString = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                                            const qText = q.payload?.question || (resultData?.questionBreakdown?.[q.payload?.index - 1]?.question) || `Question ${idx + 1}`;

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => controls.seek(q.startTime)}
                                                    className={`p-3.5 rounded-xl cursor-pointer transition-colors border flex gap-3 text-xs ${isActive
                                                        ? 'bg-[var(--primary-tint,rgba(99,56,246,0.15))] border-[var(--color-border-active,#6338F6)] text-[var(--color-text-primary)]'
                                                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-active,#6338F6)]/40 text-[var(--color-text-secondary)]'
                                                        }`}
                                                >
                                                    <span className={`font-mono text-xs shrink-0 mt-0.5 ${isActive ? 'text-[var(--color-text-accent,#C4B5FD)] font-medium' : 'text-[var(--color-text-muted)]'}`}>
                                                        {timeString}
                                                    </span>
                                                    <p className="leading-relaxed font-normal">
                                                        {qText}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

        </div>
    );
};
