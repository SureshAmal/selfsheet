'use client';

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { loginUser } from '../actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await loginUser(username, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.user) {
        setUser(result.user);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="welcome-screen">
      <h1>SelfSheet Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Username" 
          className="input-base" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password" 
          className="input-base" 
          required 
        />
        <button type="submit" className="btn-base">Login</button>
        {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
      </form>
      <Link href="/register" style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>
        Don't have an account? Register here.
      </Link>
    </div>
  );
}
