const errors = {
    //zerotier errors
    INVALID_NETWORK_ID: 'Invalid network id!',
    PRIVATE_NETWORK: 'This network is private, make it public and try again!',
    FAILED_TO_JOIN: 'Failed to join zerotier network, try again!',
    CONFIGURATION_TIMEOUT: 'Network configuration timeout!',
    //iptables errors
    
}

const strErrors = Object.keys(errors)


module.exports = {
    errors,
    strErrors
}