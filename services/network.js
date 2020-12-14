const { runSync } = require("node-cmd");
const {probe} = require('ping').promise


const getLocalIp = () => {
  try {
    const { err, data } = runSync("hostname -I");

    if (err) {
      throw err;
    }

    return data.slice(0, data.indexOf(" "));

  } catch (err) {
    console.error(err);
    return 'FAILED_TO_GET_LOCAL_IP';
  }
};


const ping = async (ip) => {
    const res = await probe(ip)

    if(res.alive){
        return true
    }

    return false
}

module.exports = {
    getLocalIp,
    ping
}
