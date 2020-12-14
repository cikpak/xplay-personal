const dgram = require('dgram')
const { ping } = require('./network')
const { delay } = require('../utils/utils')

const TRIES = process.env.XBOX_ON_TRIES || 10 
const WOL_PORT = 5050
const DELAY = process.env.XBOX_ON_DELAY || 1000 

const xboxOn = async (xboxId, xboxIp, callback) => {
    const socket = dgram.createSocket('udp4')
    let isXboxOn = false;

    try {
        let powerPayload = new Buffer.from('\x00' + String.fromCharCode(xboxId.length) + xboxId + '\x00')
        let powerPayloadLength = new Buffer.from(String.fromCharCode(powerPayload.length))
        let powerHeader = Buffer.concat([new Buffer.from('dd0200', 'hex'), powerPayloadLength, new Buffer.from('0000', 'hex')])
        let powerPacket = Buffer.concat([powerHeader, powerPayload])

        for (let i = 0; i < TRIES; i++) {
            //stop if xbox is on
            if(isXboxOn){
                return
            }

            socket.send(powerPacket, 0, powerPacket.length, WOL_PORT, xboxIp, async (err, bytes) => {
                if(await ping(xboxIp)){
                    isXboxOn = true
                    socket.close();
                    callback()
                }
            });
            //wait DELAY and continue for
            await delay(DELAY)
        }
        
        //xbox power on failed
        if (!isXboxOn) callback('FAILED_TO_POWER_ON')
    } catch (err) {
        callback('FAILED_TO_POWER_ON')
    }
}


module.exports = {
    xboxOn
}