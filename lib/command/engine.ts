import { COMMAND_REGISTRY } from './registry';
import { CommandContext, CommandResult } from './types';
import { logEvent } from '@/lib/systemLogger';

/**
 * COMMAND_ENGINE
 * Central runtime for parsing and executing terminal commands.
 */
export const commandEngine = {
  /**
   * Main entry point for command execution.
   */
  async process(input: string, context: CommandContext): Promise<CommandResult> {
    const raw = input.trim();
    if (!raw) return { outputs: [] };

    // 1. Parsing
    const parts = raw.split(/\s+/);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    // 2. Logging
    logEvent(`COMMAND_INPUT: ${cmdName}`, 'ACTION');

    // 3. Lookup
    const command = this.findCommand(cmdName);

    if (!command) {
      return {
        outputs: [
          { text: `[ERROR] UNKNOWN COMMAND: '${cmdName}'`, type: 'ERROR' },
          { text: 'TYPE "help" FOR AVAILABLE COMMANDS', type: 'INFO' }
        ]
      };
    }

    // 4. Access Control
    if (command.accessLevel === 'admin' && !context.isAdmin) {
      return {
        outputs: [
          { text: '[ERROR] ACCESS_DENIED', type: 'ERROR' },
          { text: 'ELEVATED PRIVILEGES REQUIRED FOR THIS OPERATION', type: 'INFO' }
        ]
      };
    }

    // 5. Execution
    try {
      return await command.execute(args, context);
    } catch (err: any) {
      logEvent(`COMMAND_ERROR: ${cmdName} -> ${err.message}`, 'ERROR');
      return {
        outputs: [
          { text: `[SYSTEM_FAILURE] EXECUTION_ERROR in '${cmdName}'`, type: 'ERROR' },
          { text: err.message, type: 'INFO' }
        ]
      };
    }
  },

  /**
   * Helper to find command by name or alias.
   */
  findCommand(name: string) {
    // Direct match
    if (COMMAND_REGISTRY[name]) return COMMAND_REGISTRY[name];
    
    // Alias match
    return Object.values(COMMAND_REGISTRY).find(c => 
      c.aliases?.includes(name)
    );
  }
};
