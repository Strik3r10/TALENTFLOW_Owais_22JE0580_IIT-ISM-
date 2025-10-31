import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db, Candidate } from '../database';
import { User, ChevronDown, ChevronRight } from 'lucide-react';
import { TorchLoader, ParchmentCard } from '../components/ui';

interface Stage {
  id: Candidate['stage'];
  title: string;
  icon: string;
  color: string;
}

const stages: Stage[] = [
  { id: 'applied', title: 'Applied', icon: '�', color: 'bg-castle-stone-light' },
  { id: 'screen', title: 'Screening', icon: '👀', color: 'bg-aged-brown' },
  { id: 'tech', title: 'Interview', icon: '�', color: 'bg-royal-purple' },
  { id: 'offer', title: 'Offer', icon: '📜', color: 'bg-gold-dark' },
  { id: 'hired', title: 'Hired', icon: '✓', color: 'bg-forest-green' },
  { id: 'rejected', title: 'Rejected', icon: '✗', color: 'bg-blood-red' },
];

interface CandidateCardProps {
  candidate: Candidate;
}

const SortableCandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="bg-white rounded-lg border-2 border-aged-brown p-3 mb-2 cursor-move hover:shadow-md hover:border-gold transition-all duration-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-royal-purple to-royal-purple-dark rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medieval font-semibold text-castle-stone text-sm truncate">
              {candidate.name}
            </h4>
            <p className="text-xs font-body text-aged-brown truncate">
              {candidate.email}
            </p>
            {candidate.notes && (
              <p className="text-xs font-body text-aged-brown-dark mt-1.5 line-clamp-2">
                {candidate.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanBoard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<Candidate['stage']>>(new Set());

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    const allCandidates = await db.candidates.toArray();
    setCandidates(allCandidates);
    setLoading(false);
  };

  const toggleStage = (stageId: Candidate['stage']) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const candidateId = active.id as string;
    const newStage = over.id as Candidate['stage'];

    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || candidate.stage === newStage) return;

    // Optimistic update
    setCandidates(prev =>
      prev.map(c => c.id === candidateId ? { ...c, stage: newStage, updatedAt: new Date() } : c)
    );

    try {
      // Update in database
      await db.candidates.update(candidateId, {
        stage: newStage,
        updatedAt: new Date()
      });

      // Add timeline entry
      await db.candidateTimeline.add({
        id: crypto.randomUUID(),
        candidateId,
        stage: newStage,
        timestamp: new Date(),
        note: `Moved to ${newStage}`
      });
    } catch (error) {
      console.error('Failed to update candidate:', error);
      // Rollback on error
      loadCandidates();
    }
  };

  const getCandidatesByStage = (stage: Candidate['stage']) => {
    return candidates.filter(c => c.stage === stage);
  };

  const activeCandidate = activeId ? candidates.find(c => c.id === activeId) : null;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <TorchLoader size="lg" text="Loading pipeline..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-medieval font-bold text-castle-stone mb-1">
          📊 Recruitment Pipeline
        </h1>
        <p className="font-body text-aged-brown-dark">
          Track candidates through each recruitment stage. Click to expand and view details.
        </p>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Accordion Stages */}
        <div className="space-y-3">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.id);
            const isExpanded = expandedStages.has(stage.id);
            
            return (
              <ParchmentCard key={stage.id} className="overflow-hidden">
                {/* Stage Header - Clickable */}
                <button
                  onClick={() => toggleStage(stage.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-parchment-dark transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className={`${stage.color} text-white w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <span className="text-2xl">{stage.icon}</span>
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg sm:text-xl font-medieval font-bold text-castle-stone">
                        {stage.title}
                      </h3>
                      <p className="text-sm font-body text-aged-brown">
                        {stageCandidates.length} {stageCandidates.length === 1 ? 'candidate' : 'candidates'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Progress indicator */}
                    <div className="hidden sm:block w-24 h-2 bg-aged-brown bg-opacity-20 rounded-full overflow-hidden">
                      <div
                        className={`${stage.color} h-2 rounded-full transition-all duration-500`}
                        style={{
                          width: `${candidates.length > 0 ? (stageCandidates.length / candidates.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                    {/* Expand/Collapse Icon */}
                    {isExpanded ? (
                      <ChevronDown className="h-6 w-6 text-castle-stone transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-6 w-6 text-castle-stone transition-transform duration-200" />
                    )}
                  </div>
                </button>

                {/* Collapsible Content */}
                {isExpanded && (
                  <SortableContext
                    id={stage.id}
                    items={stageCandidates.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="border-t-2 border-aged-brown bg-parchment-dark">
                      {stageCandidates.length === 0 ? (
                        <div className="p-8 text-center">
                          <User className="h-12 w-12 mx-auto text-aged-brown mb-3 opacity-50" />
                          <p className="font-body text-aged-brown">No candidates in this stage</p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-2">
                          {stageCandidates.map((candidate) => (
                            <SortableCandidateCard key={candidate.id} candidate={candidate} />
                          ))}
                        </div>
                      )}
                    </div>
                  </SortableContext>
                )}
              </ParchmentCard>
            );
          })}
        </div>

        <DragOverlay>
          {activeCandidate ? (
            <div className="bg-white rounded-lg border-2 border-gold p-3 cursor-grabbing shadow-2xl rotate-2 scale-105">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-royal-purple to-royal-purple-dark rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medieval font-semibold text-castle-stone text-sm">
                    {activeCandidate.name}
                  </h4>
                  <p className="text-xs font-body text-aged-brown">
                    {activeCandidate.email}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
