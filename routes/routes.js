const { Router } = require("express");
const { xboxOn } = require('../services/xbox')
const { joinNetwork } = require("../services/zerotier");
const cmd = require("node-cmd");
const router = new Router();
const { errors, strErrors, status } = require("../utils/errors");
const { getXboxIp } = require('../services/nmap')
const { body } = require("express-validator");

//middleware
const validate = require('../middlewares/fieldsValidator.middleware')

router.get("/", async (req, res, next) => {
  try {
    res.json({
      success: true,
      strStatus: "AVAILABLE",
      messageText: {
        status: 200,
        messageText: status["AVAILABLE"],
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/xbox-ip', async (req, res, next) => {
  try {
    const xboxIp = getXboxIp()

    if (strErrors.indexOf(xboxIp)) {
      return res.status(400).json({
        success: false,
        strStatus: xboxIp,
        xbox_ip: null,
        messageText: {
          status: 400,
          messageText: status[xboxIp],
        },
      });
    }

    return res.json({
      success: true,
      strStatus: "SUCCESS",
      xbox_ip: xboxIp,
      messageText: {
        status: 200,
        messageText: status["SUCCESS"],
      },
    });
  } catch (err) {
    console.error(err);
    next(err)
  }
})

//power-on xbox
router.post("/xbox-on", [
  body('xbox_ip').isIP(4).withMessage('IP field must contain a valid ip adress!'),
  body('xbox_id').notEmpty({ ignore_whitespace: true }).withMessage('Id field must contain a valid xbox console ID!'),
  validate
], (req, res, next) => {
  try {
    const { xbox_ip, xbox_id } = req.body;

    xboxOn(xbox_id, xbox_ip, (err) => {
      if (!err) {
        return res.json({
          success: true,
          strStatus: "SUCCESS",
          messages: {
            status: 200,
            messageText: status["SUCCESS"],
          },
        });
      }

      res.status(400).json({
        success: false,
        strStatus: err,
        messages: {
          status: 400,
          messageText: errors[err],
        },
      });
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//join zerotier network
router.post("/join", [
  body('zerotier_network_id').isLength({ min: 16, max: 16 }).withMessage("Zerotier id field must contain a valid zerotier id!"),
  validate
], async (req, res, next) => {
  try {
    const zerotierIp = await joinNetwork(req.body.zerotier_network_id);

    if (strErrors.indexOf(zerotierIp) !== -1) {
      return res.status(400).json({
        success: false,
        rasp_ip: null,
        strStatus: zerotierIp,
        messages: {
          status: 400,
          messageText: errors[zerotierIp],
        },
      });
    }

    res.json({
      success: true,
      rasp_ip: zerotierIp,
      strStatus: "SUCCESS",
      messages: {
        status: 200,
        messageText: status["SUCCESS"],
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//setup forward.sh
router.post("/iptable-allow", [
  body('xbox_ip').isIP(4).withMessage('IP field must contain a valid ip adress!'),
  body('src_ip').isIP(4).withMessage('Source ip field must contain a valid ip adress!'),
], (req, res, next) => {
  try {
    const { xbox_ip, src_ip } = req.body;
    const command = `sudo bash ./forward.sh -s ${src_ip} -x ${xbox_ip}`;
    const { err, data } = cmd.runSync(command);

    if (!err) {
      res.json({
        success: true,
        strStatus: "SUCCESS",
        messages: {
          status: 200,
          messageText: status["SUCCESS"],
        },
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});


//play
router.post("/play", [
  body('xbox_ip').isIP(4).withMessage('IP field must contain a valid ip adress!'),
  body('src_ip').isIP(4).withMessage('Source ip field must contain a valid ip adress!'),
  body('zerotier_network_id').isLength({ min: 16, max: 16 }).withMessage("Zerotier id field must contain a valid zerotier id!"),
  body('xbox_id').notEmpty({ ignore_whitespace: true }).withMessage('Id field must contain a valid xbox console ID!'),
  validate],
  require('./play')
);

// router.post('/update', [], require('./update'))

module.exports = router;
