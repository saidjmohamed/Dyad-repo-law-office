import { supabase } from '@/integrations/supabase/client'
import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        navigate('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login')
    }
  }, [session, loading, navigate])

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div>جاري التحميل...</div>
        </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}

export default AuthLayout