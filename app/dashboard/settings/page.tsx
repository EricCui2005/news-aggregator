'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const response = await fetch('/api/user/api-key');
    const data = await response.json();
    setHasApiKey(data.hasApiKey);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const response = await fetch('/api/user/api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });

    if (response.ok) {
      setMessage('API key saved successfully!');
      setHasApiKey(true);
      setApiKey('');
    } else {
      setMessage('Failed to save API key');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Settings</h1>

      <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-800 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">
          Perplexity API Key
        </h2>
        <p className="text-gray-400 mb-4">
          {hasApiKey
            ? 'You have an API key configured. Enter a new key to update it.'
            : 'Enter your Perplexity API key to start using the news aggregator.'}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Perplexity API key (pplx-...)"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 text-gray-100 placeholder-gray-500 transition-all duration-200"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-500 transition-all duration-200 font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 disabled:scale-100 disabled:shadow-none"
          >
            {loading ? 'Saving...' : 'Save API Key'}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 ${
              message.includes('success') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-6 p-4 bg-blue-950/30 border border-blue-900 rounded-lg">
          <h3 className="font-semibold text-blue-400 mb-2">
            How to get your API key:
          </h3>
          <ol className="list-decimal list-inside text-gray-400 space-y-1">
            <li>Visit https://www.perplexity.ai/settings/api</li>
            <li>Sign in to your Perplexity account</li>
            <li>Generate a new API key</li>
            <li>Copy and paste it here</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
