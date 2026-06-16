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
          const response = await fetch('http://localhost:8082/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accessToken: session.access_token })
          });

          if (response.ok) {
            const data = await response.json();
            
            // Store token and user details in localStorage
            const localUser = {
              username: data.email.split('@')[0],
              email: data.email,
              fullName: data.fullName || data.email.split('@')[0],
              role: 'ROLE_USER'
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
