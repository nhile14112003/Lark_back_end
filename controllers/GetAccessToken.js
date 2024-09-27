const axios = require('axios');
const NodeCache = require("node-cache");
const myCache = new NodeCache()

// Function for getting tenant access token

const refreshAccessToken = async () => {

    const app_access_token = await getAppAccessToken();

    try {
        const response = await axios.post(
            "https://open.larksuite.com/open-apis/authen/v1/refresh_access_token",
            {
                grant_type: "refresh_token",
                refresh_token: myCache.get('refresh_token'),
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${app_access_token}`,
                },
            }
        );

        return response.data.data.access_token;
    } catch (error) {
        console.error("Error refreshing access token:", error);
    }
};

const getTenantAccessToken = async (req, res) => {

    try {
        const response = await axios.post(`${process.env.LARK_HOST}${process.env.TENANT_ACCESS_TOKEN_URI}`, {
            app_id: process.env.APP_ID,
            app_secret: process.env.APP_SECRET,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.tenant_access_token;
    } catch (error) {
        console.error('Error getting tenant access token:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Function for getting ticket
const getTicket = async () => {
    const tenant_access_token = await getTenantAccessToken();

    try {
        const response = await axios.post(`${LARK_HOST}/open-apis/jssdk/ticket/get`, {}, {
            headers: {
                Authorization: `Bearer ${tenant_access_token}`,
                'Content-Type': 'application/json',
            }
        });

        return response.data.data.ticket || '';
    } catch (error) {
        console.error("Error getting ticket:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Function for getting config parameters
const getConfigParameters = async (req, res) => {
    try {

        const url = req.query.url;

        if (!url) {
            return res.status(400).json({ message: 'URL parameter is missing' });
        }

        const ticket = await getTicket();

        const timestamp = Date.now();

        const verifyStr = `jsapi_ticket=${ticket}&noncestr=${process.env.NONCE_STR}&timestamp=${timestamp}&url=${url}`;

        const signature = crypto.createHash('sha1').update(verifyStr).digest('hex');

        // Return the parameters required for authentication to the front-end
        return res.json({
            appid: process.env.APP_ID,
            signature: signature,
            noncestr: process.env.NONCE_STR,
            timestamp: timestamp,
        });

    } catch (error) {
        console.error('Error in get_config_parameters:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Function for getting app access token
const getAppAccessToken = async () => {
    try {
        const response = await axios.post(`${process.env.LARK_HOST}${process.env.APP_ACCESS_TOKEN_URI}`, {
            app_id: process.env.APP_ID,
            app_secret: process.env.APP_SECRET
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.data.code !== 0) {
            throw new Error(`Failed to fetch app access token: ${response.data.msg}`);
        }
        console.log("App Access Token Response:", response.data);
    } catch (error) {
        console.error("Error getting app access token:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Function for getting user access token
const getUserAccessToken = async (code) => {

    const data = {
        grant_type: "authorization_code",
        code: code,
    };

    try {
        const response = await axios.post('https://open.larksuite.com/open-apis/authen/v1/oidc/access_token', data, {
            headers: {
                'Authorization': `Bearer ${appAccessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data.code !== 0) {
            throw new Error(`Failed to generate user access token: ${response.data.message}`);
        }
        console.log("User Access Token Response:", response.data);
    } catch (error) {
        console.error("Error fetching access token:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Function for getting user info
const getUserInfo = async (code) => {

    const userAccessToken = await getUserAccessToken(code)

    try {
        const response = await axios.get(`${process.env.LARK_HOST}${process.env.USER_INFO_URI}`, {
            headers: {
                'Authorization': `Bearer ${userAccessToken}`,
            }
        });
        console.log("User Info Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user info:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// Exporting all functions
module.exports = {
    getTenantAccessToken,
    getTicket,
    getConfigParameters,
    getAppAccessToken,
    getUserAccessToken,
    getUserInfo,
    refreshAccessToken
};
