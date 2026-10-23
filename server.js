require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Serve HTML files
app.use(express.static(path.join(__dirname,'public')));

// 【entity-MongoDB¦canonical_name=MongoDB】 Connect
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('【entity-MongoDB¦canonical_name=MongoDB】 Connected');
    try{
      const Setting = require('./models/Setting');
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
    }catch(e){
      console.log('Setting model not found, skipping - '+e.message);
    }
    
    // Auto create admin user if not exist
    try{
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPass = process.env.ADMIN_PASSWORD;
      if(adminEmail){
        const exists = await User.findOne({email: adminEmail});
        if(!exists){
          const hash = await bcrypt.hash(adminPass,10);
          await User.create({email: adminEmail, password: hash, balance: 10000, isAdmin:true, apiKey:'admin_'+Date.now()});
          console.log('Admin created: '+adminEmail);
        }
      }
    }catch(e){console.log('Admin create skip:',e.message)}
  })
  .catch(err => console.error('Mongo Error:',err));

// Telegram Bot Start - FIXED FOR BOTH bot.js and bot/telegramBot.js
try{
  if(fs.existsSync(path.join(__dirname,'bot','telegramBot.js'))){
    const { initBot } = require('./bot/telegramBot');
    if(initBot) initBot();
    console.log('Bot started from bot/telegramBot.js');
  }else if(fs.existsSync(path.join(__dirname,'bot.js'))){
    require('./bot');
    console.log('Bot started from bot.js');
  }else{
    console.log('No bot file found');
  }
}catch(e){ console.log('Bot error:',e.message) }

// Routes - auto detect which route files you have
try{
  if(fs.existsSync(path.join(__dirname,'routes','auth.js'))){
    app.use('/', require('./routes/auth'));
    app.use('/', require('./routes/wallet'));
    app.use('/admin', require('./routes/admin'));
    if(fs.existsSync(path.join(__dirname,'routes','api_external.js'))){
      app.use('/api', require('./routes/api_external'));
    }
  }else{
    // Fallback to old routes (my files)
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/wallet', require('./routes/wallet'));
    app.use('/api/admin', require('./routes/admin'));
  }
}catch(e){console.log('Route load error:',e.message)}

app.get('/', (req,res) => {
  const indexPath = path.join(__dirname,'public','index.html');
  if(fs.existsSync(indexPath)){
    res.sendFile(indexPath);
  }else{
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
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
