'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel} title="" maxWidthClass="max-w-md">
      <div className="flex flex-col items-center text-center gap-3 -mt-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${destructive ? 'bg-red-100' : 'bg-blue-100'}`}>
          <AlertTriangle className={`w-7 h-7 ${destructive ? 'text-red-600' : 'text-blue-600'}`} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors cursor-pointer disabled:opacity-60 ${
            destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-700 hover:bg-blue-800'
          }`}
        >
          {isSubmitting ? 'Processando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
