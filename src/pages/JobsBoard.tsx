import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Archive, ArchiveRestore, Edit, Trash2, GripVertical, Scroll, FileText } from 'lucide-react';
import { Job, db } from '../database';
import JobModal from '../components/JobModal';
import { ParchmentCard, WaxSealButton, TorchLoader, Badge, Input, Select } from '../components/ui';

const JobsBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      let query = db.jobs.orderBy('createdAt').reverse();

      // Apply status filter
      if (statusFilter) {
        query = query.filter(job => job.status === statusFilter);
      }

      // Get all filtered jobs
      let allJobs = await query.toArray();

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        allJobs = allJobs.filter(job => 
          job.title.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower)
        );
      }

      // Calculate pagination
      const total = allJobs.length;
      const totalPagesCalc = Math.ceil(total / 10);
      setTotalPages(totalPagesCalc);

      // Paginate
      const startIdx = (page - 1) * 10;
      const endIdx = startIdx + 10;
      const paginatedJobs = allJobs.slice(startIdx, endIdx);

      setJobs(paginatedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCreateJob = () => {
    setEditingJob(null);
    setShowModal(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowModal(true);
  };

  const handleArchiveJob = async (job: Job) => {
    try {
      await db.jobs.update(job.id, { 
        status: job.status === 'active' ? 'archived' : 'active',
        updatedAt: new Date()
      });
      fetchJobs();
    } catch (error) {
      console.error('Failed to archive job:', error);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await db.jobs.delete(job.id);
        fetchJobs();
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetJob: Job) => {
    e.preventDefault();
    
    if (!draggedJob || draggedJob.id === targetJob.id) return;

    try {
      // Swap order values
      const draggedOrder = draggedJob.order;
      const targetOrder = targetJob.order;

      await db.jobs.update(draggedJob.id, { order: targetOrder, updatedAt: new Date() });
      await db.jobs.update(targetJob.id, { order: draggedOrder, updatedAt: new Date() });
      
      fetchJobs();
    } catch (error) {
      console.error('Failed to reorder jobs:', error);
      // Rollback optimistic update
      fetchJobs();
    } finally {
      setDraggedJob(null);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingJob(null);
    fetchJobs();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medieval font-bold text-castle-stone mb-1">
            📜 Job Board
          </h1>
          <p className="text-base sm:text-lg font-body text-aged-brown-dark">Manage and post job openings</p>
        </div>
        <WaxSealButton variant="primary" onClick={handleCreateJob}>
          <span className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Post New Job
          </span>
        </WaxSealButton>
      </div>

      {/* Filters */}
      <ParchmentCard className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search jobs by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-5 w-5" />}
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active Jobs' },
                { value: 'archived', label: 'Archived' }
              ]}
            />
          </div>
        </div>
      </ParchmentCard>

      {/* Jobs List */}
      <div className="space-y-3">
        {loading ? (
          <ParchmentCard className="p-8">
            <TorchLoader size="lg" text="Loading jobs..." />
          </ParchmentCard>
        ) : jobs.length === 0 ? (
          <ParchmentCard className="p-12">
            <div className="text-center">
              <Scroll className="h-16 w-16 mx-auto text-aged-brown mb-4" />
              <p className="text-xl font-medieval text-castle-stone mb-2">No Jobs Found</p>
              <p className="font-body text-aged-brown">Create your first job posting to begin recruiting</p>
            </div>
          </ParchmentCard>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              draggable
              onDragStart={(e: React.DragEvent) => handleDragStart(e, job)}
              onDragOver={handleDragOver}
              onDrop={(e: React.DragEvent) => handleDrop(e, job)}
            >
              <ParchmentCard className="p-4 sm:p-5 cursor-move hover:shadow-lg transition-all duration-200 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <GripVertical className="h-6 w-6 text-aged-brown group-hover:text-gold transition-colors flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-lg sm:text-xl font-medieval font-bold text-castle-stone hover:text-royal-purple transition-colors"
                      >
                        {job.title}
                      </Link>
                      <Badge
                        variant={job.status === 'active' ? 'active' : 'archived'}
                        icon={job.status === 'active' ? '✓' : '�'}
                      >
                        {job.status === 'active' ? 'Active' : 'Archived'}
                      </Badge>
                    </div>
                    {job.description && (
                      <p className="text-sm font-body text-aged-brown-dark mb-2 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {job.tags.slice(0, 6).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-body bg-gold-light text-castle-stone border border-gold"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 6 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-body text-aged-brown">
                          +{job.tags.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 sm:ml-4">
                  <Link
                    to={`/assessments/${job.id}`}
                    className="p-2 text-castle-stone hover:text-gold hover:bg-parchment-dark rounded-lg transition-all duration-200"
                    title="Manage assessment"
                  >
                    <FileText className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleEditJob(job)}
                    className="p-2 text-castle-stone hover:text-royal-purple hover:bg-parchment-dark rounded-lg transition-all duration-200"
                    title="Edit job"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleArchiveJob(job)}
                    className="p-2 text-castle-stone hover:text-gold hover:bg-parchment-dark rounded-lg transition-all duration-200"
                    title={job.status === 'active' ? 'Archive job' : 'Restore job'}
                  >
                    {job.status === 'active' ? (
                      <Archive className="h-5 w-5" />
                    ) : (
                      <ArchiveRestore className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job)}
                    className="p-2 text-castle-stone hover:text-blood-red hover:bg-parchment-dark rounded-lg transition-all duration-200"
                    title="Delete job"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              </ParchmentCard>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && jobs.length > 0 && totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <WaxSealButton
            variant="gold"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </WaxSealButton>
          <span className="flex items-center px-4 font-medieval text-castle-stone">
            Page {page} of {totalPages}
          </span>
          <WaxSealButton
            variant="gold"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </WaxSealButton>
        </div>
      )}

      {showModal && (
        <JobModal
          job={editingJob}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default JobsBoard;
