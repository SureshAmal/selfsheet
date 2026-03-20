'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MonthSelector } from './components/MonthSelector';
import { TrackerGrid } from './components/TrackerGrid';
import { AnalysisChart } from './components/AnalysisChart';
import { Modal } from './components/Modal';
import { useUser } from './context/UserContext';
import { getUserProtocols, getLogsForMonth, bulkInsertLogs } from './actions';
import { format, getDaysInMonth } from 'date-fns';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export default function Home() {
  const { user, isLoading } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [protocols, setProtocols] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<{ protocols: string[], logs: { protocolName: string, day: number, status: boolean }[], month: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTrackerData = async () => {
    if (!user) return;
    const p = await getUserProtocols(user.id);
    setProtocols(p);

    const monthPrefix = format(currentDate, 'yyyy-MM');
    const l = await getLogsForMonth(user.id, monthPrefix);
    setLogs(l);
  };

  useEffect(() => {
    fetchTrackerData();
  }, [user, currentDate]);

  const handleExportSheet = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const monthPrefix = format(currentDate, 'yyyy-MM');
    const headerRow = ['Protocol', ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString())];

    const dataRows = protocols.map(p => {
      const row = [p.name];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${monthPrefix}-${day.toString().padStart(2, '0')}`;
        const log = logs.find(l => l.protocolId === p.id && l.date === dateStr);
        row.push(log?.status ? '✓' : '');
      }
      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, format(currentDate, 'MMM_yyyy'));
    XLSX.writeFile(workbook, `tracker_${format(currentDate, 'MMM_yyyy')}.xlsx`);
  };

  const handleExportPNG = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current, {
        ignoreElements: (element) => element.classList.contains('ignore-capture')
      });
      const link = document.createElement('a');
      link.download = `analysis_${format(currentDate, 'MMM_yyyy')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result;
      try {
        const res = await fetch('/api/extract-image', {
          method: 'POST',
          body: JSON.stringify({ image: base64 })
        });
        const data = await res.json();

        if (data.error || !data.protocols) {
          setImportError(data.error || 'Failed to parse required data from image.');
        } else {
          setImportData({
            protocols: data.protocols,
            logs: data.logs || [],
            month: data.month
          });
        }
      } catch (error) {
        console.error(error);
        setImportError('Failed to parse image. Please try again.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmImport = async () => {
    if (!user || !importData) return;
    try {
      await bulkInsertLogs(user.id, format(currentDate, 'yyyy-MM'), importData.protocols, importData.logs);
      fetchTrackerData();
      setImportData(null);
    } catch (error) {
      setImportError('Failed to save imported logs.');
    }
  };

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <main className="main-container">
      <Header />

      {user ? (
        <div className="content-wrapper">
          <div className="controls-row">
            <MonthSelector
              currentDate={currentDate}
              onChange={setCurrentDate}
            />
            <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleExportSheet} className="btn-secondary">Export Sheet</button>
              {/* <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn-secondary"
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Import Image'}
              </button>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileSelect} 
              /> */}
            </div>
          </div>

          <TrackerGrid
            userId={user.id}
            currentDate={currentDate}
            protocols={protocols}
            logs={logs}
            onUpdate={fetchTrackerData}
          />

          <div ref={chartRef} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: '1rem', top: '1rem', zIndex: 10 }} className="ignore-capture">
              <button onClick={handleExportPNG} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>Export PNG</button>
            </div>
            <AnalysisChart
              currentDate={currentDate}
              logs={logs}
              totalProtocols={protocols.length}
            />
          </div>

          <Modal isOpen={!!importError} onClose={() => setImportError(null)} title="Error">
            <p style={{ marginBottom: 'var(--spacing-md)' }}>{importError}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setImportError(null)} className="btn-base">OK</button>
            </div>
          </Modal>

          <Modal isOpen={!!importData} onClose={() => setImportData(null)} title="Import Preview">
            {importData && (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: 'var(--spacing-md)' }}>
                <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Parsed <strong>{importData.protocols.length}</strong> protocols and <strong>{importData.logs.length}</strong> logs.
                </p>
                <div className="tracker-grid-wrapper">
                  <table className="tracker-table" style={{ fontSize: '0.8rem', minWidth: '100%' }}>
                    <thead>
                      <tr>
                        <th className="protocol-col-header" style={{ width: 'auto' }}>Protocol</th>
                        <th style={{ padding: '0 8px' }}>Logs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.protocols.map(p => (
                        <tr key={p}>
                          <td className="protocol-name">{p}</td>
                          <td>{importData.logs.filter(l => l.protocolName === p && l.status).length} done</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setImportData(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleConfirmImport} className="btn-base">Confirm Import</button>
            </div>
          </Modal>

        </div>
      ) : (
        <div className="welcome-screen">
          <h1>Welcome to SelfSheet</h1>
          <p>Login or Register to manage your protocols seamlessly.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/login" className="btn-base" style={{ textDecoration: 'none' }}>Login</Link>
            <Link href="/register" className="btn-secondary" style={{ textDecoration: 'none' }}>Register</Link>
          </div>
        </div>
      )}
    </main>
  );
}
