import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import * as nearApi from 'near-api-js';
import { KeyPair } from 'near-api-js';
import detectBrowserLanguage from 'detect-browser-language';
import {
  nearTo, nearToInt, toNear, BOATLOAD_OF_GAS, DROP_GAS, NETWORK_ID, ACCESS_KEY_ALLOWANCE
} from './util/near-util';
import nearcover from './assets/img/redpacket-cover.svg';

class Claim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: true,
      secretkey: null,
      walletClaimUrl: '',
      login: false,
      currentUser: window.currentUser,
      lang: '',
      amount: 0,
    }
    this.signedInFlow = this.signedInFlow.bind(this);
    this.requestSignIn = this.requestSignIn.bind(this);
    this.requestSignOut = this.requestSignOut.bind(this);
    this.signedOutFlow = this.signedOutFlow.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.claimDrop = this.claimDrop.bind(this);
  }

  async componentDidMount() {
    let loggedIn = this.props.wallet.isSignedIn();
    if (loggedIn) {
      this.signedInFlow();
    } else {
      this.signedOutFlow();
    }
    this.setState({ currentUser: window.currentUser })

    // Detect browser lang
    this.setState({ lang: detectBrowserLanguage() })

    const {
      contractName,
      walletUrl
    } = window.nearConfig

    if (this.props.match.params) {
      const secretkey = this.props.match.params.key
      let status = true,
          amount = 0,
          walletClaimUrl = ''
      try {
        walletClaimUrl = await this.getWalletLink(secretkey)
        amount = await this.checkNearDropBalance(contractName, secretkey)
        this.setState({ status, secretkey, walletClaimUrl, amount })
        console.log(status, contractName, secretkey, walletClaimUrl, amount)
      } catch (err) {
        status = false
        this.setState({ status })
        console.log(err)
      }
    }

    // Show toast for WeChat users
    const userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
    if (/micromessenger|qq/i.test(userAgent)) {
      let ele = document.getElementsByClassName("toast-wechat")
      console.log(ele)
      ele[0].style.display="block" 
    }
  }

  async signedInFlow() {
    this.setState({
      login: true,
    })
    const accountId = await this.props.wallet.getAccountId()
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
  }

  async requestSignIn() {
    const appTitle = 'NEAR Redpacket';
    await this.props.wallet.requestSignIn(
      window.nearConfig.contractName,
      appTitle
    )
  }

  async updateUser() {
    await window.getCurrentUser()
    this.setState({ currentUser: window.currentUser })
  }

  requestSignOut() {
    this.props.wallet.signOut();
    setTimeout(this.signedOutFlow, 500);
    console.log("after sign out", this.props.wallet.isSignedIn())
  }

  signedOutFlow() {
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
    this.setState({
      login: false,
      currentUser: null,
    })
  }

  async checkNearDropBalance(fundingContract, fundingKey) {
    const account = this.getAccount(fundingContract)

    const contract = new nearApi.Contract(account, fundingContract, {
        viewMethods: ['get_key_balance'],
        sender: fundingContract
    });
    
    const key = KeyPair.fromString(fundingKey).publicKey.toString()
    return await contract.get_key_balance({ key })
  }

  async getWalletLink(secretkey) {
    return `${window.nearConfig.walletUrl}/create/${window.nearConfig.contractName}/${secretkey}`
  }

  async getContract(viewMethods = [], changeMethods = [], secretKey) {
    if (secretKey) {
      await window.keyStore.setKey(
          NETWORK_ID, window.nearConfig.contractName,
          nearApi.KeyPair.fromString(secretKey)
      )
    }
    const contract = new nearApi.Contract(window.contractAccount, window.nearConfig.contractName, {
        viewMethods,
        changeMethods,
        sender: window.nearConfig.contractName
    })
    return contract
  }

  async claimDrop(secretkey) {
    const account_id = currentUser.account_id
    
    if (!window.confirm(`Claim NEAR to ${account_id}.\n\nDo you want to continue?`)) {
        return
    }
    const contract = await this.getContract([], ['claim'], secretkey)
    // return funds to current user
    await contract.claim({ account_id }, BOATLOAD_OF_GAS)
        .then(() => {
            window.alert('Drop claimed')
        })
        .catch((e) => {
            console.log(e)
            alert('Unable to claim drop. The drop may have already been claimed.')
        })
    this.updateUser()
    window.location.reload()
  }

  getAccount(accountId) {
    return new nearApi.Account(window.near.connection, accountId)
  }

  render() {
    const { status, secretkey, walletClaimUrl, login, amount, lang } = this.state;
    
    return (
      <div className="near-container">
        <div className="near-dapp near-dapp-redpacket">
          <div className="near-redpacket-header">
            <img className="redpacket-cover" src={nearcover} alt="" />
            <button className="redpacket-btn">{lang == "zh-CN" ? "拆封" : "OPEN" }</button>
          </div>
          <div className="near-redpacket-body">
            <div className="redpacket-content">
              <div className="redpacket-content-title">{lang == "zh-CN" ? "感谢您的关注" : "Thank You" }</div>
              <div className="redpacket-content-subtitle">{lang == "zh-CN" ? "来自 NEAR 团队的祝福" : "FROM NEAR Protocol" }</div>
            </div>
            <div className="redpacket-card">
              <img className="redpacket-cover" src={nearcover} alt="" />
              <div className="redpacket-card-header">
                <div className="h2">{lang == "zh-CN" ? "感谢您的关注" : "Thank You" }</div></div>
              <div className="redpacket-card-body">
                <div className="">{lang == "zh-CN" ? "金额" : "AMOUNT" }</div>
                { status ?
                  <div className="h1">{nearTo(amount, 2)}<small>Ⓝ</small></div>
                  :
                  <div className="h2">{lang == "zh-CN" ? "已领取" : "ALREADY CLAIMED" }</div>
                }
              </div>
              <div className="redpacket-card-footer">
                { status && walletClaimUrl ?
                  <>
                    {login ? 
                    <>
                      <button className="btn btn-gold btn-block btn-lg" onClick={() => this.claimDrop(secretkey)}>
                        {lang == "zh-CN" ? "领取 NEAR" : "CLAIM NEAR" }
                      </button>
                      <button className="btn btn-link btn-block text-ellipsis mt-2" onClick={() => this.requestSignOut()}>
                        {lang == "zh-CN" ? "登出" : "Logout" }
                        <span className="ml-1">{currentUser.account_id}</span>
                      </button>
                    </>
                    : 
                    <>
                      <a className="btn btn-gold btn-block btn-lg" href={walletClaimUrl} target="_blank">{lang == "zh-CN" ? "注册并领取 NEAR" : "CLAIM NEAR" }</a>
                      <button className="btn btn-link btn-block mt-2" onClick={this.requestSignIn}>
                        {lang == "zh-CN" ? "登录领取" : "LOGIN" }
                      </button>
                    </>
                    }
                  </>
                  :
                  <a className="btn btn-gold btn-block btn-lg disabled" href="#">{lang == "zh-CN" ? "无法领取 NEAR" : "Invalid Redpacket" }</a>
                }
              </div>
            </div>
          </div>
        </div>

        <div className="toast-wechat">
          推荐在浏览器中打开领取 ↗
        </div>
      </div>
    )
  }

}

export default Claim;
