import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'
import { OAuthButton } from '../components/OAuthButton.jsx'

export default function Login() {
  const nav = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.message || 'Login failed')
      localStorage.setItem('token', data.token)
      alert('Logged in! (token in localStorage)')
      nav('/login') // stay here for demo
    } catch(err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="mx-auto max-w-md mt-16 mb-24">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
          <h1 className="text-2xl font-semibold text-center">Welcome Back</h1>
          <p className="text-center text-gray-600 mt-2">Sign in to your TaxPal account</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={e=>setForm({...form, email:e.target.value})}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e=>setForm({...form, password:e.target.value})}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"/>
                Remember me
              </label>
              <Link to="/forgot" className="text-blue-600 hover:underline">Forgot password?</Link>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button type="submit">Sign In</Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-gray-500 text-sm">OR CONTINUE WITH</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <OAuthButton provider="Google" />
            <OAuthButton provider="Microsoft" />
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
