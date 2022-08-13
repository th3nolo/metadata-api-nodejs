import express  from 'Express'
import path from 'path'
import { fileURLToPath } from 'url';
import pkgMoment from 'moment'
const {moment} = pkgMoment
import  HOST  from './src/constants.js'
import pkgMoralis from '@moralisweb3/core';
const { moralis } = pkgMoralis;
import { EvmChain } from '@moralisweb3/evm-utils';
import db  from './src/database.js';
//const db = require('./src/database')
//const moment = require('moment')
//const { HOST } = require('./src/constants')
//const path = require('path')
//const Express = require('express')

const PORT = process.env.PORT || 5000
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

// Static public files
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.send('Get ready for OpenSea!');
})

app.get('/api/token/:token_id', function(req, res) {
  const tokenId = parseInt(req.params.token_id).toString()
  const nft = db[tokenId]
  //const bdayParts = nft.birthday.split(' ')
  //const day = parseInt(bdayParts[1])
  //const month = parseInt(bdayParts[0])
  
  const data = {
    'name': nft.name,
    'attributes': {
      'type': nft.type,
      'stakeTime': nft.stakeTime,
      'transparent': nft.transparent,    
      'fruits': nft.fruits
    },
    'image': `${HOST}/images/${tokenId}.png`   
  }
  res.send(data)
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
})

// returns the zodiac sign according to day and month ( https://coursesweb.net/javascript/zodiac-signs_cs )
//function zodiac(day, month) {
//  var zodiac =['', 'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn'];
//  var last_day =['', 19, 18, 20, 20, 21, 21, 22, 22, 21, 22, 21, 20, 19];
//  return (day > last_day[month]) ? zodiac[month*1 + 1] : zodiac[month];
//}

//function monthName(month) {
//  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
//  ]
//  return monthNames[month - 1]
//}