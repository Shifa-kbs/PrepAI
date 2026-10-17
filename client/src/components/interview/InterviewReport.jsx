import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Brain,
  MessageSquare,
  Target,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  History,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const getScoreBadge = (score) => {
  if (score >= 85) return { label: 'Strong Hire Readiness', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  if (score >= 70) return { label: 'Hire Readiness', color: 'bg-teal-500/15 text-teal-400 border-teal-500/30' };
  if (score >= 55) return { label: 'Lean Hire / Needs Polish', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  return { label: 'Needs Practice', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
};

const InterviewReport = ({ interview, report, onStartNew, onGoToHistory, onGoToDashboard }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const finalReport = report || interview?.finalReport || {};
  const overallScore = finalReport.overallScore ?? interview?.overallScore ?? 0;
  const badge = getScoreBadge(overallScore);

  const questions = interview?.questions || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Banner & Overall Score Hero */}
      <Card className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border-purple-500/30 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Evaluation Report Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {interview?.jobRole} Interview Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {interview?.interviewType} Interview • {interview?.difficulty} Difficulty •{' '}
              {interview?.experienceLevel}
            </p>
          </div>

          {/* Overall Score Dial */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 shrink-0 min-w-[170px] text-center shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overall Score
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">
              {overallScore}
              <span className="text-lg font-bold text-slate-500">/100</span>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border mt-2 ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        {finalReport.summary && (
          <div className="mt-6 pt-6 border-t border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            <p className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              <span>Executive Performance Summary:</span>
            </p>
            <p>{finalReport.summary}</p>
          </div>
        )}
      </Card>

      {/* 4 Core Competency Dimension Cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Core Competency Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Technical Knowledge</span>
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {finalReport.technicalKnowledge ?? 75}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full"
                style={{ width: `${finalReport.technicalKnowledge ?? 75}%` }}
              />
            </div>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Answer Relevance</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {finalReport.answerRelevance ?? 80}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${finalReport.answerRelevance ?? 80}%` }}
              />
            </div>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Problem Solving</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {finalReport.problemSolving ?? 70}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${finalReport.problemSolving ?? 70}%` }}
              />
            </div>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Communication Clarity</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {finalReport.communicationClarity ?? 80}%
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${finalReport.communicationClarity ?? 80}%` }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Top Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Strengths */}
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Top Strengths Demonstrated</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(finalReport.topStrengths || []).map((s, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Key Areas for Improvement */}
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Key Areas for Improvement</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {(finalReport.keyAreasForImprovement || []).map((item, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recommended Topics & Next Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recommended Practice Topics
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(finalReport.recommendedTopicsToPractice || []).map((topic, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Suggested Actionable Next Steps
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {(finalReport.suggestedNextSteps || []).map((step, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Question-by-Question Deep Dive Accordion */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Question-by-Question Detailed Feedback
        </h2>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isExpanded = expandedQuestion === idx;
            return (
              <Card
                key={idx}
                className="bg-slate-900/80 border-slate-800 p-4 transition-all hover:border-slate-700"
              >
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-400">Question #{idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                      {q.questionText}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-white">
                      {q.score || 0} / 100
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
                    {/* Candidate Answer */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Your Answer:
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                        {q.userAnswer || '[No answer recorded / skipped]'}
                      </p>
                    </div>

                    {/* AI Feedback */}
                    {q.aiFeedback && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-purple-300 uppercase">
                          Interviewer Assessment:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed bg-purple-950/20 p-3 rounded-lg border border-purple-500/20">
                          {q.aiFeedback}
                        </p>
                      </div>
                    )}

                    {/* Suggested Improvements */}
                    {q.suggestedImprovements && q.suggestedImprovements.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-300 uppercase">
                          How to Elevate This Response:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                          {q.suggestedImprovements.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Practice Disclaimer:</strong> AI interview scores, competency ratings, and hiring readiness estimates are intended strictly for practice, training, and skill development. They do not constitute official hiring decisions or employment guarantees.
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={onGoToDashboard}
            icon={LayoutDashboard}
            className="text-xs flex-1 sm:flex-initial"
          >
            Dashboard
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={onGoToHistory}
            icon={History}
            className="text-xs flex-1 sm:flex-initial"
          >
            History
          </Button>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onStartNew}
          icon={RotateCcw}
          className="w-full sm:w-auto text-xs bg-purple-600 hover:bg-purple-500 border-purple-500/30"
        >
          Start Another Mock Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewReport;
