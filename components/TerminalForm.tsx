'use client';

import React, { useState } from 'react';

export interface TerminalFormData {
  source: string;
  node: string;
  type: 'HIRING' | 'COLLABORATION' | 'GENERAL';
  packet: string;
}

interface TerminalFormProps {
  onSubmit: (formData: TerminalFormData) => void;
  isSubmitting: boolean;
}

export const TerminalForm: React.FC<TerminalFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<TerminalFormData>({
    source: '',
    node: '',
    type: 'GENERAL',
    packet: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.source || !formData.packet) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-8">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; TRANSMISSION_PACKET_INIT
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[9px] opacity-50 uppercase tracking-widest">SOURCE_ID &gt;</label>
            <input 
              required
              type="text" 
              value={formData.source}
              onChange={(e) => setFormData({...formData, source: e.target.value.toUpperCase()})}
              className="w-full bg-black/40 border border-primary/30 p-2 outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:opacity-30 text-primary"
              placeholder="USER_NAME"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] opacity-50 uppercase tracking-widest">TARGET_NODE &gt;</label>
            <input 
              required
              type="email" 
              value={formData.node}
              onChange={(e) => setFormData({...formData, node: e.target.value})}
              className="w-full bg-black/40 border border-primary/30 p-2 outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder:opacity-30 text-primary lowercase"
              placeholder="user@node.ext"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] opacity-50 uppercase tracking-widest">PACKET_TYPE &gt;</label>
          <div className="flex flex-wrap gap-4 pt-2">
            {['HIRING', 'COLLABORATION', 'GENERAL'].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="type" 
                  value={t} 
                  checked={formData.type === t}
                  onChange={(e) => setFormData({...formData, type: e.target.value as TerminalFormData['type']})}
                  className="hidden"
                />
                <span className={`w-3 h-3 border ${formData.type === t ? 'bg-primary border-primary' : 'border-primary/40 group-hover:border-primary'} transition-all`} />
                <span className={`text-[10px] ${formData.type === t ? 'text-primary' : 'opacity-40'} uppercase`}>{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] opacity-50 uppercase tracking-widest">PACKET_RAW_DATA &gt;</label>
          <textarea 
            required
            value={formData.packet}
            onChange={(e) => setFormData({...formData, packet: e.target.value})}
            className="w-full h-32 bg-black/40 border border-primary/30 p-3 outline-none focus:border-primary focus:bg-primary/5 transition-all resize-none placeholder:opacity-30 text-primary"
            placeholder="ENTER_MESSAGE_STRING_FOR_SECURE_UPLINK..."
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-black py-4 font-bold uppercase transition-all hover:bg-glow disabled:opacity-30 phosphor-glow relative overflow-hidden"
        >
          {isSubmitting ? 'UPLOADING_PACKET...' : '[ INITIATE_UPLINK_TRANSMISSION ]'}
        </button>
      </form>
    </div>
  );
};
