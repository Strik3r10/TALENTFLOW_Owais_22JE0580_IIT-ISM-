import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import JobsBoard from './pages/JobsBoard';
import JobDetail from './pages/JobDetail';
import CandidatesList from './pages/CandidatesList';
import CandidateDetail from './pages/CandidateDetail';
import AssessmentBuilder from './pages/AssessmentBuilder';
import AssessmentForm from './pages/AssessmentForm';
import AssessmentsList from './pages/AssessmentsList';
import KanbanBoard from './pages/KanbanBoard';

function App() {

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobsBoard />} />
          <Route path="/jobs/:jobId" element={<JobDetail />} />
          <Route path="/candidates" element={<CandidatesList />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/assessments" element={<AssessmentsList />} />
          <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
          <Route path="/assessments/:jobId/take/:candidateId?" element={<AssessmentForm />} />
          <Route path="/pipeline" element={<KanbanBoard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
