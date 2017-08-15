import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';
import wrapDisplayName from 'recompose/wrapDisplayName';

import DataListPage from '../../components/DataListPage';
import DataObjPage from '../../components/DataObjPage';
import MetaObjPage from '../../components/MetaObjPage';
import NotFoundPage from '../../components/NotFoundPage';


const DataRoute = ({match}) => {

  const withMngr = (Component) => {
    const wraped = (props) => {
      const {area, name} = match.params;
      const _mngr = $p[area][name];
      return <Component _mngr={_mngr} {...props} />;
    };
    wraped.displayName = wrapDisplayName(Component, 'withMngr');
    return wraped;
  };

  return <Switch>
    <Route path={`${match.url}/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`} render={withMngr(DataObjPage)}/>
    <Route path={`${match.url}/list`} render={withMngr(DataListPage)}/>
    <Route path={`${match.url}/meta`} render={withMngr(MetaObjPage)}/>
    <Route component={NotFoundPage}/>
  </Switch>;
};
DataRoute.propTypes = {
  match: PropTypes.object.isRequired,
};

export default DataRoute;
