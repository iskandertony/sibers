import axios from "axios";

/** Axios instance for plain HTTP calls. */
export const http = axios.create({
  timeout: 15000,
});

http.interceptors.response.use(
  r => r,
  (err) => {
    // Keep it simple: rethrow and let UI handlers display messages.
    return Promise.reject(err);
  }
);
