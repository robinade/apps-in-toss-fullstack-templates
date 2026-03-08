import { cn } from '../lib/utils';

interface AttendanceCalendarProps {
  history: string[];
  streak: number;
}

export function AttendanceCalendar({ history, streak }: AttendanceCalendarProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const checkedSet = new Set(history);
  const todayStr = today.toISOString().split('T')[0];

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const dateStr = date.toISOString().split('T')[0];
    return {
      day: i + 1,
      dateStr,
      isChecked: checkedSet.has(dateStr),
      isToday: dateStr === todayStr,
    };
  });

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">
          {year}년 {monthNames[month]}
        </h3>
        <span className="text-sm text-indigo-600 font-medium">
          연속 {streak}일
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <div key={d} className="text-xs text-gray-400 py-1">{d}</div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(({ day, isChecked, isToday }) => (
          <div
            key={day}
            className={cn(
              'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs',
              isChecked && 'bg-indigo-500 text-white font-bold',
              isToday && !isChecked && 'ring-2 ring-indigo-300',
              !isChecked && !isToday && 'text-gray-600'
            )}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
