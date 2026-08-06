import axios from 'axios';

import { ApiError } from '@/utils/api/api-error';
import { constants } from '@/utils/constants/env/client';

import { extractApiError } from './extract-api-error';

const apiClient = axios.create({
    baseURL: constants.API.URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve();
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(undefined, async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
        return Promise.reject(
            new ApiError(error?.message || 'Network error', { code: 'NETWORK_ERROR' })
        );
    }

    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

    if (error.response.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
        originalRequest._retry = true;

        if (isRefreshing) {
            // If refresh already in progress, queue the requests
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => apiClient(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            await apiClient.post('/auth/refresh');

            // After successful refresh, process queue and retry original request
            processQueue(null);
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            console.error('Need to redirect to login');
            // Memo: throw error or direct login redirect
            // With throw error, I can properly clean the login states
            // window.location.href = '/login';

            if (axios.isAxiosError(refreshError) && refreshError.response) {
                return Promise.reject(extractApiError(refreshError.response));
            }
            return Promise.reject(new ApiError('Unauthorized', { status: 401 }));
        } finally {
            isRefreshing = false;
        }
    }

    return Promise.reject(extractApiError(error.response));
});

export default apiClient;
