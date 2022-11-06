import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

import WindowSizer from 'metadata-react/WindowSize';
import {withObj} from 'metadata-redux';

import {lazy} from './lazy';                        // конструкторы для контекста
import NotFoundPage from '../NotFoundPage';

function DataRoute({match, handlers, title, windowHeight, windowWidth}) {
  const {area, name} = match.params;
  const _mgr = $p[area][name];

  if(!_mgr) {
    return <NotFoundPage/>;
  }

  const {current_user} = $p;
  const _acl = current_user ? current_user.get_acl(_mgr.class_name) : 'r';

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
    const Component = _mgr.FrmObj || lazy.FrmReport;
    return <Component _mgr={_mgr} _acl={_acl} match={match} title={title} {...handlers} {...sizes} />;
  }

  return <Switch>
    <Route path={`${match.url}/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`}
           render={(props) => wraper(lazy.DataObj, props, 'obj')}/>
    <Route path={`${match.url}/list`} render={(props) => wraper(lazy.DataList, props, 'list')}/>
    <Route component={NotFoundPage}/>
  </Switch>;
}

DataRoute.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  windowHeight: PropTypes.number.isRequired,
  windowWidth: PropTypes.number.isRequired,
  handlers: PropTypes.object.isRequired,
};

export default WindowSizer(withObj(DataRoute));
