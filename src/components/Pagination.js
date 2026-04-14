import React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1 mt-8" data-testid="pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        data-testid="pagination-prev"
        className="w-10 h-10 flex items-center justify-center border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <CaretLeft size={16} weight="bold" />
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            data-testid="pagination-page-1"
            className="w-10 h-10 flex items-center justify-center border border-zinc-200 hover:bg-zinc-100 text-sm font-bold transition-colors"
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="w-10 h-10 flex items-center justify-center text-zinc-400 text-sm">...</span>
          )}
        </>
      )}

      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          data-testid={`pagination-page-${p}`}
          className={`w-10 h-10 flex items-center justify-center border text-sm font-bold transition-colors ${
            p === page
              ? 'bg-[#002FA7] text-white border-[#002FA7]'
              : 'border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          {p}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="w-10 h-10 flex items-center justify-center text-zinc-400 text-sm">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            data-testid={`pagination-page-${totalPages}`}
            className="w-10 h-10 flex items-center justify-center border border-zinc-200 hover:bg-zinc-100 text-sm font-bold transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        data-testid="pagination-next"
        className="w-10 h-10 flex items-center justify-center border border-zinc-200 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  );
};
