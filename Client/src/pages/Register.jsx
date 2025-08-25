import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Input from '../components/Input.jsx'
import Button from '../components/Button.jsx'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if(form.password !== form.confirm) { setError('Passwords do not match'); return; }
    try {
      const res = await fetch('/api/auth/register', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:form.name, email:form.email, phone:form.phone, password:form.password })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.message || 'Registration failed')
      alert('Registered! You can now login.')
      nav('/login')
    } catch(err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="mx-auto max-w-2xl mt-12 mb-24">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8">
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <p className="text-gray-600 mt-1">Join TaxPal for professional tax management</p>

          <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
            <Input label="Full Name" placeholder="Enter your full name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <Input label="Email Address" type="email" placeholder="Enter your email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            <Input label="Phone Number" placeholder="Enter your phone number" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
            <Input label="Password" type="password" placeholder="Create a password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
            <Input label="Confirm Password" type="password" placeholder="Confirm your password" value={form.confirm} onChange={e=>setForm({...form, confirm:e.target.value})} />

            <div className="md:col-span-2 flex items-start gap-3 mt-2">
              <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-600" required />
              <p className="text-sm text-gray-600">I agree to the <a href="#" className="text-blue-600">Terms of Service</a> and <a href="#" className="text-blue-600">Privacy Policy</a></p>
            </div>

            <div className="md:col-span-2 mt-2">
              <Button type="submit">Create Account</Button>
            </div>
          </form>

          <p className="text-sm text-gray-600 mt-6">
            Already have an account? <Link className="text-blue-600" to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
