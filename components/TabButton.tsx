// components/ui/TabButton.jsx
interface TabButtonProps {
  name: string;
  label: string;
  activeTab: string;
  onClick: (tab: string) => void;
}

export const TabButton = ({
  name,
  label,
  activeTab,
  onClick
}: TabButtonProps) => (
  <button
    onClick={() => onClick(name)}
    className={`py-4 px-6 font-medium text-base relative ${
      activeTab === name
        ? 'text-blue-600'
        : 'text-gray-500 hover:text-gray-700'
    }`}
    aria-selected={activeTab === name}
    role="tab"
  >
    {label}
    {activeTab === name && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
    )}
  </button>
);

export default TabButton;