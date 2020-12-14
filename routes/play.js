const { xboxOn } = require("../services/xbox");
const { joinNetwork } = require("../services/zerotier");
const {runSync} = require("node-cmd");
const { errors, strErrors } = require("../utils/errors");


module.exports = async (req, res, next) => {
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

    runSync(`sudo bash ./forward.sh -s ${src_ip} -x ${xbox_ip}`);

    xboxOn(xbox_id, xbox_ip, (err) => {
      if (err) {
        res.status(400).json({
          success: false,
          rasp_ip: null,
          strError: err,
          messages: {
            status: 400,
            messageText: errors[err],
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
};
