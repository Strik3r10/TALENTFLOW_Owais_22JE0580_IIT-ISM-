import { http, HttpResponse } from 'msw';
import { db, Job, Candidate, Assessment } from '../database';

// Helper function to add artificial latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate errors
const shouldError = () => Math.random() < 0.1; // 10% error rate

export const handlers = [
  // Test endpoint
  http.get('/api/test', () => {
    console.log('MSW: Test endpoint called');
    return HttpResponse.json({ message: 'MSW is working!' });
  }),

  // Jobs API
  http.get('/api/jobs', async ({ request }) => {
    console.log('MSW: GET /api/jobs handler called');
    await delay(200 + Math.random() * 1000); // 200-1200ms delay
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    let jobs = await db.jobs.toArray();
    
    // Filter by search
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Filter by status
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
    
    // Sort
    if (sort === 'order') {
      jobs.sort((a, b) => a.order - b.order);
    } else if (sort === 'title') {
      jobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'createdAt') {
      jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedJobs = jobs.slice(start, end);
    
    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        pageSize,
        total: jobs.length,
        totalPages: Math.ceil(jobs.length / pageSize)
      }
    });
  }),

  http.post('/api/jobs', async ({ request }) => {
    console.log('MSW: POST /api/jobs handler called');
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      console.log('MSW: Simulating error for POST /api/jobs');
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    const jobData = await request.json() as Partial<Job>;
    console.log('Creating job with data:', jobData);
    
    // Get the current max order
    const existingJobs = await db.jobs.toArray();
    const maxOrder = existingJobs.length > 0 ? Math.max(...existingJobs.map(j => j.order)) : 0;
    
    const job: Job = {
      id: crypto.randomUUID(),
      title: jobData.title || '',
      slug: jobData.slug || jobData.title?.toLowerCase().replace(/\s+/g, '-') || '',
      status: jobData.status || 'active',
      tags: jobData.tags || [],
      order: maxOrder + 1,
      description: jobData.description,
      requirements: jobData.requirements,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Saving job:', job);
    await db.jobs.add(job);
    return HttpResponse.json(job);
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    const { id } = params;
    const job = await db.jobs.get(id as string);
    
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return HttpResponse.json(job);
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    const { id } = params;
    const updates = await request.json() as Partial<Job>;
    
    await db.jobs.update(id as string, { ...updates, updatedAt: new Date() });
    const updatedJob = await db.jobs.get(id as string);
    
    return HttpResponse.json(updatedJob);
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Reorder failed' }, { status: 500 });
    }
    
    const { id } = params;
    const { toOrder } = await request.json() as { fromOrder: number; toOrder: number };
    
    // Update the job's order
    await db.jobs.update(id as string, { order: toOrder });
    
    return HttpResponse.json({ success: true });
  }),

  // Candidates API
  http.get('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let candidates = await db.candidates.toArray();
    
    // Filter by search
    if (search) {
      candidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by stage
    if (stage) {
      candidates = candidates.filter(candidate => candidate.stage === stage);
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCandidates = candidates.slice(start, end);
    
    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total: candidates.length,
        totalPages: Math.ceil(candidates.length / pageSize)
      }
    });
  }),

  http.post('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    const candidateData = await request.json() as Partial<Candidate>;
    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: candidateData.name || '',
      email: candidateData.email || '',
      stage: candidateData.stage || 'applied',
      jobId: candidateData.jobId || '',
      appliedAt: new Date(),
      updatedAt: new Date(),
      notes: candidateData.notes
    };
    
    await db.candidates.add(candidate);
    
    // Add to timeline
    await db.candidateTimeline.add({
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      stage: candidate.stage,
      timestamp: new Date()
    });
    
    return HttpResponse.json(candidate);
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    const { id } = params;
    const candidate = await db.candidates.get(id as string);
    
    if (!candidate) {
      return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    return HttpResponse.json(candidate);
  }),

  http.patch('/api/candidates/:id', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    const { id } = params;
    const updates = await request.json() as Partial<Candidate>;
    
    // Add to timeline if stage changed
    if (updates.stage) {
      await db.candidateTimeline.add({
        id: crypto.randomUUID(),
        candidateId: id as string,
        stage: updates.stage,
        timestamp: new Date()
      });
    }
    
    await db.candidates.update(id as string, { ...updates, updatedAt: new Date() });
    const updatedCandidate = await db.candidates.get(id as string);
    
    return HttpResponse.json(updatedCandidate);
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    const { id } = params;
    const timeline = await db.candidateTimeline
      .where('candidateId')
      .equals(id as string)
      .sortBy('timestamp');
    
    return HttpResponse.json(timeline);
  }),

  // Assessments API
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    const { jobId } = params;
    const assessment = await db.assessments
      .where('jobId')
      .equals(jobId as string)
      .first();
    
    return HttpResponse.json(assessment);
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    const { jobId } = params;
    const assessmentData = await request.json() as Partial<Assessment>;
    
    const existing = await db.assessments
      .where('jobId')
      .equals(jobId as string)
      .first();
    
    if (existing) {
      await db.assessments.update(existing.id, { 
        ...assessmentData, 
        updatedAt: new Date() 
      });
      const updated = await db.assessments.get(existing.id);
      return HttpResponse.json(updated);
    } else {
      const assessment: Assessment = {
        id: crypto.randomUUID(),
        jobId: jobId as string,
        title: assessmentData.title || 'Assessment',
        sections: assessmentData.sections || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.assessments.add(assessment);
      return HttpResponse.json(assessment);
    }
  }),

  http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    
    const responseData = await request.json() as any;
    
    const response = {
      id: crypto.randomUUID(),
      assessmentId: responseData.assessmentId,
      candidateId: responseData.candidateId,
      responses: responseData.responses,
      submittedAt: new Date()
    };
    
    await db.assessmentResponses.add(response);
    return HttpResponse.json(response);
  })
];