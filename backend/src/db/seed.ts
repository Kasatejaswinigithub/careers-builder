import '../config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './connect';
import { Tenant } from '../models/Tenant.model';
import { User } from '../models/User.model';
import { Job } from '../models/Job.model';

const SAMPLE_JOBS = [
  { title: 'Full Stack Engineer', work_policy: 'Remote', location: 'Berlin, Germany', department: 'Product', employment_type: 'Full time', experience_level: 'Senior', job_type: 'Temporary', salary_range: 'AED 8K-12K / month', posted_days_ago: 40 },
  { title: 'Business Analyst', work_policy: 'Hybrid', location: 'Riyadh, Saudi Arabia', department: 'Customer Success', employment_type: 'Part time', experience_level: 'Mid-level', job_type: 'Permanent', salary_range: 'USD 4K-6K / month', posted_days_ago: 5 },
  { title: 'Software Engineer', work_policy: 'Remote', location: 'Berlin, Germany', department: 'Sales', employment_type: 'Contract', experience_level: 'Senior', job_type: 'Permanent', salary_range: 'SAR 10K-18K / month', posted_days_ago: 32 },
  { title: 'Marketing Manager', work_policy: 'Hybrid', location: 'Boston, United States', department: 'Engineering', employment_type: 'Part time', experience_level: 'Mid-level', job_type: 'Temporary', salary_range: 'AED 8K-12K / month', posted_days_ago: 22 },
  { title: 'UX Researcher', work_policy: 'Hybrid', location: 'Boston, United States', department: 'Engineering', employment_type: 'Full time', experience_level: 'Senior', job_type: 'Permanent', salary_range: 'USD 4K-6K / month', posted_days_ago: 31 },
  { title: 'AI Product Manager', work_policy: 'On-site', location: 'Athens, Greece', department: 'Operations', employment_type: 'Full time', experience_level: 'Junior', job_type: 'Internship', salary_range: 'INR 8L-15L / year', posted_days_ago: 37 },
  { title: 'Sales Development Representative', work_policy: 'Remote', location: 'Berlin, Germany', department: 'Marketing', employment_type: 'Full time', experience_level: 'Mid-level', job_type: 'Temporary', salary_range: 'INR 8L-15L / year', posted_days_ago: 27 },
  { title: 'Frontend Engineer', work_policy: 'Hybrid', location: 'Athens, Greece', department: 'Engineering', employment_type: 'Part time', experience_level: 'Junior', job_type: 'Temporary', salary_range: 'USD 80K-120K / year', posted_days_ago: 59 },
  { title: 'Sales Development Representative', work_policy: 'On-site', location: 'Cairo, Egypt', department: 'Sales', employment_type: 'Contract', experience_level: 'Senior', job_type: 'Internship', salary_range: 'USD 4K-6K / month', posted_days_ago: 0 },
  { title: 'Data Analyst', work_policy: 'On-site', location: 'Dubai, United Arab Emirates', department: 'Customer Success', employment_type: 'Full time', experience_level: 'Mid-level', job_type: 'Permanent', salary_range: 'AED 8K-12K / month', posted_days_ago: 53 },
  { title: 'Solutions Consultant', work_policy: 'Hybrid', location: 'Hyderabad, India', department: 'Engineering', employment_type: 'Contract', experience_level: 'Junior', job_type: 'Internship', salary_range: 'AED 8K-12K / month', posted_days_ago: 41 },
  { title: 'Mobile Developer (Flutter)', work_policy: 'Hybrid', location: 'Athens, Greece', department: 'Operations', employment_type: 'Part time', experience_level: 'Senior', job_type: 'Permanent', salary_range: 'USD 80K-120K / year', posted_days_ago: 43 },
  { title: 'Operations Associate', work_policy: 'Hybrid', location: 'Bangalore, India', department: 'Analytics', employment_type: 'Contract', experience_level: 'Junior', job_type: 'Internship', salary_range: 'SAR 10K-18K / month', posted_days_ago: 16 },
  { title: 'QA Engineer', work_policy: 'Hybrid', location: 'Berlin, Germany', department: 'Marketing', employment_type: 'Contract', experience_level: 'Junior', job_type: 'Temporary', salary_range: 'INR 8L-15L / year', posted_days_ago: 48 },
  { title: 'UX Researcher', work_policy: 'On-site', location: 'Berlin, Germany', department: 'R&D', employment_type: 'Full time', experience_level: 'Senior', job_type: 'Internship', salary_range: 'USD 80K-120K / year', posted_days_ago: 7 },
  { title: 'Product Designer', work_policy: 'On-site', location: 'Boston, United States', department: 'Operations', employment_type: 'Part time', experience_level: 'Mid-level', job_type: 'Permanent', salary_range: 'AED 12K-18K / month', posted_days_ago: 52 },
  { title: 'Full Stack Engineer', work_policy: 'Hybrid', location: 'Dubai, United Arab Emirates', department: 'Engineering', employment_type: 'Part time', experience_level: 'Mid-level', job_type: 'Permanent', salary_range: 'INR 8L-15L / year', posted_days_ago: 22 },
  { title: 'Product Designer', work_policy: 'Remote', location: 'Istanbul, Turkey', department: 'Customer Success', employment_type: 'Full time', experience_level: 'Mid-level', job_type: 'Temporary', salary_range: 'SAR 10K-18K / month', posted_days_ago: 17 },
  { title: 'Marketing Manager', work_policy: 'On-site', location: 'Dubai, United Arab Emirates', department: 'Engineering', employment_type: 'Full time', experience_level: 'Mid-level', job_type: 'Internship', salary_range: 'AED 8K-12K / month', posted_days_ago: 3 },
  { title: 'AI Product Manager', work_policy: 'Hybrid', location: 'Cairo, Egypt', department: 'Analytics', employment_type: 'Full time', experience_level: 'Junior', job_type: 'Permanent', salary_range: 'AED 12K-18K / month', posted_days_ago: 17 },
  { title: 'Backend Developer', work_policy: 'Hybrid', location: 'Bangalore, India', department: 'Product', employment_type: 'Part time', experience_level: 'Senior', job_type: 'Temporary', salary_range: 'USD 80K-120K / year', posted_days_ago: 21 },
  { title: 'Technical Writer', work_policy: 'On-site', location: 'Berlin, Germany', department: 'Sales', employment_type: 'Full time', experience_level: 'Junior', job_type: 'Permanent', salary_range: 'SAR 10K-18K / month', posted_days_ago: 13 },
  { title: 'DevOps Engineer', work_policy: 'Hybrid', location: 'Dubai, United Arab Emirates', department: 'Customer Success', employment_type: 'Contract', experience_level: 'Junior', job_type: 'Internship', salary_range: 'USD 80K-120K / year', posted_days_ago: 37 },
  { title: 'Customer Success Executive', work_policy: 'Hybrid', location: 'Istanbul, Turkey', department: 'Customer Success', employment_type: 'Full time', experience_level: 'Junior', job_type: 'Temporary', salary_range: 'SAR 10K-18K / month', posted_days_ago: 25 },
  { title: 'Frontend Engineer', work_policy: 'Remote', location: 'Istanbul, Turkey', department: 'Engineering', employment_type: 'Full time', experience_level: 'Senior', job_type: 'Internship', salary_range: 'INR 8L-15L / year', posted_days_ago: 44 },
  { title: 'Cloud Architect', work_policy: 'Remote', location: 'Dubai, United Arab Emirates', department: 'Customer Success', employment_type: 'Contract', experience_level: 'Mid-level', job_type: 'Permanent', salary_range: 'SAR 10K-18K / month', posted_days_ago: 48 },
  { title: 'Machine Learning Engineer', work_policy: 'Remote', location: 'Boston, United States', department: 'Sales', employment_type: 'Contract', experience_level: 'Senior', job_type: 'Temporary', salary_range: 'INR 8L-15L / year', posted_days_ago: 6 },
  { title: 'DevOps Engineer', work_policy: 'Remote', location: 'Berlin, Germany', department: 'Sales', employment_type: 'Part time', experience_level: 'Junior', job_type: 'Temporary', salary_range: 'SAR 10K-18K / month', posted_days_ago: 13 },
  { title: 'Data Analyst', work_policy: 'Remote', location: 'Bangalore, India', department: 'Product', employment_type: 'Part time', experience_level: 'Junior', job_type: 'Permanent', salary_range: 'INR 8L-15L / year', posted_days_ago: 57 },
  { title: 'Machine Learning Engineer', work_policy: 'On-site', location: 'Istanbul, Turkey', department: 'Operations', employment_type: 'Contract', experience_level: 'Senior', job_type: 'Permanent', salary_range: 'INR 8L-15L / year', posted_days_ago: 58 },
];

