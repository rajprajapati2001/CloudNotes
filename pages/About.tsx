import React from 'react';
import { Cloud, Shield, Zap, Sparkles, Github, Facebook , Mail, Instagram } from 'lucide-react';
import { APP_NAME } from '../constants';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-zoom-in">
      <div className="text-center mb-16">
        <div className="inline-block p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-500/40 mb-6">
          <Cloud size={48} />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          About {APP_NAME}
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          The most elegant way to capture your thoughts, organize your life, and boost your productivity with the power of your personal cloud.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: Zap, title: 'Blazing Fast', text: 'Optimized performance for a smooth note-taking experience.', color: 'text-yellow-500 bg-yellow-50' },
          { icon: Shield, title: 'Secure', text: 'Your data is strictly yours and kept private in your personal cloud section.', color: 'text-green-500 bg-green-50' },
          { icon: Sparkles, title: 'AI Enhanced', text: 'Powered by Gemini AI to help you write better notes instantly.', color: 'text-purple-500 bg-purple-50' }
        ].map((feature, i) => (
          <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
              <feature.icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-slate-500">{feature.text}</p>
          </div>
        ))}
      </div>

      <div className="p-10 rounded-[3rem] bg-indigo-600 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-indigo-500/40">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-lg">
            <img src="../assets/me_picture_logo_1000x1000.jpg" alt="Developer" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white text-indigo-600 p-2 rounded-full shadow-lg">
            <Sparkles size={20} />
          </div>
        </div>
        <div className="text-center md:text-left flex-grow">
          <h2 className="text-3xl font-bold mb-2">CloudNotes</h2>
          <p className="text-1xl mb-2 underline-offset-8 underline underline-offset-8">Developed by: Raj Prajapati</p>
          <p className="text-indigo-100 text-lg mb-6 leading-relaxed">
            Every user deserves a clean, private space for their ideas. {APP_NAME} was built to provide just that, with modern technologies ensuring a seamless experience.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" onClick={() => window.location.href = "https://www.instagram.com/raj_pankaj_prajapati"}><Instagram size={20} /></button>
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" onClick={() => window.location.href = "https://github.com/rajprajapati2001"}><Github size={20} /></button>
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" onClick={() => window.location.href = "#"}><Facebook size={20} /></button>
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors" onClick={() => window.location.href = "mailto:rp5876907@gmail.com"}><Mail size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
