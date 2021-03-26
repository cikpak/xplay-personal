const { runSync } = require('node-cmd')


const clearIpTables = async () => {
    const command = "sudo iptables -P INPUT ACCEPT && sudo iptables -P FORWARD ACCEPT && sudo iptables -P OUTPUT ACCEPT && sudo iptables -t nat -F && sudo iptables -t mangle -F && sudo iptables -F && sudo iptables -X"
    const { err, data } = runSync(command)
    console.log(`err`, err)
    console.log(`data`, data)
}

module.exports = {
    clearIpTables
}