import type { Metadata } from 'next';
import CooperadoShell from './components/CooperadoShell';

export const metadata: Metadata = {
  title: 'Área do cooperado - Coopera Fácil',
  description: 'O produtor consulta as próprias licenças ambientais e os prazos de renovação.',
};

export default function CooperadoLayout({ children }: { children: React.ReactNode }) {
  return <CooperadoShell>{children}</CooperadoShell>;
}