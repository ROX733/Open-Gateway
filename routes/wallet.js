const express = require('express');
const User = require('../models/User');
const Tx = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/balance', auth, async (req,res)=>{
  const u = await User.findById(req.user.id);
  res.json({balance:u.balance, email:u.email, apiKey:u.apiKey});
});

router.post('/transfer', auth, async (req,res)=>{
  const {toEmail, amount, note} = req.body;
  const amt = Number(amount);
  if(amt <=0) return res.status(400).json({error:'Invalid amount'});
  const from = await User.findById(req.user.id);
  if(from.balance < amt) return res.status(400).json({error:'Low balance'});
  const to = await User.findOne({email:toEmail});
  if(!to) return res.status(400).json({error:'Receiver not found'});
  if(to.email === from.email) return res.status(400).json({error:'Cannot send to self'});
  
  from.balance -= amt;
  to.balance += amt;
  await from.save();
  await to.save();
  
  await Tx.create({user:from._id,type:'p2p',amount:amt,fromUser:from.email,toUser:to.email,note});
  await Tx.create({user:to._id,type:'add',amount:amt,fromUser:from.email,toUser:to.email,note:'Received'});
  
  res.json({success:true,balance:from.balance});
});

router.get('/history', auth, async (req,res)=>{
  const tx = await Tx.find({user:req.user.id}).sort({createdAt:-1}).limit(100);
  res.json(tx);
});

module.exports = router;
