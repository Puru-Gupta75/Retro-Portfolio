export type AccessLevel = 'public' | 'admin';

export type OutputType = 'INFO' | 'ACTION' | 'ERROR' | 'SUCCESS' | 'SYSTEM' | 'WARNING';

export interface CommandOutput {
  text: string;
  type: OutputType;
  prefix?: string;
}

export interface CommandResult {
  outputs: CommandOutput[];
  action?: 'navigate' | 'game' | 'leaderboard' | 'clear' | 'terminal_reset' | 'secret';
  data?: any;
}

export interface Command {
  name: string;
  description: string;
  accessLevel: AccessLevel;
  aliases?: string[];
  hidden?: boolean;
  execute: (args: string[], context: CommandContext) => Promise<CommandResult> | CommandResult;
}

export interface CommandContext {
  isAdmin: boolean;
  systemMode: 'NORMAL' | 'ANOMALY' | 'BOOT';
  pathname: string;
}
