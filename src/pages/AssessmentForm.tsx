import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle, FileText } from 'lucide-react';
import { Assessment, AssessmentQuestion, db } from '../database';
import { ParchmentCard, WaxSealButton, TorchLoader, Input } from '../components/ui';

const AssessmentForm: React.FC = () => {
  const { jobId, candidateId } = useParams<{ jobId: string; candidateId?: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        // Fetch directly from IndexedDB
        const data = await db.assessments
          .where('jobId')
          .equals(jobId!)
          .first();
        
        setAssessment(data || null);
      } catch (error) {
        console.error('Failed to fetch assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchAssessment();
    }
  }, [jobId]);

  const shouldShowQuestion = (question: AssessmentQuestion): boolean => {
    if (!question.conditionalLogic) return true;
    const { dependsOn, condition, value } = question.conditionalLogic;
    const dependentResponse = responses[dependsOn];
    
    if (dependentResponse === undefined || dependentResponse === null) return false;
    
    switch (condition) {
      case 'equals':
        return String(dependentResponse) === String(value);
      case 'notEquals':
        return String(dependentResponse) !== String(value);
      case 'contains':
        return Array.isArray(dependentResponse) && dependentResponse.includes(value);
      default:
        return true;
    }
  };

  const validateResponse = (question: AssessmentQuestion, value: any): string | null => {
    if (question.required && (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim()))) {
      return 'This field is required';
    }

    if (question.type === 'numeric' && value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }
      if (question.min !== undefined && numValue < question.min) {
        return `Value must be at least ${question.min}`;
      }
      if (question.max !== undefined && numValue > question.max) {
        return `Value must be at most ${question.max}`;
      }
    }

    if ((question.type === 'short-text' || question.type === 'long-text') && value) {
      if (question.maxLength && value.length > question.maxLength) {
        return `Maximum length is ${question.maxLength} characters`;
      }
    }

    return null;
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    // Clear error for this question
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  };

  const validateAll = (): boolean => {
    if (!assessment) return false;
    const newErrors: Record<string, string> = {};
    
    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (shouldShowQuestion(question)) {
          const value = responses[question.id];
          const error = validateResponse(question, value);
          if (error) {
            newErrors[question.id] = error;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assessment) return;
    
    if (!validateAll()) {
      return;
    }

    setSubmitting(true);
    try {
      // Save directly to IndexedDB
      const response = {
        id: crypto.randomUUID(),
        assessmentId: assessment.id,
        candidateId: candidateId || 'anonymous',
        responses,
        submittedAt: new Date()
      };

      await db.assessmentResponses.add(response);

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/jobs');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <TorchLoader size="lg" text="Loading assessment..." />
      </div>
    );
  }

  if (!assessment || assessment.sections.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ParchmentCard className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-aged-brown mb-4" />
          <h2 className="text-2xl sm:text-3xl font-medieval font-bold text-castle-stone mb-2">
            No Assessment Available
          </h2>
          <p className="font-body text-aged-brown-dark mb-4">
            This quest does not have a training trial yet.
          </p>
          <div className="bg-parchment-dark border-2 border-aged-brown rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
            <h3 className="font-medieval font-bold text-castle-stone mb-3 flex items-center">
              💡 How to Create an Assessment:
            </h3>
            <ol className="text-sm font-body text-aged-brown space-y-2 list-decimal list-inside">
              <li>Go to the <span className="font-semibold text-castle-stone">Jobs Board</span></li>
              <li>Click on a job or use the <span className="font-semibold text-castle-stone">📄 icon</span> to manage assessments</li>
              <li>Click <span className="font-semibold text-castle-stone">"Training Trials"</span> button</li>
              <li>Build your assessment with sections and questions</li>
              <li>Save and return here to take the assessment!</li>
            </ol>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/jobs">
              <WaxSealButton variant="gold">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quest Board
              </WaxSealButton>
            </Link>
            {jobId && (
              <Link to={`/assessments/${jobId}`}>
                <WaxSealButton variant="primary">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Assessment
                </WaxSealButton>
              </Link>
            )}
          </div>
        </ParchmentCard>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="inline-flex items-center text-aged-brown hover:text-castle-stone font-medieval font-semibold transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Quest Board
        </Link>
      </div>

      {submitSuccess && (
        <ParchmentCard className="p-6 border-2 border-forest-green bg-forest-green bg-opacity-10">
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-forest-green" />
            <div>
              <h3 className="font-medieval font-bold text-forest-green text-lg">Assessment Submitted!</h3>
              <p className="font-body text-aged-brown">Your responses have been saved successfully.</p>
            </div>
          </div>
        </ParchmentCard>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <ParchmentCard className="p-6 sm:p-8">
          <div className="border-b-2 border-aged-brown pb-6 mb-6">
            <h1 className="text-3xl sm:text-4xl font-medieval font-bold text-castle-stone mb-2">
              🎯 {assessment.title}
            </h1>
            <p className="font-body text-aged-brown-dark">
              Please complete all required questions marked with *
            </p>
          </div>

          <div className="space-y-8">
            {assessment.sections.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-6">
                <div className="border-l-4 border-gold pl-4">
                  <h2 className="text-2xl font-medieval font-bold text-castle-stone">
                    {sectionIndex + 1}. {section.title}
                  </h2>
                </div>

                <div className="space-y-6 ml-4">
                  {section.questions.map((question) => {
                    const isVisible = shouldShowQuestion(question);
                    if (!isVisible) return null;

                    const error = errors[question.id];
                    const value = responses[question.id];

                    return (
                      <div key={question.id} className="space-y-2">
                        <label className="block text-lg font-medieval font-semibold text-castle-stone">
                          {question.question}
                          {question.required && <span className="text-blood-red ml-1">*</span>}
                        </label>

                        {question.type === 'short-text' && (
                          <Input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            placeholder="Your answer..."
                            error={error}
                            maxLength={question.maxLength}
                          />
                        )}

                        {question.type === 'long-text' && (
                          <div>
                            <textarea
                              value={value || ''}
                              onChange={(e) => handleResponseChange(question.id, e.target.value)}
                              rows={6}
                              maxLength={question.maxLength}
                              className="w-full px-4 py-3 bg-parchment border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                              placeholder="Your answer..."
                            />
                            {question.maxLength && (
                              <p className="mt-1 text-sm font-body text-aged-brown">
                                {value?.length || 0} / {question.maxLength} characters
                              </p>
                            )}
                            {error && (
                              <p className="mt-1 text-sm text-blood-red font-body">{error}</p>
                            )}
                          </div>
                        )}

                        {question.type === 'single-choice' && question.options && (
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                className="flex items-center cursor-pointer p-3 bg-parchment-dark border-2 border-aged-brown rounded-lg hover:border-gold transition-colors"
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option}
                                  checked={value === option}
                                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                  className="mr-3 w-4 h-4 text-gold focus:ring-gold"
                                />
                                <span className="font-body text-castle-stone flex-1">{option}</span>
                              </label>
                            ))}
                            {error && (
                              <p className="text-sm text-blood-red font-body flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                              </p>
                            )}
                          </div>
                        )}

                        {question.type === 'multi-choice' && question.options && (
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                className="flex items-center cursor-pointer p-3 bg-parchment-dark border-2 border-aged-brown rounded-lg hover:border-gold transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={Array.isArray(value) && value.includes(option)}
                                  onChange={(e) => {
                                    const currentValues = Array.isArray(value) ? value : [];
                                    if (e.target.checked) {
                                      handleResponseChange(question.id, [...currentValues, option]);
                                    } else {
                                      handleResponseChange(question.id, currentValues.filter(v => v !== option));
                                    }
                                  }}
                                  className="mr-3 w-4 h-4 text-gold focus:ring-gold"
                                />
                                <span className="font-body text-castle-stone flex-1">{option}</span>
                              </label>
                            ))}
                            {error && (
                              <p className="text-sm text-blood-red font-body flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                              </p>
                            )}
                          </div>
                        )}

                        {question.type === 'numeric' && (
                          <Input
                            type="number"
                            value={value || ''}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            placeholder={`Enter number${question.min !== undefined || question.max !== undefined ? ` (${question.min ?? 'any'} - ${question.max ?? 'any'})` : ''}`}
                            error={error}
                            min={question.min}
                            max={question.max}
                          />
                        )}

                        {question.type === 'file-upload' && (
                          <div>
                            <div className="border-2 border-dashed border-aged-brown rounded-lg p-8 text-center bg-parchment-dark hover:border-gold transition-colors">
                              <FileText className="h-12 w-12 mx-auto text-aged-brown mb-4" />
                              <p className="font-body text-castle-stone mb-2">File Upload</p>
                              <p className="text-sm font-body text-aged-brown">
                                (File upload functionality is a stub)
                              </p>
                              <input
                                type="file"
                                disabled
                                className="mt-4 hidden"
                              />
                            </div>
                            {error && (
                              <p className="mt-2 text-sm text-blood-red font-body">{error}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-aged-brown flex justify-end gap-3">
            <Link to="/jobs">
              <WaxSealButton variant="gold" type="button">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </WaxSealButton>
            </Link>
            <WaxSealButton variant="primary" type="submit" disabled={submitting}>
              <Check className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </WaxSealButton>
          </div>
        </ParchmentCard>
      </form>
    </div>
  );
};

export default AssessmentForm;

