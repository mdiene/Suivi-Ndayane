import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Truck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-4">
            <div className="mx-auto bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
              <Truck className="h-10 w-10 text-primary-content" />
            </div>
            <h2 className="text-3xl font-extrabold">
              Fleet Delivery Tracker
            </h2>
            <p className="text-sm opacity-70 mt-2">
              {isSignUp ? 'Create a new account' : 'Sign in to your account'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            {error && (
              <div className="alert alert-error text-sm shadow-sm">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            
            {message && (
              <div className="alert alert-success text-sm shadow-sm">
                <span>{message}</span>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email address</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail className="w-4 h-4 opacity-70" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="grow"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock className="w-4 h-4 opacity-70" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="grow"
                />
              </label>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="btn btn-link text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;