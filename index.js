import express from "express";
import path from "path";
import { domainToASCII, fileURLToPath } from "url";
import pkgMoment from "moment";
const { moment } = pkgMoment;
import HOST from "./src/constants.js";
import db from "./src/database.js";
import abiNFT from "./src/abiNFT.js";
import abiProtocol from "./src/abiProtocol.js";
import env from "dotenv";
import axios from "axios";
import ethers from "ethers";
import Moralis from "moralis-v1/node.js";

//why this line : https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope#:~:text=The%20__dirname%20or%20__,directory%20name%20of%20the%20pathclea.
env.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverUrl = process.env.SERVER_URL || "https://xqzpsbn9rkym.usemoralis.com:2053/server";
const appId = process.env.APP_ID || "WcthTo0h24NbgFE4ExuuDaVR67isyWtiK9kJAEt9";
const masterKey =  process.env.MASTER_KEY || "DqSTHsNyalXVdubxKMXGf0Uaq5iTGXI4oWB5hfyy";
const ADDRESSPROTOCOL = process.env.ADDRESSPROTOCOL || "0xe2790A1F0b412EA3880a5B93Ae6bd4F966C20CED";
const ADDRESSNFT = process.env.ADDRESSNFT || "0x5B51857C8220Ac230fb93aA0087587fD4229eE8d";
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.MORALISV2_API_KEY;
console.log(API_KEY)
const TRANSFER = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const ADDRESS0 = "0x0000000000000000000000000000000000000000000000000000000000000000";
const STAKE_STARTED = "0xf1b726f9b240a431d5a1d157ace1cf0be2de5c6c909df71d85852f34c069a542";
const STAKE_ENDEDAT = "0xf187ddd32321a75ef62b9b415856a4e6da260b575772cb6e14dde1b37439ab29";
const STAKED_RESUMEDAT = "0x39e4283688f7cedd360def9191f85b9a3207636f1a7a2831a20222bc085678b3"
const iface =  new ethers.utils.Interface(abiNFT);


function refreshMetadata(_tokenId){    
  const options = {
    method: 'GET',
    url: `https://deep-index.moralis.io/api/v2/nft/${ADDRESSNFT}/${_tokenId}/metadata/resync?chain=mumbai&flag=uri&mode=async`,
    headers: {
      Accept: 'application/json',
      'X-API-Key': 'xTVK25vKf4vxBe8db3OC18Ox0HMtGjxMNJaI6zFzEoXVetpPn0E2qCcJNj1sunGO'
    }
  };
  
  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
}

function ownerOf(_tokenId) {
  const options = {
    method: "POST",
    url: `https://deep-index.moralis.io/api/v2/${ADDRESSNFT}/function?chain=mumbai&function_name=ownerOf`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    data: { abi: abiNFT, params: { tokenId: _tokenId } },
  };

  return axios
    .request(options)
    .then(function (response) {
      let addressTo = ethers.utils.hexZeroPad(response.data, 32);
      return filterDeposits(addressTo);
    })
    .catch(function (error) {
      console.error(error);
    });
}

