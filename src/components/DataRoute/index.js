import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

import WindowSizer from 'metadata-react/WindowSize';
import withObj from 'metadata-redux/src/withObj';

import DataList from 'metadata-react/DataList';
import DataObj from '../DataObjPage';
import MetaObjPage from '../MetaObjPage';
import NotFoundPage from '../NotFoundPage';
import FrmReport from 'metadata-react/FrmReport';

class DataRoute extends Component {

  render() {
    const {match, handlers, windowHeight, windowWidth} = this.props;
    const {area, name} = match.params;
    const _mgr = $p[area][name];
    const _acl = $p.current_user.get_acl(_mgr.class_name);

    const sizes = {
      windowHeight,
      windowWidth,
      height: windowHeight > 480 ? windowHeight - 52 : 428,
      width: windowWidth > 800 ? windowWidth - (windowHeight < 480 ? 20 : 0) : 800
    };

    const wraper = (Component, props, type) => {
      if(type === 'obj' && _mgr.FrmObj) {
        Component = _mgr.FrmObj;
      }
      else if(type === 'list' && _mgr.FrmList) {
        Component = _mgr.FrmList;
      }
      return <Component _mgr={_mgr} _acl={_acl} handlers={handlers} {...props} {...sizes}  />;
    };

    if(match.params.area === 'rep') {
      const Component = _mgr.FrmObj || FrmReport;
      return <Component _mgr={_mgr} _acl={_acl} match={match} {...sizes} />;
    }

    return <Switch>
      <Route path={`${match.url}/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`} render={(props) => wraper(DataObj, props)}/>
      <Route path={`${match.url}/list`} render={(props) => wraper(DataList, props)}/>
      <Route path={`${match.url}/meta`} render={(props) => wraper(MetaObjPage, props)}/>
      <Route component={NotFoundPage}/>
    </Switch>;
  }

  getChildContext() {
    return {components: {DataObj, DataList}};
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
    windowHeight: PropTypes.number.isRequired,
    windowWidth: PropTypes.number.isRequired,
    handlers: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    components: PropTypes.object,
  };
}

export default WindowSizer(withObj(DataRoute));
