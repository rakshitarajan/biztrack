// Example: Function to validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Example: Function to check if a field is required and not empty
  export const isRequired = (value) => {
    return value && value.trim() !== '';
  };
  
  // Add more validation functions as needed