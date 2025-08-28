
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API } from '../api';

const pwRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export default function Reset(){
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  async function onSubmit(e){
    e.preventDefault();
    if(pw1 !== pw2) return toast.error('Passwords do not match');
    if(!pwRegex.test(pw1)) return toast.error('Password needs 1 uppercase, 1 number, 1 special, min 8 chars');
    try{
      const res = await fetch("http://localhost:5001/auth/reset-password", {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, otp, password: pw1 })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Reset failed');
      toast.success('Password changed successfully, please login');
      setTimeout(()=> navigate('/'), 900);
    }catch(err){
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Reset password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com"/>
          </div>
          <div>
            <label className="block text-sm mb-1">OTP</label>
            <input type="text" required value={otp} onChange={e=>setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="6-digit code"/>
          </div>
          <div>
            <label className="block text-sm mb-1">New password</label>
            <input type="password" required value={pw1} onChange={e=>setPw1(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••"/>
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm new password</label>
            <input type="password" required value={pw2} onChange={e=>setPw2(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••"/>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Change password
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center">
          <Link to="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
