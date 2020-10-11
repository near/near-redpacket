import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import * as nearApi from 'near-api-js';
import { KeyPair } from 'near-api-js';
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
      amount: 0,
    }
  }

  async componentDidMount() {
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
    const { status, walletClaimUrl, amount } = this.state;
    
    return (
      <div className="near-container">
        <div className="near-dapp near-dapp-redpacket">
          <div className="near-redpacket-header">
            <img className="redpacket-cover" src={nearcover} alt="红包封面图" />
            <button className="redpacket-btn">拆封</button>
          </div>
          <div className="near-redpacket-body">
            <div className="redpacket-content">
              <div className="redpacket-content-title">中秋快乐</div>
              <div className="redpacket-content-subtitle">来自 NEAR 团队的祝福</div>
            </div>
            <div className="redpacket-card">
              <img className="redpacket-cover" src={nearcover} alt="红包封面图" />
              <div className="redpacket-card-header">
                <div className="h2">中秋快乐</div></div>
              <div className="redpacket-card-body">
                <div className="">金额</div>
                { status ?
                  <div className="h1">{nearTo(amount, 2)}<small>Ⓝ</small></div>
                  :
                  <div className="h2">已领取</div>
                }
              </div>
              <div className="redpacket-card-footer">
                { status && walletClaimUrl ?
                  <a className="btn btn-gold btn-block btn-lg" href={walletClaimUrl} target="_blank">注册并领取 NEAR</a>
                  :
                  <a className="btn btn-gold btn-block btn-lg disabled" href="#">无法领取 NEAR</a>
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
