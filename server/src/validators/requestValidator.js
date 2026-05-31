/**
 * Validate request operations
 */
export const requestValidator = {
  create(body) {
    const errors = [];
    const { title, description, category, priority } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Title is required and must be a valid string.');
    } else if (title.length > 255) {
      errors.push('Title cannot exceed 255 characters.');
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.push('Description is required and must be a valid string.');
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      errors.push('Category is required.');
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    if (!priority || !validPriorities.includes(priority)) {
      errors.push(`Priority must be one of: ${validPriorities.join(', ')}.`);
    }

    return {
      errors: errors.length > 0 ? errors : null,
      value: {
        title: title ? title.trim() : '',
        description: description ? description.trim() : '',
        category: category ? category.trim() : '',
        priority
      }
    };
  },

  updateStatus(body) {
    const errors = [];
    const { status, comments } = body;

    const validStatuses = ['Submitted', 'Approved', 'Rejected', 'Needs Clarification', 'Closed', 'Reopened'];
    if (!status || !validStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}.`);
    }

    if (comments && typeof comments !== 'string') {
      errors.push('Comments must be a text value.');
    }

    return {
      errors: errors.length > 0 ? errors : null,
      value: {
        status,
        comments: comments ? comments.trim() : ''
      }
    };
  }
};
