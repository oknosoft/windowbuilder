/**
 * ### Фильтр по статусам, подразделениям и ответственным
 *
 * @module Params
 *
 * Created by Evgeniy Malyarov on 07.03.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';

import DataField from 'metadata-react/DataField';

class Params extends React.Component {

  render() {
    const {scheme, handleFilterChange} = this.props;
    return <div>
      <DataField _obj={scheme} _fld="date_from"/>
      <DataField _obj={scheme} _fld="date_till"/>
    </div>
  }

}

Params.propTypes = {
  scheme: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default Params;
