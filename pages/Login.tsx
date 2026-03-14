import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Cloud, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { APP_NAME } from '../constants';
import {
  createUser,
  findUserByCredentials,
  getUserByEmail,
  migrateLegacyLocalStorageData,
} from '../services/indexedDbService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);

  const handleModeToggle = () => {
    if (loading || isSwitchingMode) return;

    setError('');
    setIsSwitchingMode(true);

    setTimeout(() => {
      setIsLogin(prev => !prev);
    }, 170);

    setTimeout(() => {
      setIsSwitchingMode(false);
    }, 520);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !username)) {
      setError('Please fill in all fields correctly.');
      return;
    }

    setLoading(true);

    try {
      // Ensure older localStorage data is imported before auth checks.
      await migrateLegacyLocalStorageData();

      await new Promise(resolve => setTimeout(resolve, 500));

      if (isLogin) {
        const foundUser = await findUserByCredentials(email, password);
        if (foundUser) {
          onLogin(foundUser);
        } else {
          alert('Error: Account not found or incorrect password. Please sign up if you do not have an account.');
          setError('Invalid credentials.');
        }
      } else {
        const exists = await getUserByEmail(email);
        if (exists) {
          setError('User with this email already exists.');
        } else {
          const newUser = { username, email, password };
          await createUser(newUser);
          onLogin({ username: newUser.username, email: newUser.email });
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center md:p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700 border border-slate-100">
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="bg-white/10 w-fit p-3 rounded-2xl backdrop-blur-md mb-6">
              <Cloud size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight">{APP_NAME}</h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-sm">
              Organize your thoughts and ideas, securely stored in the cloud. Experience the next level of note-taking with AI enhancement powered by Google Gemini.
            </p>
          </div>

          <div className="relative z-10 flex gap-6 items-center">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <img key={i} src={`https://picsum.photos/seed/${i}/40/40`} className="w-10 h-10 rounded-full border-2 border-indigo-600" alt="User" />
               ))}
             </div>
             <p className="text-sm font-medium text-indigo-100">Syncing thousands of thoughts</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="md:hidden mb-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Cloud size={28} />
            </div>
            <h1 className="mt-1 mb-2 text-2xl font-extrabold text-slate-900 tracking-tight">{APP_NAME}</h1>
            <hr className="border-gray-200"></hr>
          </div>

          <div className={`md:mb-10 mb-3 text-center md:text-left transition-all duration-500 ease-in-out ${isSwitchingMode ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-slate-500">
              {isLogin ? 'Enter your credentials to access your notes' : 'Sign up today and never forget an idea again'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="md:space-y-5  space-y-3">
            <div className={`overflow-hidden transition-[max-height,opacity,transform] duration-500 ease-in-out ${isLogin ? 'max-h-0 opacity-0 -translate-y-1' : 'max-h-24 opacity-100 translate-y-0'}`}>
              <div>
                <div className="relative group pb-1">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                    required={!isLogin}
                    disabled={isLogin}
                    tabIndex={isLogin ? -1 : 0}
                    aria-hidden={isLogin}
                  />
                </div>
              </div>
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm font-medium p-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className={`inline-block transition-all duration-500 ease-in-out ${isSwitchingMode ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
                    {isLogin ? 'Log In' : 'Sign Up'}
                  </span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="md:mt-10 mt-5 text-center text-slate-600 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={handleModeToggle}
              disabled={loading || isSwitchingMode}
              className="text-indigo-600 font-bold hover:underline transition-all duration-200 active:scale-95 disabled:opacity-70"
            >
              {isLogin ? 'Create Account' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
