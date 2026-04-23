#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Ensure we're in the correct directory
const projectRoot = __dirname;
process.chdir(projectRoot);

console.log('Starting Next.js from:', process.cwd());
console.log('');

// Start Next.js dev server
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: projectRoot,
  env: { ...process.env, FORCE_COLOR: '1' }
});

child.on('exit', (code) => {
  process.exit(code);
});
