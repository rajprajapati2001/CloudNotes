import React, { useState, useMemo } from 'react';
import { Plus, Search, User as UserIcon } from 'lucide-react';
import { User, Note } from '../types';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

interface DashboardProps {
  user: User;
  notes: Note[];
  onAddNote: (note: any) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onReorder: (notes: Note[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, notes, onAddNote, onUpdateNote, onDeleteNote, onTogglePin, onToggleArchive, onReorder
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase())
    );
  }, [notes, search]);

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const otherNotes = filteredNotes.filter(n => !n.pinned);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSave = (noteData: any) => {
    if (editingNote) {
      onUpdateNote(noteData);
    } else {
      onAddNote(noteData);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number, isPinnedSection: boolean) => {
    if (draggedIndex === null) return;
    
    const sectionNotes = isPinnedSection ? pinnedNotes : otherNotes;
    const result = [...notes];
    
    const draggedNote = sectionNotes[draggedIndex];
    const targetNote = sectionNotes[targetIndex];
    
    const dIdx = notes.findIndex(n => n.id === draggedNote.id);
    const tIdx = notes.findIndex(n => n.id === targetNote.id);
    
    if (dIdx !== -1 && tIdx !== -1) {
      const [removed] = result.splice(dIdx, 1);
      result.splice(tIdx, 0, removed);
      onReorder(result);
    }
    
    setDraggedIndex(null);
  };

  return (
    <div className="relative pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between md:gap-6 gap-2">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">
            Welcome, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">{user.username}</span>
          </h1>
          <p className="text-slate-500 mt-1">You have {notes.length} notes in your private cloud section.</p>
        </div>
        
        <div className="w-full md:max-w-md">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search your notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </header>

      {pinnedNotes.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="whitespace-nowrap">Pinned Notes</span>
            <span className="h-px bg-slate-200 w-full"></span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-2">
            {pinnedNotes.map((note, idx) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onEdit={handleEdit} 
                onDelete={onDeleteNote}
                onTogglePin={onTogglePin}
                onToggleArchive={onToggleArchive}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx, true)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        {pinnedNotes.length > 0 && (
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="whitespace-nowrap">Recent Notes</span>
            <span className="h-px bg-slate-200 w-full"></span>
          </h2>
        )}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20 bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
               <Plus className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 text-lg mb-6">No notes found in your private section.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Add Your First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-2">
            {otherNotes.map((note, idx) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onEdit={handleEdit} 
                onDelete={onDeleteNote}
                onTogglePin={onTogglePin}
                onToggleArchive={onToggleArchive}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(idx, false)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating Add Button (Moved to Bottom Right) */}
      <button 
        onClick={() => {
          setEditingNote(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all hover:scale-110 active:scale-90 flex items-center justify-center z-40 group"
        title="Add New Note"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        note={editingNote} 
      />
    </div>
  );
};

export default Dashboard;