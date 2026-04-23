import { Command, CommandResult } from './types';
import { systemStore } from '@/store/useSystemStore';

/**
 * COMMAND_REGISTRY
 * The single source of truth for all system actions.
 */
export const COMMAND_REGISTRY: Record<string, Command> = {
  // --- SYSTEM COMMANDS ---
  
  help: {
    name: 'help',
    description: 'LIST ALL AVAILABLE SYSTEM COMMANDS',
    accessLevel: 'public',
    execute: () => {
      const commands = Object.values(COMMAND_REGISTRY).filter(c => !c.hidden);
      return {
        outputs: [
          { text: '[SYSTEM] AVAILABLE_COMMANDS:', type: 'SYSTEM' },
          ...commands.map(c => ({
            text: `  ${c.name.toUpperCase().padEnd(12)} → ${c.description}`,
            type: 'INFO' as const
          }))
        ]
      };
    }
  },

  status: {
    name: 'status',
    description: 'VIEW CURRENT SYSTEM STATE AND METRICS',
    accessLevel: 'public',
    execute: (args, context) => {
      const state = systemStore.getState();
      const isAnomaly = context.systemMode === 'ANOMALY';
      
      return {
        outputs: [
          { text: `[SYSTEM] STATUS:   ${isAnomaly ? 'CRITICAL_FAILURE' : 'NOMINAL'}`, type: isAnomaly ? 'ERROR' : 'SUCCESS' },
          { text: `[SYSTEM] UPTIME:   ${state.uptime}S`, type: 'INFO' },
          { text: `[SYSTEM] NODE:     ${context.pathname}`, type: 'INFO' },
          { text: `[SYSTEM] IDENTITY: ${state.playerName || 'GUEST'}`, type: 'INFO' },
          { text: `[SYSTEM] MEMORY:   ${isAnomaly ? 'CORRUPTED' : 'NOMINAL'}`, type: isAnomaly ? 'WARNING' : 'SYSTEM' }
        ]
      };
    }
  },

  fix: {
    name: 'fix',
    description: 'ATTEMPT SYSTEM RECOVERY (ANOMALY MODE ONLY)',
    accessLevel: 'public',
    execute: (args, context) => {
      if (context.systemMode !== 'ANOMALY') {
        return {
          outputs: [{ text: '[SYSTEM] INTEGRITY NOMINAL. NO REPAIR NEEDED.', type: 'INFO' }]
        };
      }
      return {
        outputs: [
          { text: '[SYSTEM] INITIATING RECOVERY...', type: 'ACTION' },
          { text: '[SYSTEM] SCANNING CORE MODULES...', type: 'INFO' },
          { text: '[SYSTEM] ANALYZING MEMORY BLOCKS...', type: 'INFO' }
        ],
        action: 'terminal_reset'
      };
    }
  },

  home: {
    name: 'home',
    description: 'FORCED RETURN TO PRIMARY INTERFACE',
    accessLevel: 'public',
    execute: () => ({
      outputs: [{ text: '[SYSTEM] FORCING NAVIGATION TO HOME...', type: 'ACTION' }],
      action: 'navigate',
      data: '/'
    })
  },

  sync: {
    name: 'sync',
    description: 'TRIGGER MANUAL DATA SYNC (ADMIN ONLY)',
    accessLevel: 'admin',
    execute: async () => {
      return {
        outputs: [
          { text: '[SYNC] INITIATED', type: 'ACTION' },
          { text: '[SYNC] PIPELINE TRIGGERED VIA COMMAND_RUNTIME', type: 'INFO' },
          { text: '[SYNC] MONITOR SYSTEM PANEL FOR PROGRESS', type: 'SYSTEM' }
        ],
        action: 'terminal_reset'
      };
    }
  },

  admin: {
    name: 'admin',
    description: 'INITIALIZE SECURE ADMIN RUNTIME',
    accessLevel: 'public',
    execute: (args, context) => {
      if (systemStore.getState().adminModuleActive) {
        return {
          outputs: [{ text: '[SYSTEM] ADMIN RUNTIME ALREADY INITIALIZED', type: 'INFO' }]
        };
      }

      systemStore.setAdminModuleActive(true);
      
      return {
        outputs: [
          { text: '[SYSTEM] ADMIN MODE INITIALIZING...', type: 'ACTION' },
          { text: '[AUTH] ELEVATED PRIVILEGES REQUESTED', type: 'INFO' },
          { text: '[AUTH] REDIRECTING TO SECURE_LOGIN_GATE...', type: 'SUCCESS' }
        ],
        action: 'navigate',
        data: '/admin'
      };
    }
  },

  logout: {
    name: 'logout',
    description: 'TERMINATE ADMIN SESSION AND PURGE PRIVILEGES',
    accessLevel: 'public',
    execute: async () => {
      // 1. Destroy server session
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
      } catch (e) {}

      // 2. Reset local state
      systemStore.resetAdminState();

      return {
        outputs: [
          { text: '[SYSTEM] ADMIN SESSION TERMINATED', type: 'ACTION' },
          { text: '[SYSTEM] PRIVILEGES PURGED', type: 'INFO' },
          { text: '[SYSTEM] RETURNING TO ROOT...', type: 'SUCCESS' }
        ],
        action: 'navigate',
        data: '/'
      };
    }
  },

  exit: {
    name: 'exit',
    description: 'DEACTIVATE ADMIN MODULE VISIBILITY',
    accessLevel: 'public',
    execute: () => {
      systemStore.setAdminModuleActive(false);
      return {
        outputs: [
          { text: '[SYSTEM] ADMIN MODULE DEACTIVATED', type: 'ACTION' },
          { text: '[SYSTEM] VISIBILITY TERMINATED', type: 'INFO' }
        ],
        action: 'navigate',
        data: '/'
      };
    }
  },

  clear: {
    name: 'clear',
    description: 'CLEAR TERMINAL BUFFER',
    accessLevel: 'public',
    aliases: ['cls'],
    execute: () => ({
      outputs: [],
      action: 'clear'
    })
  },

  // --- GAME COMMANDS ---

  play: {
    name: 'play',
    description: 'LAUNCH GAME MODULE [SNAKE|PONG|RUNNER|MEMORY]',
    accessLevel: 'public',
    execute: (args) => {
      const game = args[0]?.toLowerCase();
      const validGames = ['snake', 'pong', 'runner', 'memory'];
      
      if (!game || !validGames.includes(game)) {
        return {
          outputs: [
            { text: '[ERROR] INVALID_GAME', type: 'ERROR' },
            { text: '[SYSTEM] USAGE: PLAY [SNAKE|PONG|RUNNER|MEMORY]', type: 'INFO' }
          ]
        };
      }

      return {
        outputs: [
          { text: `[GAME] LAUNCHING_${game.toUpperCase()}...`, type: 'SUCCESS' }
        ],
        action: 'game',
        data: game
      };
    }
  },

  leaderboard: {
    name: 'leaderboard',
    description: 'VIEW HIGH SCORES [SNAKE|PONG|RUNNER|MEMORY]',
    accessLevel: 'public',
    aliases: ['scores', 'lb'],
    execute: (args) => {
      const game = args[0]?.toLowerCase();
      const validGames = ['snake', 'pong', 'runner', 'memory'];

      if (!game || !validGames.includes(game)) {
        return {
          outputs: [
            { text: '[ERROR] SPECIFY A GAME', type: 'ERROR' },
            { text: '[SYSTEM] USAGE: LEADERBOARD [SNAKE|PONG|RUNNER|MEMORY]', type: 'INFO' }
          ]
        };
      }

      return {
        outputs: [
          { text: `[DB] FETCHING_SCORES — ${game.toUpperCase()}...`, type: 'SUCCESS' }
        ],
        action: 'leaderboard',
        data: game
      };
    }
  }
};

