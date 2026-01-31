
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VoterListPage from './pages/VoterListPage';
import FlaggedVotersPage from './pages/FlaggedVotersPage';
import VoterDetailPage from './pages/VoterDetailPage';
import FieldTasksPage from './pages/FieldTasksPage';
import AuditLogPage from './pages/AuditLogPage';
import MunicipalUploadPage from './pages/MunicipalUploadPage';
import IdentityClashPage from './pages/IdentityClashPage';
import { User, Voter } from './types';
import { MOCK_VOTERS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState<Voter[]>(MOCK_VOTERS);

  useEffect(() => {
    const savedUser = localStorage.getItem('voteguard_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('voteguard_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('voteguard_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('voteguard_user');
  };

  const updateVoter = (updatedVoter: Voter) => {
    setVoters(prev => prev.map(v => v.id === updatedVoter.id ? updatedVoter : v));
  };

  const decommissionVoter = (voterId: string, reason: string) => {
    setVoters(prev => prev.map(v => {
      if (v.id === voterId) {
        return {
          ...v,
          status: 'Deceased',
          isArchived: true,
          riskScore: 0,
          isFlagged: false,
          flaggedReasons: [`Decommissioned: ${reason}`]
        };
      }
      return v;
    }));
  };

  if (loading) return null;

  return (
    <HashRouter>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard voters={voters} />} />
            <Route path="/voters" element={<VoterListPage voters={voters} />} />
            <Route path="/voters/:id" element={<VoterDetailPage voters={voters} onUpdateVoter={updateVoter} />} />
            <Route path="/flagged" element={<FlaggedVotersPage voters={voters} />} />
            <Route path="/clashes" element={<IdentityClashPage voters={voters} />} />
            <Route path="/field-tasks" element={<FieldTasksPage voters={voters} onUpdateVoter={updateVoter} />} />
            <Route path="/municipal-upload" element={<MunicipalUploadPage voters={voters} onDecommission={decommissionVoter} />} />
            <Route path="/audit" element={<AuditLogPage />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;
