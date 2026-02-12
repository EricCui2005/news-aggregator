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

  // Post-process text to make inline citations [1], [2] clickable and remove Sources section
  const processInlineCitations = (text: string): string => {
    // Extract citations from the Sources section
    const citationsRegex = /\n\n---\n\n## Sources\n\n((?:\d+\. \[.+?\]\(.+?\)\n?)+)/;
    const match = text.match(citationsRegex);

    if (!match) return text;

    // Parse individual citations to build a map of number -> URL
    const citationLines = match[1].trim().split('\n');
    const citationMap: { [key: number]: string } = {};

    citationLines.forEach(line => {
      const lineMatch = line.match(/^(\d+)\. \[(.+?)\]\((.+?)\)$/);
      if (lineMatch) {
        const num = parseInt(lineMatch[1]);
        const url = lineMatch[3];
        citationMap[num] = url;
      }
    });

    // Replace inline citations [1], [2], etc. with clickable markdown links
    let processedText = text;
    Object.entries(citationMap).forEach(([num, url]) => {
      const regex = new RegExp(`\\[${num}\\]`, 'g');
      processedText = processedText.replace(regex, `[[${num}]](${url})`);
    });

    // Remove the Sources section entirely
    processedText = processedText.replace(/\n\n---\n\n## Sources\n\n(?:\d+\. \[.+?\]\(.+?\)\n?)+/, '');

    return processedText;
  };

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
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        accumulatedText += text;
        setResults((prev) => prev + text);
      }

      // After streaming completes, post-process to make inline citations clickable
      const processedText = processInlineCitations(accumulatedText);
      setResults(processedText);

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
            className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-500 transition-all duration-200"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 disabled:scale-100 disabled:shadow-none"
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
        <div className="mb-4 p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {(results || loading) && (
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Results</h2>
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
                      className="text-blue-400 hover:text-blue-300 underline break-words transition-colors duration-200"
                    />
                  ),
                }}
              >
                {results}
              </ReactMarkdown>
            ) : (
              'Loading...'
            )}
            {loading && <span className="animate-pulse ml-1 text-blue-400">▊</span>}
          </div>
        </div>
      )}
    </div>
  );
}
