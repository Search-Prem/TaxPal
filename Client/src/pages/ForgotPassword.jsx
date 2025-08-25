import { Link } from 'react-router-dom'
import { useState } from 'react'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPass, setNewPass] = useState('')
  const [stage, setStage] = useState(1) // 1: enter email, 2: enter code + new pass
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const sendCode = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    const res = await fetch('/api/auth/forgot', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email})
    })
    const data = await res.json()
    if(!res.ok){ setErr(data.message || 'Failed'); return }
    setMsg('Verification code sent. Check server console.')
    setStage(2)
  }

  const reset = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    const res = await fetch('/api/auth/reset', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, code, newPassword:newPass})
    })
    const data = await res.json()
    if(!res.ok){ setErr(data.message || 'Failed'); return }
    setMsg('Password reset successful. You can sign in now.')
  }

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="mx-auto max-w-lg mt-16 mb-24">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
          <button onClick={()=>history.back()} className="text-gray-500">←</button>
          <h1 className="text-2xl font-semibold mt-2">Forgot Password</h1>
          <p className="text-gray-600 mt-2">
            {stage===1 ? 'Enter your email to receive a verification code' : 'Enter the code you received and your new password'}
          </p>

          {stage===1 ? (
            <form className="mt-6 space-y-4" onSubmit={sendCode}>
              <Input label="Email Address" type="email" placeholder="Enter your email address" value={email} onChange={e=>setEmail(e.target.value)} />
              {err && <p className="text-red-600 text-sm">{err}</p>}
              {msg && <p className="text-green-700 text-sm">{msg}</p>}
              <Button type="submit">Send Verification Code</Button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={reset}>
              <Input label="Verification Code" placeholder="6-digit code" value={code} onChange={e=>setCode(e.target.value)} />
              <Input label="New Password" type="password" placeholder="Enter new password" value={newPass} onChange={e=>setNewPass(e.target.value)} />
              {err && <p className="text-red-600 text-sm">{err}</p>}
              {msg && <p className="text-green-700 text-sm">{msg}</p>}
              <Button type="submit">Reset Password</Button>
              <p className="text-sm text-gray-600">Remember your password? <Link to="/login" className="text-blue-600">Sign In</Link></p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
