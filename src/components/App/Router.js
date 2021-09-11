import React from 'react';
import PropTypes from 'prop-types';
import {Router, Switch, Route} from 'react-router-dom';
import {createBrowserHistory} from 'history';
import Toolbar from './Toolbar';
import Builder from '../Builder';
import Templates from '../CalcOrder/Templates';
import CalcOrderList from '../CalcOrder/List';


const history = createBrowserHistory();

const handleNavigate = (url) => {
  history.push(url);
};


class AppRouter extends React.Component {

  routeComponent = (Component) => {
    return (props) => <Component {...this.props} {...props} handleNavigate={handleNavigate}/>;
  };

  render() {
    const props = Object.assign({}, )
    return <Router history={history}>
      <Switch>
        <Route
          path="/builder/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"
          render={this.routeComponent(Builder)}
        />
        <Route
          path="/templates"
          render={this.routeComponent(Templates)}
        />
        <Route
          path="/order/list"
          render={this.routeComponent(CalcOrderList)}
        />
        <Route>
          <Toolbar />
        </Route>
      </Switch>
    </Router>;
  }

  getChildContext() {
    return {handleNavigate};
  }
}

AppRouter.childContextTypes = {
  handleNavigate: PropTypes.func,
};

export default AppRouter;

