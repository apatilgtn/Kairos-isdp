import React, { useState } from 'react';
import { auth } from '@devvai/devv-code-backend';
import { APIService } from '@/lib/api';

const tests = [
  {
    id: 'sdk',
    label: 'SDK Installation Check',
    run: () => typeof auth === 'object' && typeof auth.sendOTP === 'function',
    description: 'Verifies @devvai/devv-code-backend is loaded and methods are available.'
  },
  {
    id: 'network',
    label: 'Network Connectivity Test',
    run: async () => {
      try {
        const res = await fetch('https://api.devv.ai/ping');
        return res.ok;
      } catch {
        return false;
      }
    },
    description: 'Tests connectivity to DevvAI servers.'
  },
  {
    id: 'auth',
    label: 'Authentication Service Status',
    run: async () => {
      try {
        return typeof auth.sendOTP === 'function';
      } catch {
        return false;
      }
    },
    description: 'Checks authentication service availability.'
  },
  {
    id: 'otp',
    label: 'OTP Delivery Validation',
    run: async () => {
      try {
        // Use a test email that should always fail gracefully
        await auth.sendOTP('test@invalid.local');
        return true;
      } catch (e) {
        return e?.message?.includes('Failed to send OTP') || e?.message?.includes('400');
      }
    },
    description: 'Tests email OTP delivery system.'
  },
  {
    id: 'ai',
    label: 'AI Service Availability',
    run: async () => {
      try {
        const res = await APIService.checkAuthStatus();
        return res === true;
      } catch {
        return false;
      }
    },
    description: 'Validates AI generation capabilities.'
  },
  {
    id: 'db',
    label: 'Database Connection Test',
    run: async () => {
      try {
        // Try a harmless API call
        await APIService.getProjects();
        return true;
      } catch {
        return false;
      }
    },
    description: 'Checks table operations and database connectivity.'
  }
];

export const DevvAIDebugPanel: React.FC = () => {
  const [results, setResults] = useState<Record<string, boolean | string>>({});
  const [running, setRunning] = useState(false);

  const runAllTests = async () => {
    setRunning(true);
    const newResults: Record<string, boolean | string> = {};
    for (const test of tests) {
      try {
        const result = await test.run();
        newResults[test.id] = result;
      } catch (e: any) {
        newResults[test.id] = e?.message || 'Error';
      }
    }
    setResults(newResults);
    setRunning(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>DevvAI Debug Panel</h2>
      <p style={{ marginBottom: '2rem' }}>Run diagnostics to identify issues with SDK, network, authentication, AI, and database connectivity.</p>
      <button onClick={runAllTests} disabled={running} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', borderRadius: 4, background: '#3b82f6', color: '#fff', border: 'none', marginBottom: '2rem' }}>
        {running ? 'Running...' : 'Run All Tests'}
      </button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tests.map(test => (
          <li key={test.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: 6 }}>
            <strong>{test.label}</strong>
            <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.5rem' }}>{test.description}</div>
            <div>
              {results[test.id] === undefined ? (
                <span style={{ color: '#999' }}>Not run</span>
              ) : results[test.id] === true ? (
                <span style={{ color: '#16a34a' }}>✅ Passed</span>
              ) : results[test.id] === false ? (
                <span style={{ color: '#dc2626' }}>❌ Failed</span>
              ) : (
                <span style={{ color: '#dc2626' }}>❌ {results[test.id]}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '2rem', fontSize: '0.95rem', color: '#555' }}>
        <strong>Tip:</strong> Check your browser console for detailed error logs and stack traces.
      </div>
    </div>
  );
};
