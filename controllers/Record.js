// Function for adding record

const { getTenantAccessToken } = require('./GetTenantAccessToken');
const axios = require('axios');

const addRecord = async (req, res) => {
    try {
        const tenant_access_token = await getTenantAccessToken();

        const { fields } = req.body;

        const config = {
            method: 'POST',
            url: `https://open.larksuite.com/open-apis/bitable/v1/apps/${process.env.APP_TOKEN}/tables/${process.env.TABLE_ID}/records`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tenant_access_token}`
            },
            data: JSON.stringify({ fields })
        };

        const response = await axios(config);
        console.log('Record successfully added to Larksuite:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error adding record:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Đã xảy ra lỗi', error: error.response ? error.response.data : error.message });
    }
}

const getAllRecords = async (req, res) => {

    const tenant_access_token = await getTenantAccessToken();


    try {
        const config = {
            method: 'GET',
            url: `https://open.larksuite.com/open-apis/bitable/v1/apps/${process.env.APP_TOKEN}/tables/${process.env.TABLE_ID}/records`,
            headers: {
                'Authorization': `Bearer ${tenant_access_token}`,
            },
        };

        const response = await axios(config);
        console.log('Records fetched successfully:', response.data);

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching records:', error.message);
        res.status(500).json({ message: 'Error fetching records', error: error.message });
    }
}

const updateRecord = async (req, res) => {

    const { fields } = req.body;

    const id = req.params.id;

    const tenant_access_token = await getTenantAccessToken();

    try {

        const config = {
            method: 'PUT',
            url: `https://open.larksuite.com/open-apis/bitable/v1/apps/${process.env.APP_TOKEN}/tables/${process.env.TABLE_ID}/records/${id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tenant_access_token}`
            },
            data: JSON.stringify({ fields })
        };

        const response = await axios(config);
        console.log('Records updated successfully:', response.data);

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error updating records:', error.message);
        res.status(500).json({ message: 'Error update record', error: error.message });
    }
}

const deleteRecord = async (req, res) => {
    const id = req.params.id;

    const tenant_access_token = await getTenantAccessToken();

    try {
        const config = {
            method: 'DELETE',
            url: `https://open.larksuite.com/open-apis/bitable/v1/apps/${process.env.APP_TOKEN}/tables/${process.env.TABLE_ID}/records/${id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tenant_access_token}`
            },
        };

        const response = await axios(config);
        console.log('Record deleted successfully:', response.data);

        res.status(200).json({ message: 'Record deleted successfully', data: response.data }); // Send a success message back
    } catch (error) {
        console.error('Error deleting record:', error.message);
        res.status(500).json({ message: 'Error deleting record', error: error.message });
    }
}

const searchRecord = async (req, res) => {

}

module.exports = {
    addRecord, getAllRecords, updateRecord, deleteRecord
}