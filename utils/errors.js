const errors = {
  //hamachi errors
  HAMACHI_LOGIN_ERROR: "Failed to login in hamachi!",
  NETWORK_ERROR: "Hamachi network error!",
  NETWORK_JOIN_ERROR: "Error on network join!",

  //zerotier errors
  INVALID_NETWORK_ID: "Invalid network id!",
  PRIVATE_NETWORK: "This network is private, make it public and try again!",
  FAILED_TO_JOIN: "Failed to join zerotier network, try again!",
  CONFIGURATION_TIMEOUT: "Network configuration time out!",
  INVALID_NETWORK: "Invalid network!",
  ZEROTIER_ERROR: "Zerotier error ocurred!",
  NETWORK_ERROR: "Zerotier network error!",
  //iptables errors

  //xbox errors
  FAILED_TO_POWER_ON: "Failed to start xbox!",

  //server errors
  SERVER_ERROR: "An error ocured on server, try again later!",
  WRONG_CLIENT: "Wrong client was specified in request!",
};

const status = {
  AVAILABLE: "Server is working!",
  SUCCESS: "Success!",
  FAILED: "Error!",
};

const strErrors = Object.keys(errors);

module.exports = {
  errors,
  status,
  strErrors,
};
