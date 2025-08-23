import { useQuery, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getHearings } from '../hearings/actions';
import { getTasks } from '../tasks/actions';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import arLocale from '@fullcalendar/core/locales/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [supabaseAccessToken, setSupabaseAccessToken] = useState<string | null>(null); // حالة لتخزين رمز الوصول الخاص بـ Supabase
  const queryClient = useQueryClient();

  // جلب معرف المستخدم ورمز الوصول الخاص بـ Supabase عند تحميل المكون
  useEffect(() => {
    const fetchUserAndToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      setSupabaseAccessToken(session?.access_token || null);
    };

    fetchUserAndToken();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      setSupabaseAccessToken(session?.access_token || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // التحقق مما إذا كان تقويم Google متصلاً بالفعل
  useEffect(() => {
    const checkConnection = async () => {
      if (userId) {
        const { data } = await supabase
          .from('user_integrations')
          .select('google_access_token')
          .eq('user_id', userId)
          .single();
        if (data && data.google_access_token) {
          setIsGoogleCalendarConnected(true);
        } else {
          setIsGoogleCalendarConnected(false);
        }
      }
    };
    checkConnection();
  }, [userId]);

  // التعامل مع إعادة التوجيه بعد مصادقة Google OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('google_auth_success') === 'true') {
      showSuccess("تم ربط تقويم Google بنجاح!");
      setIsGoogleCalendarConnected(true);
      // تنظيف عنوان URL
      urlParams.delete('google_auth_success');
      navigate({ search: urlParams.toString() }, { replace: true });
    }
  }, [navigate]);

  const { data: hearings, isLoading: isLoadingHearings } = useQuery({
    queryKey: ['hearings'],
    queryFn: getHearings,
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const { data: googleEvents, isLoading: isLoadingGoogleEvents, refetch: refetchGoogleEvents } = useQuery({
    queryKey: ['googleEvents', userId, supabaseAccessToken], // إضافة supabaseAccessToken إلى مفتاح الاستعلام
    queryFn: async () => {
      if (!userId || !isGoogleCalendarConnected || !supabaseAccessToken) return []; // التأكد من توفر الرمز المميز
      const { data, error } = await supabase.functions.invoke('get-google-calendar-events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAccessToken}`, // إضافة رأس المصادقة
          'Content-Type': 'application/json',
        },
        body: { user_id: userId },
      });

      if (error) {
        console.error('Error fetching Google Calendar events:', error);
        showError(`فشل جلب أحداث تقويم Google: ${error.message}`);
        // إذا فشل تحديث الرمز المميز، افصل تقويم Google
        if (error.message.includes('re-authenticate')) {
          setIsGoogleCalendarConnected(false);
        }
        return [];
      }
      return data.events;
    },
    enabled: !!userId && isGoogleCalendarConnected && !!supabaseAccessToken, // تشغيل الاستعلام فقط إذا كان المستخدم مسجلاً للدخول ومتصلاً ولديه رمز مميز
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

    const allEvents = [...hearingEvents, ...taskEvents];

    if (isGoogleCalendarConnected && googleEvents) {
      allEvents.push(...googleEvents);
    }

    return allEvents;
  }, [hearings, tasks, googleEvents, isGoogleCalendarConnected]);

  const handleEventClick = (clickInfo: any) => {
    clickInfo.jsEvent.preventDefault(); // منع التنقل في المتصفح
    if (clickInfo.event.url) {
      navigate(clickInfo.event.url);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      if (!supabaseAccessToken) {
        showError("يجب أن تكون مسجلاً للدخول لربط تقويم Google.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('google-oauth-init', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseAccessToken}`, // إضافة رأس المصادقة
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("لم يتم الحصول على رابط المصادقة من Google.");
      }
    } catch (error: any) {
      showError(`فشل ربط تقويم Google: ${error.message}`);
      console.error("Error connecting to Google Calendar:", error);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('user_integrations')
        .update({ google_access_token: null, google_refresh_token: null, google_calendar_id: null })
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }
      setIsGoogleCalendarConnected(false);
      showSuccess("تم فصل تقويم Google بنجاح.");
      queryClient.invalidateQueries({ queryKey: ['googleEvents', userId] }); // إبطال أحداث Google
    } catch (error: any) {
      showError(`فشل فصل تقويم Google: ${error.message}`);
      console.error("Error disconnecting Google Calendar:", error);
    }
  };
  
  const isLoading = isLoadingHearings || isLoadingTasks || isLoadingGoogleEvents;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">التقويم</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض مركزي لجميع الجلسات والمهام القادمة.
          </p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          {isGoogleCalendarConnected ? (
            <>
              <Button onClick={() => refetchGoogleEvents()} variant="outline">
                <RefreshCcw className="w-4 h-4 ml-2" />
                تحديث أحداث Google
              </Button>
              <Button onClick={handleDisconnectGoogleCalendar} variant="destructive">
                فصل تقويم Google
              </Button>
            </>
          ) : (
            <Button onClick={handleConnectGoogleCalendar}>
                <CalendarPlus className="w-4 h-4 ml-2" />
                ربط تقويم Google
            </Button>
          )}
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