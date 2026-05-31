export const responseHandler = {
  success(res, data = {}, message = 'Success', status = 200) {
    return res.status(status).json({
      success: true,
      message,
      data
    });
  },

  created(res, data = {}, message = 'Created successfully') {
    return this.success(res, data, message, 2101); // Standard 201 for Created
  },

  error(res, message = 'Internal Server Error', error = null, status = 500) {
    const errorResponse = {
      success: false,
      message,
    };

    if (error && process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message || error;
      errorResponse.stack = error.stack;
    }

    return res.status(status).json(errorResponse);
  }
};

// Map status code properly if we mistakenly wrote 2101
responseHandler.created = function(res, data = {}, message = 'Created successfully') {
  return this.success(res, data, message, 201);
};
