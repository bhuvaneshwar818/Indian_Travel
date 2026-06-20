import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        try {
          // Exchange the Supabase access token for a backend HttpOnly auth session
          const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
          const response = await fetch(`${API_BASE}/api/auth/session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accessToken: session.access_token })
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.isNewUser) {
              // Redirect to Signup Step 2 (custom username/password setup)
              navigate('/signup', {
                state: {
                  isGoogleSignup: true,
                  email: data.email,
                  fullName: data.fullName,
                  accessToken: session.access_token
                }
              });
            } else {
              // Store token and user details in localStorage
              const localUser = {
                username: data.username,
                email: data.email,
                fullName: data.fullName,
                role: data.role || 'ROLE_USER'
              };
              localStorage.setItem('token', session.access_token);
              localStorage.setItem('user', JSON.stringify(localUser));

              // Sync authStore state
              useAuthStore.setState({
                user: localUser,
                token: session.access_token,
                isAuthenticated: true,
                loading: false
              });

              navigate('/dashboard');
            }
          } else {
            console.error("Backend session validation failed");
            navigate('/login');
          }
        } catch (err) {
          console.error("Error connecting to backend auth session endpoint:", err);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    }).catch(err => {
      console.error("Error retrieving session in callback:", err);
      navigate('/login');
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="text-white text-lg font-medium animate-pulse">
        Signing you in...
      </div>
    </div>
  );
};

export default AuthCallback;
