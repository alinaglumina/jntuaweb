import { Link } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { useGlobalSearch } from '../../hooks/useGlobalSearch.js';

export default function Header() {
  const { openSearch } = useGlobalSearch();
  return (
    <header className="border-b border-line bg-surface">
      <div className="container flex items-center justify-between gap-4 py-3">
        <Link to="/" className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy font-display text-2xl font-bold text-white">J</span>
          <span className="leading-tight">
            <h1 className="font-display text-lg font-bold text-brand md:text-2xl">Jawaharlal Nehru Technological University Anantapur</h1>
            <span className="block text-sm text-muted">జవహర్‌లాల్ నెహ్రూ సాంకేతిక విశ్వవిద్యాలయం అనంతపురం</span>
            <span className="block text-xs text-muted">(Established under A.P. Govt. Act No.30 of 2008)</span>
            <span className="block text-xs text-muted"><i className="fa-solid fa-location-dot text-gold" aria-hidden="true" /> Ananthapuramu – 515002, Andhra Pradesh, India</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          <button onClick={openSearch} aria-label="Search (press / or Ctrl+K)" title="Search  (Ctrl/⌘+K)"
            className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm text-muted transition hover:border-navy hover:text-brand">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden rounded bg-line/60 px-1.5 text-[10px] lg:inline">⌘K</kbd>
          </button>
          <ThemeToggle className="text-brand" />
          <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-navy/20 text-[10px] font-semibold text-navy">NAAC</span>
          <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-gold/40 text-[10px] font-semibold text-gold">75 Yrs</span>
        </div>
      </div>
    </header>
  );
}
