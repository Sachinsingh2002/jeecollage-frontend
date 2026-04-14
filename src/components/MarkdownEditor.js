import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Eye, PencilSimple } from '@phosphor-icons/react';

export const MarkdownEditor = ({ value, onChange, label, rows = 8 }) => {
  const [preview, setPreview] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">{label}</label>
        <div className="flex gap-0 border border-zinc-200">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`px-3 py-1 text-xs font-bold flex items-center gap-1 transition-colors ${!preview ? 'bg-[#002FA7] text-white' : 'bg-white text-zinc-600 hover:bg-zinc-100'}`}
            data-testid="md-edit-btn"
          >
            <PencilSimple size={12} weight="bold" /> Write
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`px-3 py-1 text-xs font-bold flex items-center gap-1 transition-colors ${preview ? 'bg-[#002FA7] text-white' : 'bg-white text-zinc-600 hover:bg-zinc-100'}`}
            data-testid="md-preview-btn"
          >
            <Eye size={12} weight="bold" /> Preview
          </button>
        </div>
      </div>

      {preview ? (
        <div className="bg-white border border-zinc-200 px-4 py-3 min-h-[200px] prose prose-sm max-w-none" data-testid="md-preview">
          <ReactMarkdown>{value || '*No content yet*'}</ReactMarkdown>
        </div>
      ) : (
        <>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="w-full bg-white border border-zinc-200 rounded-none px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002FA7] text-sm font-mono"
            placeholder="Supports **bold**, *italic*, # headings, - lists, [links](url)"
            data-testid="md-textarea"
          />
          <div className="text-xs text-zinc-400 mt-1">
            Supports Markdown: **bold**, *italic*, # Heading, - bullet list, [link text](url)
          </div>
        </>
      )}
    </div>
  );
};
