import { useQuery } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getHearings } from '../hearings/actions';
import { getTasks } from '../tasks/actions';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import arLocale from '@fullcalendar/core/locales/ar';
import { Card, CardContent } from '@/components/ui/card';

type Hearing = {
  case_number?: string;
  hearing_date: string;
  case_id?: string;
};

type Task = {
  title: string;
  due_date: string | null;
  case_id?: string | null;
  done: boolean;
};

const CalendarPage = () => {
  const navigate = useNavigate();

  const { data: hearings, isLoading: isLoadingHearings } = useQuery<Hearing[]>({
    queryKey: ['hearings'],
    queryFn: () => getHearings({}),
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const events = useMemo(() => {
    const hearingEvents =
      hearings?.map((hearing: Hearing) => ({
        title: `جلسة: ${hearing.case_number || 'غير محدد'}`,
        start: hearing.hearing_date,
        url: `/cases/${hearing.case_id}`,
        backgroundColor: '#3788d8',
        borderColor: '#3788d8',
        extendedProps: {
            type: 'hearing'
        }
      })) || [];

    const taskEvents =
      tasks
        ?.filter(task => task.due_date && !task.done)
        .map((task) => ({
          title: `مهمة: ${task.title}`,
          start: task.due_date!,
          url: task.case_id ? `/cases/${task.case_id}` : undefined,
          backgroundColor: '#f59e0b',
          borderColor: '#f59e0b',
          extendedProps: {
            type: 'task'
          }
        })) || [];

    return [...hearingEvents, ...taskEvents];
  }, [hearings, tasks]);

  const handleEventClick = (clickInfo: any) => {
    clickInfo.jsEvent.preventDefault();
    if (clickInfo.event.url) {
      navigate(clickInfo.event.url);
    }
  };
  
  const isLoading = isLoadingHearings || isLoadingTasks;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">التقويم</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض مركزي لجميع الجلسات والمهام القادمة.
          </p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
            {isLoading ? (
                <Skeleton className="h-[70vh] w-full" />
            ) : (
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    weekends={true}
                    events={events}
                    eventClick={handleEventClick}
                    headerToolbar={{
                        start: 'title',
                        center: '',
                        end: 'today prev,next'
                    }}
                    locale={arLocale}
                    direction="rtl"
                    height="auto"
                    eventTimeFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        meridiem: false
                    }}
                />
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;