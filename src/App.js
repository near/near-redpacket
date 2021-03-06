import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import Drops from './Drops';
import nearlogo from './assets/near-logo.svg';
import iconUser from './assets/img/icon-account.svg';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      currentUser: window.currentUser,
    }
    this.signedInFlow = this.signedInFlow.bind(this);
    this.requestSignIn = this.requestSignIn.bind(this);
    this.requestSignOut = this.requestSignOut.bind(this);
    this.signedOutFlow = this.signedOutFlow.bind(this);
    this.updateUser = this.updateUser.bind(this);
  }

  async componentDidMount() {
    let loggedIn = this.props.wallet.isSignedIn();
    if (loggedIn) {
      this.signedInFlow();
    } else {
      this.signedOutFlow();
    }
    this.setState({ currentUser: window.currentUser })
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

  /********************************
  Download keypair
  ********************************/
  downloadFile(fileName, data, type='text/plain') {
    const a = document.createElement('a')
    a.style.display = 'none'
    document.body.appendChild(a)
    a.href = window.URL.createObjectURL(new Blob([data], { type }))
    a.setAttribute("download", fileName)
    a.click()
    window.URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  }

  downloadJson() {
    try {
      const accountId = currentUser.account_id
      const dropStorageKey = '__drops_' + accountId
      const data = localStorage.getItem(dropStorageKey) || '[]'
      this.downloadFile(accountId + '.json', data)
    } catch(e) {
      console.warn(e)
    }
  }

  render() {
    const {
      state,
      updateUser
    } = this
    const {
      currentUser
    } = state

    console.log(state)

    return (
      <div className="near-container">
        <div className="near-dapp">
          <div className="near-dapp-header">
            <div className="near-logo">
              <img className="near-logo" src={nearlogo} alt="NEAR logo" height="32" />
            </div>
            <div className="near-user">
              {this.state.login ? 
                  <div className="dropdown dropdown-right" tabIndex="0">
                      <div className="btn">
                        <img className="btn-icon" src={iconUser} alt="NEAR user" height="40" />
                        <span className="text-ellipsis">{currentUser.account_id}</span>
                      </div>
                      <ul className="menu">
                        <li className="menu-item">
                          <a href="#" onClick={() => this.downloadJson()}>
                            Backup NEAR Drops
                          </a>
                        </li>
                        {/* <li className="menu-item">
                          <a href="#" onClick={() => this.restoreJson()}>
                            Restore
                          </a>
                        </li> */}
                        <li className="divider"></li>
                        <li className="menu-item">
                          <a href={window.nearConfig.walletUrl} target="_blank">
                            NEAR Wallet
                          </a>
                        </li>
                        <li className="menu-item">
                          <a href="#" onClick={() => this.requestSignOut()}>
                            Log Out
                          </a>
                        </li>
                      </ul>
                  </div>
                  : <></>
              }
            </div>
          </div>
          <div className="near-dapp-body">
            <div>
              { currentUser ? 
                <Drops {...{currentUser, updateUser}} />
                : 
                <div className="empty">
                    <div className="empty-icon">🧧</div>
                    <p className="empty-title h5">NEAR Redpackets</p>
                    <p className="empty-subtitle">Login and Send NEAR Redpackets.</p>
                    <div className="empty-action">
                      <div className="near-user">
                        <a className="btn" href="#" onClick={this.requestSignIn}>
                          <img className="btn-icon" src={iconUser} alt="NEAR user" height="40" />
                          <span className="text-ellipsis">Login with NEAR</span>
                        </a>
                      </div>
                    </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default App;
