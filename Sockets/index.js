const { strErrors } = require('../utils/errors')
const joinZerotierNetwork = require('../services/zerotier').joinNetwork;
const joinTailscaleNetwork = require('../services/tailscale').joinNetwork
const { getRaspberryLocalIp } = require('../services/network')
const { getXboxIp, getXboxData, xboxOn, tryWakeUp } = require('../services/xbox')
const cmd = require("node-cmd");

const sockets = (userId, clientSocket) => {
    const socket = require('socket.io-client').connect(process.env.XPLAY_SERVER, {
        query: {
            userId,
        },
    })

    socket.on('connect_error', (err) => {
        console.log('err on connect', err.message)
    })

    socket.on('connect', () => {
        console.log('---socket connected to server---')
    });

    //handle zerotier join event
    socket.on('join zerotier', async (data, cb) => {
        const { networkId } = data
        const ip = await joinZerotierNetwork(networkId)

        if (ip && strErrors.indexOf(ip) === -1) {
            cb({ success: true, msg: 'Join success!', ip })
        } else {
            cb({ success: false, msg: 'Join failed!', ip })
        }
    })

    //handle tailscale join event
    socket.on('join tailscale', async (data, cb) => {
        const { networkId } = data
        const ip = await joinTailscaleNetwork(networkId)

        if (ip && strErrors.indexOf(ip) === -1) {
            cb({ success: true, msg: 'Join success!', ip })
        } else {
            cb({ success: false, msg: 'Join failed!', ip })
        }
    })

    //handle get raspberry local ip
    socket.on('get raspberry local ip', async (data, cb) => {
        console.log('trying to get rasp local ip ')

        try {
            const raspberryIp = getRaspberryLocalIp()

            if (raspberryIp && strErrors.indexOf(raspberryIp) === -1) {
                return cb({ success: true, msg: 'Success to get rasp ip!', raspberryIp })
            }

            console.log('data :>> ', data);

            throw 'Failed to get rasp ip!'
        } catch (err) {
            cb({ success: false, msg: err, raspberryIp: null })
        }
    })

    //handle get xbox ip
    socket.on('get xbox data', async (data, cb) => {
        console.log(`get xbox data`)
        let xboxIp = data.xboxIp

        try {
            if (!xboxIp) {
                console.log('getting xbox ip')
                xboxIp = getXboxIp()
            }

            if (xboxIp && strErrors.indexOf(xboxIp) === -1) {

                getXboxData(xboxIp, (err, xboxId) => {
                    if (err) {
                        console.log(`err`, err)
                        return cb({ success: false, msg: err, xboxId: null, xboxIp })
                    } else {
                        console.log(`xboxIp: ${xboxIp} --- xboxId: ${xboxId}`)
                        return cb({ success: true, msg: 'Success!', xboxId, xboxIp })
                    }
                })

                return
            }

            throw 'Failed to get xbox ip!'
        } catch (err) {
            console.log(`err `, err)
            cb({ success: false, msg: err, xboxIp: null, xboxId: null })
        }
    })

    socket.on('raspberry reboot', async (data, cb) => {
        const command = `sudo reboot`
        setTimeout(() => { cmd.runSync(command) }, 2000)

        cb({
            success: true,
            status: 200,
            msg: 'Reboot success!'
        })
    })

    socket.on('xbox find start', (data, cb) => {
        const { xboxId } = data

        //respond to main server 
        cb({ success: true })

        //call xbox find function
        tryWakeUp(xboxId, (err, xboxData) => {
            if (err) {
                //emit response direct to desktop client
                clientSocket.emit('xbox find finish', { success: false, msg: err })
            }
            clientSocket.emit('xbox find finish', { success: true, msg: `Xbox was find at ${xboxData.xboxIp}!`, ...xboxData })
        })
    })

    return socket
}

module.exports = sockets