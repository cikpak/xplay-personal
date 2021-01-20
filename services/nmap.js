const { runSync } = require("node-cmd");
const { regex } = require("../utils/regex");
const { getLocalIp } = require('./network')
const { strErrors } = require('../utils/errors')


const getXboxIp = () => {
  //TODO - check with pinga and xbox ID if xbox is on
  try {
    const localIp = getLocalIp();
    if (localIp in strErrors) return localIp

    const { err, data } = runSync(
      `nmap -sU -p 3074 ${localIp.slice(0, localIp.lastIndexOf("."))}.0/24`
    );

    if (err) {
      throw err;
    }

    const xbox = data.split("Nmap ").filter((host) => host.search("Microsoft") != -1 && host.search("3074/udp open") != -1)

    if (xbox.length) {
      return xbox[0].match(regex.ip)
    }

    return 'XBOX_IP_NOT_FOUND'
  } catch (err) {
    console.error(err);
    return 'XBOX_IP_NOT_FOUND'
  }
};


module.exports = {
  getXboxIp,
};
