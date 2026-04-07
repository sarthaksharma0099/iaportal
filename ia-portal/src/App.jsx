import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from './lib/supabase';
import Gate        from './pages/portal/Gate';
import Portal      from './pages/portal/Portal';
import AdminLogin  from './pages/admin/AdminLogin';
import AdminShell  from './pages/admin/AdminShell';
import { ToastProvider } from './components/UI';
import './styles/global.css';

export default function App() {
  const path = window.location.pathname;
  const isAdmin = path.startsWith('/admin');

  const [investorEmail, setInvestorEmail] = useState(null);
  const [adminAuthed, setAdminAuthed]     = useState(false);
  const [pendingCount, setPendingCount]   = useState(0);

  // Restore sessions
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('ia_email');
    if (savedEmail) setInvestorEmail(savedEmail);
    const savedAdmin = sessionStorage.getItem('ia_admin');
    if (savedAdmin) setAdminAuthed(true);
  }, []);

  // Load pending request count for admin badge
  useEffect(() => {
    if (adminAuthed) {
      supabaseAdmin.from('access_requests').select('id', { count: 'exact' }).eq('status', 'pending')
        .then(({ count }) => setPendingCount(count || 0));
    }
  }, [adminAuthed]);

  function signOutInvestor() {
    sessionStorage.removeItem('ia_email');
    setInvestorEmail(null);
  }

  function signOutAdmin() {
    sessionStorage.removeItem('ia_admin');
    setAdminAuthed(false);
  }

  return (
    <>
      <ToastProvider />

      {isAdmin ? (
        adminAuthed
          ? <AdminShell onSignOut={signOutAdmin} pendingCount={pendingCount} />
          : <AdminLogin onLogin={() => setAdminAuthed(true)} />
      ) : (
        investorEmail
          ? <Portal email={investorEmail} onSignOut={signOutInvestor} />
          : <Gate onAccess={setInvestorEmail} />
      )}
    </>
  );
}
