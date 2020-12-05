module.exports = (req, res, next) => {
  console.log("-------------------------------");
  console.log(`${req.method} request on ${req.originalUrl}`);
  console.log("body :>> ", req.body);
  console.log("-------------------------------");

  next();
};
