import React, { useState, useEffect } from 'react';
import { FileText, Save, Check } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { updateNotes } from '../../services/questionService';
import toast from 'react-hot-toast';

const QuestionNotes = ({ questionId, initialNotes = '', onNotesSaved }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes || '');
  }, [initialNotes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateNotes(questionId, notes);
      setIsSaved(true);
      toast.success(res.message || 'Notes saved successfully');
      if (onNotesSaved) {
        onNotesSaved(res.notes);
      }
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = (notes || '').trim() !== (initialNotes || '').trim();

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Personal Notes & Reflections</h3>
        </div>
        {initialNotes && (
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Saved
          </span>
        )}
      </div>

      <div className="mt-3 space-y-3">
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jot down algorithmic patterns, time complexity notes, edge cases to remember, or key interview talking points..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-y"
        />

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Notes are private to your account and persist across practice sessions.
          </p>
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!hasChanged && !isSaved}
            variant={isSaved ? 'secondary' : 'primary'}
            icon={isSaved ? Check : Save}
          >
            {isSaved ? 'Saved!' : 'Save Notes'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuestionNotes;
