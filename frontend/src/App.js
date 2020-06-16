import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AuthPage from './pages/Auth';
import RewardsPage from './pages/Rewards';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthContext from './context/auth-context';

import { Provider } from 'react-redux';
import store from './store';

import './App.css';

class App extends Component {
  state = {
    token: null,
    userId: null
  };

  login = (token, userId, tokenExpiration) => {
    this.setState({ token: token, userId: userId });
  };

  logout = () => {
    this.setState({ token: null, userId: null });
  };

  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <React.Fragment>
            <AuthContext.Provider
              value={{
                token: this.state.token,
                userId: this.state.userId,
                login: this.login,
                logout: this.logout
              }}
            >
              <MainNavigation />
              <main className="main-content">
                <Switch>
                  {this.state.token && <Redirect from="/" to="/rewards" exact />}
                  {this.state.token && (
                    <Redirect from="/auth" to="/rewards" exact />
                  )}
                  {!this.state.token && (
                    <Route path="/auth" component={AuthPage} />
                  )}
                  {!this.state.token && <Redirect to="/auth" exact />}
                  <Route path="/rewards" component={RewardsPage} />
                </Switch>
              </main>
            </AuthContext.Provider>
          </React.Fragment>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
