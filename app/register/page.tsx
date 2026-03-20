'use client';

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { registerUser } from '../actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await registerUser(username, password);
      setUser(user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="welcome-screen">
      <h1>Create Account</h1>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Choose a Username" 
          className="input-base" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Choose a Password" 
          className="input-base" 
          required 
        />
        <button type="submit" className="btn-base">Register</button>
        {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
      </form>
      <Link href="/login" style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>
        Already have an account? Login here.
      </Link>
    </div>
  );
}
