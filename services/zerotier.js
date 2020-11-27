const cmd = require("node-cmd");
const { errors, strErrors } = require("./utils/errors");


function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const getZerotierIp = async (count=0) => {
  try {
    const { err, data } = cmd.runSync("sudo zerotier-cli listnetworks");
    if (err) {
      throw err;
    }

    const splitedData = data
      .split("\n")
      .filter((piece) => piece !== "")[1]
      .split(" ");

    if (splitedData[6] === "PRIVATE") {
      throw "PRIVATE_NETWORK";
    }

    if (splitedData[0] === "200" && splitedData[5] === "OK") {
      return splitedData[8].split("/")[0];
    } else {
      if(count === 10){
        return 'CONFIGURATION_TIMEOUT'
      }
      await delay(1000);
      return getZerotierIp(++count);
    }
  } catch (err) {
    console.error(err);
    return err;
  }
};

const leaveNetwork = (network) => {
  //extract network id from network
  const id = network.split(" ")[2];

  try {
    const { err, data } = cmd.runSync(`sudo zerotier-cli leave ${id}`);
    console.log('data :>> ', data);
    if (!err) {
      return data;
    }

    throw err;
  } catch (err) {
    console.error(err);
    return err;
  }
};

const checkNetworks = () => {
  const { err, data } = cmd.runSync("sudo zerotier-cli listnetworks");

  if (!err) {
    const networks = data.split("\n").filter((network) => network !== "");
    //TO-DO: refactor to leave more than one network
    if (networks.length > 2) leaveNetwork(networks[1]);
  }
};

const checkNetworkAvailability = async () => {
  const { err, data } = cmd.runSync("sudo zerotier-cli listnetworks");

  if (!err) {
    const networks = data.split("\n").filter((network) => network !== "");

    //check if network is not private
    const splitData = networks[1].split(" ");

    if (splitData[6] === "PRIVATE") {
      if (splitData[5] === "REQUESTING_CONFIGURATION") {
        await delay(1000)
        return checkNetworkAvailability()
      }

      leaveNetwork(networks[1]);
      return "PRIVATE_NETWORK";
    }
    return "AVAILABLE";
  }
};

const joinNetwork = async (networkId) => {
  checkNetworks();
  //join network
  try {
    if (networkId !== "") {
      const { err, data } = cmd.runSync(`sudo zerotier-cli join ${networkId}`);

      if (!err) {
        const networkStatus = await checkNetworkAvailability();

        if (networkStatus === "AVAILABLE") {
          return data;
        } else {
          return networkStatus;
        }
      }
    } else {
      throw "INVALID_NETWORK_ID";
    }
  } catch (err) {
    console.error(err);
    return err;
  }
};

module.exports = {
  joinNetwork,
  getZerotierIp,
};
