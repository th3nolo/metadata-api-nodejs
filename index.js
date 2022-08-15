import express from "Express";
import path from "path";
import { domainToASCII, fileURLToPath } from "url";
import pkgMoment from "moment";
const { moment } = pkgMoment;
import HOST from "./src/constants.js";
import db from "./src/database.js";
import abiNFT from "./src/abi.js";
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
const iface =  new ethers.utils.Interface(abiNFT);

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
      //console.log(response.data)
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
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
  const nft = db[tokenId];
  let stakeTimeArray = await ownerOf(tokenId);
  let _result = stakeTimeArray.result[stakeTimeArray.result.length - 1];
  let firstDeposit = new Date(
    _result.block_timestamp
  );
  let dateNow = new Date();
  let timeStaked = ((dateNow - firstDeposit) / (1000 * 3600 * 24)).toFixed();
  console.log(timeStaked);  
  // this parses the Address whe're looking for, and return the adress of the owner in an array \
  // handle like this _address[0]
  let _address = ethers.utils.defaultAbiCoder.decode(
    ["address"],
    _result.topic2
  );
  let _adressToDeposits = Moralis.Object.extend("adressToDeposits");
  //let _newAdressInstance = new _adressToDeposits();
  let _query = new Moralis.Query(_adressToDeposits);
  _query.equalTo("address", _address[0]);
  let _resultQuery = await _query.find();
  if (_resultQuery.length > 0) {
    let _ParseObjectSubclass = _resultQuery[0];
    console.log(_ParseObjectSubclass.id);
    let _adressToDeposits = Moralis.Object.extend("adressToDeposits");
    let _query = new Moralis.Query(_adressToDeposits);
    let _result = _query.get(_ParseObjectSubclass.id).then(
      (_address) => {
        _address.set('endDate', "-1");
        //Remember to use the save function to save the changes to the Parse server
        _address.save();
      },
      (error) => {
        console.log(error);
      }
    );
  }
  // When _resultQuery is empty, the user has not deposited yet thus the _resultQuery.length is 0 
  //console.log(_resultQuery);
  //let _newAdressInstance = new _adressToDeposits({ address: _address[0], days: timeStaked , startDate: firstDeposit, endDate: 0,  });
  //_newAdressInstance.save().then(
  //  (_newAdressInstance) => {
  //    console.log("New Object created with Object Id", _newAdressInstance.id);
  //  },
  //  (err) => {
  //    console.log("Error:", err);
  //  }
  //);
  //console.log("Ultimo resultado?: ", stakeTimeArray.result[stakeTimeArray.result.length - 1].block_timestamp);
  //first find the user object ID in the Database or Create an Object in the Database
  //const userDB = Moralis.Object.extend
  //Block timestamp are in dateNowISO8601, you need to convert it using new Date, to get in epoch time, toISOString() converts the Date into a string in ISO 8601 format.
  //console.log(firstDeposit.toISOString(), dateNow.toISOString());

  const data = {
    name: nft.name,
    attributes: {
      type: nft.type,
      stakeTime: nft.stakeTime,
      transparent: nft.transparent,
      fruits: nft.fruits,
    },
    image: `${HOST}/images/${tokenId}.png`,
  };
  res.send(data);
});

const startServer = async () => {
  await Moralis.start({ serverUrl, appId, masterKey });
  console.log("Moralis server started");

  app.listen(app.get("port"), function () {
    console.log("Node app is running on port", app.get("port"));
  });
};


startServer();