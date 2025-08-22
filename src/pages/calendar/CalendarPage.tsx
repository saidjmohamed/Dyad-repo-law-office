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
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

const CalendarPage = () => {
  const navigate = useNavigate();

  const { data: hearings, isLoading: isLoadingHearings } = useQuery({
    queryKey: ['hearings'],
    queryFn: getHearings,
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const events = useMemo(() => {
    const hearingEvents =
      hearings?.map((hearing) => ({
        title: `جلسة: ${hearing.case_number || 'غير محدد'}`,
        start: hearing.hearing_date,
        url: `/cases/${hearing.case_id}`,
        backgroundColor: '#3788d8', // Blue for hearings
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
          start: task.due_date,
          url: task.case_id ? `/cases/${task.case_id}` : undefined,
          backgroundColor: '#f59e0b', // Amber for tasks
          borderColor: '#f59e0b',
          extendedProps: {
            type: 'task'
          }
        })) || [];

    return [...hearingEvents, ...taskEvents];
  }, [hearings, tasks]);

  const handleEventClick = (clickInfo: any) => {
    clickInfo.jsEvent.preventDefault(); // prevent browser navigation
    if (clickInfo.event.url) {
      navigate(clickInfo.event.url);
    }
  };

  const handleConnectGoogleCalendar = () => {
    // TODO: Implement Google Calendar OAuth flow
    console.log("Connecting to Google Calendar...");
    alert("سيتم ربط تقويم Google قريباً!");
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
        <Button onClick={handleConnectGoogleCalendar}>
            <CalendarPlus className="w-4 h-4 ml-2" />
            ربط تقويم Google
        </Button>
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