function mapJobType(jt: string): string {
  const m: Record<string, string> = {
    'Permanent': 'full-time',
    'Temporary': 'contract',
    'Internship': 'internship',
  };
  return m[jt] || 'full-time';
}

function mapEmploymentType(et: string): string {
  const m: Record<string, string> = {
    'Full time': 'full-time',
    'Part time': 'part-time',
    'Contract': 'contract',
  };
  return m[et] || 'full-time';
}

function buildDescription(job: typeof SAMPLE_JOBS[0]): string {
  return (
    'We are looking for a ' + job.experience_level + ' ' + job.title +
    ' to join our ' + job.department + ' team.\n\n' +
    'Location: ' + job.location + ' (' + job.work_policy + ')\n' +
    'Employment: ' + job.employment_type + '\n' +
    'Salary: ' + job.salary_range + '\n\n' +
    'You will work alongside a talented team to deliver high-impact results. ' +
    'This is a ' + job.job_type.toLowerCase() + ' position ideal for a ' +
    job.experience_level.toLowerCase() + '-level professional.'
  );
}

async function seed() {
  await connectDB();
  await Promise.all([Tenant.deleteMany({}), User.deleteMany({}), Job.deleteMany({})]);
  console.log('Cleared existing data');

  const acme = await Tenant.create({
    slug: 'acme',
    name: 'Acme Inc.',
    plan: 'pro',
    published: true,
    branding: {
      primaryColor: '#6366f1',
      secondaryColor: '#eef2ff',
      heroHeadline: 'Build the future with us',
      heroSubtext: 'Join a team of passionate people building products that matter. We are remote-first, globally distributed, and hiring across multiple roles.',
      about: 'Acme Inc. is a fast-growing technology company building tools that help teams work smarter. Founded in 2019, we have grown to 200+ employees across 15 countries. We are backed by top-tier investors and used by thousands of companies worldwide.',
      lifeAtCompany: 'We believe in async-first communication, generous PTO, and continuous learning budgets. Every team member gets a home office stipend, mental health resources, and access to company retreats twice a year.',
      website: 'https://acme.example.com',
      linkedin: 'https://linkedin.com/company/acme',
      twitter: 'https://twitter.com/acme',
    },
  });

  console.log('Created tenant: acme');

  const hash = await bcrypt.hash('password123', 10);
  await User.insertMany([
    { tenantId: acme._id, email: 'admin@acme.com',     role: 'admin',     passwordHash: hash },
    { tenantId: acme._id, email: 'recruiter@acme.com', role: 'recruiter', passwordHash: hash },
  ]);
  console.log('Created 2 users');

  const jobDocs = SAMPLE_JOBS.map(function(job) {
    const daysAgo = job.posted_days_ago;
    const createdAt = new Date(Date.now() - daysAgo * 86400000);
    return {
      tenantId: acme._id,
      title: job.title,
      description: buildDescription(job),
      location: job.location,
      jobType: mapEmploymentType(job.employment_type),
      tags: [job.department, job.experience_level, job.work_policy],
      status: 'published',
      createdAt,
      updatedAt: createdAt,
    };
  });

  await Job.insertMany(jobDocs);
  console.log('Created ' + jobDocs.length + ' jobs from sample data');

  console.log('');
  console.log('Seed complete!');
  console.log('  Login:       admin@acme.com / password123  (slug: acme)');
  console.log('  Public page: http://localhost:5173/acme/careers');
  console.log('  Dashboard:   http://localhost:5173/dashboard');

  await mongoose.disconnect();
}

seed().catch(function(err) { console.error('Seed failed:', err); process.exit(1); });
