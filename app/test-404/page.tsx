'use client';

import { useState } from 'react';
import { generateRandomError, formatErrorDisplay } from '@/lib/errorGenerator';
import { commandEngine } from '@/lib/command/engine';
import { saveScore, formatLeaderboard, getLeaderboard } from '@/lib/leaderboard';
import { systemStore } from '@/store/useSystemStore';

export default function Test404Page() {
  const [error, setError] = useState(generateRandomError());
  const [commandInput, setCommandInput] = useState('');
  const [commandOutput, setCommandOutput] = useState('');
  const [leaderboardGame, setLeaderboardGame] = useState('snake');

  const testErrorGenerator = () => {
    setError(generateRandomError());
  };

  const testCommand = async () => {
    const ctx = {
      isAdmin: systemStore.getState().adminAuthenticated,
      systemMode: systemStore.getState().systemMode,
      pathname: '/test-404',
    };
    const result = await commandEngine.process(commandInput, ctx);
    setCommandOutput(JSON.stringify(result, null, 2));
  };

  const testLeaderboard = async () => {
    // Add some test scores
    await saveScore('snake', 'TestUser1', 150);
    await saveScore('snake', 'TestUser2', 200);
    await saveScore('snake', 'TestUser3', 100);
    await saveScore('pong', 'Player1', 50);
    await saveScore('pong', 'Player2', 75);

    const scores = await getLeaderboard(leaderboardGame);
    const board = formatLeaderboard(leaderboardGame, scores);
    setCommandOutput(board);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8">
      <h1 className="text-3xl mb-8">404 System Test Suite</h1>

      {/* Error Generator Test */}
      <section className="mb-8 border border-green-500 p-4">
        <h2 className="text-xl mb-4">1. Error Generator</h2>
        <button
          onClick={testErrorGenerator}
          className="border border-green-500 px-4 py-2 mb-4 hover:bg-green-500 hover:text-black"
        >
          Generate New Error
        </button>
        <pre className="text-red-500 text-sm whitespace-pre-wrap bg-red-900/10 p-4 border border-red-500">
          {formatErrorDisplay(error)}
        </pre>
      </section>

      {/* Command Engine Test */}
      <section className="mb-8 border border-green-500 p-4">
        <h2 className="text-xl mb-4">2. Command Engine</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Enter command (e.g., help, play snake)"
            className="flex-1 bg-black border border-green-500 p-2 text-green-500"
          />
          <button
            onClick={testCommand}
            className="border border-green-500 px-4 py-2 hover:bg-green-500 hover:text-black"
          >
            Execute
          </button>
        </div>
        <div className="text-xs mb-2 opacity-70">
          Try: help, play snake, leaderboard snake, home, admin, sync, status, clear
        </div>
        {commandOutput && (
          <pre className="text-sm bg-black border border-green-500 p-4 whitespace-pre-wrap">
            {commandOutput}
          </pre>
        )}
      </section>

      {/* Leaderboard Test */}
      <section className="mb-8 border border-green-500 p-4">
        <h2 className="text-xl mb-4">3. Leaderboard System</h2>
        <div className="flex gap-2 mb-4">
          <select
            value={leaderboardGame}
            onChange={(e) => setLeaderboardGame(e.target.value)}
            className="bg-black border border-green-500 p-2 text-green-500"
          >
            <option value="snake">Snake</option>
            <option value="pong">Pong</option>
            <option value="runner">Runner</option>
            <option value="memory">Memory</option>
          </select>
          <button
            onClick={testLeaderboard}
            className="border border-green-500 px-4 py-2 hover:bg-green-500 hover:text-black"
          >
            Add Test Scores & View
          </button>
        </div>
        {commandOutput && (
          <pre className="text-sm bg-black border border-green-500 p-4 whitespace-pre-wrap">
            {commandOutput}
          </pre>
        )}
      </section>

      {/* Game Links */}
      <section className="mb-8 border border-green-500 p-4">
        <h2 className="text-xl mb-4">4. Test Games</h2>
        <p className="text-sm mb-4 opacity-70">
          Go to the actual 404 page to test games in context
        </p>
        <a
          href="/nonexistent-page"
          className="inline-block border border-green-500 px-4 py-2 hover:bg-green-500 hover:text-black"
        >
          Trigger 404 Page
        </a>
      </section>

      {/* System Info */}
      <section className="border border-green-500 p-4">
        <h2 className="text-xl mb-4">5. System Info</h2>
        <div className="text-sm space-y-1">
          <p>✓ Error Generator: Random errors on each load</p>
          <p>✓ Command Engine: Shared terminal system</p>
          <p>✓ Leaderboard: localStorage (Firestore-ready)</p>
          <p>✓ Games: Snake, Pong, Runner, Memory</p>
          <p>✓ Easter Eggs: Idle detection, glitch text, secrets</p>
          <p>✓ Mobile: Simplified view for small screens</p>
        </div>
      </section>
    </div>
  );
}
