// Function for getting app_access_token

const axios = require('axios')

const getTenantAccessToken = async () => {
    try {
        const response = await axios.post('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
            app_id: process.env.APP_ID,
            app_secret: process.env.APP_SECRET
        });

        return response.data.tenant_access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = {
    getTenantAccessToken
}