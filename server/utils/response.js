export const successResponse = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

export const errorResponse = (res, code, message, status = 400) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
