import { useState, useCallback } from 'react';
import axios from 'axios';

const useApi = (baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios({
        method,
        url: `${baseURL}${url}`,
        data: body,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : '',
        },
      });
      setData(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
      throw err;
    }
  }, [baseURL]);

  return { loading, error, data, request };
};

export default useApi;