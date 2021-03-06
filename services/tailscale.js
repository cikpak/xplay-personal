const { runSync } = require('node-cmd')

//get device ip in tailscale network
const getDeviceIp = () => {
    try {
        const command = `sudo tailscale status --json`
        const { err, data } = runSync(command)

        if (err) {
            console.log('err', err)
            return undefined
        }

        return JSON.parse(data)['Self']['TailAddr']
    } catch (err) {
        console.error('------------------------', err)
        return undefined
    }
}

//join tailscale network and return device ip
const joinNetwork = (networkId) => {
    try {
        const command = `sudo tailscale up --authkey ${networkId}`
        const { err, data } = runSync(command)

        if (data) return undefined

        return getDeviceIp()
    } catch (err) {
        console.error('------------------------', err)
        return undefined
    }
}


module.exports = {
    joinNetwork
}