function filterDeposits(addressTo) {
  const options = {
    method: "GET",
    url: `https://deep-index.moralis.io/api/v2/${ADDRESSPROTOCOL}/logs?chain=mumbai&topic0=${TRANSFER}&topic1=${ADDRESS0}&topic2=${addressTo}&limit=500`,
    headers: {
      Accept: "application/json",
      "X-API-Key": API_KEY,
    },
  };

  return axios
    .request(options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
}

function isActive(account) {
  const options = {
    method: "POST",
    url: `https://deep-index.moralis.io/api/v2/${ADDRESSPROTOCOL}/function?chain=mumbai&function_name=isStaking`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    // to give params you need to pass only the name of the param and the value of the param as it's on the ABI or Smart Contract
    data: { abi: abiProtocol, params: { _account: account } },
  };

  return axios
    .request(options)
    .then(function (response) {
      return response.data
    })
    .catch(function (error) {
      console.error(error);
    });
}


function stakeStartedAt(addressTo) {
  let _addressTo = ethers.utils.hexZeroPad(addressTo.toString(), 32);
  const options = {
    method: "GET",
    url: `https://deep-index.moralis.io/api/v2/${ADDRESSPROTOCOL}/logs?chain=mumbai&topic0=${STAKE_STARTED}&topic1=${_addressTo}&limit=500`,
    headers: {
      Accept: "application/json",
      "X-API-Key": API_KEY,
    },
  };

  return axios
    .request(options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
}

function stakeEndedAt(addressTo) {
  console.log(addressTo);
  let _addressTo = ethers.utils.hexZeroPad(addressTo, 32);
  const options = {
    method: "GET",
    url: `https://deep-index.moralis.io/api/v2/${ADDRESSPROTOCOL}/logs?chain=mumbai&topic0=${STAKE_ENDEDAT}&topic1=${_addressTo}&limit=500`,
    headers: {
      Accept: "application/json",
      "X-API-Key": API_KEY,
    },
  };

  return axios
    .request(options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
}

function stakeResumedAt(addressTo) {
  const options = {
    method: "GET",
    url: `https://deep-index.moralis.io/api/v2/${ADDRESSPROTOCOL}/logs?chain=mumbai&topic0=${STAKED_RESUMEDAT}&topic1=${addressTo}&limit=500`,
    headers: {
      Accept: "application/json",
      "X-API-Key": API_KEY,
    },
  };

  return axios
    .request(options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
}

function levelOfToken (days) {
  let _days = days <= 1 ? 1 : days <= 30 ? 2 : days <= 90 ? 3 : days <= 180 ? 4 : days >=365 ? 5: 4;
  return _days; 
  //1, 30, 90, 180, 365
}

const app = express()
  .set("port", PORT)
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs");

// Static public files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.send("Get ready for OpenSea!");
});

app.get("/api/token/:token_id", async function (req, res) {

  const tokenId = parseInt(req.params.token_id).toString();  
  let stakeTimeArray = await ownerOf(tokenId);
  let _result = stakeTimeArray.result[stakeTimeArray.result.length - 1];
  //Block timestamp are in dateNowISO8601, you need to convert it using new Date, to get in epoch time, toISOString() converts the Date into a string in ISO 8601 format.
  //console.log(firstDeposit.toISOString(), dateNow.toISOString());
  let firstDeposit = new Date(
    _result.block_timestamp
  );
  let dateNow = new Date();
  let timeStaked = ((dateNow - firstDeposit) / (1000 * 3600 * 24)).toFixed();
  console.log(timeStaked);  
  // this parses the Address whe're looking for, and return the adress of the owner in an array 
  // handle like this _address[0]
  let _address = ethers.utils.defaultAbiCoder.decode(
    ["address"],
    _result.topic2
  );
  let _addressToDeposits = Moralis.Object.extend("addressToDeposits");  
  let _query = new Moralis.Query(_addressToDeposits);
  _query.equalTo("address", _address[0]);
  let _resultQuery = await _query.find();
  console.log(await isActive(_address[0]));
   // When _resultQuery is empty, the user has not deposited yet thus the _resultQuery.length is 0 
  if (_resultQuery.length > 0) {
    if (await isActive(_address[0])) {
      // is user is Active then calculate how many days have pass since the first deposit
      let _ParseObjectSubclass = _resultQuery[0];
      console.log(_ParseObjectSubclass.id);
      let _addressToDeposits = Moralis.Object.extend("addressToDeposits");
      let _query = new Moralis.Query(_addressToDeposits);
      _query.get(_ParseObjectSubclass.id).then(
        (_address) => {
          _address.set("days", timeStaked);
          _address.set("daysCounter", timeStaked)
          //Remember to use the save function to save the changes to the Parse server
          _address.save();
        },
        (error) => {
          console.log(error);
        }
      );
    }else{
      // if the guy is not Active.. 
      let _ParseObjectSubclass = _resultQuery[0];
      console.log(_ParseObjectSubclass.id);
      let _addressToDeposits = Moralis.Object.extend("addressToDeposits");
      let _query = new Moralis.Query(_addressToDeposits);      
      _query.get(_ParseObjectSubclass.id).then(
        async(_address) => {         
                    console.log(_address.get("days"));
          console.log(_address.get("daysCounter"))
          console.log(await stakeEndedAt(_address.get("address")));
          //Remember to use the save function to save the changes to the Parse server
          _address.save();
        },
        (error) => {
          console.log(error);
        }
      );
    }
  } else {
    // if the data does't exist, create a new object
    let _addressToDeposits = Moralis.Object.extend("addressToDeposits");
    let _newAdressInstance = new _addressToDeposits();
    _newAdressInstance = new _addressToDeposits({
      address: _address[0],
      days: timeStaked,
      startDate: firstDeposit,
      endDate: "-1",
      daysCounter: timeStaked,
    });
    _newAdressInstance.save().then(
      (_newAdressInstance) => {
        console.log("New Object created with Object Id", _newAdressInstance.id);
      },
      (error) => {
        console.log(error);
      }
    );
  }
 
  //30, 60, 90, 120, 150
  let level = await levelOfToken(timeStaked);
  const nft = db[level]; 

  const data = {
    name: nft.name,
    attributes: {
      type: nft.type,
      stakeTime: timeStaked, //nft.stakeTime,
      transparent: nft.transparent,
      fruits: nft.fruits,
    },
    image: `${HOST}/images/${level}.png`,
  };
  res.send(data);
  setTimeout(refreshMetadata, 5000, tokenId)
});

const startServer = async () => {
  await Moralis.start({ serverUrl, appId, masterKey });
  console.log("Moralis server started");

  app.listen(app.get("port"), function () {
    console.log("Node app is running on port", app.get("port"));
  });
};


startServer();