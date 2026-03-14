import React, { useState } from 'react';
import { Archive as ArchiveIcon, Info } from 'lucide-react';
import { Note } from '../types';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

interface ArchiveProps {
  notes: Note[];
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

const Archive: React.FC<ArchiveProps> = ({ notes, onUpdateNote, onDeleteNote, onToggleArchive }) => {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSave = (noteData: any) => {
    onUpdateNote(noteData);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="mb-10 flex items-center gap-4">
        <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
          <ArchiveIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Archived Notes</h1>
          <p className="text-slate-500">Notes you've stored away but aren't ready to delete.</p>
        </div>
      </header>

      {notes.length === 0 ? (
        <div className="text-center py-20 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
          <div className="p-4 bg-slate-200 rounded-full text-slate-400 mb-4">
             <Info size={40} />
          </div>
          <p className="text-slate-500 text-lg">Your archive is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-2">
          {notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onEdit={handleEdit} 
              onDelete={onDeleteNote}
              onToggleArchive={onToggleArchive}
              isArchive={true}
            />
          ))}
        </div>
      )}

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        note={editingNote} 
      />
    </div>
  );
};

export default Archive;