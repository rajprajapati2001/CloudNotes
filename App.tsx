import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { User, Note } from './types';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import About from './pages/About';
import Archive from './pages/Archive';
import { APP_NAME } from './constants';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth State Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch notes from Supabase
  const fetchNotes = useCallback(async () => {
    if (!session?.user) return;
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('note_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data || []);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [session, fetchNotes]);

  const addNote = useCallback(async (noteData: Partial<Note>) => {
    if (!session?.user) return;

    // Calculate next order
    const nextOrder = notes.length > 0 ? Math.max(...notes.map(n => n.note_order || 0)) + 1 : 0;

    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...noteData,
        user_id: session.user.id,
        note_order: nextOrder
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding note:', error);
    } else if (data) {
      setNotes(prev => [data, ...prev]);
    }
  }, [session, notes]);

  const updateNote = useCallback(async (updatedNote: Note) => {
    const { error } = await supabase
      .from('notes')
      .update({
        title: updatedNote.title,
        content: updatedNote.content,
        color: updatedNote.color,
        pinned: updatedNote.pinned,
        archived: updatedNote.archived,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedNote.id);

    if (error) {
      console.error('Error updating note:', error);
    } else {
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this note permanently from the cloud?")) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting note:', error);
      } else {
        setNotes(prev => prev.filter(n => n.id !== id));
      }
    }
  }, []);

  const togglePin = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const newPinned = !note.pinned;
    const { error } = await supabase
      .from('notes')
      .update({ pinned: newPinned })
      .eq('id', id);

    if (!error) {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: newPinned } : n));
    }
  }, [notes]);

  const toggleArchive = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const newArchived = !note.archived;
    const { error } = await supabase
      .from('notes')
      .update({ archived: newArchived })
      .eq('id', id);

    if (!error) {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, archived: newArchived } : n));
    }
  }, [notes]);

  const reorderNotes = useCallback(async (newNotes: Note[]) => {
    setNotes(newNotes);
    
    // Update orders in Supabase
    const updates = newNotes.map((note, index) => ({
      id: note.id,
      user_id: session?.user.id,
      note_order: index
    }));

    const { error } = await supabase.from('notes').upsert(updates);
    if (error) console.error('Error updating note orders:', error);
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Connecting to CloudNotes...</p>
        </div>
      </div>
    );
  }

  const currentUser: User | null = session?.user ? {
    id: session.user.id,
    email: session.user.email!,
    username: session.user.user_metadata?.username
  } : null;

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        {currentUser && (
          <Navbar 
            onLogout={handleLogout} 
            username={currentUser.username}
          />
        )}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/login" 
              element={!session ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={session && currentUser ? (
                <Dashboard 
                  user={currentUser} 
                  notes={notes.filter(n => !n.archived)} 
                  onAddNote={addNote} 
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  onTogglePin={togglePin}
                  onToggleArchive={toggleArchive}
                  onReorder={reorderNotes}
                />
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/archive" 
              element={session ? (
                <Archive 
                  notes={notes.filter(n => n.archived)} 
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  onToggleArchive={toggleArchive}
                />
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/about" 
              element={session ? <About /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <p className="text-center text-slate-500 font-medium tracking-wide">
      © {new Date().getFullYear()} @ <span className="text-indigo-600 font-bold">{APP_NAME}</span>. All rights reserved.
    </p>
      </div>
    </Router>
  );
};

export default App;
