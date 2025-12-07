import AuthForm from '../components/AuthForm'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/')
  }

  return <AuthForm />
}