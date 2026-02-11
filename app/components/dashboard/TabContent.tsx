'use client';

import { useState, useEffect, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tab } from '@/lib/types/tab';

interface TabContentProps {
  tab: Tab;
  onUpdateTab: (tabId: string, updates: any) => void;
}

export default function TabContent({ tab, onUpdateTab }: TabContentProps) {
  const [topic, setTopic] = useState(tab.topic || '');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync topic state when tab changes
  useEffect(() => {
    setTopic(tab.topic || '');
    setResults(''); // Clear results when switching tabs
    setError(''); // Clear errors when switching tabs
  }, [tab.id, tab.topic]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Update tab topic if changed
    if (topic !== tab.topic) {
      await onUpdateTab(tab.id, { topic });
    }

    // Reset state
    setResults('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tabId: tab.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch news');
      }

      // Read stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setResults((prev) => prev + text);
      }

      // Update last refreshed timestamp
      await onUpdateTab(tab.id, { lastRefreshedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., artificial intelligence)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Loading...' : 'Refresh News'}
          </button>
        </div>

        {tab.last_refreshed_at && (
          <p className="text-sm text-gray-500 mt-2">
            Last refreshed: {new Date(tab.last_refreshed_at).toLocaleString()}
          </p>
        )}
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {(results || loading) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Results</h2>
          <div className="prose prose-slate max-w-none">
            {results ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-words"
                    />
                  ),
                }}
              >
                {results}
              </ReactMarkdown>
            ) : (
              'Loading...'
            )}
            {loading && <span className="animate-pulse ml-1">▊</span>}
          </div>
        </div>
      )}
    </div>
  );
}
