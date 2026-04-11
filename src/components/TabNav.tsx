export type AppTab = 'visualization' | 'user-study';

type TabNavProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'visualization', label: 'Visualization' },
  { id: 'user-study', label: 'User Study' },
];

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <nav className="tab-nav" aria-label="Primary views">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeTab === tab.id ? 'active' : ''}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
