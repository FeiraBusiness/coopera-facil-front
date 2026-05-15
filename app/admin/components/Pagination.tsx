'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number; // 0-indexed
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({ page, totalPages, totalElements, pageSize, onPageChange, disabled }: PaginationProps) {
  if (totalElements === 0) return null;

  const start = page * pageSize + 1;
  const end = Math.min(totalElements, start + pageSize - 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
      <p className="text-xs text-slate-500 order-2 sm:order-1">
        Exibindo <span className="font-semibold text-slate-700">{start}-{end}</span> de{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span>
      </p>
      <div className="flex items-center gap-2 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page === 0}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-bold min-w-16 text-center">
          {page + 1} / {Math.max(totalPages, 1)}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages - 1}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors cursor-pointer"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
