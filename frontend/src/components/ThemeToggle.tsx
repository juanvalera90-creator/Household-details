'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      style={{
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      {theme === 'light' ? (
        <>
          <span aria-hidden>🌙</span>
          Dark
        </>
      ) : (
        <>
          <span aria-hidden>☀️</span>
          Light
        </>
      )}
    </button>
  );
}
