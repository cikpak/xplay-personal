const errors = {
    //zerotier errors
    INVALID_NETWORK_ID: 'Invalid network id!',
    PRIVATE_NETWORK: 'This network is private, make it public and try again!',
    FAILED_TO_JOIN: 'Failed to join zerotier network, try again!',
    CONFIGURATION_TIMEOUT: 'Network configuration timeout!',
    //iptables errors

    //xbox errors
    FAILED_TO_POWER_ON: 'Failed to start xbox!',

    //server errors
    SERVER_ERROR: 'An error ocured on server, try again later!'
}

const status = {
    AVAILABLE: 'Server is working!',
    SUCCESS: 'Success!',
    FAILED: 'Error!'
}

const strErrors = Object.keys(errors)


module.exports = {
    errors,
    status,
    strErrors
}