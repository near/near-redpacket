import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import * as nearApi from 'near-api-js';
import { KeyPair } from 'near-api-js';
import detectBrowserLanguage from 'detect-browser-language'
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
      lang: '',
      amount: 0,
    }
  }

  async componentDidMount() {
    // Detect browser lang
    const detectBrowserLanguage = require('detect-browser-language')
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

  getAccount(accountId) {
    return new nearApi.Account(window.near.connection, accountId)
  }

  render() {
    const { status, walletClaimUrl, amount, lang } = this.state;
    
    return (
      <div className="near-container">
        <div className="near-dapp near-dapp-redpacket">
          <div className="near-redpacket-header">
            <img className="redpacket-cover" src={nearcover} alt="" />
            <button className="redpacket-btn">{this.state.lang == "zh-CN" ? "拆封" : "OPEN" }</button>
          </div>
          <div className="near-redpacket-body">
            <div className="redpacket-content">
              <div className="redpacket-content-title">{this.state.lang == "zh-CN" ? "感谢您的关注" : "Thank You" }</div>
              <div className="redpacket-content-subtitle">{this.state.lang == "zh-CN" ? "来自 NEAR 团队的祝福" : "FROM NEAR Protocol" }</div>
            </div>
            <div className="redpacket-card">
              <img className="redpacket-cover" src={nearcover} alt="" />
              <div className="redpacket-card-header">
                <div className="h2">{this.state.lang == "zh-CN" ? "感谢您的关注" : "Thank You" }</div></div>
              <div className="redpacket-card-body">
                <div className="">{this.state.lang == "zh-CN" ? "金额" : "AMOUNT" }</div>
                { status ?
                  <div className="h1">{nearTo(amount, 2)}<small>Ⓝ</small></div>
                  :
                  <div className="h2">{this.state.lang == "zh-CN" ? "已领取" : "ALREADY CLAIMED" }</div>
                }
              </div>
              <div className="redpacket-card-footer">
                { status && walletClaimUrl ?
                  <a className="btn btn-gold btn-block btn-lg" href={walletClaimUrl} target="_blank">{this.state.lang == "zh-CN" ? "注册并领取 NEAR" : "CLAIM NEAR" }</a>
                  :
                  <a className="btn btn-gold btn-block btn-lg disabled" href="#">{this.state.lang == "zh-CN" ? "无法领取 NEAR" : "Invalid Redpacket" }</a>
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
