require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initBot } = require('./bot/telegramBot');
const Setting = require('./models/Setting');

const app = express();
app.use(cors());
app.use(express.json());

// 【entity-MongoDB¦canonical_name=MongoDB】 Connect
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('【entity-MongoDB¦canonical_name=MongoDB】 Connected');
    const count = await Setting.countDocuments();
    if(count === 0){
      await Setting.insertMany([
        { key: 'add_fund_tax', value: '0' },
        { key: 'withdrawal_tax', value: '5' },
        { key: 'min_add_fund', value: '100' },
        { key: 'min_withdrawal', value: '100' },
        { key: 'maintenance_mode', value: 'off' },
        { key: 'maintenance_msg', value: 'Website under maintenance' }
      ]);
      console.log('Default settings created');
    }
  })
  .catch(err => console.error(err));

// Telegram Bot Start
initBot();

// CLEAN URLS - Like mygateway.onrender.com/login
app.use('/', require('./routes/auth')); // /login, /signup, /send-otp
app.use('/', require('./routes/wallet')); // /balance, /pay, /add-fund, /withdraw
app.use('/admin', require('./routes/admin')); // /admin/users, /admin/dashboard
app.use('/api', require('./routes/api_external')); // /api/balance, /api/transfer

app.get('/', (req,res) => {
  res.json({
    msg: 'MyGateway API Running',
    endpoints: {
      signup: 'POST /signup',
      login: 'POST /login',
      send_otp: 'POST /send-otp',
      balance: 'GET /balance',
      pay: 'POST /pay',
      add_fund: 'POST /add-fund',
      withdraw: 'POST /withdraw',
      admin: 'GET /admin/dashboard',
      wallet_api: 'POST /api/transfer'
    }
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
