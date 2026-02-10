'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@/lib/types/tab';

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTabs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tabs');
      const data = await response.json();

      if (response.ok) {
        setTabs(data.tabs);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch tabs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabs();
  }, []);

  const createTab = async (topic: string) => {
    try {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (response.ok) {
        const { tab } = await response.json();
        setTabs([...tabs, tab]);
        return tab;
      }
      return null;
    } catch (err) {
      console.error('Error creating tab:', err);
      return null;
    }
  };

  const updateTab = async (tabId: string, updates: Partial<Tab>) => {
    try {
      const response = await fetch('/api/tabs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabId, ...updates }),
      });

      if (response.ok) {
        const { tab } = await response.json();
        setTabs(tabs.map((t) => (t.id === tabId ? tab : t)));
        return tab;
      }
      return null;
    } catch (err) {
      console.error('Error updating tab:', err);
      return null;
    }
  };

  const deleteTab = async (tabId: string) => {
    try {
      const response = await fetch(`/api/tabs?tabId=${tabId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTabs(tabs.filter((t) => t.id !== tabId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting tab:', err);
      return false;
    }
  };

  return {
    tabs,
    loading,
    error,
    createTab,
    updateTab,
    deleteTab,
    refreshTabs: fetchTabs,
  };
}
