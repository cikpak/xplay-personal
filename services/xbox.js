const Smartglass = require('xbox-smartglass-core-node')
const { getRaspberryLocalIp } = require('./network')
const { strErrors } = require('../utils/errors')
const { clearIpTables } = require('./iptables');
const { regex } = require("../utils/regex");
const { runSync } = require("node-cmd");

//scan local network with nmap and try to find xbox ip
const getXboxIp = () => {
    //TODO - add smartglass functional and connect to console to get console info
    try {
        const localIp = getRaspberryLocalIp();
        if (localIp in strErrors) return localIp

        //run nmap command
        const { err, data } = runSync(
            `sudo nmap -sU -p 3074 ${localIp.slice(0, localIp.lastIndexOf("."))}.0/24`
        );

        if (err) { throw err; }

        //select from nmap result the xbox result
        const xbox = data.split("Nmap ").filter((host) => host.search("Microsoft") != -1 && host.search("3074/udp open") != -1)

        //if xbox is in nmap result then select ip with regex
        if (xbox.length) { return xbox[0].match(regex.ip)[0] }

        return 'XBOX_IP_NOT_FOUND'
    } catch (err) {
        console.error(err);
        return 'XBOX_IP_NOT_FOUND'
    }
};


//receive xbox id and call xboxOn for all ips in local network
const tryWakeUp = async (xboxId, callback) => {
    //clear ip tables to allow raspberry make requests in local network
    await clearIpTables()

    const raspIp = getRaspberryLocalIp();

    //get base ip, from 192.168.100.132 -> 192.168.100
    const baseIp = raspIp.slice(0, (raspIp.lastIndexOf('.') + 1))

    let success = false
    let xboxData = null

    //start a cycle to generate ips, from 1 to 255
    for (i = 1; i < 255 && !success; i++) {
        try {
            //try to power on xbox for each ip
            await xboxOn(xboxId, `${baseIp}${i}`, 5, 50, (err, data) => {
                if (!err) {
                    success = true
                    xboxData = data
                }
            })
        } catch (err) { }
    }

    if (success && xboxData) {
        callback(null, xboxData)
    } else {
        callback("Can't find xbox in local network!", null)
    }
}

//power on xbox with smartglass functional 
const xboxOn = async (...arguments) => {
    //ARGUMENTS:
    //base:      xboxIp, xboxId, callback function
    //optional:  xboxIp, xboxId, number of power on tries, delay between tries, callback function

    //init default 3 arguments
    const xboxId = arguments[0]
    const xboxIp = arguments[1]
    let callback = arguments[2]

    let DELAY = process.env.XBOX_ON_DELAY
    let TRIES = process.env.XBOX_ON_TRIES

    //init 2 more arguments if function got 5 arguments
    if (arguments.length === 5) {
        TRIES = arguments[2]
        DELAY = arguments[3]
        callback = arguments[4]
    }

    const sgClient = Smartglass()

    try {
        //power on xbox
        const response = await sgClient.powerOn({
            live_id: xboxId,
            tries: TRIES,
            ip: xboxIp,
            delay: DELAY
        })

        //if powerOn was success -> connect to console and get xbox ID
        if (response.status === 'success') {
            await sgClient.connect(xboxIp)

            //get xbox id from smartglass connection
            const xboxId = sgClient._console._liveid
            //send response if no errors
            callback(null, { xboxId, xboxIp })
        }
    } catch (err) {
        if (err.status === 'error_discovery') {
            console.log(`Failed to power on xbox at ${xboxIp}`)
        } else {
            console.log(`Unknown error at ${xboxIp}`)
        }

        callback('FAILED_TO_POWER_ON')
    }
}

getXboxData = (xboxIp, callback) => {
    const sgClient = Smartglass()
    sgClient.connect(xboxIp)
        .then(() => {
            callback(null, { xboxId: sgClient._console._liveid, xboxIp })
        })
        .catch(err => {
            console.log(`err`, err)
            callback('Failed to get xbox ID!', null)
        })
}

module.exports = {
    xboxOn,
    getXboxData,
    getXboxIp,
    tryWakeUp
}