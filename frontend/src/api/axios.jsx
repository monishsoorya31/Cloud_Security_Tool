// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://136.112.133.78/api/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 0,
});

export default api;
