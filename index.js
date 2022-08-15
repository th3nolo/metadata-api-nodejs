import express  from 'Express'
import path from 'path'
import { fileURLToPath } from 'url';
import pkgMoment from 'moment'
const {moment} = pkgMoment
import  HOST  from './src/constants.js'
import db  from './src/database.js';
import abiNFT from './src/abi.js';
import env from 'dotenv'
import axios from 'axios'
import ethers from 'ethers'

env.config()

//why this line : https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope#:~:text=The%20__dirname%20or%20__,directory%20name%20of%20the%20pathclea.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ADDRESSPROTOCOL = process.env.ADDRESSPROTOCOL || '0xe2790A1F0b412EA3880a5B93Ae6bd4F966C20CED';
const ADDRESSNFT = process.env.ADDRESSNFT || '0x5B51857C8220Ac230fb93aA0087587fD4229eE8d'
const PORT = process.env.PORT || 5000
const API_KEY = process.env.MORALISV2_API_KEY;
const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const ADDRESS0 = '0x0000000000000000000000000000000000000000000000000000000000000000'


function ownerOf(_tokenId){
  const options = {
    method: 'POST',
    url: `https://deep-index.moralis.io/api/v2/${ADDRESSNFT}/function?chain=mumbai&function_name=ownerOf`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    data: {abi: abiNFT, params: {tokenId: _tokenId}}
  };

    return axios
    .request(options)
    .then(function (response) {  
      let addressTo = ethers.utils.hexZeroPad(response.data, 32)
      return filterDeposits(addressTo)
    })
    .catch(function (error) {
      console.error(error);
    });
  
}

function filterDeposits(addressTo){
const options = {
  method: 'GET',
  url: `https://deep-index.moralis.io/api/v2/${ADDRESSPROTOCOL}/logs?chain=mumbai&topic0=${TRANSFER}&topic1=${ADDRESS0}&topic2=${addressTo}&limit=500`,
  headers: {
    Accept: 'application/json',
    'X-API-Key': API_KEY
  }
};

return axios
  .request(options)
  .then(function (response) {
    //console.log(response.data)
    return response.data
  })
  .catch(function (error) {
    console.error(error);
});
  
}

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

// Static public files
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.send('Get ready for OpenSea!');
})

app.get('/api/token/:token_id', async function(req, res) {
  const tokenId = parseInt(req.params.token_id).toString()
  const nft = db[tokenId]
  //const bdayParts = nft.birthday.split(' ')
  //const day = parseInt(bdayParts[1])
  //const month = parseInt(bdayParts[0])
  let stakeTimeArray = await ownerOf(tokenId)
  //console.log(stakeTimeArray);
  //console.log("Ultimo resultado?: ", stakeTimeArray.result[stakeTimeArray.result.length - 1].block_timestamp);
  let firstDeposit = new Date(stakeTimeArray.result[stakeTimeArray.result.length - 1].block_timestamp)
  let dateNow = new Date()
  //console.log(firstDeposit)
  //console.log(dateNowISO8601)
  //console.log(firstDeposit.toISOString(), dateNow.toISOString())
  console.log(firstDeposit.toISOString(), dateNow.toISOString())
  let timeStaked = ((dateNow - firstDeposit) /(1000*3600*24)).toFixed();

  console.log(timeStaked)

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

