import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } 
  from 'react-router-dom';
import { supabaseAdmin } 
  from './lib/supabase';
import Gate from './pages/portal/Gate';
import Portal from './pages/portal/Portal';
import PitchDeck from './pages/portal/PitchDeck';
import TeamPage from './pages/portal/TeamPage';
import Portfolio from './pages/portal/Portfolio';
import Financials from './pages/portal/Financials';
import ProgramsPage from './pages/portal/ProgramsPage';
import ThesesPage from './pages/portal/ThesesPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminShell from './pages/admin/AdminShell';
import { ToastProvider } from './components/UI';
import './styles/global.css';

export default function App() {
  const [investorEmail, setInvestorEmail] = 
    useState(null);
  const [adminAuthed, setAdminAuthed] = 
    useState(false);
  const [pendingCount, setPendingCount] = 
    useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmail = 
      localStorage.getItem('ia_email');
    if (savedEmail) setInvestorEmail(savedEmail);
    const savedAdmin = 
      sessionStorage.getItem('ia_admin');
    if (savedAdmin) setAdminAuthed(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!adminAuthed) return;
    supabaseAdmin
      .from('access_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .then(({ count }) => 
        setPendingCount(count || 0));
  }, [adminAuthed]);

  function signOutInvestor() {
    localStorage.removeItem('ia_email');
    setInvestorEmail(null);
  }

  function signOutAdmin() {
    sessionStorage.removeItem('ia_admin');
    setAdminAuthed(false);
  }

  function handleInvestorAccess(email) {
    localStorage.setItem('ia_email', email);
    setInvestorEmail(email);
  }

  function handleAdminLogin() {
    setAdminAuthed(true);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a08',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{
          width: 40, height: 40,
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18
        }}>◈</div>
        <div style={{
          fontSize: 13,
          color: 'rgba(201,168,76,0.6)',
          letterSpacing: '0.1em'
        }}>LOADING</div>
      </div>
    );
  }

  return (
    <>
      <ToastProvider />
      <Routes>

        <Route path="/admin" element={
          adminAuthed
            ? <AdminShell
                onSignOut={signOutAdmin}
                pendingCount={pendingCount} />
            : <AdminLogin
                onLogin={handleAdminLogin} />
        } />

        <Route path="/admin/*" element={
          adminAuthed
            ? <AdminShell
                onSignOut={signOutAdmin}
                pendingCount={pendingCount} />
            : <AdminLogin
                onLogin={handleAdminLogin} />
        } />

        <Route path="/deck" element={
          investorEmail
            ? <PitchDeck
                email={investorEmail} />
            : <Navigate to="/" replace />
        } />

        <Route path="/team" element={
          investorEmail
            ? <TeamPage
                email={investorEmail} />
            : <Navigate to="/" replace />
        } />

        <Route path="/portfolio" element={
          investorEmail
            ? <Portfolio
                email={investorEmail} />
            : <Navigate to="/" replace />
        } />

        <Route path="/financials" element={
          investorEmail
            ? <Financials
                email={investorEmail} />
            : <Navigate to="/" replace />
        } />

        <Route path="/programs" element={
          investorEmail
            ? <ProgramsPage
                email={investorEmail} />
            : <Navigate to="/" replace />
        } />

        <Route path="/theses" element={
          investorEmail
            ? <ThesesPage
                email={investorEmail} />
            : <Navigate to="/" replace />
        } />

        <Route path="/" element={
          investorEmail
            ? <Portal
                email={investorEmail}
                onSignOut={signOutInvestor} />
            : <Gate
                onAccess={handleInvestorAccess} />
        } />

        <Route path="*" element={
          <Navigate to="/" replace />
        } />

      </Routes>
    </>
  );
}
