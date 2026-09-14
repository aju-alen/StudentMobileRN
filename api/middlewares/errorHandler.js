export const errorHandler = (error, req, res, next) => {
  const errorStatus = error.status || 500;
  console.error(error);

  return res.status(errorStatus).json({ message: "Something went wrong" });
};
