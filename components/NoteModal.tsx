import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Palette } from 'lucide-react';
import { Note } from '../types';
import { NOTE_COLORS } from '../constants';
import { enhanceNoteContent } from '../services/geminiService';

interface NoteModalProps {
  note?: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: any) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ note, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(NOTE_COLORS[0].value);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
    } else {
      setTitle('');
      setContent('');
      setColor(NOTE_COLORS[0].value);
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }
    onSave({
      ...(note || {}),
      title,
      content,
      color,
      pinned: note?.pinned || false,
      archived: note?.archived || false,
    });
    onClose();
  };

  const handleEnhance = async () => {
    if (!content.trim()) return;
    setIsEnhancing(true);
    const enhanced = await enhanceNoteContent(content);
    setContent(enhanced);
    setIsEnhancing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/40 animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${color} border border-white/20`}
      >
        <div className="flex items-center justify-between p-4 border-b border-black/5">
          <h2 className="text-xl font-bold text-slate-800">
            {note ? 'Edit Note' : 'Create Note'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-2xl font-bold placeholder-slate-400 focus:outline-none text-slate-900"
          />
          <textarea
            placeholder="Start typing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 bg-transparent resize-none placeholder-slate-400 focus:outline-none text-slate-700 leading-relaxed text-lg"
          />
        </div>

        <div className="p-4 bg-black/5 border-t border-black/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded-xl bg-white shadow-sm border border-slate-200 hover:border-indigo-500 transition-colors text-slate-600"
                title="Change Color"
              >
                <Palette size={20} />
              </button>
              
              {showColorPicker && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 flex gap-2 overflow-x-auto max-w-[260px] sm:max-w-[360px] animate-in slide-in-from-bottom-2">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setColor(c.value);
                        setShowColorPicker(false);
                      }}
                      className={`w-8 h-8 shrink-0 rounded-full border-2 transition-transform hover:scale-110 ${c.value} ${
                        color === c.value ? 'border-indigo-500' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleEnhance}
              disabled={isEnhancing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-all ${isEnhancing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Sparkles size={18} className={isEnhancing ? 'animate-pulse' : ''} />
              {isEnhancing ? 'AI Thinking...' : 'AI Enhance'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/50 transition-all active:scale-95"
            >
              <Check size={20} />
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
