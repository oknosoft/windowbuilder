import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

import WindowSizer from 'metadata-react/WindowSize';
import {withObj} from 'metadata-redux';

//import DataList from 'metadata-react/DataList';
import DataList from 'metadata-react/DynList';
import DataObj from '../DataObjPage';
import MetaObjPage from '../MetaObjPage';
import NotFoundPage from '../NotFoundPage';
import FrmReport from 'metadata-react/FrmReport';

class DataRoute extends Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    windowHeight: PropTypes.number.isRequired,
    windowWidth: PropTypes.number.isRequired,
    handlers: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    components: PropTypes.object,
  };

  render() {
    const {match, handlers, windowHeight, windowWidth} = this.props;
    const {area, name} = match.params;
    const _mgr = $p[area][name];

    if(!_mgr) {
      return <NotFoundPage/>;
    }

    const {current_user} = $p;
    const _acl = current_user ? current_user.get_acl(_mgr.class_name) : 'e';

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

    if(area === 'rep') {
      const Component = _mgr.FrmObj || FrmReport;
      return <Component _mgr={_mgr} _acl={_acl} match={match} location={this.props.location} {...sizes} />;
    }

    return <Switch>
      <Route path={`${match.url}/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`}
             render={(props) => wraper(DataObj, props, 'obj')}/>
      <Route path={`${match.url}/list`} render={(props) => wraper(DataList, props, 'list')}/>
      <Route path={`${match.url}/meta`} render={(props) => wraper(MetaObjPage, props)}/>
      <Route component={NotFoundPage}/>
    </Switch>;
  }

  getChildContext() {
    return {components: {DataObj, DataList}};
  }
}

export default WindowSizer(withObj(DataRoute));
