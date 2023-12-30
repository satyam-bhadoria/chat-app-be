export const errorResponse = (res, err) => {
  const response = {
    status: 'error',
    message: err.message,
    errors: err.stack,
    timestamp: Date.now(),
  };
  res.status(500).json(response).end();
};

export const successResponse = (res, result) => {
  const response = {
    status: 'success',
    result,
    timestamp: Date.now(),
  };
  res.status(200).json(response).end();
};
