import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, MessageSquare, Phone, FileText, ExternalLink, MapPin, Briefcase, GraduationCap, Award } from 'lucide-react';
import { Candidate, CandidateTimeline, db } from '../database';
import { ParchmentCard, WaxSealButton, TorchLoader, Badge, ScrollModal } from '../components/ui';
import { MentionTextarea } from '../components/MentionTextarea';
import { MentionRenderer } from '../components/MentionRenderer';

const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [timeline, setTimeline] = useState<CandidateTimeline[]>([]);
  const [assessmentResponses, setAssessmentResponses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [allCandidates, setAllCandidates] = useState<Array<{ id: string; name: string }>>([]);
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        // Fetch directly from IndexedDB instead of using fetch API
        const candidateData = await db.candidates.get(id!);
        
        if (candidateData) {
          setCandidate(candidateData);
          setNotes(candidateData.notes || '');
        }

        // Fetch timeline from IndexedDB
        const timelineData = await db.candidateTimeline
          .where('candidateId')
          .equals(id!)
          .sortBy('timestamp');
        
        setTimeline(timelineData);
      } catch (error) {
        console.error('Failed to fetch candidate:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch all candidates for @mentions
    const fetchAllCandidates = async () => {
      try {
        const all = await db.candidates.toArray();
        setAllCandidates(all.map(c => ({ id: c.id, name: c.name })));
      } catch (error) {
        console.error('Failed to fetch candidates for mentions:', error);
      }
    };

    // Fetch assessment responses for this candidate
    const fetchAssessmentResponses = async () => {
      if (!id) return;
      try {
        const responses = await db.assessmentResponses
          .where('candidateId')
          .equals(id)
          .toArray();
        setAssessmentResponses(responses);

        // Fetch assessments for each response
        const assessmentIds = responses.map(r => r.assessmentId);
        const allAssessments = await db.assessments
          .where('id')
          .anyOf(assessmentIds)
          .toArray();
        setAssessments(allAssessments);
      } catch (error) {
        console.error('Failed to fetch assessment responses:', error);
      }
    };

    if (id) {
      fetchCandidate();
      fetchAllCandidates();
      fetchAssessmentResponses();
    }
  }, [id]);

  const handleStageChange = async (newStage: Candidate['stage']) => {
    if (!candidate) return;

    try {
      // Update in IndexedDB directly
      await db.candidates.update(candidate.id, { 
        stage: newStage,
        updatedAt: new Date()
      });

      // Add timeline entry
      await db.candidateTimeline.add({
        id: crypto.randomUUID(),
        candidateId: candidate.id,
        stage: newStage,
        timestamp: new Date()
      });

      // Refresh data from IndexedDB
      const candidateData = await db.candidates.get(id!);
      const timelineData = await db.candidateTimeline
        .where('candidateId')
        .equals(id!)
        .sortBy('timestamp');

      if (candidateData) {
        setCandidate(candidateData);
      }
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to update candidate stage:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!candidate) return;

    try {
      // Update in IndexedDB directly
      await db.candidates.update(candidate.id, { 
        notes,
        updatedAt: new Date()
      });

      setCandidate(prev => prev ? { ...prev, notes } : null);
      setShowNotesModal(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <TorchLoader size="lg" text="Loading warrior profile..." />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ParchmentCard className="p-12 text-center">
          <User className="h-16 w-16 mx-auto text-aged-brown mb-4" />
          <h2 className="text-2xl sm:text-3xl font-medieval font-bold text-castle-stone mb-2">
            Warrior Not Found
          </h2>
          <p className="font-body text-aged-brown-dark mb-6">
            The warrior you're looking for doesn't exist or has been removed from the archives.
          </p>
          <Link to="/candidates">
            <WaxSealButton variant="gold">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </WaxSealButton>
          </Link>
        </ParchmentCard>
      </div>
    );
  }

  const stageInfo = getStageInfo(candidate.stage);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/candidates"
            className="inline-flex items-center text-aged-brown hover:text-castle-stone font-medieval font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Candidates
          </Link>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {candidate?.jobId && (
            <Link to={`/assessments/${candidate.jobId}/take/${candidate.id}`}>
              <WaxSealButton variant="gold">
                <FileText className="h-4 w-4 mr-2" />
                Take Assessment
              </WaxSealButton>
            </Link>
          )}
          <WaxSealButton variant="primary" onClick={() => setShowNotesModal(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Notes
          </WaxSealButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Profile */}
        <div className="lg:col-span-1 space-y-6">
          <ParchmentCard className="p-6">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b-2 border-aged-brown">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-royal-purple to-royal-purple-dark flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-medieval font-bold text-castle-stone mb-2">
                  {candidate.name}
                </h1>
                <Badge variant={stageInfo.variant} icon={stageInfo.icon}>
                  {stageInfo.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm font-body text-aged-brown">
                <Mail className="h-4 w-4 mr-3 text-royal-purple" />
                <span className="break-all">{candidate.email}</span>
              </div>
              
              {candidate.phone && (
                <div className="flex items-center text-sm font-body text-aged-brown">
                  <Phone className="h-4 w-4 mr-3 text-royal-purple" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              
              {candidate.location && (
                <div className="flex items-center text-sm font-body text-aged-brown">
                  <MapPin className="h-4 w-4 mr-3 text-royal-purple" />
                  <span>{candidate.location}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm font-body text-aged-brown">
                <Calendar className="h-4 w-4 mr-3 text-royal-purple" />
                <span>Applied {new Date(candidate.appliedAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center text-sm font-body text-aged-brown">
                <Calendar className="h-4 w-4 mr-3 text-royal-purple" />
                <span>Updated {new Date(candidate.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </ParchmentCard>

          {/* Contact & Links */}
          {(candidate.linkedin || candidate.portfolio || candidate.resume) && (
            <ParchmentCard className="p-6">
              <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4 flex items-center">
                <ExternalLink className="h-5 w-5 mr-2 text-gold" />
                Social & Portfolio
              </h3>
              <div className="space-y-3">
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm font-body text-royal-purple hover:text-royal-purple-dark transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-3" />
                    LinkedIn Profile
                  </a>
                )}
                
                {candidate.portfolio && (
                  <a
                    href={candidate.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm font-body text-royal-purple hover:text-royal-purple-dark transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-3" />
                    Portfolio Website
                  </a>
                )}
                
                {candidate.resume && (
                  <a
                    href={candidate.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm font-body text-royal-purple hover:text-royal-purple-dark transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    View Resume
                  </a>
                )}
              </div>
            </ParchmentCard>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <ParchmentCard className="p-6">
              <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-gold" />
                Skills & Abilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-body bg-gold-light text-castle-stone border-2 border-gold shadow-sm hover:shadow-md transition-shadow"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </ParchmentCard>
          )}

          {/* Experience & Education */}
          {(candidate.experience || candidate.education) && (
            <ParchmentCard className="p-6">
              <div className="space-y-4">
                {candidate.experience && (
                  <div>
                    <h3 className="text-lg font-medieval font-bold text-castle-stone mb-2 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-gold" />
                      Experience
                    </h3>
                    <p className="text-sm font-body text-aged-brown">{candidate.experience}</p>
                  </div>
                )}
                
                {candidate.education && (
                  <div>
                    <h3 className="text-lg font-medieval font-bold text-castle-stone mb-2 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-gold" />
                      Education
                    </h3>
                    <p className="text-sm font-body text-aged-brown">{candidate.education}</p>
                  </div>
                )}
              </div>
            </ParchmentCard>
          )}

          {/* Stage Actions */}
          <ParchmentCard className="p-6">
            <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4">
              🛡️ Move to Stage
            </h3>
            <div className="space-y-2">
              {stages.map(stage => {
                const stageInfo = getStageInfo(stage);
                return (
                  <button
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                    disabled={candidate.stage === stage}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medieval font-semibold transition-all duration-200 ${
                      candidate.stage === stage
                        ? 'bg-gold text-castle-stone cursor-not-allowed shadow-md'
                        : 'bg-parchment-dark text-castle-stone hover:bg-aged-brown hover:text-parchment hover:shadow-md border-2 border-aged-brown'
                    }`}
                  >
                    <span className="mr-2">{stageInfo.icon}</span>
                    {stageInfo.label}
                  </button>
                );
              })}
            </div>
          </ParchmentCard>

          {/* Notes */}
          {candidate.notes && (
            <ParchmentCard className="p-6">
              <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4">
                📝 Commander's Notes
              </h3>
              <div className="font-body text-castle-stone whitespace-pre-wrap bg-parchment-dark p-4 rounded-lg border border-aged-brown">
                <MentionRenderer text={candidate.notes} candidates={allCandidates} />
              </div>
            </ParchmentCard>
          )}

          {/* Assessment Responses */}
          {assessmentResponses.length > 0 && (
            <ParchmentCard className="p-6">
              <h3 className="text-xl font-medieval font-bold text-castle-stone mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gold" />
                Assessment Responses
              </h3>
              <div className="space-y-4">
                {assessmentResponses.map((response) => {
                  const assessment = assessments.find(a => a.id === response.assessmentId);
                  return (
                    <div
                      key={response.id}
                      className="bg-parchment-dark border-2 border-aged-brown rounded-lg p-4 hover:border-gold transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medieval font-semibold text-castle-stone">
                          {assessment?.title || 'Assessment'}
                        </h4>
                        <Badge variant="default" icon="✓">
                          Submitted
                        </Badge>
                      </div>
                      <p className="text-xs font-body text-aged-brown mb-3">
                        Submitted on {new Date(response.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {assessment && (
                        <Link to={`/jobs/${assessment.jobId}`}>
                          <span className="text-sm font-body text-royal-purple hover:text-royal-purple-dark transition-colors">
                            View Job →
                          </span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </ParchmentCard>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <ParchmentCard className="p-6 sm:p-8">
            <div className="border-b-2 border-aged-brown pb-4 mb-6">
              <h2 className="text-2xl font-medieval font-bold text-castle-stone">
                📜 Warrior's Journey
              </h2>
              <p className="text-sm font-body text-aged-brown mt-2">
                Timeline of the warrior's progression through the recruitment quest
              </p>
            </div>
            <div className="px-6 py-4">
              {timeline.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-aged-brown mb-4" />
                  <h3 className="text-xl font-medieval font-bold text-castle-stone mb-2">
                    No Journey Events
                  </h3>
                  <p className="font-body text-aged-brown">
                    Timeline events will appear here as the warrior progresses through the stages.
                  </p>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="space-y-6">
                    {timeline
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((event, eventIdx) => {
                        const eventStageInfo = getStageInfo(event.stage as Candidate['stage']);
                        return (
                          <li key={event.id}>
                            <div className="relative flex items-start gap-4">
                              {eventIdx !== timeline.length - 1 && (
                                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-aged-brown opacity-30" />
                              )}
                              <div className="flex-shrink-0">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg border-2 border-aged-brown ${
                                  event.stage === 'hired' ? 'bg-forest-green' :
                                  event.stage === 'rejected' ? 'bg-blood-red' :
                                  'bg-royal-purple'
                                }`}>
                                  <span className="text-2xl">{eventStageInfo.icon}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 pb-6">
                                <div className="bg-parchment-dark border-2 border-aged-brown rounded-lg p-4 hover:border-gold transition-colors">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <p className="text-base font-medieval font-bold text-castle-stone mb-1">
                                        Moved to {eventStageInfo.label}
                                      </p>
                                      {event.note && (
                                        <p className="text-sm font-body text-aged-brown mt-2">
                                          {event.note}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-xs font-body text-aged-brown mt-3 pt-3 border-t border-aged-brown">
                                    <Calendar className="h-3 w-3 mr-2" />
                                    <time dateTime={new Date(event.timestamp).toISOString()}>
                                      {new Date(event.timestamp).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}
            </div>
          </ParchmentCard>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <ScrollModal
          isOpen={true}
          onClose={() => setShowNotesModal(false)}
          title="📝 Add Commander's Notes"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
                Notes about this warrior
              </label>
              <p className="text-xs font-body text-aged-brown mb-2">
                💡 Type <span className="font-semibold text-gold">@</span> to mention other candidates
              </p>
              <MentionTextarea
                value={notes}
                onChange={setNotes}
                rows={8}
                placeholder="Add notes about this candidate... Type @ to mention others"
                candidates={allCandidates.filter(c => c.id !== candidate?.id)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t-2 border-aged-brown">
              <WaxSealButton variant="gold" onClick={() => setShowNotesModal(false)}>
                Cancel
              </WaxSealButton>
              <WaxSealButton variant="primary" onClick={handleSaveNotes}>
                Save Notes
              </WaxSealButton>
            </div>
          </div>
        </ScrollModal>
      )}
    </div>
  );
};

export default CandidateDetail;
