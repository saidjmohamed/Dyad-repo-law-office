import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Login = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <h1 className="text-2xl font-bold">مكتب الأستاذ سايج محمد</h1>
            <p className="text-muted-foreground">تسجيل الدخول إلى حسابك</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          view="magic_link"
          localization={{
            variables: {
              sign_in: {
                email_label: 'البريد الإلكتروني',
                email_input_placeholder: 'your.email@example.com',
                button_label: 'إرسال رابط الدخول',
                magic_link_sent: 'تم إرسال رابط الدخول إلى بريدك الإلكتروني.',
                loading_button_label: 'جاري الإرسال ...'
              },
            },
          }}
          theme="light"
          showLinks={false}
        />
      </div>
    </div>
  )
}

export default Login