
import React from 'react';
import { Pin, Archive, Trash2, Edit3, Clock, GripVertical } from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleArchive: (id: string) => void;
  isArchive?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onEdit, 
  onDelete, 
  onTogglePin, 
  onToggleArchive,
  isArchive = false,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  // Fix: Property 'timestamp' does not exist on type 'Note'. Use updated_at or created_at instead.
  const dateStr = new Date(note.updated_at || note.created_at || Date.now()).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      draggable={!isArchive && !!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group relative p-5 rounded-2xl border transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-default ${note.color} ${
        note.color.includes('bg-white') ? 'border-slate-200' : 'border-transparent'
      } animate-zoom-in`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-grow">
          {!isArchive && (
            <div className="text-slate-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={16} />
            </div>
          )}
          <h3 className="font-bold text-lg leading-tight text-slate-800 line-clamp-2">
            {note.title || 'Untitled'}
          </h3>
        </div>
        {!isArchive && onTogglePin && (
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
            className={`p-1.5 rounded-full transition-colors ${
              note.pinned 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-slate-400 hover:bg-black/5'
            }`}
          >
            <Pin size={18} fill={note.pinned ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-6 whitespace-pre-wrap">
        {note.content}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-black/5">
        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          <Clock size={12} />
          {dateStr}
        </span>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-black/5"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleArchive(note.id); }}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-black/5"
            title={isArchive ? "Restore" : "Archive"}
          >
            <Archive size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
            title="Delete Permanently"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
