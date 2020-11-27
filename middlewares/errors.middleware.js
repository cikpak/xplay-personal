const {errors} = require('../services/utils/errors')

module.exports = async (err, req, res, next) => {
  try {
      console.error(err)
      
      res.status(500).json({
        success: false,
        strStatus: "SERVER_ERROR",
        messageText: {
          status: 500,
          messageText: errors["SERVER_ERROR"]
        }
      })
  } catch (err) {
    console.error(err)
  }
};
