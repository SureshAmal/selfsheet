'use client';

import React, { useState } from 'react';
import { getDaysInMonth, format, isAfter, parseISO, startOfDay } from 'date-fns';
import { toggleLogStatus, addProtocol, deleteProtocol } from '@/app/actions';
import { Plus, X } from 'lucide-react';
import { Modal } from './Modal';

interface Protocol {
  id: string;
  name: string;
}

interface ProtocolLog {
  id: string;
  protocolId: string;
  date: string;
  status: boolean;
}

interface TrackerGridProps {
  userId: string;
  currentDate: Date;
  protocols: Protocol[];
  logs: ProtocolLog[];
  onUpdate: () => void;
}

export function TrackerGrid({ userId, currentDate, protocols, logs, onUpdate }: TrackerGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProtocolName, setNewProtocolName] = useState('');
  
  const daysInMonth = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthPrefix = format(currentDate, 'yyyy-MM');
  const today = startOfDay(new Date());

  const getLogForDay = (protocolId: string, day: number) => {
    const dateStr = `${monthPrefix}-${day.toString().padStart(2, '0')}`;
    return logs.find(l => l.protocolId === protocolId && l.date === dateStr);
  };

  const isFutureDay = (day: number) => {
    const cellDateStr = `${monthPrefix}-${day.toString().padStart(2, '0')}`;
    const cellDate = parseISO(cellDateStr);
    return isAfter(cellDate, today);
  };

  const handleToggle = async (protocolId: string, day: number) => {
    if (isFutureDay(day)) return; // Prevent clicking future days
    const dateStr = `${monthPrefix}-${day.toString().padStart(2, '0')}`;
    const log = getLogForDay(protocolId, day);
    await toggleLogStatus(protocolId, dateStr, log?.status);
    onUpdate();
  };

  const handleAddProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProtocolName.trim() !== '') {
      await addProtocol(userId, newProtocolName.trim());
      setNewProtocolName('');
      setIsModalOpen(false);
      onUpdate();
    }
  };

  const handleDeleteProtocol = async (protocolId: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? All related logs will be removed.`)) {
      await deleteProtocol(protocolId);
      onUpdate();
    }
  };

  return (
    <>
      <div className="tracker-grid-wrapper glass-panel">
        <table className="tracker-table">
          <thead>
            <tr>
              <th className="protocol-col-header">Protocols</th>
              {daysArray.map(day => (
                <th key={day} className="day-col-header" style={{ opacity: isFutureDay(day) ? 0.4 : 1 }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {protocols.map(p => (
              <tr key={p.id}>
                <td className="protocol-name">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '8px' }}>
                    <span>{p.name}</span>
                    <button 
                      className="icon-btn delete-btn" 
                      onClick={() => handleDeleteProtocol(p.id, p.name)}
                      title="Delete Protocol"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </td>
                {daysArray.map(day => {
                  const log = getLogForDay(p.id, day);
                  const future = isFutureDay(day);
                  return (
                    <td 
                      key={day} 
                      className={`day-cell ${log?.status ? 'active' : ''} ${future ? 'disabled' : ''}`}
                      onClick={() => handleToggle(p.id, day)}
                    >
                      {log?.status ? '✓' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="add-protocol-cell" onClick={() => setIsModalOpen(true)} colSpan={daysInMonth + 1}>
                <button className="add-btn"><Plus size={16} /> Add Protocol</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Protocol">
        <form onSubmit={handleAddProtocol} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            autoFocus
            type="text"
            className="input-base"
            placeholder="e.g. Morning Jog, Reading, etc."
            value={newProtocolName}
            onChange={(e) => setNewProtocolName(e.target.value)}
            required
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-base">Add Protocol</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
