const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const resUnauthorized = (msg = "Not authorized!") => {
      res.status(401).json({
        message: {
          status: 401,
          msg,
        },
      });
    };

    try {
      const token = req.headers["authorization"].split(" ")[1];

      if (!token) {
        resUnauthorized("JWT token missing!");
      }

      try {
        jwt.verify(token, secret, async (err, payload) => {
          console.log(payload);
          if (!err) {
            if (payload) {
              req.payload = payload;
            }
            next();
          } else {
            console.log(err);
            resUnauthorized();
          }
        });
      } catch (e) {
        console.error(e);
        resUnauthorized();
      }
    } catch (e) {
      resUnauthorized();
    }
  } catch (err) {}
};
