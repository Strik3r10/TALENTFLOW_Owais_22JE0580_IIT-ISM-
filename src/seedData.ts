import { db, Job, Candidate, Assessment } from './database';

const jobTitles = [
  'Senior Software Engineer',
  'Product Manager',
  'UX/UI Designer',
  'Data Scientist',
  'DevOps Engineer',
  'Full Stack Developer',
  'Marketing Manager',
  'Sales Director',
  'Business Analyst',
  'Project Manager',
  'Frontend Developer',
  'Backend Developer',
  'Mobile App Developer',
  'Quality Assurance Engineer',
  'Cybersecurity Specialist',
  'Cloud Architect',
  'HR Manager',
  'Content Writer',
  'Graphic Designer',
  'Financial Analyst',
  'Customer Success Manager',
  'Scrum Master',
  'Technical Writer',
  'Operations Manager',
  'Account Executive'
];

const tags = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Azure', 'Docker',
  'Kubernetes', 'SQL', 'NoSQL', 'TypeScript', 'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL',
  'Full-time', 'Remote', 'Hybrid', 'Senior', 'Junior', 'Mid-level', 'Contract', 'Freelance',
  'Leadership', 'Agile', 'Scrum', 'Communication', 'Design', 'Analytics', 'Marketing', 'Sales'
];

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas',
  'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael', 'Emily', 'Daniel',
  'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery', 'David', 'Ella', 'Joseph',
  'Scarlett', 'Samuel', 'Grace', 'Carter', 'Chloe', 'Owen', 'Victoria', 'Wyatt',
  'Riley', 'John', 'Aria', 'Jack', 'Lily', 'Luke', 'Aubrey', 'Jayden', 'Zoey',
  'Dylan', 'Penelope', 'Grayson', 'Lillian', 'Levi', 'Addison', 'Isaac', 'Layla',
  'Gabriel', 'Natalie', 'Julian', 'Camila', 'Mateo', 'Hannah', 'Anthony', 'Brooklyn',
  'Jaxon', 'Zoe', 'Lincoln', 'Nora', 'Joshua', 'Leah', 'Christopher', 'Savannah',
  'Andrew', 'Audrey', 'Theodore', 'Claire', 'Caleb', 'Eleanor', 'Ryan', 'Skylar',
  'Asher', 'Ellie', 'Nathan', 'Samantha', 'Thomas', 'Stella', 'Leo', 'Paisley',
  'Isaiah', 'Violet', 'Charles', 'Mila', 'Josiah', 'Allison', 'Hudson', 'Alexa',
  'Christian', 'Anna', 'Hunter', 'Hazel', 'Connor', 'Aaliyah', 'Eli', 'Ariana'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
  'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers',
  'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell'
];

const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

