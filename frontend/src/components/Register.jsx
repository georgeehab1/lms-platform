import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2, BookOpen, GraduationCap, Presentation } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        if (data.role === 'instructor' || data.role === 'admin') {
          navigate('/instructor-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF6E5] font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-sm overflow-hidden p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FCD34D] rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-slate-900" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-2 font-medium">Join the platform to start your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl text-center font-bold">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-[1.5rem] transition-all ${
                formData.role === 'student'
                  ? 'border-[#FCD34D] bg-[#FFF6E5] text-slate-900'
                  : 'border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600 bg-slate-50'
              }`}
            >
              <GraduationCap className="h-8 w-8 mb-2" />
              <span className="text-sm font-bold">Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('instructor')}
              className={`flex flex-col items-center justify-center p-4 border-2 rounded-[1.5rem] transition-all ${
                formData.role === 'instructor'
                  ? 'border-[#FCD34D] bg-[#FFF6E5] text-slate-900'
                  : 'border-slate-100 hover:border-slate-200 text-slate-400 hover:text-slate-600 bg-slate-50'
              }`}
            >
              <Presentation className="h-8 w-8 mb-2" />
              <span className="text-sm font-bold">Instructor</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all sm:text-sm font-medium outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all sm:text-sm font-medium outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                name="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FCD34D] focus:bg-white transition-all sm:text-sm font-medium outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-full shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 transition-colors mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-slate-900 hover:text-[#FCD34D] transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}