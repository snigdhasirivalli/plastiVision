import axios from 'axios';

// Direct URL to Flask — bypasses Vite proxy (works with /api prefix on Flask)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 20 seconds
});

// ── Response interceptor: retry on network errors, translate HTTP errors ──────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Build a human-readable error message
    if (!response) {
      // Network-level failure (Flask is offline)
      const retryErr = new Error(
        'Backend Offline — Cannot connect to Flask server on port 5000. ' +
        'Please run: cd backend && python app.py'
      );
      retryErr.isBackendOffline = true;

      // Retry up to 2 times for network errors only
      if (config) {
        config.__retryCount = config.__retryCount || 0;
        if (config.__retryCount < 2) {
          config.__retryCount += 1;
          console.warn(`[API] Network error. Retrying (${config.__retryCount}/2)...`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
          return apiClient(config);
        }
      }
      return Promise.reject(retryErr);
    }

    // HTTP error from Flask (4xx / 5xx)
    const serverMsg = response.data?.error || response.data?.message || response.statusText;
    const httpErr   = new Error(`Server error ${response.status}: ${serverMsg}`);
    httpErr.status  = response.status;
    httpErr.data    = response.data;
    return Promise.reject(httpErr);
  }
);

/**
 * POST /api/predict
 * Sends an image file or blob for classification.
 * @param {File|Blob} imageFileOrBlob
 */
export const predictImage = async (imageFileOrBlob) => {
  const formData = new FormData();
  formData.append('image', imageFileOrBlob);
  const response = await apiClient.post('/api/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * GET /api/dashboard
 * Fetches analytics and dataset statistics.
 */
export const fetchDashboardData = async () => {
  const response = await apiClient.get('/api/dashboard');
  return response.data;
};

/**
 * GET /api/model-performance
 * Fetches model evaluation metrics and training history.
 */
export const fetchModelPerformance = async () => {
  const response = await apiClient.get('/api/model-performance');
  return response.data;
};

/**
 * GET /api/health
 * Checks if the Flask backend and model are ready.
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

export default apiClient;
