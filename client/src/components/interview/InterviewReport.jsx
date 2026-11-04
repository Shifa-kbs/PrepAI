import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  BookOpen,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const getScoreBadge = (score, evaluationStatus, answeredCount, totalQuestions) => {
  if (evaluationStatus === 'Not Evaluated' || score === null || score === undefined) {
    return { label: 'Not Evaluated', color: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
  if (evaluationStatus === 'Partial Evaluation' || (answeredCount !== undefined && totalQuestions !== undefined && answeredCount < totalQuestions)) {
    return {
      label: `Partial Evaluation (${answeredCount ?? '?'}/${totalQuestions ?? '?'} Answered)`,
      color: 'bg-amber-50 text-amber-800 border-amber-300',
    };
  }
  if (score >= 85) return { label: 'Strong Placement Readiness', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
  if (score >= 70) return { label: 'Good Placement Readiness', color: 'bg-sky-50 text-sky-800 border-sky-300' };
  if (score >= 55) return { label: 'Moderate / Polish Required', color: 'bg-amber-50 text-amber-800 border-amber-300' };
  return { label: 'Needs Structured Practice', color: 'bg-rose-50 text-rose-800 border-rose-300' };
};

const InterviewReport = ({ interview, report, onStartNew, onGoToHistory, onGoToDashboard }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const finalReport = report || interview?.finalReport || {};
  const questions = interview?.questions || [];

  const answeredQuestions = questions.filter(
    (q) =>
      q.userAnswer &&
      q.userAnswer.trim().length > 0 &&
      !q.userAnswer.startsWith('[Skipped') &&
      q.status === 'answered'
  );

  const totalQuestions = finalReport.totalQuestions ?? interview?.totalQuestions ?? questions.length;
  const answeredCount = finalReport.answeredCount ?? answeredQuestions.length;
  const isZeroAnswered = answeredCount === 0;

  const evaluationStatus =
    finalReport.evaluationStatus ||
    (isZeroAnswered ? 'Not Evaluated' : answeredCount < totalQuestions ? 'Partial Evaluation' : 'Completed');

  const overallScore =
    evaluationStatus === 'Not Evaluated' || isZeroAnswered
      ? null
      : (finalReport.overallScore ?? interview?.overallScore ?? null);

  const badge = getScoreBadge(overallScore, evaluationStatus, answeredCount, totalQuestions);

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Banner & Overall Score Hero */}
      <Card className="bg-white border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>AI Evaluation & Mentor Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {interview?.jobRole} Interview Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              {interview?.interviewType} Format • {interview?.difficulty} Difficulty •{' '}
              {interview?.experienceLevel}
            </p>
          </div>

          {/* Overall Score Dial */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 min-w-[200px] text-center shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Readiness Score
            </span>
            <div className="text-4xl sm:text-5xl font-black text-slate-900 mt-1">
              {overallScore !== null && overallScore !== undefined ? (
                <>
                  {overallScore}
                  <span className="text-lg font-bold text-slate-400">/100</span>
                </>
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-500">N/A</span>
              )}
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border mt-2 ${badge.color}`}>
              {badge.label}
            </span>
            {isZeroAnswered && (
              <span className="text-[10px] text-slate-400 mt-1">No responses submitted</span>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {finalReport.summary && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-sky-600" />
              <span>Executive Performance Summary:</span>
            </p>
            <p>{finalReport.summary}</p>
          </div>
        )}
      </Card>

      {/* 4 Core Competency Dimension Cards */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          <span>Core Competency Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-white border-slate-200 p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700">Technical Knowledge</span>
              <Brain className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {finalReport.technicalKnowledge !== null && finalReport.technicalKnowledge !== undefined
                ? `${finalReport.technicalKnowledge}%`
                : 'N/A'}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${finalReport.technicalKnowledge ?? 0}%` }}
              />
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700">Answer Relevance</span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {finalReport.answerRelevance !== null && finalReport.answerRelevance !== undefined
                ? `${finalReport.answerRelevance}%`
                : 'N/A'}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${finalReport.answerRelevance ?? 0}%` }}
              />
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700">Problem Solving</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {finalReport.problemSolving !== null && finalReport.problemSolving !== undefined
                ? `${finalReport.problemSolving}%`
                : 'N/A'}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${finalReport.problemSolving ?? 0}%` }}
              />
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700">Communication Clarity</span>
              <MessageSquare className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {finalReport.communicationClarity !== null && finalReport.communicationClarity !== undefined
                ? `${finalReport.communicationClarity}%`
                : 'N/A'}
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${finalReport.communicationClarity ?? 0}%` }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Top Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Strengths */}
        <Card className="bg-white border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Top Strengths Demonstrated</span>
          </div>
          {finalReport.topStrengths && finalReport.topStrengths.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-700">
              {finalReport.topStrengths.map((s, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No strengths recorded. Attempt candidate responses during the interview to evaluate demonstrated strengths.
            </p>
          )}
        </Card>

        {/* Key Areas for Improvement */}
        <Card className="bg-white border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Key Areas for Improvement</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(finalReport.keyAreasForImprovement || []).map((item, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-amber-600 font-bold">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Missing Concepts & Recommended Practice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Missing Concepts */}
        <Card className="bg-white border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Identified Concept Gaps</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {finalReport.missingConcepts && finalReport.missingConcepts.length > 0 ? (
              finalReport.missingConcepts.map((concept, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold"
                >
                  {concept}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">
                {isZeroAnswered ? 'None identified (No responses submitted)' : 'No critical concept gaps identified'}
              </p>
            )}
          </div>
        </Card>

        {/* Recommended Practice Modules */}
        <Card className="bg-white border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recommended Practice Topics
            </h3>
            <Link to="/learning" className="text-xs text-sky-600 font-bold hover:underline">
              Open Studio →
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(finalReport.recommendedTopicsToPractice || []).map((topic, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold"
              >
                {topic}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Mentoring Roadmap (Prioritized Weekly Plan) */}
      {finalReport.studyRoadmap && finalReport.studyRoadmap.length > 0 && (
        <Card className="bg-white border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Personalized AI Mentorship Action Plan (Prioritized Roadmap)
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {finalReport.studyRoadmap.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{item.timeframe || `Step ${idx + 1}`}</span>
                </div>
                <p className="text-xs text-slate-700 pl-7">{item.focus || item.task || item}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                className="bg-white border-slate-200 p-4 transition-all hover:border-slate-300 shadow-xs"
              >
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-600">Question #{idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {q.questionText}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200">
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
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                    {/* Candidate Answer */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        Your Answer:
                      </span>
                      <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {q.userAnswer || '[No answer recorded / skipped]'}
                      </p>
                    </div>

                    {/* AI Feedback */}
                    {q.aiFeedback && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-sky-700 uppercase">
                          Interviewer Assessment:
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed bg-sky-50/70 p-3 rounded-lg border border-sky-200">
                          {q.aiFeedback}
                        </p>
                      </div>
                    )}

                    {/* Suggested Improvements */}
                    {q.suggestedImprovements && q.suggestedImprovements.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-800 uppercase">
                          How to Elevate This Response:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-amber-50/60 p-3 rounded-lg border border-amber-200">
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

      {/* Honest Disclaimer */}
      <div className="flex items-start space-x-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">Practice Disclaimer:</strong> AI interview scores, competency ratings, and hiring readiness estimates are intended strictly for practice, training, and skill development. They do not constitute official hiring decisions or employment guarantees.
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
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
          className="w-full sm:w-auto text-xs"
        >
          Start Another Mock Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewReport;