export async function seedDatabase() {
  // Clear existing data
  await db.jobs.clear();
  await db.candidates.clear();
  await db.candidateTimeline.clear();
  await db.assessments.clear();
  await db.assessmentResponses.clear();

  // Seed jobs
  const jobs: Job[] = [];
  for (let i = 0; i < 25; i++) {
    const title = jobTitles[i];
    const job: Job = {
      id: crypto.randomUUID(),
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => 
        tags[Math.floor(Math.random() * tags.length)]
      ),
      order: i,
      description: `We are seeking a talented ${title} to join our growing team. This role offers an exciting opportunity to work on innovative projects and grow your career.`,
      requirements: [
        'Bachelor\'s degree in relevant field or equivalent experience',
        '3+ years of professional experience in a similar role',
        'Strong communication and teamwork skills',
        'Proven track record of delivering results'
      ],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    jobs.push(job);
  }
  await db.jobs.bulkAdd(jobs);

  // Seed candidates
  const candidates: Candidate[] = [];
  for (let i = 0; i < 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    
    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      stage,
      jobId: job.id,
      appliedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      notes: Math.random() > 0.7 ? 'Strong candidate with excellent qualifications and experience' : undefined
    };
    candidates.push(candidate);
  }
  await db.candidates.bulkAdd(candidates);

  // Seed candidate timeline
  for (const candidate of candidates) {
    const timelineEntries = [];
    const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    const currentStageIndex = stages.indexOf(candidate.stage);
    
    for (let i = 0; i <= currentStageIndex; i++) {
      timelineEntries.push({
        id: crypto.randomUUID(),
        candidateId: candidate.id,
        stage: stages[i],
        timestamp: new Date(candidate.appliedAt.getTime() + i * 24 * 60 * 60 * 1000)
      });
    }
    
    if (timelineEntries.length > 0) {
      await db.candidateTimeline.bulkAdd(timelineEntries);
    }
  }

  // Seed assessments for first 3 jobs
  for (let i = 0; i < 3; i++) {
    const job = jobs[i];
    const assessment: Assessment = {
      id: crypto.randomUUID(),
      jobId: job.id,
      title: `${job.title} Assessment`,
      sections: [
        {
          id: crypto.randomUUID(),
          title: 'Professional Experience',
          questions: [
            {
              id: 'exp-years',
              type: 'single-choice',
              question: 'How many years of relevant professional experience do you have?',
              required: true,
              options: ['0-1 years', '2-3 years', '4-5 years', '6+ years']
            },
            {
              id: 'senior-exp',
              type: 'long-text',
              question: 'Please describe your senior-level experience and leadership roles',
              required: true,
              maxLength: 800,
              conditionalLogic: {
                dependsOn: 'exp-years',
                condition: 'equals',
                value: '6+ years'
              }
            },
            {
              id: 'tech-stack',
              type: 'multi-choice',
              question: 'Which technologies/tools are you proficient in?',
              required: true,
              options: ['JavaScript/TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS/Azure', 'Docker/Kubernetes', 'SQL/NoSQL']
            },
            {
              id: 'achievement',
              type: 'short-text',
              question: 'Describe your most significant professional achievement',
              required: true,
              maxLength: 500
            },
            {
              id: 'problem-solving',
              type: 'long-text',
              question: 'Explain your approach to solving complex technical problems',
              required: true,
              maxLength: 1000
            },
            {
              id: 'self-rating',
              type: 'numeric',
              question: 'Rate your technical expertise (1-10)',
              required: true,
              min: 1,
              max: 10
            }
          ]
        },
        {
          id: crypto.randomUUID(),
          title: 'Skills & Competencies',
          questions: [
            {
              id: 'team-lead',
              type: 'single-choice',
              question: 'Have you led a team before?',
              required: true,
              options: ['Yes', 'No', 'Informally']
            },
            {
              id: 'team-size',
              type: 'numeric',
              question: 'How many team members did you lead?',
              required: true,
              min: 1,
              max: 100,
              conditionalLogic: {
                dependsOn: 'team-lead',
                condition: 'equals',
                value: 'Yes'
              }
            },
            {
              id: 'deadline-handling',
              type: 'single-choice',
              question: 'How do you handle tight deadlines and pressure?',
              required: true,
              options: ['Prioritize tasks effectively', 'Communicate with team and stakeholders', 'Break down work into manageable chunks', 'Stay focused and maintain quality']
            },
            {
              id: 'team-challenge',
              type: 'long-text',
              question: 'Describe a challenging team situation and how you handled it',
              required: true,
              maxLength: 800
            },
            {
              id: 'remote-work',
              type: 'single-choice',
              question: 'Do you prefer remote, hybrid, or on-site work?',
              required: true,
              options: ['Remote', 'Hybrid', 'On-site', 'Flexible']
            },
            {
              id: 'resume-upload',
              type: 'file-upload',
              question: 'Upload your resume (optional)',
              required: false
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.assessments.add(assessment);
  }

  console.log('Database seeded successfully!');
}
