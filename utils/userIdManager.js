const path = require('path')
const fs = require('fs');

const dataFilePath = path.join(__dirname, '../data.txt')

const saveUserId = (userId) => {
    if (!userId) {
        return false
    }

    if (!fs.existsSync(dataFilePath)) {
        fs.openSync(dataFilePath, 'w')
    }

    try {
        fs.writeFileSync(dataFilePath, JSON.stringify({ "userId": userId }))
        return true
    } catch (err) {
        console.log('err', err)
        return false
    }
}

const getUserId = () => {
    try {
        const data = fs.readFileSync(dataFilePath)

        return JSON.parse(data)
    } catch (error) {
        console.log(`error`, error)
        return undefined
    }
}


module.exports = {
    saveUserId,
    getUserId
}