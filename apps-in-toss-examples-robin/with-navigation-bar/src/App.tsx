import { DemoLayout } from './components/DemoLayout';
import { useNavigationBar } from './hooks/useNavigationBar';
import { useEventLogStore } from './stores/eventLogStore';
import { useState } from 'react';

const ICON_OPTIONS = [
  { name: 'icon-heart-mono', label: 'Heart' },
  { name: 'icon-star-mono', label: 'Star' },
  { name: 'icon-setting-mono', label: 'Setting' },
];

export default function App() {
  const { accessoryButton, lastClickedId, addAccessoryButton, simulateClick } = useNavigationBar();
  const { events } = useEventLogStore();
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [buttonTitle, setButtonTitle] = useState('Heart');

  const handleAddButton = () => {
    const icon = ICON_OPTIONS[selectedIcon];
    addAccessoryButton({
      id: icon.name,
      title: buttonTitle || icon.label,
      icon: { name: icon.name },
    });
  };

  return (
    <DemoLayout
      title="네비게이션바"
      description="상단 네비게이션바 액세서리 버튼 추가 (partner.addAccessoryButton)"
      statusItems={[
        { label: '액세서리 버튼', value: accessoryButton ? accessoryButton.title : '(없음)', variant: accessoryButton ? 'success' : 'default' },
        { label: '마지막 클릭', value: lastClickedId || '(없음)' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">아이콘 선택</label>
          <div className="flex gap-2">
            {ICON_OPTIONS.map((icon, i) => (
              <button
                key={icon.name}
                onClick={() => { setSelectedIcon(i); setButtonTitle(icon.label); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedIcon === i
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {icon.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={buttonTitle}
            onChange={e => setButtonTitle(e.target.value)}
            placeholder="버튼 타이틀"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddButton}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
          >
            추가
          </button>
        </div>

        {accessoryButton && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">미리보기</h3>
            <div className="bg-white border rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">미니앱 이름</span>
              <button
                onClick={() => simulateClick(accessoryButton.id)}
                className="text-xs text-indigo-600 border border-indigo-200 rounded px-2 py-1 active:bg-indigo-50"
              >
                {accessoryButton.title} (클릭 테스트)
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">웹에서는 시뮬레이션 / 토스앱에서는 실제 네비게이션바에 표시</p>
          </div>
        )}

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>참고:</strong> 액세서리 버튼은 모노톤 아이콘만 지원되며, 한 번에 1개만 표시 가능합니다.
            defineConfig에서 initialAccessoryButton으로 초기 설정도 가능합니다.
          </p>
        </div>
      </div>
    </DemoLayout>
  );
}
