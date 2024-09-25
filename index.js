require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { addRecord, getAllRecords, deleteRecord, updateRecord } = require('./controllers/Record');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// CRUD records
app.post('/add-record', addRecord);
app.get('/get-record', getAllRecords);
app.put('/update-record/:id', updateRecord);
app.delete('/delete-record/:id', deleteRecord)

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
