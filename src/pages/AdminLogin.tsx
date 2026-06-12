import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { useAuthContext } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Shield, Mail, Lock, Loader2, LogIn } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful');
      const adminRef = ref(db, `admins/${auth.currentUser?.uid}`);
      const snapshot = await get(adminRef);
      if (snapshot.exists()) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        await auth.signOut();
        toast.error('This account is not authorized for admin access');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F2E9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#f37022] animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F2E9] flex items-center justify-center pt-20 pb-10 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f37022]/10 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-[#f37022]" />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-[#f37022] mb-1">
            Admin Portal
          </h1>
          <p className="text-slate-600 text-sm font-inter">
            Khelo Mewat Sports Authority
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-5 shadow-xl"
        >
          <div>
            <label className="text-slate-700 text-sm font-inter mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A6B8A]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none transition-colors"
                placeholder="admin@khelomewat.gov.in"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 text-sm font-inter mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A6B8A]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f37022] text-[#0A1628] py-3 rounded-xl font-inter font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs font-inter mt-6">
          Secure access for authorized personnel only.
        </p>
      </div>
    </main>
  );
}
