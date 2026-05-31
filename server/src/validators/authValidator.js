/**
 * Validate login credentials
 */
export const authValidator = {
  login(body) {
    const errors = [];
    const { email, password } = body;

    // Validate email
    if (!email) {
      errors.push('Email is required.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address.');
      }
    }

    // Validate password
    if (!password) {
      errors.push('Password is required.');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    return {
      errors: errors.length > 0 ? errors : null,
      value: {
        email: email ? email.trim().toLowerCase() : '',
        password
      }
    };
  },

  register(body) {
    const errors = [];
    const { name, email, password, role } = body;

    // Validate name
    if (!name || !name.trim()) {
      errors.push('Name is required.');
    }

    // Validate email
    if (!email) {
      errors.push('Email is required.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address.');
      }
    }

    // Validate password
    if (!password) {
      errors.push('Password is required.');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    // Validate role
    const allowedRoles = ['User', 'Manager', 'Admin'];
    if (role && !allowedRoles.includes(role)) {
      errors.push(`Role must be one of: ${allowedRoles.join(', ')}`);
    }

    return {
      errors: errors.length > 0 ? errors : null,
      value: {
        name: name ? name.trim() : '',
        email: email ? email.trim().toLowerCase() : '',
        password,
        role: role || 'User'
      }
    };
  }
};

