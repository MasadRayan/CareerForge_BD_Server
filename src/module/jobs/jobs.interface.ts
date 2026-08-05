export interface SearchJob {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  publication_date: string | null;
  tags: string[];
  snippet: string;
  url: string;
}

export interface SearchJobsResult {
  jobs: SearchJob[];
  page: number;
  limit: number;
  page_count?: number;
  total_jobs?: number;
}