# Sample Metadata API for Non-Fungible Tokens (NFTs) <!-- omit in toc -->

Use this repo to make an API for serving metadata about your tokens ([ERC-721](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md) or [ERC-1155](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md)) to marketplaces like [OpenSea](https://opensea.io) and other third parties.

Metadata for each token can include an image, animation, attributes, scalar properties, boost properties, and more!

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


- [Requirements](#requirements)

### Requirements
You need node.js (v16.16.* or later) and npm installed. If you want to do a Heroku deployment, download and install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and run `heroku login` locally.

1. Click the **Deploy to Heroku** button above to instantly get it up and running somewhere. You can pick the URL! For this example, let's say that it's `your-metadata-api.herokuapp.com`.
2. Run `heroku git:clone -a your-metadata-api`, and `cd` into your new directory.
3. Run `npm install`.
4. Save the Heroku URL you picked into `src/constants.js` as the `HOST` variable (e.g. `https://your-metadata-api.herokuapp.com`). This is the root URL for the tokens on your contract.
5. Deploy to Heroku by committing your changes and using `git push heroku master`.
6. Visit your token's metadata at https://your-metadata-api.herokuapp.com/api/token/1 (for token 1).
