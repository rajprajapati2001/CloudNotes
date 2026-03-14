import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, Note } from './types';
import { APP_NAME } from './constants';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import About from './pages/About';
import Archive from './pages/Archive';
import {
  clearCurrentUser,
  getCurrentUser,
  getUserNotes,
  migrateLegacyLocalStorageData,
  setCurrentUser,
  setUserNotes,
} from './services/indexedDbService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthHydrated, setIsAuthHydrated] = useState(false);
  const [isNotesHydrated, setIsNotesHydrated] = useState(false);

  const [notes, setNotes] = useState<Note[]>([]);

  const createNoteId = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `note_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  };

  // One-time migration and session hydration from IndexedDB.
  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        await migrateLegacyLocalStorageData();
        const savedUser = await getCurrentUser();
        if (isMounted) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Failed to hydrate session from IndexedDB:', error);
      } finally {
        if (isMounted) {
          setIsAuthHydrated(true);
        }
      }
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load user-specific notes when user changes
  useEffect(() => {
    let isMounted = true;
    setIsNotesHydrated(false);

    const hydrateNotes = async () => {
      if (!user) {
        if (isMounted) {
          setNotes([]);
          setIsNotesHydrated(true);
        }
        return;
      }

      try {
        const savedNotes = await getUserNotes(user.email);
        if (isMounted) {
          setNotes(savedNotes);
        }
      } catch (error) {
        console.error('Failed to load notes from IndexedDB:', error);
        if (isMounted) {
          setNotes([]);
        }
      } finally {
        if (isMounted) {
          setIsNotesHydrated(true);
        }
      }
    };

    void hydrateNotes();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Persist authenticated user session in IndexedDB.
  useEffect(() => {
    if (!isAuthHydrated) return;

    if (user) {
      void setCurrentUser(user);
    } else {
      void clearCurrentUser();
    }
  }, [user, isAuthHydrated]);

  // Persist user-specific notes in IndexedDB after hydration.
  useEffect(() => {
    if (user && isNotesHydrated) {
      void setUserNotes(user.email, notes);
    }
  }, [notes, user, isNotesHydrated]);

  const addNote = useCallback((note: Omit<Note, 'id' | 'timestamp'>) => {
    const newNote: Note = {
      ...note,
      id: createNoteId(),
      timestamp: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
  }, []);

  const updateNote = useCallback((updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? { ...updatedNote, timestamp: Date.now() } : n));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  }, []);

  const toggleArchive = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, archived: !n.archived } : n));
  }, []);

  const reorderNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
  }, []);

  if (!isAuthHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold">
        Loading CloudNotes...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        {user && (
          <Navbar 
            onLogout={() => setUser(null)} 
          />
        )}
        <main className="flex-grow container mx-auto px-4 py-6">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={setUser} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={user ? (
                isNotesHydrated ? (
                  <Dashboard 
                    user={user} 
                    notes={notes.filter(n => !n.archived)} 
                    onAddNote={addNote} 
                    onUpdateNote={updateNote}
                    onDeleteNote={deleteNote}
                    onTogglePin={togglePin}
                    onToggleArchive={toggleArchive}
                    onReorder={reorderNotes}
                  />
                ) : (
                  <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-semibold">
                    Loading your notes...
                  </div>
                )
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/archive" 
              element={user ? (
                isNotesHydrated ? (
                  <Archive 
                    notes={notes.filter(n => n.archived)} 
                    onUpdateNote={updateNote}
                    onDeleteNote={deleteNote}
                    onToggleArchive={toggleArchive}
                  />
                ) : (
                  <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-semibold">
                    Loading your archived notes...
                  </div>
                )
              ) : <Navigate to="/login" />} 
            />
            <Route 
              path="/about" 
              element={user ? <About /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <p className="text-center text-sm p-2 text-slate-500 font-medium tracking-wide">
              © {new Date().getFullYear()} @ <span className="text-indigo-600 font-bold">{APP_NAME}</span>. All rights reserved.
            </p>
      </div>
    </Router>
      
  );
};

export default App;