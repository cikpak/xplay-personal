const { Router } = require("express");
const Xbox = require("xbox-on");
const { joinNetwork, getZerotierIp } = require("../services/zerotier");
const cmd = require("node-cmd");
const router = new Router();
const { errors, strErrors } = require("../services/utils/errors");

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
      if (err) {
        return res.json({
          successs: true,
          messages: {
            status: 400,
            messageText: "Xbox power on success!",
          },
        });
      }

      res.status(400).json({
        successs: false,
        strError: 'FAILED_TO_POWER_ON',
        messages: {
          status: 400,
          messageText: errors['FAILED_TO_POWER_ON'],
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
    const { zerotier_network_id } = req.body;
    const result = await joinNetwork(zerotier_network_id);

    if (result in strErrors) {
      return res.status(400).json({
        success: false,
        strError: result,
        messages: {
          status: 400,
          messageText: errors[result],
        },
      });
    }

    if (result.trim() !== "200 join OK") {
      res.status(400).json({
        success: false,
        strError: "FAILED_TO_JOIN",
        messages: {
          status: 200,
          messageText: errors["FAILED_TO_JOIN"],
        },
      });
    }

    const zerotierIp = await getZerotierIp();

    res.json({
      success: true,
      rasp_ip: zerotierIp,
      messages: {
        status: 200,
        messageText: "Successfully joined!",
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
        successs: true,
        messages: {
          status: 200,
          messageText: "Iptable was configured!",
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
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
