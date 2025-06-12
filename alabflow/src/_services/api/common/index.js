import axios from "axios";

const apiInstance = axios.create({

  baseURL: "https://api-alabflow.alab.com.pl/api",
  // baseURL: "https://10.1.252.81:18138//api/",
  // baseURL: "https://10.1.252.81:28138//api/",
});


// Interceptor dodający Authorization automatycznie
apiInstance.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiInstance;
