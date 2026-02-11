'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTabs } from '@/lib/hooks/useTabs';
import TabBar from '@/app/components/dashboard/TabBar';
import TabContent from '@/app/components/dashboard/TabContent';

export default function DashboardPage() {
  const router = useRouter();
  const { tabs, loading, createTab, updateTab, deleteTab } = useTabs();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingApiKey, setCheckingApiKey] = useState(true);

  useEffect(() => {
    checkApiKey();
  }, []);

  useEffect(() => {
    // Set active tab to first tab when tabs load
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const checkApiKey = async () => {
    const response = await fetch('/api/user/api-key');
    const data = await response.json();
    setHasApiKey(data.hasApiKey);
    setCheckingApiKey(false);

    if (!data.hasApiKey) {
      router.push('/dashboard/settings');
    }
  };

  const handleAddTab = async () => {
    const newTab = await createTab('New Topic');
    if (newTab) {
      setActiveTabId(newTab.id);
    }
  };

  const handleDeleteTab = async (tabId: string) => {
    const success = await deleteTab(tabId);
    if (success && activeTabId === tabId) {
      // Set active tab to first remaining tab
      const remainingTabs = tabs.filter((t) => t.id !== tabId);
      setActiveTabId(remainingTabs[0]?.id || null);
    }
  };

  if (checkingApiKey || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return null; // Will redirect to settings
  }

  // If no tabs exist, create the first one
  if (tabs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Welcome to Your News Dashboard!
        </h2>
        <p className="text-gray-400 mb-6">
          Get started by creating your first news topic tab.
        </p>
        <button
          onClick={handleAddTab}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
        >
          Create Your First Tab
        </button>
      </div>
    );
  }

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div>
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={setActiveTabId}
        onAddTab={handleAddTab}
        onDeleteTab={handleDeleteTab}
      />

      {activeTab && <TabContent tab={activeTab} onUpdateTab={updateTab} />}
    </div>
  );
}
