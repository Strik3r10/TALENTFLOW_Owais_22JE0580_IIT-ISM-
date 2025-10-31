import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, Save, FileText, GripVertical } from 'lucide-react';
import { Assessment, AssessmentSection, AssessmentQuestion, db } from '../database';
import { ParchmentCard, WaxSealButton, TorchLoader, Input, Badge } from '../components/ui';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Section Component
const SortableSection: React.FC<{
  section: AssessmentSection;
  sectionIndex: number;
  assessment: Assessment;
  updateSection: (sectionId: string, updates: Partial<AssessmentSection>) => void;
  removeSection: (sectionId: string) => void;
  addQuestion: (sectionId: string) => void;
  updateQuestion: (sectionId: string, questionId: string, updates: Partial<AssessmentQuestion>) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
  handleQuestionDragEnd: (sectionId: string) => (event: DragEndEvent) => void;
}> = ({
  section,
  sectionIndex,
  assessment,
  updateSection,
  removeSection,
  addQuestion,
  updateQuestion,
  removeQuestion,
  handleQuestionDragEnd
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ParchmentCard className="p-6 border-l-4 border-gold">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-aged-brown hover:text-gold cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              className="text-xl font-medieval font-bold text-castle-stone bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-gold rounded px-2 py-1 flex-1"
              placeholder={`Section ${sectionIndex + 1} Title`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addQuestion(section.id)}
              className="p-2 text-royal-purple hover:text-royal-purple-dark hover:bg-parchment-dark rounded-lg transition-colors"
              title="Add Question"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              onClick={() => removeSection(section.id)}
              className="p-2 text-blood-red hover:text-blood-red-dark hover:bg-parchment-dark rounded-lg transition-colors"
              title="Remove Section"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <DndContext
          sensors={useSensors(
            useSensor(PointerSensor),
            useSensor(KeyboardSensor, {
              coordinateGetter: sortableKeyboardCoordinates,
            })
          )}
          collisionDetection={closestCenter}
          onDragEnd={handleQuestionDragEnd(section.id)}
        >
          <SortableContext
            items={section.questions.map(q => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 mt-6">
              {section.questions.map((question, questionIndex) => (
                <SortableQuestion
                  key={question.id}
                  question={question}
                  questionIndex={questionIndex}
                  sectionId={section.id}
                  assessment={assessment}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ParchmentCard>
    </div>
  );
};

// Sortable Question Component
const SortableQuestion: React.FC<{
  question: AssessmentQuestion;
  questionIndex: number;
  sectionId: string;
  assessment: Assessment;
  updateQuestion: (sectionId: string, questionId: string, updates: Partial<AssessmentQuestion>) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
}> = ({ question, questionIndex, sectionId, assessment, updateQuestion, removeQuestion }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-parchment-dark border-2 border-aged-brown rounded-lg p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-aged-brown hover:text-gold cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <Badge variant="default" icon="❓">
            Q{questionIndex + 1}
          </Badge>
          <select
            value={question.type}
            onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as any })}
            className="px-3 py-1.5 bg-parchment border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold text-sm"
          >
            <option value="short-text">Short Text</option>
            <option value="long-text">Long Text</option>
            <option value="single-choice">Single Choice</option>
            <option value="multi-choice">Multiple Choice</option>
            <option value="numeric">Numeric</option>
            <option value="file-upload">File Upload</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
              className="mr-2 w-4 h-4 text-gold focus:ring-gold"
            />
            <span className="text-sm font-body text-castle-stone">Required</span>
          </label>
          <button
            onClick={() => removeQuestion(sectionId, question.id)}
            className="p-1.5 text-blood-red hover:text-blood-red-dark hover:bg-parchment rounded-lg transition-colors"
            title="Remove Question"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Input
        type="text"
        value={question.question}
        onChange={(e) => updateQuestion(sectionId, question.id, { question: e.target.value })}
        placeholder="Enter question text..."
      />

      {(question.type === 'single-choice' || question.type === 'multi-choice') && (
        <div className="mt-4">
          <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
            Options (one per line)
          </label>
          <textarea
            value={question.options?.join('\n') || ''}
            onChange={(e) => updateQuestion(sectionId, question.id, {
              options: e.target.value.split('\n').filter(opt => opt.trim())
            })}
            rows={4}
            className="w-full px-4 py-3 bg-parchment border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
            placeholder="Option 1&#10;Option 2&#10;Option 3"
          />
        </div>
      )}

      {question.type === 'numeric' && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
              Min Value
            </label>
            <Input
              type="number"
              value={question.min?.toString() || ''}
              onChange={(e) => updateQuestion(sectionId, question.id, { min: parseInt(e.target.value) || undefined })}
              placeholder="Min"
            />
          </div>
          <div>
            <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
              Max Value
            </label>
            <Input
              type="number"
              value={question.max?.toString() || ''}
              onChange={(e) => updateQuestion(sectionId, question.id, { max: parseInt(e.target.value) || undefined })}
              placeholder="Max"
            />
          </div>
        </div>
      )}

      {(question.type === 'short-text' || question.type === 'long-text') && (
        <div className="mt-4">
          <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
            Max Length
          </label>
          <Input
            type="number"
            value={question.maxLength?.toString() || ''}
            onChange={(e) => updateQuestion(sectionId, question.id, { maxLength: parseInt(e.target.value) || undefined })}
            placeholder="Character limit"
          />
        </div>
      )}

      {/* Conditional Logic */}
      <div className="mt-4 border-t border-aged-brown pt-4">
        <label className="flex items-center cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={!!question.conditionalLogic}
            onChange={(e) => {
              if (e.target.checked) {
                // Enable conditional logic with default values
                updateQuestion(sectionId, question.id, {
                  conditionalLogic: {
                    dependsOn: '',
                    condition: 'equals',
                    value: ''
                  }
                });
              } else {
                // Disable conditional logic
                updateQuestion(sectionId, question.id, { conditionalLogic: undefined });
              }
            }}
            className="mr-2 w-4 h-4 text-gold focus:ring-gold"
          />
          <span className="text-sm font-medieval font-semibold text-castle-stone">
            🔀 Make this question conditional
          </span>
        </label>

        {question.conditionalLogic && (
          <div className="space-y-3 bg-parchment p-4 rounded-lg border border-aged-brown">
            <div>
              <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
                Show this question only when:
              </label>
              <select
                value={question.conditionalLogic.dependsOn || ''}
                onChange={(e) => updateQuestion(sectionId, question.id, {
                  conditionalLogic: { ...question.conditionalLogic!, dependsOn: e.target.value }
                })}
                className="w-full px-3 py-2 bg-parchment-dark border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold text-sm"
              >
                <option value="">Select a question...</option>
                {assessment.sections.flatMap(s => s.questions)
                  .filter(q => q.id !== question.id) // Can't depend on itself
                  .map(q => (
                    <option key={q.id} value={q.id}>
                      {q.question.substring(0, 50)}{q.question.length > 50 ? '...' : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
                  Condition
                </label>
                <select
                  value={question.conditionalLogic.condition || 'equals'}
                  onChange={(e) => updateQuestion(sectionId, question.id, {
                    conditionalLogic: { ...question.conditionalLogic!, condition: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-parchment-dark border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold text-sm"
                >
                  <option value="equals">Equals</option>
                  <option value="notEquals">Not Equals</option>
                  <option value="contains">Contains</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
                  Value
                </label>
                <Input
                  type="text"
                  value={question.conditionalLogic.value?.toString() || ''}
                  onChange={(e) => updateQuestion(sectionId, question.id, {
                    conditionalLogic: { ...question.conditionalLogic!, value: e.target.value }
                  })}
                  placeholder="Expected value"
                />
              </div>
            </div>

            <p className="text-xs font-body text-aged-brown italic">
              💡 This question will only appear if the selected question's answer matches the condition.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AssessmentBuilder: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        // Fetch directly from IndexedDB
        const data = await db.assessments
          .where('jobId')
          .equals(jobId!)
          .first();
        
        // If no assessment exists, create a new one
        if (!data) {
          setAssessment({
            id: crypto.randomUUID(),
            jobId: jobId!,
            title: 'Training Trial Assessment',
            sections: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          setAssessment(data);
        }
      } catch (error) {
        console.error('Failed to fetch assessment:', error);
        // Create new assessment on error
        setAssessment({
          id: crypto.randomUUID(),
          jobId: jobId!,
          title: 'Training Trial Assessment',
          sections: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchAssessment();
    }
  }, [jobId]);

  const addSection = () => {
    if (!assessment) return;

    const newSection: AssessmentSection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      questions: []
    };

    setAssessment(prev => prev ? {
      ...prev,
      sections: [...prev.sections, newSection]
    } : null);
  };

  const updateSection = (sectionId: string, updates: Partial<AssessmentSection>) => {
    if (!assessment) return;

    setAssessment(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    } : null);
  };

  const removeSection = (sectionId: string) => {
    if (!assessment) return;

    setAssessment(prev => prev ? {
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    } : null);
  };

  const addQuestion = (sectionId: string) => {
    if (!assessment) return;

    const newQuestion: AssessmentQuestion = {
      id: crypto.randomUUID(),
      type: 'short-text',
      question: 'New Question',
      required: true
    };

    setAssessment(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    } : null);
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<AssessmentQuestion>) => {
    if (!assessment) return;

    setAssessment(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(question =>
                question.id === questionId ? { ...question, ...updates } : question
              )
            }
          : section
      )
    } : null);
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    if (!assessment) return;

    setAssessment(prev => prev ? {
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      )
    } : null);
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!assessment || !over || active.id === over.id) return;

    const oldIndex = assessment.sections.findIndex(s => s.id === active.id);
    const newIndex = assessment.sections.findIndex(s => s.id === over.id);

    setAssessment(prev => prev ? {
      ...prev,
      sections: arrayMove(prev.sections, oldIndex, newIndex)
    } : null);
  };

  const handleQuestionDragEnd = (sectionId: string) => (event: DragEndEvent) => {
    const { active, over } = event;

    if (!assessment || !over || active.id === over.id) return;

    setAssessment(prev => {
      if (!prev) return null;

      return {
        ...prev,
        sections: prev.sections.map(section => {
          if (section.id !== sectionId) return section;

          const oldIndex = section.questions.findIndex(q => q.id === active.id);
          const newIndex = section.questions.findIndex(q => q.id === over.id);

          return {
            ...section,
            questions: arrayMove(section.questions, oldIndex, newIndex)
          };
        })
      };
    });
  };

  const saveAssessment = async () => {
    if (!assessment) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      // Save directly to IndexedDB
      const existing = await db.assessments
        .where('jobId')
        .equals(jobId!)
        .first();

      if (existing) {
        await db.assessments.update(existing.id, {
          ...assessment,
          updatedAt: new Date()
        });
      } else {
        await db.assessments.add({
          ...assessment,
          updatedAt: new Date()
        });
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save assessment:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <TorchLoader size="lg" text="Loading training trial..." />
      </div>
    );
  }

  // Ensure assessment is always set (should never be null after loading)
  if (!assessment) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <TorchLoader size="lg" text="Initializing assessment builder..." />
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
          <WaxSealButton
            variant="gold"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </WaxSealButton>
          <WaxSealButton
            variant="primary"
            onClick={saveAssessment}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Trial'}
          </WaxSealButton>
        </div>
      </div>

      {saveSuccess && (
        <ParchmentCard className="p-6 border-2 border-forest-green bg-forest-green bg-opacity-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <h3 className="font-medieval font-bold text-forest-green text-lg">Training Trial Saved!</h3>
              <p className="font-body text-aged-brown">Your assessment has been saved successfully.</p>
            </div>
          </div>
        </ParchmentCard>
      )}

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Builder */}
        <div className="space-y-6">
          <ParchmentCard className="p-6 sm:p-8">
            <div className="border-b-2 border-aged-brown pb-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-medieval font-bold text-castle-stone flex items-center">
                <FileText className="h-6 w-6 mr-3 text-gold" />
                Training Trial Builder
              </h1>
              <p className="font-body text-aged-brown mt-2">
                Build your assessment with sections and questions
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
                Trial Title
              </label>
              <Input
                type="text"
                value={assessment.title}
                onChange={(e) => setAssessment(prev => prev ? { ...prev, title: e.target.value } : null)}
                placeholder="Enter assessment title..."
              />
            </div>

            <div className="space-y-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSectionDragEnd}
              >
                <SortableContext
                  items={assessment.sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {assessment.sections.map((section, sectionIndex) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      sectionIndex={sectionIndex}
                      assessment={assessment}
                      updateSection={updateSection}
                      removeSection={removeSection}
                      addQuestion={addQuestion}
                      updateQuestion={updateQuestion}
                      removeQuestion={removeQuestion}
                      handleQuestionDragEnd={handleQuestionDragEnd}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <button
                onClick={addSection}
                className="w-full border-2 border-dashed border-aged-brown rounded-lg p-6 text-aged-brown hover:border-gold hover:text-gold hover:bg-parchment-dark transition-all duration-200"
              >
                <Plus className="h-8 w-8 mx-auto mb-2" />
                <span className="font-medieval font-semibold">Add New Section</span>
              </button>
            </div>
          </ParchmentCard>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="space-y-6">
            <ParchmentCard className="p-6 sm:p-8">
              <div className="border-b-2 border-aged-brown pb-4 mb-6">
                <h2 className="text-2xl font-medieval font-bold text-castle-stone">
                  👁️ Live Preview
                </h2>
                <p className="font-body text-aged-brown-dark mt-2">
                  See how warriors will experience this trial
                </p>
              </div>
              <div className="space-y-6">
                <h1 className="text-3xl font-medieval font-bold text-castle-stone border-b-2 border-aged-brown pb-4">
                  {assessment.title}
                </h1>
                
                {assessment.sections.map((section, sectionIndex) => (
                  <div key={section.id} className="space-y-4 border-l-4 border-gold pl-4">
                    <h2 className="text-xl font-medieval font-bold text-castle-stone">
                      {sectionIndex + 1}. {section.title}
                    </h2>
                    
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="space-y-2 bg-parchment-dark p-4 rounded-lg border border-aged-brown">
                        <label className="block text-base font-medieval font-semibold text-castle-stone">
                          {question.question}
                          {question.required && <span className="text-blood-red ml-1">*</span>}
                          {question.conditionalLogic && (
                            <span className="ml-2 text-xs font-body text-royal-purple bg-royal-purple bg-opacity-10 px-2 py-1 rounded border border-royal-purple">
                              🔀 Conditional
                            </span>
                          )}
                        </label>
                        
                        {question.type === 'short-text' && (
                          <Input
                            type="text"
                            disabled
                            placeholder="Your answer..."
                            className="bg-parchment"
                          />
                        )}
                        
                        {question.type === 'long-text' && (
                          <textarea
                            disabled
                            rows={4}
                            className="w-full px-4 py-2 bg-parchment border-2 border-aged-brown rounded-md font-body text-castle-stone"
                            placeholder="Your answer..."
                          />
                        )}
                        
                        {question.type === 'single-choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  disabled
                                  className="mr-3 w-4 h-4 text-gold"
                                />
                                <span className="font-body text-castle-stone">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'multi-choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <label key={optionIndex} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  disabled
                                  className="mr-3 w-4 h-4 text-gold"
                                />
                                <span className="font-body text-castle-stone">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'numeric' && (
                          <Input
                            type="number"
                            disabled
                            min={question.min}
                            max={question.max}
                            placeholder={`Enter number${question.min !== undefined || question.max !== undefined ? ` (${question.min ?? 'any'} - ${question.max ?? 'any'})` : ''}`}
                            className="bg-parchment"
                          />
                        )}
                        
                        {question.type === 'file-upload' && (
                          <div className="border-2 border-dashed border-aged-brown rounded-lg p-6 text-center bg-parchment">
                            <FileText className="h-8 w-8 mx-auto text-aged-brown mb-2" />
                            <p className="font-body text-aged-brown">File upload area</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                
                {assessment.sections.length === 0 && (
                  <div className="text-center py-8 text-aged-brown font-body italic">
                    No sections yet. Add sections and questions to build your trial.
                  </div>
                )}
              </div>
            </ParchmentCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentBuilder;
