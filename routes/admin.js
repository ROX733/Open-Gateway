const express = require('express');
const User = require('../models/User');
const Tx = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

const isAdmin = async (req,res,next)=>{
  const u = await User.findById(req.user.id);
  if(!u || !u.isAdmin) return res.status(403).json({error:'Admin only'});
  next();
}

router.post('/add-balance', auth, isAdmin, async (req,res)=>{
  const {email, amount} = req.body;
  const u = await User.findOne({email});
  if(!u) return res.status(400).json({error:'User not found'});
  u.balance += Number(amount);
  await u.save();
  await Tx.create({user:u._id,type:'add',amount:Number(amount),note:'Admin added balance'});
  res.json({success:true, balance:u.balance, email:u.email});
});

router.get('/users', auth, isAdmin, async (req,res)=>{
  const users = await User.find().select('email balance apiKey isAdmin createdAt');
  res.json(users);
});

router.get('/all-transactions', auth, isAdmin, async (req,res)=>{
  const tx = await Tx.find().sort({createdAt:-1}).limit(200);
  res.json(tx);
});

module.exports = router;
