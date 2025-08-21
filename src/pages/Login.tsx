import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Login = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: 'البريد الإلكتروني',
                email_input_placeholder: 'your.email@example.com',
                password_label: 'كلمة المرور',
                password_input_placeholder: '••••••••',
                button_label: 'تسجيل الدخول',
                loading_button_label: 'جاري تسجيل الدخول ...'
              },
              sign_up: {
                email_label: 'البريد الإلكتروني',
                email_input_placeholder: 'your.email@example.com',
                password_label: 'كلمة المرور',
                password_input_placeholder: '••••••••',
                button_label: 'إنشاء حساب',
                loading_button_label: 'جاري إنشاء الحساب ...',
                confirmation_text: 'تحقق من بريدك الإلكتروني لتأكيد حسابك.'
              },
              forgotten_password: {
                email_label: 'البريد الإلكتروني',
                email_input_placeholder: 'your.email@example.com',
                button_label: 'إرسال تعليمات إعادة التعيين',
                loading_button_label: 'جاري الإرسال ...',
                confirmation_text: 'تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
              }
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