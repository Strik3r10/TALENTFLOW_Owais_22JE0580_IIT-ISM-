import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit, Eye, Scroll, Calendar, Briefcase } from 'lucide-react';
import { Assessment, Job, db } from '../database';
import { ParchmentCard, WaxSealButton, TorchLoader, Badge } from '../components/ui';

const AssessmentsList: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [jobs, setJobs] = useState<Map<string, Job>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all assessments
        const allAssessments = await db.assessments.toArray();
        setAssessments(allAssessments.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ));

        // Fetch all jobs for reference
        const allJobs = await db.jobs.toArray();
        const jobsMap = new Map(allJobs.map(job => [job.id, job]));
        setJobs(jobsMap);
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getJobForAssessment = (jobId: string) => {
    return jobs.get(jobId);
  };

  const getQuestionCount = (assessment: Assessment) => {
    return assessment.sections.reduce((total, section) => 
      total + section.questions.length, 0
    );
  };

  const hasConditionalQuestions = (assessment: Assessment) => {
    return assessment.sections.some(section =>
      section.questions.some(q => q.conditionalLogic)
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <TorchLoader size="lg" text="Loading assessments..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-medieval font-bold text-castle-stone flex items-center">
            <FileText className="h-8 w-8 mr-3 text-gold" />
            Training Trials Archive
          </h1>
          <p className="font-body text-aged-brown mt-2">
            Manage all assessments and training trials for your quests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ParchmentCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-aged-brown mb-1">Total Assessments</p>
              <p className="text-3xl font-medieval font-bold text-castle-stone">{assessments.length}</p>
            </div>
            <FileText className="h-10 w-10 text-gold" />
          </div>
        </ParchmentCard>
        
        <ParchmentCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-aged-brown mb-1">Total Questions</p>
              <p className="text-3xl font-medieval font-bold text-castle-stone">
                {assessments.reduce((total, a) => total + getQuestionCount(a), 0)}
              </p>
            </div>
            <Scroll className="h-10 w-10 text-royal-purple" />
          </div>
        </ParchmentCard>
        
        <ParchmentCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-aged-brown mb-1">With Conditionals</p>
              <p className="text-3xl font-medieval font-bold text-castle-stone">
                {assessments.filter(hasConditionalQuestions).length}
              </p>
            </div>
            <span className="text-4xl">🔀</span>
          </div>
        </ParchmentCard>
      </div>

      {/* Assessments List */}
      {assessments.length === 0 ? (
        <ParchmentCard className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-aged-brown mb-4" />
          <h2 className="text-2xl font-medieval font-bold text-castle-stone mb-2">
            No Assessments Yet
          </h2>
          <p className="font-body text-aged-brown-dark mb-6">
            Create your first assessment to begin testing candidates
          </p>
          <Link to="/jobs">
            <WaxSealButton variant="gold">
              <Briefcase className="h-4 w-4 mr-2" />
              Go to Jobs Board
            </WaxSealButton>
          </Link>
        </ParchmentCard>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => {
            const job = getJobForAssessment(assessment.jobId);
            const questionCount = getQuestionCount(assessment);
            const hasConditionals = hasConditionalQuestions(assessment);

            return (
              <ParchmentCard key={assessment.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-12 w-12 bg-gold-light rounded-lg flex items-center justify-center border-2 border-gold">
                          <FileText className="h-6 w-6 text-gold" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-medieval font-bold text-castle-stone mb-1">
                          {assessment.title}
                        </h3>
                        {job ? (
                          <Link 
                            to={`/jobs/${job.id}`}
                            className="text-sm font-body text-royal-purple hover:text-royal-purple-dark transition-colors flex items-center gap-1"
                          >
                            <Briefcase className="h-4 w-4" />
                            {job.title}
                          </Link>
                        ) : (
                          <p className="text-sm font-body text-aged-brown">Job not found</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="default" icon="📋">
                        {assessment.sections.length} {assessment.sections.length === 1 ? 'Section' : 'Sections'}
                      </Badge>
                      <Badge variant="default" icon="❓">
                        {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                      </Badge>
                      {hasConditionals && (
                        <Badge variant="default" icon="🔀">
                          Conditional Logic
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-body text-aged-brown">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(assessment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {new Date(assessment.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/assessments/${assessment.jobId}/take`}>
                      <WaxSealButton variant="gold">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </WaxSealButton>
                    </Link>
                    <Link to={`/assessments/${assessment.jobId}`}>
                      <WaxSealButton variant="primary">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </WaxSealButton>
                    </Link>
                  </div>
                </div>

                {/* Sections Preview */}
                <div className="mt-4 pt-4 border-t border-aged-brown">
                  <p className="text-xs font-medieval font-semibold text-aged-brown mb-2 uppercase">
                    Sections:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {assessment.sections.slice(0, 5).map((section, idx) => (
                      <span
                        key={section.id}
                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-body bg-parchment-dark text-castle-stone border border-aged-brown"
                      >
                        {idx + 1}. {section.title}
                      </span>
                    ))}
                    {assessment.sections.length > 5 && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-body text-aged-brown">
                        +{assessment.sections.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </ParchmentCard>
            );
          })}
        </div>
      )}

      {/* Help Card */}
      <ParchmentCard className="p-6 bg-gold-light bg-opacity-10 border-2 border-gold">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <span className="text-3xl">💡</span>
          </div>
          <div>
            <h3 className="font-medieval font-bold text-castle-stone mb-2">
              How to Create an Assessment
            </h3>
            <ol className="text-sm font-body text-aged-brown space-y-1 list-decimal list-inside">
              <li>Navigate to the <strong>Jobs Board</strong></li>
              <li>Click on a job or use the <strong>📄 icon</strong></li>
              <li>Click the <strong>"Training Trials"</strong> button</li>
              <li>Build your assessment with sections and questions</li>
              <li>Save and it will appear here!</li>
            </ol>
          </div>
        </div>
      </ParchmentCard>
    </div>
  );
};

export default AssessmentsList;
