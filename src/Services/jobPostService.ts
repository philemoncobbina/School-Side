import axios, { AxiosResponse } from 'axios';

// Import the getAuthHeaders function
const getAuthHeaders = (): { Authorization: string } => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    return { Authorization: `Bearer ${accessToken}` };
};

export interface JobPost {
    id: number;
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary_range: string;
    status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
    created_by: number;
    created_at: string;
    reference_number: string;
    applications_count: string;
    updated_at: string;
    scheduled_date: string | null;
    published_date: string | null;
}

export interface CreateJobPostDTO {
    title: string;
    description: string;
    requirements: string;
    location: string;
    salary_range: string;
}

export interface ScheduleJobPostDTO {
    scheduled_date: string;
}

const API_URL = 'http://localhost:8000/api/api';

// Configure axios instance with basic headers
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// JobPostService with API methods
export const JobPostService = {
    // Get all job posts
    getAllPosts: async (): Promise<JobPost[]> => {
        const headers = getAuthHeaders();
        const response: AxiosResponse<JobPost[]> = await axiosInstance.get('/jobposts/', { headers });
        return response.data;
    },

    // Get a single job post by ID
    getPostById: async (id: number): Promise<JobPost> => {
        const headers = getAuthHeaders();
        const response: AxiosResponse<JobPost> = await axiosInstance.get(`/jobposts/${id}/`, { headers });
        return response.data;
    },

    // Create a new job post
    createPost: async (post: CreateJobPostDTO): Promise<JobPost> => {
        const headers = getAuthHeaders();
        const response: AxiosResponse<JobPost> = await axiosInstance.post('/jobposts/', post, { headers });
        return response.data;
    },

    // Update an existing job post
    updatePost: async (id: number, post: Partial<JobPost>): Promise<JobPost> => {
        const headers = getAuthHeaders();
        const response: AxiosResponse<JobPost> = await axiosInstance.patch(`/jobposts/${id}/`, post, { headers });
        return response.data;
    },

    // Delete a job post
    deletePost: async (id: number): Promise<void> => {
        const headers = getAuthHeaders();
        await axiosInstance.delete(`/jobposts/${id}/`, { headers });
    },

    // Publish a job post
    publishPost: async (id: number): Promise<JobPost> => {
        const headers = getAuthHeaders();
        const response: AxiosResponse<JobPost> = await axiosInstance.post(`/jobposts/${id}/publish/`, {}, { headers });
        return response.data;
    },

    // Schedule a job post
    schedulePost: async (id: number, scheduleData: ScheduleJobPostDTO): Promise<JobPost> => {
        const headers = getAuthHeaders();
        const response: AxiosResponse<JobPost> = await axiosInstance.post(`/jobposts/${id}/schedule/`, scheduleData, { headers });
        return response.data;
    },

    // Get draft posts
    getDraftPosts: async (): Promise<JobPost[]> => {
        const headers = getAuthHeaders();
        const response: AxiosResponse<JobPost[]> = await axiosInstance.get('/jobposts/get_draft_posts/', { headers });
        return response.data;
    },

    // Get scheduled posts
    getScheduledPosts: async (): Promise<JobPost[]> => {
        const headers = getAuthHeaders();
        const response: AxiosResponse<JobPost[]> = await axiosInstance.get('/jobposts/get_scheduled_posts/', { headers });
        return response.data;
    }
};
