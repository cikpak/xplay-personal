const socketClient = require('socket.io-client')
const { strErrors } = require('../utils/errors')
const joinZerotierNetwork = require('../services/zerotier').joinNetwork;
const joinTailscaleNetwork = require('../services/tailscale').joinNetwork
const { getRaspberryLocalIp } = require('../services/network')
const { getXboxIp } = require('../services/nmap')

const sockets = (userId) => {
    const socket = socketClient.connect(process.env.XPLAY_SERVER, {
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
        console.log('networkId', networkId)
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
            console.log('raspberryIp', raspberryIp)

            if (raspberryIp && strErrors.indexOf(raspberryIp) === -1) {
                return cb({ success: true, msg: 'Success to get rasp ip!', raspberryIp })
            }

            throw 'Failed to get rasp ip!'
        } catch (err) {
            cb({ success: false, msg: err, raspberryIp: null })
        }
    })

    //handle get xbox ip
    socket.on('get xbox ip', async (data, cb) => {
        console.log('trying to get xbox ip ')

        try {
            const xboxIp = getXboxIp()
            console.log('xboxIp', xboxIp)

            if (xboxIp && strErrors.indexOf(xboxIp) === -1) {
                return cb({ success: true, msg: 'Success to get xbox ip!', xboxIp })
            }

            throw 'Failed to get xbox ip!'
        } catch (err) {
            cb({ success: false, msg: err, xboxIp: null })
        }
    })

    //gandle get xbox id 
    //TODO - add this function
    // socket.on('get xbox id', async (data, cb) => {
    //     console.log('trying to get xbox ip ')

    //     try {
    //         const xboxIp = getXboxIp()
    //         console.log('xboxIp', xboxIp)

    //         if (xboxIp && strErrors.indexOf(xboxIp) === -1) {
    //             return cb({ success: true, msg: 'Success to get xbox ip!', xboxIp })
    //         }

    //         throw 'Failed to get xbox ip!'
    //     } catch (err) {
    //         cb({ success: false, msg: err, xboxIp: null })
    //     }
    // })

    return socket
}

module.exports = sockets