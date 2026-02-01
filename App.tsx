
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VoterListPage from './pages/VoterListPage';
import FlaggedVotersPage from './pages/FlaggedVotersPage';
import VoterDetailPage from './pages/VoterDetailPage';
import FieldTasksPage from './pages/FieldTasksPage';
import MunicipalUploadPage from './pages/MunicipalUploadPage';
import IdentityClashPage from './pages/IdentityClashPage';
import { User, Voter, UserRole } from './types';
import { MOCK_VOTERS, MOCK_USERS } from './constants';

const App: React.FC = () => {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { signOut, isLoaded: isAuthLoaded } = useAuth();
  const [voters, setVoters] = useState<Voter[]>(MOCK_VOTERS);

  // Map Clerk user to internal User type
  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.username || 'User',
    role: (clerkUser.publicMetadata.role as UserRole) || UserRole.FIELD_OFFICER,
    district: (clerkUser.publicMetadata.district as string) || 'Delhi'
  } : null;

  const handleLogout = async () => {
    await signOut();
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

  if (!isUserLoaded || !isAuthLoaded) return null;

  return (
    <HashRouter>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;
