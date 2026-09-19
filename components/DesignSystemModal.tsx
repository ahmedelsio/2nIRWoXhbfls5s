import React, { useState } from 'react';
import { 
  Palette, Check, Sparkles, Eye, ShieldCheck, 
  Layers, Smartphone, Flame, Moon, Sun, ArrowRight, Timer, Plus, Minus
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { DesignSystemId } from '../types';

interface DesignSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignSystemModal: React.FC<DesignSystemModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, availableOptions, activeOption } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<DesignSystemId>(theme);

  if (!isOpen) return null;

  const handleSelectTheme = (id: DesignSystemId) => {
    setPreviewTheme(id);
    setTheme(id);
  };

  return (
    <div
      id="design-system-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-4xl rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 text-[var(--text-primary)] shadow-2xl flex flex-col max-h-[90vh] my-auto">
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
                Design System Studio
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] mt-1">
              Choose Your Gym Companion Design System
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select an aesthetic and functional architecture. Click any card to preview the entire application live in real-time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition"
          >
            ✕
          </button>
        </div>

        {/* 6 DESIGN SYSTEM OPTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 my-5 overflow-y-auto pr-1">
          {availableOptions.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelectTheme(opt.id)}
                className={`cursor-pointer rounded-2xl p-4 transition border relative flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-[var(--accent)] border-[var(--accent)] shadow-xl bg-[var(--bg-elevated)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-subtle)]'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] px-2 py-0.5 text-[10px] font-black uppercase">
                    <Check className="h-3 w-3 stroke-[3]" /> Active
                  </div>
                )}

                <div>
                  {/* Visual Color Palette Swatch Bar */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div
                      className="h-6 w-6 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: opt.primaryAccent }}
                      title={`Accent: ${opt.primaryAccent}`}
                    />
                    <div
                      className="h-6 w-6 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: opt.surfaceBg }}
                      title={`Surface: ${opt.surfaceBg}`}
                    />
                    <div
                      className="h-6 w-6 rounded-full border border-white/20 shadow-sm shrink-0"
                      style={{ backgroundColor: opt.primaryBg }}
                      title={`Base: ${opt.primaryBg}`}
                    />
                    <span className="text-[10px] font-mono text-[var(--text-muted)] ml-auto">
                      {opt.contrastRatio}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{opt.name}</h3>
                  <p className="text-[11px] font-medium text-[var(--accent)] mt-0.5">{opt.tagline}</p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {opt.recommendedFor}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {opt.previewBadges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="rounded-md bg-[var(--bg-main)] px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-secondary)] border border-[var(--border-color)]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTheme(opt.id);
                    }}
                    className={`w-full rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[var(--accent)] text-[var(--accent-contrast)] shadow-md'
                        : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                    {isSelected ? 'Currently Selected' : `Apply ${opt.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* LIVE COMPONENT PREVIEW OF ACTIVE THEME */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-main)] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
              Live Interactive Component Preview: {activeOption.name}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Vibe: {activeOption.vibe}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* 1. Rest Timer Preview */}
            <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-[11px] font-bold text-[var(--accent)]">Rest Timer</span>
              </div>
              <span className="font-mono text-lg font-black text-[var(--accent)]">01:45</span>
            </div>

            {/* 2. Stepper Preview */}
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 flex items-center justify-between">
              <button className="h-7 w-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center font-bold">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <div className="text-center">
                <span className="text-xs font-mono font-black text-[var(--text-primary)]">82.5 kg</span>
                <span className="block text-[9px] text-[var(--text-muted)]">Work Load</span>
              </div>
              <button className="h-7 w-7 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center font-bold">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 3. Giant CTA Preview */}
            <button className="w-full rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-black text-xs py-3 px-4 shadow-md flex items-center justify-center gap-2">
              <Check className="h-4 w-4 stroke-[3]" />
              <span>✓ COMPLETE SET (56px CTA)</span>
            </button>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-secondary)]">
            Selection is saved automatically to your device session.
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] px-5 py-2 text-xs font-black hover:opacity-90 transition shadow-md"
          >
            Confirm & Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
