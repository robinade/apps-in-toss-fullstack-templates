import { DemoLayout } from './components/DemoLayout';
import { useContactsViral } from './hooks/useContactsViral';
import { useEventLogStore } from './stores/eventLogStore';

export default function App() {
  const { sentCount, acceptedCount, rewardTotal, openInvite } = useContactsViral();
  const { events } = useEventLogStore();

  return (
    <DemoLayout
      title="연락처 바이럴"
      description="친구 초대 + 초대 현황 추적 예제"
      statusItems={[
        { label: '보낸 초대', value: `${sentCount}건` },
        { label: '수락됨', value: `${acceptedCount}건`, variant: acceptedCount > 0 ? 'success' : 'default' },
        { label: '획득 리워드', value: `${rewardTotal}`, variant: 'success' },
      ]}
      eventLog={events}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-indigo-50 rounded-lg text-center">
            <p className="text-xl font-bold text-indigo-600">{sentCount}</p>
            <p className="text-[10px] text-gray-500">보낸 초대</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-xl font-bold text-green-600">{acceptedCount}</p>
            <p className="text-[10px] text-gray-500">수락</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-xl font-bold text-amber-600">{rewardTotal}</p>
            <p className="text-[10px] text-gray-500">리워드</p>
          </div>
        </div>

        <button
          onClick={openInvite}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm active:bg-indigo-700 transition-colors"
        >
          친구 초대하기
        </button>
      </div>
    </DemoLayout>
  );
}
