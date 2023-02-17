const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/integration-token', (req, res) => {

    const tokenData = {
        // Identifier of user or organization.
        id: 'user_id',
        // Human-readable name (it will simplify troubleshooting)
        name: 'Integration.app',
        // (optional) Any user fields you want to attach to your user.
        fields: {
        }
    }

    // Your workspace key and secret.
    // You can find them on the Settings page.
    const WORKSPACE_KEY = ''
    const WORKSPACE_SECRET = ''
    const options = {
        issuer: WORKSPACE_KEY,
        // To prevent token from being used for too long
        expiresIn: 7200,
    }

    const token = jwt.sign(tokenData, WORKSPACE_SECRET, options)

    res.send(JSON.stringify(token))
})

app.listen(8080)

