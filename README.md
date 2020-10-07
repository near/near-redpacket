<br />
<br />

<p>
<img src="https://nearprotocol.com/wp-content/themes/near-19/assets/img/logo.svg?t=1553011311" width="240">
</p>

## Linkdrop example with contract account deployment

## About the app
The app allows you to send funds to the Linkdrop contract which will create "Drops". You will have a list of these in local storage and you can remove them at any time. This claims the funds back to your current account.

**NOTE:** If you follow the wallet link of a drop, be warned it will not create accounts because your contract is not eligible to create the `.testnet` domain accounts.

Instead, click "Share Drop Link" and visit your own drop.

You will now see a *URL Drop* heading with some information about the drop. This is what another user would see if they used your URL.

You can either:
1. claim the funds
2. create an account
3. create a contract account (deploys a locked multisig account)

## Contract
For more details on the linkdrop contract:
https://github.com/near/near-linkdrop

## Quickstart
```
yarn && yarn dev
```

## Deploying your own contract
It's recommended you create a sub account to handle your contract deployments:
```
near login
near create_account [account_id] --masterAccount [your_account_id] --initialBalance [1-5 N]
```
Now update config.js and set:
```
const CONTRACT_NAME = [account_id]
```

## The Linkdrop contract and calling it from JS

All calls to the contract can be found in `src/Drops.js`.

The original linkdrop contract is here:
https://github.com/nearprotocol/near-linkdrop

An additional function is added to the regular linkdrop contract:
```
pub fn create_limited_contract_account
```
This takes 3 additional arguments over the existing `pub fn create_account_and_claim` function.
In order to successfully invoke from JS you must pass in the following:
```
new_account_id: string,
new_public_key: string,
allowance: string,
contract_bytes: [...new Uint8Array(contract_bytes)],
method_names: [...new Uint8Array(new TextEncoder().encode(`
    methods,account,is_limited_too_call
`))]
```

##### IMPORTANT: Make sure you have the latest version of NEAR Shell and Node Version > 10.x 

1. [Node.js](https://nodejs.org/en/download/package-manager/)
2. near-shell
```
npm i -g near-shell
```
### To run on NEAR testnet

```bash
yarn && yarn dev
```