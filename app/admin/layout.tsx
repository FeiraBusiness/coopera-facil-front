import type { Metadata } from 'next';
import AdminShell from './components/AdminShell';
import { ToastProvider } from './components/ToastProvider';

export const metadata: Metadata = {
  title: 'Painel Administrativo - CooperaFácil',
  description: 'Gestão de produtores rurais, licenças ambientais e documentos recebidos via WhatsApp.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
