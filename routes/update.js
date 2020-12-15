const updater = require('../services/updater')


module.exports = async (req, res, next) => {
    try {
        updater()

        res.json({
            success: true,
            message: {
                status: 200,
                strStatus: "Updated!"
            }
        })
        
    } catch (err) {
        console.error(err)
        res.json({
            success: false,
            message: {
                status: 400,
                strStatus: "Failed to update!"
            }
        })
    }
}