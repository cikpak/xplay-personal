const cmd = require("node-cmd");
const { Router } = require("express");
const { runSync } = require('node-cmd')
const { joinNetwork } = require('../services/tailscale')
const { xboxOn } = require('../services/xbox')
const { errors, strErrors, status } = require("../utils/errors");
const { getXboxIp } = require('../services/xbox')
const { body } = require("express-validator");
const validate = require('../middlewares/fieldsValidator.middleware')

const router = new Router()


//join tailscale network
router.post('/join', async (req, res, next) => {
	try {
		const tailscaleIp = joinNetwork(req.body.tailscale_id);

		if (strErrors.indexOf(tailscaleIp) !== -1) {
			return res.status(400).json({
				success: false,
				rasp_ip: null,
				strStatus: zerotierIp,
				messages: {
					status: 400,
					messageText: errors[tailscaleIp],
				},
			});
		}

		res.json({
			success: true,
			rasp_ip: tailscaleIp,
			strStatus: "SUCCESS",
			messages: {
				status: 200,
				messageText: status["SUCCESS"],
			},
		});
	} catch (err) {
		console.error(err);
		next(err);
	}
})

//TODO - add verification for every body field
router.post('/play',
	async (req, res, next) => {
		try {
			console.log('req.body', req.body)
			const { tailscale_id, xbox_ip, src_ip, xbox_id, rasp_local_ip, rasp_vpn_ip } = req.body;

			const tailscaleIp = await joinNetwork(tailscale_id);
			console.log('raspberry tailscaleIp', tailscaleIp)

			if (strErrors.indexOf(tailscaleIp) !== -1) {
				return res.status(400).json({
					success: false,
					rasp_ip: null,
					strStatus: tailscaleIp,
					messages: {
						status: 400,
						messageText: errors[tailscaleIp],
					},
				});
			}

			runSync(`sudo bash ./forward.sh -s ${src_ip} -x ${xbox_ip} -l ${rasp_local_ip} -z ${rasp_vpn_ip}`);

			xboxOn(xbox_id, xbox_ip, (err) => {
				if (err) {
					res.status(400).json({
						success: false,
						rasp_ip: null,
						strError: err,
						messages: {
							status: 400,
							messageText: errors[err],
						},
					});
				}

				return res.json({
					success: true,
					rasp_ip: tailscaleIp,
					strStatus: "READY_TO_PLAY",
					messages: {
						status: 200,
						messageText: "Ready to play!",
					},
				});
			});
		} catch (err) {
			console.error(err);
			next(err);
		}
	}
)


//configure iptables
router.post("/iptable-allow",
	[
		body('xbox_ip').isIP(4).withMessage('IP field must contain a valid ip adress!'),
		body('src_ip').isIP(4).withMessage('Source ip field must contain a valid ip adress!'),
	],
	(req, res, next) => {
		try {
			const { xbox_ip, src_ip, rasp_local_ip, rasp_vpn_ip } = req.body;
			const command = `sudo bash ./forward.sh -s ${src_ip} -x ${xbox_ip} -l ${rasp_local_ip} -z ${rasp_vpn_ip}`;
			const { err, data } = cmd.runSync(command);

			if (!err) {
				res.json({
					success: true,
					strStatus: "SUCCESS",
					messages: {
						status: 200,
						messageText: status["SUCCESS"],
					},
				});
			}
		} catch (err) {
			console.error(err);
			next(err);
		}
	});


//get xbox ip
router.get('/xbox-ip', async (req, res, next) => {
	try {
		const xboxIp = getXboxIp()

		if (strErrors.indexOf(xboxIp) !== -1) {
			return res.status(400).json({
				success: false,
				strStatus: xboxIp,
				xbox_ip: null,
				messageText: {
					status: 400,
					messageText: status[xboxIp],
				},
			});
		}

		return res.json({
			success: true,
			strStatus: "SUCCESS",
			xbox_ip: xboxIp,
			messageText: {
				status: 200,
				messageText: status["SUCCESS"],
			},
		});
	} catch (err) {
		console.error(err);
		next(err)
	}
})


//power on xbox
router.post("/xbox-on",
	[
		body('xbox_ip').isIP(4).withMessage('IP field must contain a valid ip adress!'),
		body('xbox_id').notEmpty({ ignore_whitespace: true }).withMessage('Id field must contain a valid xbox console ID!'),
		validate
	],
	(req, res, next) => {
		try {
			const { xbox_ip, xbox_id } = req.body;

			xboxOn(xbox_id, xbox_ip, (err) => {
				if (!err) {
					return res.json({
						success: true,
						strStatus: "SUCCESS",
						messages: {
							status: 200,
							messageText: status["SUCCESS"],
						},
					});
				}

				res.status(400).json({
					success: false,
					strStatus: err,
					messages: {
						status: 400,
						messageText: errors[err],
					},
				});
			});
		} catch (err) {
			console.error(err);
			next(err);
		}
	});

module.exports = router