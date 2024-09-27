require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const path = require('path');
const { addRecord, getAllRecords, deleteRecord, updateRecord } = require('./controllers/Record');
const { getConfigParameters, getAppAccessToken, getUserInfo } = require('./controllers/GetAccessToken');
const axios = require('axios')

const app = express();
const port = process.env.PORT || 3001;
const NodeCache = require("node-cache");
const myCache = new NodeCache();

app.use(cors());
app.use(express.json());

// CRUD records
app.post('/add-record', addRecord);
app.get('/get-record', getAllRecords);
app.put('/update-record/:id', updateRecord);
app.delete('/delete-record/:id', deleteRecord)

// Function for jumping to login page first
app.get("/get-user-access-token", async (req, res) => {
    const larkOAuthUrl = `https://open.larksuite.com/open-apis/authen/v1/authorize?app_id=${process.env.APP_ID}&redirect_uri=http://localhost:3000&scope=bitable:app&state=RANDOMSTATE`;
    res.redirect(larkOAuthUrl);
});

app.post('/callback', async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ message: 'Authorization code is missing' });
    }

    axios.post("https://open.larksuite.com/open-apis/authen/v1/access_token", {
        code: code,
        grant_type: "authorization_code",
        app_id: process.env.APP_ID,
        app_secret: process.env.APP_SECRET,
    })
        .then((response) => {
            user_access_token = "Bearer " + response.data.data.access_token;
            user_id = response.data.data.open_id;
            refresh_token = response.data.data.refresh_token;

            console.log("user id: " + user_id);
            console.log("refresh token: " + refresh_token);
            console.log("access token : " + user_access_token);

            myCache.set("refresh_token", response.data.data.refresh_token)
            res.json(response.data);
        })
        .catch((error) => {
            res.status(500).json({ error: "Failed to fetch access token" });
        });
});

// Route to get user info after the callback
app.post('/api/callback', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        console.log('message', "fail")
        return res.status(400).json({ message: 'Authorization code is missing' });
    }

    try {
        const userInfo = await getUserInfo(code);
        console.log("User Info:", userInfo);
        return res.json(userInfo);
    } catch (err) {
        res.status(500).json({ message: 'Error getting user info', error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
