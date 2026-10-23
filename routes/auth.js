const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req,res)=>{
  try{
    const {email,password} = req.body;
    const hash = await bcrypt.hash(password,10);
    const apiKey = 'mg_'+Math.random().toString(36).substr(2,12)+Date.now().toString(36);
    const user = await User.create({email,password:hash,apiKey});
    const token = jwt.sign({id:user._id,isAdmin:user.isAdmin}, process.env.JWT_SECRET);
    res.json({token, apiKey:user.apiKey, balance:user.balance});
  }catch(e){
    res.status(400).json({error:'Email already exists'});
  }
});

router.post('/login', async (req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({error:'No user'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({error:'Wrong password'});
  const token = jwt.sign({id:user._id,isAdmin:user.isAdmin}, process.env.JWT_SECRET);
  res.json({token, apiKey:user.apiKey, balance:user.balance, isAdmin:user.isAdmin});
});

module.exports = router;
