export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-10 h-10 border-3', lg: 'w-14 h-14 border-4' };
  return (
    <div className="flex items-center justify-center py-10">
      <div className={`${sizes[size]} rounded-full border-blue-200 border-t-blue-700 animate-spin`} />
    </div>
  );
}
