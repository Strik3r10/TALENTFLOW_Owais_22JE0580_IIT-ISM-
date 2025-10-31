import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Job, db } from '../database';
import { ScrollModal, Input, WaxSealButton } from './ui';

interface JobModalProps {
  job?: Job | null;
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
    tags: ['']
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        description: job.description || '',
        requirements: job.requirements || [''],
        tags: job.tags.length > 0 ? job.tags : ['']
      });
    }
  }, [job]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.requirements.some(req => !req.trim())) {
      newErrors.requirements = 'All requirements must be filled';
    }

    if (formData.tags.some(tag => !tag.trim())) {
      newErrors.tags = 'All tags must be filled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const now = new Date();
      const filteredTags = formData.tags.filter(tag => tag.trim());
      const filteredRequirements = formData.requirements.filter(req => req.trim());

      if (job) {
        // Update existing job
        await db.jobs.update(job.id, {
          title: formData.title,
          description: formData.description,
          requirements: filteredRequirements,
          tags: filteredTags,
          slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          updatedAt: now
        });
      } else {
        // Create new job - get max order and increment
        const allJobs = await db.jobs.toArray();
        const maxOrder = allJobs.length > 0 ? Math.max(...allJobs.map(j => j.order)) : 0;

        await db.jobs.add({
          id: `job-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          requirements: filteredRequirements,
          tags: filteredTags,
          slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          status: 'active',
          order: maxOrder + 1,
          createdAt: now,
          updatedAt: now
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      setErrors({ submit: 'Failed to save job. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  return (
    <ScrollModal
      isOpen={true}
      onClose={onClose}
      title={job ? '📝 Edit Job' : '📜 Post New Job'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Job Title *"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Senior Software Engineer"
            error={errors.title}
          />
        </div>

        <div>
          <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
            Job Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 bg-parchment border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
            placeholder="Describe the role and responsibilities..."
          />
        </div>

        <div>
          <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
            Requirements *
          </label>
          <div className="space-y-2">
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-parchment border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  placeholder="Enter requirement"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="p-2 text-blood-red hover:bg-blood-red hover:text-parchment rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="inline-flex items-center px-3 py-2 font-medieval text-sm text-castle-stone bg-parchment-dark border-2 border-aged-brown rounded-md hover:bg-aged-brown hover:text-parchment transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Requirement
            </button>
          </div>
          {errors.requirements && (
            <p className="mt-1 text-sm text-blood-red font-body">{errors.requirements}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medieval font-semibold text-castle-stone mb-2">
            Skills & Tags *
          </label>
          <div className="space-y-2">
            {formData.tags.map((tag, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-parchment border-2 border-aged-brown rounded-md font-body text-castle-stone focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  placeholder="e.g. Swordsmanship"
                />
                {formData.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="p-2 text-blood-red hover:bg-blood-red hover:text-parchment rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTag}
              className="inline-flex items-center px-3 py-2 font-medieval text-sm text-castle-stone bg-parchment-dark border-2 border-aged-brown rounded-md hover:bg-aged-brown hover:text-parchment transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Skill Tag
            </button>
          </div>
          {errors.tags && (
            <p className="mt-1 text-sm text-blood-red font-body">{errors.tags}</p>
          )}
        </div>

        {errors.submit && (
          <div className="parchment-card p-4 border-2 border-blood-red">
            <p className="text-sm text-blood-red font-body">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t-2 border-aged-brown">
          <WaxSealButton
            type="button"
            onClick={onClose}
            variant="gold"
          >
            Cancel
          </WaxSealButton>
          <WaxSealButton
            type="submit"
            disabled={loading}
            variant="primary"
          >
            {loading ? '⏳ Saving...' : (job ? '✓ Update Job' : '✓ Post Job')}
          </WaxSealButton>
        </div>
      </form>
    </ScrollModal>
  );
};

export default JobModal;
