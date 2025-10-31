import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, User, Mail, Calendar, Shield } from 'lucide-react';
import { Candidate, db } from '../database';
import { ParchmentCard, Badge, Input, Select, TorchLoader } from '../components/ui';

const CandidateItem: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
  const getStageInfo = (stage: Candidate['stage']) => {
    switch (stage) {
      case 'applied': return { variant: 'default' as const, label: 'Applied', icon: '📝' };
      case 'screen': return { variant: 'default' as const, label: 'Screening', icon: '👀' };
      case 'tech': return { variant: 'default' as const, label: 'Interview', icon: '💬' };
      case 'offer': return { variant: 'default' as const, label: 'Offer', icon: '📜' };
      case 'hired': return { variant: 'active' as const, label: 'Hired', icon: '✓' };
      case 'rejected': return { variant: 'archived' as const, label: 'Rejected', icon: '✗' };
      default: return { variant: 'default' as const, label: stage, icon: '•' };
    }
  };

  const stageInfo = getStageInfo(candidate.stage);

  return (
    <Link to={`/candidates/${candidate.id}`}>
      <ParchmentCard className="p-4 hover:shadow-lg transition-all duration-200 group">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-royal-purple to-royal-purple-dark flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-lg font-medieval font-semibold text-castle-stone truncate group-hover:text-royal-purple transition-colors">
                  {candidate.name}
                </p>
                <Badge variant={stageInfo.variant} icon={stageInfo.icon}>
                  {stageInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 flex-wrap text-sm font-body text-aged-brown">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                {candidate.location && (
                  <div className="flex items-center gap-1.5 hidden md:flex">
                    <span>📍</span>
                    <span className="truncate">{candidate.location}</span>
                  </div>
                )}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex items-center gap-1.5 hidden lg:flex">
                    <span>🛡️</span>
                    <span className="truncate">{candidate.skills.slice(0, 2).join(', ')}{candidate.skills.length > 2 ? '...' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Applied {new Date(candidate.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 text-right hidden sm:block">
            <div className="text-xs font-body text-aged-brown">
              Updated {new Date(candidate.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </ParchmentCard>
    </Link>
  );
};

const CandidatesList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || '');
  const [totalCandidates, setTotalCandidates] = useState(0);

  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const allCandidates = await db.candidates.orderBy('appliedAt').reverse().toArray();
      setCandidates(allCandidates);
      setTotalCandidates(allCandidates.length);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    if (search) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (stageFilter) {
      filtered = filtered.filter(candidate => candidate.stage === stageFilter);
    }

    return filtered;
  }, [candidates, search, stageFilter]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchParams(prev => {
      if (value) {
        prev.set('search', value);
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  const handleStageFilterChange = (value: string) => {
    setStageFilter(value);
    setSearchParams(prev => {
      if (value) {
        prev.set('stage', value);
      } else {
        prev.delete('stage');
      }
      return prev;
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medieval font-bold text-castle-stone mb-1">
            <Shield className="inline h-8 w-8 mr-2 text-royal-purple" />
            Candidates
          </h1>
          <p className="font-body text-aged-brown-dark">Manage and track candidate applications</p>
        </div>
        <ParchmentCard className="px-6 py-3">
          <div className="text-center">
            <div className="text-3xl font-medieval font-bold text-castle-stone">{totalCandidates}</div>
            <div className="text-sm font-body text-aged-brown">Total Candidates</div>
          </div>
        </ParchmentCard>
      </div>

      {/* Filters */}
      <ParchmentCard className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search candidates by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={<Search className="h-5 w-5" />}
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={stageFilter}
              onChange={(e) => handleStageFilterChange(e.target.value)}
              options={[
                { value: '', label: 'All Stages' },
                ...stages.map(stage => ({
                  value: stage,
                  label: stage.charAt(0).toUpperCase() + stage.slice(1)
                }))
              ]}
            />
          </div>
        </div>
      </ParchmentCard>

      {/* Candidates List */}
      {loading ? (
        <ParchmentCard className="p-12">
          <TorchLoader size="lg" text="Loading candidates..." />
        </ParchmentCard>
      ) : filteredCandidates.length === 0 ? (
        <ParchmentCard className="p-12">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-aged-brown mb-4" />
            <h3 className="text-xl font-medieval font-semibold text-castle-stone mb-2">No Candidates Found</h3>
            <p className="font-body text-aged-brown">
              {search || stageFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'No candidates have been added yet.'}
            </p>
          </div>
        </ParchmentCard>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map((candidate) => (
            <CandidateItem key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}

      {/* Stage Statistics */}
      {!loading && candidates.length > 0 && (
        <ParchmentCard className="p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-medieval font-bold text-castle-stone mb-6">
            Candidates by Stage
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {stages.map(stage => {
              const count = candidates.filter(c => c.stage === stage).length;
              const percentage = candidates.length > 0 ? (count / candidates.length) * 100 : 0;
              
              const getStageColor = (stage: string) => {
                switch (stage) {
                  case 'applied': return 'bg-castle-stone-light';
                  case 'screen': return 'bg-aged-brown';
                  case 'tech': return 'bg-royal-purple';
                  case 'offer': return 'bg-gold-dark';
                  case 'hired': return 'bg-forest-green';
                  case 'rejected': return 'bg-blood-red';
                  default: return 'bg-aged-brown';
                }
              };
              
              return (
                <div key={stage} className="text-center p-4 rounded-lg bg-parchment-dark border-2 border-aged-brown hover:border-gold transition-all duration-200">
                  <div className="text-2xl sm:text-3xl font-medieval font-bold text-castle-stone mb-1">{count}</div>
                  <div className="text-sm font-body font-semibold text-aged-brown-dark capitalize mb-3">{stage}</div>
                  <div className="bg-aged-brown bg-opacity-20 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${getStageColor(stage)} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs font-body text-aged-brown mt-2">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </ParchmentCard>
      )}
    </div>
  );
};

export default CandidatesList;
