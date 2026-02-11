'use client';

import { Tab } from '@/lib/types/tab';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onAddTab: () => void;
  onDeleteTab: (tabId: string) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onAddTab,
  onDeleteTab,
}: TabBarProps) {
  return (
    <div className="flex gap-2 border-b border-slate-800 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center gap-2">
          <button
            onClick={() => onTabClick(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 whitespace-nowrap ${
              activeTabId === tab.id
                ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 border-b-2 border-blue-400'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-800 hover:text-blue-400 hover:shadow-md'
            }`}
          >
            {tab.topic || 'New Tab'}
          </button>

          {tabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTab(tab.id);
              }}
              className="text-gray-500 hover:text-red-400 text-xl leading-none hover:scale-110 transition-all duration-200"
              title="Delete tab"
            >
              ×
            </button>
          )}
        </div>
      ))}

      <button
        onClick={onAddTab}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 font-medium whitespace-nowrap shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105"
      >
        + New Tab
      </button>
    </div>
  );
}
