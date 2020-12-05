const { Router } = require("express");
const Xbox = require("xbox-on");
const { joinNetwork, getZerotierIp } = require("../services/zerotier");
const cmd = require("node-cmd");
const router = new Router();
const { errors, strErrors, status } = require("../utils/errors");

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

//power-on xbox
router.post("/xbox-on", [], (req, res, next) => {
  try {
    const { xbox_ip, xbox_id } = req.body;
    const xbox = new Xbox(xbox_ip, xbox_id);

    const options = {
      tries: process.env.XBOX_POWER_ON_TRIES,
      delay: 1000,
      waitForCallback: true,
    };

    xbox.powerOn(options, (err) => {
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
        strStatus: "FAILED_TO_POWER_ON",
        messages: {
          status: 400,
          messageText: errors["FAILED_TO_POWER_ON"],
        },
      });
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//join zerotier network
router.post("/join", [], async (req, res, next) => {
  try {
    const zerotierIp = await joinNetwork(req.body.zerotier_network_id);

    if (strErrors.indexOf(zerotierIp)) {
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
router.post("/iptable-allow", [], (req, res, next) => {
  try {
    const { xbox_ip, src_ip } = req.body;

    const command = `sudo bash ./forward.sh -s ${src_ip} -x ${xbox_ip}`;

    const { err, data } = cmd.runSync(command);
    console.log("data :>> ", data);

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
router.post("/play", [], async (req, res, next) => {
  try {
    const { zerotier_network_id, xbox_ip, src_ip, xbox_id } = req.body;

    const zerotierIp = await joinNetwork(zerotier_network_id);

    if (strErrors.indexOf(zerotierIp) != -1) {
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

    const command = `sudo bash ./forward.sh -s ${src_ip} -x ${xbox_ip}`;
    const { err, data } = cmd.runSync(command);

    const xbox = new Xbox(xbox_ip, xbox_id);

    const options = {
      tries: process.env.XBOX_POWER_ON_TRIES,
      delay: 500,
      waitForCallback: false,
    };

    xbox.powerOn(options, (err) => {
      if (err) {
        res.status(400).json({
          success: false,
          rasp_ip: null,
          strError: "FAILED_TO_POWER_ON",
          messages: {
            status: 400,
            messageText: errors["FAILED_TO_POWER_ON"],
          },
        });
      }

      return res.json({
        success: true,
        rasp_ip: zerotierIp,
        strStatus: "READY_TO_PLAY",
        messages: {
          status: 200,
          messageText: "Ready to play!",
        },
      });
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
