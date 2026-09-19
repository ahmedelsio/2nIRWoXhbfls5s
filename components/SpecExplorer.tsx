import React, { useState } from 'react';
import { 
  FileText, Copy, Check, ChevronRight, Search, 
  Layers, Code2, Database, Smartphone, ShieldCheck 
} from 'lucide-react';
import { SPEC_SECTIONS } from '../data/specData';
import { SpecSectionId } from '../types';

export const SpecExplorer: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<SpecSectionId>('pitch');
  const [copiedSection, setCopiedSection] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSection = SPEC_SECTIONS.find((s) => s.id === activeSectionId) || SPEC_SECTIONS[0];

  const handleCopySection = () => {
    navigator.clipboard?.writeText(activeSection.content);
    setCopiedSection(true);
    setTimeout(() => setCopiedSection(false), 2000);
  };

  const filteredSections = SPEC_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="spec-explorer-container" className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs font-bold text-amber-400">
            <FileText className="h-3.5 w-3.5" /> Full Product & Engineering Specification (Sections 1–12)
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white tracking-tight">
            IRONMATE Technical Specification
          </h1>
          <p className="text-xs text-neutral-400">
            Production-ready architecture, Supabase schema, Expo Router tree, sweaty-finger UX, and AI companion guardrails.
          </p>
        </div>

        <button
          id="btn-copy-active-spec"
          onClick={handleCopySection}
          className="self-start sm:self-auto flex items-center gap-2 rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-xs font-bold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
        >
          {copiedSection ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-amber-400" />}
          {copiedSection ? 'Copied to Clipboard!' : 'Copy Section Content'}
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT: NAV + CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* SIDEBAR NAVIGATION (Sections 1 to 12) */}
        <aside className="md:col-span-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 12 sections..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 pl-9 pr-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {filteredSections.map((sec) => {
              const isActive = sec.id === activeSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left rounded-xl p-3 text-xs transition border flex items-center justify-between ${
                    isActive
                      ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-bold'
                      : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-[11px] opacity-60 mr-1.5">{sec.number}.</span>
                    <span>{sec.title}</span>
                  </div>
                  <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-600'}`} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN SECTION READER */}
        <main className="md:col-span-8">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 shadow-2xl text-neutral-200 space-y-6">
            <div className="border-b border-neutral-800 pb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                Section {activeSection.number} of 12
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {activeSection.title}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">{activeSection.summary}</p>
            </div>

            {/* Content Display (with simple markdown/code formatting) */}
            <div className="prose prose-invert prose-xs max-w-none text-neutral-300 leading-relaxed space-y-4">
              {activeSection.content.split('\n\n').map((block, idx) => {
                // Code block formatting
                if (block.startsWith('```')) {
                  const lines = block.replace(/```[a-z]*/g, '').trim();
                  return (
                    <div key={idx} className="relative my-4 rounded-2xl bg-neutral-950 border border-neutral-800 p-4 font-mono text-xs overflow-x-auto text-amber-300/90 shadow-inner">
                      <pre className="whitespace-pre">{lines}</pre>
                    </div>
                  );
                }

                // Table formatting
                if (block.includes('|')) {
                  return (
                    <div key={idx} className="my-4 overflow-x-auto rounded-xl border border-neutral-800">
                      <div className="bg-neutral-950 p-3 text-xs font-mono whitespace-pre text-neutral-300">
                        {block}
                      </div>
                    </div>
                  );
                }

                // Header 3/4 formatting
                if (block.startsWith('###')) {
                  return (
                    <h3 key={idx} className="text-lg font-bold text-white pt-2 border-b border-neutral-800/60 pb-1">
                      {block.replace(/###/g, '').trim()}
                    </h3>
                  );
                }
                if (block.startsWith('####')) {
                  return (
                    <h4 key={idx} className="text-sm font-bold text-amber-300 pt-2">
                      {block.replace(/####/g, '').trim()}
                    </h4>
                  );
                }

                return (
                  <p key={idx} className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {block}
                  </p>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
