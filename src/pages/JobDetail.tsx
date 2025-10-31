import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Users, Calendar, Scroll } from 'lucide-react';
import { Job, db } from '../database';
import { ParchmentCard, WaxSealButton, TorchLoader, Badge } from '../components/ui';
import JobModal from '../components/JobModal';

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        // Fetch directly from IndexedDB
        const jobData = await db.jobs.get(jobId!);
        if (jobData) {
          setJob(jobData);
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleEditClose = async () => {
    setShowEditModal(false);
    // Refresh job data after edit
    if (jobId) {
      try {
        const data = await db.jobs.get(jobId);
        if (data) setJob(data);
      } catch (err) {
        console.error('Failed to refresh job:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <TorchLoader size="lg" text="Loading quest details..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ParchmentCard className="p-12 text-center">
          <Scroll className="h-16 w-16 mx-auto text-aged-brown mb-4" />
          <h2 className="text-2xl sm:text-3xl font-medieval font-bold text-castle-stone mb-2">
            Quest Not Found
          </h2>
          <p className="font-body text-aged-brown-dark mb-6">
            The quest you're looking for doesn't exist or has been removed from the archives.
          </p>
          <Link to="/jobs">
            <WaxSealButton variant="gold">
          <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quest Board
            </WaxSealButton>
        </Link>
        </ParchmentCard>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/jobs"
            className="inline-flex items-center text-aged-brown hover:text-castle-stone font-medieval font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Quest Board
          </Link>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={`/assessments/${job.id}`}>
            <WaxSealButton variant="gold">
            <FileText className="h-4 w-4 mr-2" />
              Training Trials
            </WaxSealButton>
          </Link>
          <WaxSealButton variant="primary" onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Quest
          </WaxSealButton>
        </div>
      </div>

      {/* Job Details Card */}
      <ParchmentCard className="p-6 sm:p-8">
        {/* Title Section */}
        <div className="border-b-2 border-aged-brown pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-medieval font-bold text-castle-stone mb-4">
                📜 {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <Badge
                  variant={job.status === 'active' ? 'active' : 'archived'}
                  icon={job.status === 'active' ? '✓' : '📜'}
                >
                  {job.status === 'active' ? 'Active Campaign' : 'Archived Scroll'}
                </Badge>
                <div className="flex items-center text-sm font-body text-aged-brown">
                  <Calendar className="h-4 w-4 mr-2" />
                  Posted {new Date(job.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
            {/* Tags */}
            {job.tags.length > 0 && (
              <div>
              <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4">
                🛡️ Skills & Requirements
              </h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-body bg-gold-light text-castle-stone border-2 border-gold shadow-sm hover:shadow-md transition-shadow"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div>
              <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4">
                📋 Quest Description
              </h3>
              <div className="bg-parchment-dark border-2 border-aged-brown rounded-lg p-4 sm:p-6">
                <p className="text-base sm:text-lg font-body text-castle-stone whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
              <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4">
                ⚔️ Requirements & Prerequisites
              </h3>
              <div className="bg-parchment-dark border-2 border-aged-brown rounded-lg p-4 sm:p-6">
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gold mr-3 font-bold">•</span>
                      <span className="text-base sm:text-lg font-body text-castle-stone flex-1">
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              </div>
            )}

            {/* Candidates Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4">
              🛡️ Warriors & Recruits
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link to={`/candidates?jobId=${job.id}`}>
                <WaxSealButton variant="gold">
                <Users className="h-4 w-4 mr-2" />
                  View All Candidates
                </WaxSealButton>
              </Link>
              <Link to={`/assessments/${job.id}/take`}>
                <WaxSealButton variant="primary">
                  <FileText className="h-4 w-4 mr-2" />
                  Take Assessment (Candidate View)
                </WaxSealButton>
              </Link>
            </div>
          </div>
        </div>
      </ParchmentCard>

      {/* Edit Modal */}
      {showEditModal && (
        <JobModal
          job={job}
          onClose={handleEditClose}
        />
      )}
    </div>
  );
};

export default JobDetail;
