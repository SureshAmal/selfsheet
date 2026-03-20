'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { useUser } from '../context/UserContext';
import { useRouter } from 'next/navigation';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = ['light', 'black', 'sunset', 'nightown', 'sea'] as const;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tracker_user');
    window.location.reload();
  };

  const handleToggle = () => {
    setIsThemeOpen(!isThemeOpen);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    } else if (e.key === 'Escape') {
      setIsThemeOpen(false);
    } else if (isThemeOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(i => (i + 1) % themes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(i => (i - 1 + themes.length) % themes.length);
      }
    }
  };

  const selectOption = (t: string) => {
    setTheme(t as any);
    setIsThemeOpen(false);
    setFocusedIndex(-1);
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, t: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectOption(t);
    }
  };

  return (
    <header className="header-container glass-panel">
      <div className="logo cursor-pointer" onClick={() => router.push('/')} tabIndex={0}>
        SelfSheet
      </div>
      
      {user && (
        <div className="user-profile">
          <span className="username-badge">{user.username}</span>
          
          <div className="custom-select-container" ref={dropdownRef}>
            <button 
              className="select-base custom-select-btn" 
              onClick={handleToggle}
              onKeyDown={handleKeyDown}
              aria-haspopup="listbox"
              aria-expanded={isThemeOpen}
            >
              {theme}
              <span style={{ fontSize: '0.8em', marginLeft: '8px' }}>▼</span>
            </button>
            {isThemeOpen && (
              <div className="custom-select-dropdown" role="listbox">
                {themes.map((t, i) => (
                  <div 
                    key={t} 
                    className={`custom-select-option ${focusedIndex === i ? 'focused' : ''}`}
                    onClick={() => selectOption(t)}
                    onKeyDown={(e) => handleOptionKeyDown(e, t)}
                    role="option"
                    aria-selected={theme === t}
                    tabIndex={0}
                    onMouseEnter={() => setFocusedIndex(i)}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
