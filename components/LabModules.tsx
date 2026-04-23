'use client';

import React, { useState } from 'react';

export const SentimentNode: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnalyze = () => {
    if (!input) return;
    setIsProcessing(true);
    setTimeout(() => {
      const sentiment = Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE';
      const magnitude = (Math.random() * 0.9).toFixed(2);
      setOutput(`POLARITY: ${sentiment} // MAGNITUDE: ${magnitude} // FREQ: ${Math.floor(Math.random() * 800 + 100)}HZ`);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Input String</label>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-black border border-primary/20 p-3 font-mono text-sm outline-none focus:border-primary/60 transition-colors"
          placeholder="ENTER_DATA_FOR_ANALYSIS..."
        />
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleAnalyze}
          disabled={isProcessing}
          className="bg-primary text-black px-6 py-2 font-mono font-bold text-xs uppercase hover:bg-glow transition-all disabled:opacity-30"
        >
          {isProcessing ? 'ANALYZING...' : '[ EXECUTE_ANALYSIS ]'}
        </button>
        <button onClick={() => {setInput(''); setOutput(null);}} className="border border-primary/20 px-6 py-2 font-mono text-xs uppercase hover:bg-primary/5 transition-all text-primary/60">
          Reset
        </button>
      </div>

      <div className="bg-surface/50 border border-primary/10 p-4 h-24 flex items-center justify-center font-mono text-xs">
        {output ? (
          <span className="text-primary animate-in fade-in slide-in-from-left-2">{output}</span>
        ) : (
          <span className="opacity-20 italic">WAITING_FOR_INPUT...</span>
        )}
      </div>
    </div>
  );
};

export const FluxVisualizer: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<string[]>([]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        const char = Math.random() > 0.5 ? '█' : '▒';
        const value = Math.random().toString(36).substring(7).toUpperCase();
        const entropy = Math.random().toFixed(4);
        setStream((prev) => [...prev, `${char} ${value}|${entropy}`].slice(-8));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button 
          onClick={() => setIsStreaming(!isStreaming)}
          className={`px-6 py-2 font-mono font-bold text-xs uppercase transition-all ${isStreaming ? 'bg-red-900 text-white' : 'bg-primary text-black'}`}
        >
          {isStreaming ? '[ STOP_STREAM ]' : '[ START_STREAM ]'}
        </button>
        <button onClick={() => setStream([])} className="border border-primary/20 px-6 py-2 font-mono text-xs uppercase hover:bg-primary/5 transition-all text-primary/60">
          Clear
        </button>
      </div>

      <div className="bg-black border border-primary/10 p-6 h-48 overflow-hidden font-mono text-[10px] space-y-1">
        {stream.length > 0 ? (
          stream.map((line, i) => {
            const [entry, entropy] = line.split('|');
            return (
              <div key={`${line}-${i}`} className="flex gap-4 opacity-70">
                <span className="text-primary">{entry}</span>
                <span className="opacity-20">{entropy}</span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center opacity-20 italic underline decoration-dotted">ENTROPY_IDLE</div>
        )}
      </div>
    </div>
  );
};

export const KernelStress: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const startStress = () => {
    setIsRunning(true);
    setLogs(["[INIT] STARTING_STRESS_TEST", "[WARN] ALLOCATING_VIRTUAL_MEM"]);
    
    let count = 0;
    const interval = setInterval(() => {
      const taskID = Math.floor(Math.random() * 9000 + 1000);
      setLogs((prev) => [...prev, `[OK] TASK_${taskID} -> DEPLOYED_AT_CORE_${count % 4}`].slice(-10));
      count++;
      if (count > 20) {
        clearInterval(interval);
        setLogs((prev) => [...prev, "[SUCCESS] TEST_COMPLETED", "[END] RELEASING_RESOURCES"]);
        setIsRunning(false);
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={startStress}
        disabled={isRunning}
        className="w-full bg-primary text-black py-4 font-mono font-extrabold text-sm uppercase hover:bg-glow transition-all disabled:opacity-30 phosphor-glow"
      >
        {isRunning ? 'STRESSING_KERNEL...' : 'RUN_FULL_STRESS_SIMULATION'}
      </button>

      <div className="bg-surface/30 border-l-4 border-primary/40 p-6 h-56 overflow-y-auto scrollbar-hide font-mono text-[11px] space-y-1">
        {logs.map((log, i) => (
          <div key={`${log}-${i}`} className={log.includes('[WARN]') ? 'text-amber-500' : 'text-primary/80'}>
            &gt; {log}
          </div>
        ))}
        {isRunning && <span className="inline-block w-2 h-3 bg-primary animate-pulse ml-2" />}
      </div>
    </div>
  );
};
