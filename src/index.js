import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import { createHashHistory } from 'history';
import App from './App';
import Claim from './Claim';
import getConfig from './config.js';
import { getCurrentUser } from './util/near-util';
import * as nearApi from 'near-api-js';

const history = createHashHistory()

// Initializing contract
async function initContract() {
    window.nearConfig = getConfig(process.env.NODE_ENV || 'development')

    window.keyStore = new nearApi.keyStores.BrowserLocalStorageKeyStore(window.localStorage, 'nearlib:keystore:')
    // console.log(window.keyStore)
    window.near = await nearApi.connect(Object.assign({ deps: { keyStore: window.keyStore } }, window.nearConfig));
    
    window.contractAccount = new nearApi.Account(window.near.connection, window.nearConfig.contractName)

    window.getCurrentUser = async () => {
        // Needed to access wallet
        window.walletConnection = new nearApi.WalletConnection(window.near)
        window.walletAccount = new nearApi.WalletAccount(window.near)
        if (walletConnection.getAccountId()) {
            const accountId = walletConnection.getAccountId()
            window.currentUser = {
                accountId, account_id: accountId,
                balance: (await walletConnection.account().state()).amount
            }
        }
    }
    await window.getCurrentUser()

    if (window.currentUser) {
        const account = window.account = window.walletConnection.account()
        window.contract = await new nearApi.Contract(account, window.nearConfig.contractName, {
            viewMethods: ['get_key_balance'],
            // Change methods can modify the state. But you don't receive the returned value when called.
            changeMethods: ['send', 'send_limited'],
            // Sender is the account ID to initialize transactions.
            sender: window.currentUser.accountId
        });
        // console.log(contract)
    }
}

window.nearInitPromise = initContract().then(() => {
    ReactDOM.render(
        <React.StrictMode>
            <Router history={history}>
                <Switch>
                    <Route path="/" exact render={(props) => (
                        <App {...props} wallet={window.walletAccount} contract={window.contract} />
                    )} />
                    <Route path="/:key" render={(props) => (
                        <Claim {...props} near={window.near} />
                    )} />
                </Switch>
            </Router>
        </React.StrictMode>,
        document.getElementById('root')
    );
}).catch(console.error)