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
    <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <div key={tab.id} className="flex items-center gap-2">
          <button
            onClick={() => onTabClick(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
              activeTabId === tab.id
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="text-gray-400 hover:text-red-600 text-xl leading-none"
              title="Delete tab"
            >
              ×
            </button>
          )}
        </div>
      ))}

      <button
        onClick={onAddTab}
        className="px-4 py-2 bg-blue-600 text-white rounded-t-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
      >
        + New Tab
      </button>
    </div>
  );
}
