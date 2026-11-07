// import axios from "axios";

// const axiosClient = axios.create({
//     baseURL: "https://localhost:7174/api",
//     headers: {
//         "Content-Type": "application/json"
//     }
// });

// export default axiosClient;

import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://localhost:7174/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// Attach JWT token to every API request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle expired or invalid JWT tokens
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url?.toLowerCase() || "";

        // Don't redirect when login credentials are incorrect
        const isLoginRequest = requestUrl.includes("/auth/login");

        if (status === 401 && !isLoginRequest) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Redirect only if not already on login page
            if (window.location.pathname !== "/login") {
                window.location.assign("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
