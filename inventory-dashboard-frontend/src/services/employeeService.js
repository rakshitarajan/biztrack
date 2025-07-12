import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// Corrected base path to /api/users

export const addEmployee = async (employeeData) => {
  // NOTE: Requires the NEW 'POST /api/users' admin-only route in the backend.
  try {
    const token = localStorage.getItem('authToken');
    // Path: /api/users - CORRECTED
    const response = await axios.post(`${API_BASE_URL}/api/users`, employeeData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding employee:', error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error; // Re-throw for component error handling
  }
};

export const getAllEmployees = async () => {
  try {
    const token = localStorage.getItem('authToken');
    // Path: /api/users - CORRECTED
    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all employees:', error);
    throw error; // Re-throw for component error handling
  }
};

export const getEmployeeById = async (employeeId) => {
  // NOTE: Requires the NEW 'GET /api/users/:id' route in the backend.
  try {
    const token = localStorage.getItem('authToken');
    // Path: /api/users/:id - CORRECTED
    const response = await axios.get(`${API_BASE_URL}/api/users/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee with ID ${employeeId}:`, error);
    throw error; // Re-throw for component error handling
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  // NOTE: Requires the NEW 'PUT /api/users/:id' route in the backend.
  // Ensure employeeData does not contain the id itself if the backend doesn't expect it in the body.
  // Pass employeeId separately for the URL.
  try {
    const token = localStorage.getItem('authToken');
     // Path: /api/users/:id - CORRECTED
    const response = await axios.put(`${API_BASE_URL}/api/users/${employeeId}`, employeeData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating employee with ID ${employeeId}:`, error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error; // Re-throw for component error handling
  }
};

export const deleteEmployee = async (employeeId) => {
    // NOTE: Uses existing 'DELETE /api/users/:id' route.
    try {
      const token = localStorage.getItem('authToken');
      // Path: /api/users/:id - CORRECTED
      const response = await axios.delete(`${API_BASE_URL}/api/users/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // Usually just a success message like { message: 'User removed' }
    } catch (error) {
      console.error(`Error deleting employee with ID ${employeeId}:`, error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error; // Re-throw for component error handling
    }
  };