import axios from 'axios';

// Import the getAuthHeaders function
const getAuthHeaders = (): { Authorization: string } => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error('No access token found');
    }
    return { Authorization: `Bearer ${accessToken}` };
};

// Types
export type EducationalLevel = 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'PHD';
export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

export interface JobApplication {
    id: number;
    job_post: number;
    resume: File | string;
    status: ApplicationStatus;
    applied_at: string;
    updated_at: string;
    job_title: string;
    job_reference_number: string;
    first_name: string;
    last_name: string;
    email: string;
    educational_level: EducationalLevel;
}

export interface CreateJobApplicationDTO {
    job_post: number;
    resume: File;
    first_name: string;
    last_name: string;
    email: string;
    educational_level: EducationalLevel;
}

export interface UpdateJobApplicationDTO {
    status?: ApplicationStatus;
    educational_level?: EducationalLevel;
    first_name?: string;
    last_name?: string;
    email?: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

export class JobApplicationService {
    private static instance: JobApplicationService;
    private constructor() {}

    public static getInstance(): JobApplicationService {
        if (!JobApplicationService.instance) {
            JobApplicationService.instance = new JobApplicationService();
        }
        return JobApplicationService.instance;
    }

    // Create a new job application
    async createApplication(application: CreateJobApplicationDTO): Promise<JobApplication> {
        const formData = new FormData();
        Object.entries(application).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const response = await axios.post(
            `${API_BASE_URL}/job-applications/`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    // Get all applications for the authenticated user
    async getMyApplications(): Promise<JobApplication[]> {
        const response = await axios.get(
            `${API_BASE_URL}/job-applications/`,
            {
                headers: {
                    ...getAuthHeaders(),
                }
            }
        );
        return response.data;
    }

    // Get a specific application by ID
    async getApplicationById(id: number): Promise<JobApplication> {
        const response = await axios.get(
            `${API_BASE_URL}/job-applications/${id}/`,
            {
                headers: {
                    ...getAuthHeaders(),
                }
            }
        );
        return response.data;
    }

    // Update an application
    async updateApplication(
        id: number,
        updates: UpdateJobApplicationDTO
    ): Promise<JobApplication> {
        const response = await axios.patch(
            `${API_BASE_URL}/job-applications/${id}/`,
            updates,
            {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    }

    // Delete an application
    async deleteApplication(id: number): Promise<void> {
        await axios.delete(
            `${API_BASE_URL}/job-applications/${id}/`,
            {
                headers: {
                    ...getAuthHeaders(),
                }
            }
        );
    }

    // Error handler wrapper
    async handleRequest<T>(request: Promise<T>): Promise<T> {
        try {
            return await request;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    // Handle unauthorized access
                    throw new Error('Unauthorized access. Please log in again.');
                }
                if (error.response?.status === 404) {
                    throw new Error('Application not found.');
                }
                throw new Error(error.response?.data?.message || 'An error occurred while processing your request.');
            }
            throw error;
        }
    }
}

// Export a singleton instance
export const jobApplicationService = JobApplicationService.getInstance();