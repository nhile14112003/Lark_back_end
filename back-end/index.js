require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { addRecord, getAllRecords, deleteRecord, updateRecord } = require('./controllers/Record');

const bodyParser = require('body-parser');
const crypto = require('crypto');

const ENCRYPT_KEY = 'U84MYW94jjRqnErbk6M31ebzRcjnJeDo'; 

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(bodyParser.json());

// CRUD records
app.post('/add-record', addRecord);
app.get('/get-record', getAllRecords);
app.put('/update-record/:id', updateRecord);
app.delete('/delete-record/:id', deleteRecord)

function verifySignature(timestamp, nonce, body, signature) {
    const content = timestamp + nonce + ENCRYPT_KEY + body;
    const sign = crypto.createHash('sha256').update(content).digest('hex');
    return signature === sign;
}

// Endpoint nhận sự kiện
app.post('/webhook', (req, res) => {

    const timestamp = req.headers['x-lark-request-timestamp'];
    const nonce = req.headers['x-lark-request-nonce'];
    const signature = req.headers['x-lark-signature'];

    console.log("a", timestamp)

    // Xác thực chữ ký
    if (!verifySignature(timestamp, nonce, JSON.stringify(req.body), signature)) {
        return res.status(403).send('Forbidden');
    }

    const event = req.body;

    // Xử lý sự kiện CRUD
    if (event.type === 'create') {
        console.log('Có sự kiện tạo mới:', event);
        // Gửi thông báo về sự kiện tạo
    } else if (event.type === 'update') {
        console.log('Có sự kiện cập nhật:', event);
        // Gửi thông báo về sự kiện cập nhật
    } else if (event.type === 'delete') {
        console.log('Có sự kiện xóa:', event);
        // Gửi thông báo về sự kiện xóa
    }

    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
