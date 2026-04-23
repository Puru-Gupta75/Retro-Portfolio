'use client';

// Module-level singleton store — no Zustand, no external deps.
// Plain pub/sub pattern consistent with the rest of this codebase.

export type LogType = 'INFO' | 'ACTION' | 'ERROR';

export type Log = {
  id: string;
  message: string;
  type: LogType;
  timestamp: number;
};

export type SystemMode = 'NORMAL' | 'ANOMALY' | 'BOOT';

export type GameType = 'snake' | 'pong' | 'runner' | 'memory' | null;

type State = {
  logs: Log[];   // newest-first, capped at 50
  fps: number;
  safeMode: boolean;
  uptime: number; // seconds since app mount
  systemMode: SystemMode;
  anomalyRoute: string | null; // stores the 404 route that triggered anomaly
  currentGame: GameType;
  playerName: string;
  
  // ADMIN RUNTIME STATE
  adminModuleActive: boolean;
  adminAuthenticated: boolean;
  adminSessionValid: boolean;
  adminLoading: boolean;
};

type Listener = () => void;

let state: State = { 
  logs: [], 
  fps: 0, 
  safeMode: false, 
  uptime: 0,
  systemMode: 'NORMAL',
  anomalyRoute: null,
  currentGame: null,
  playerName: '',
  
  adminModuleActive: false,
  adminAuthenticated: false,
  adminSessionValid: false,
  adminLoading: false
};
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

export const systemStore = {
  getState(): State {
    return state;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  addLog(message: string, type: LogType = 'INFO') {
    const log: Log = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      message,
      type,
      timestamp: Date.now(),
    };
    state = { ...state, logs: [log, ...state.logs].slice(0, 50) };
    notify();
  },

  clearLogs() {
    state = { ...state, logs: [] };
    notify();
  },

  setFPS(fps: number) {
    state = { ...state, fps };
    notify();
  },

  setSafeMode(safeMode: boolean) {
    state = { ...state, safeMode };
    notify();
  },

  tickUptime() {
    state = { ...state, uptime: state.uptime + 1 };
    notify();
  },

  setSystemMode(mode: SystemMode, route?: string) {
    state = { ...state, systemMode: mode, anomalyRoute: route || state.anomalyRoute };
    notify();
  },

  setCurrentGame(game: GameType) {
    state = { ...state, currentGame: game };
    notify();
  },

  setPlayerName(name: string) {
    state = { ...state, playerName: name };
    notify();
  },
  
  setAdminModuleActive(active: boolean) {
    state = { ...state, adminModuleActive: active };
    notify();
  },

  setAdminAuthenticated(authenticated: boolean) {
    state = { ...state, adminAuthenticated: authenticated };
    notify();
  },

  setAdminSessionValid(valid: boolean) {
    state = { ...state, adminSessionValid: valid };
    notify();
  },

  setAdminLoading(loading: boolean) {
    state = { ...state, adminLoading: loading };
    notify();
  },

  resetAdminState() {
    state = { 
      ...state, 
      adminModuleActive: false,
      adminAuthenticated: false,
      adminSessionValid: false,
      adminLoading: false
    };
    notify();
  },

  resetAnomalyState() {
    state = { 
      ...state, 
      systemMode: 'NORMAL', 
      anomalyRoute: null, 
      currentGame: null, 
      playerName: '' 
    };
    notify();
  },
};
