/**
 * Табличная часть свойств со связями параметров
 *
 * @module LinkedProps
 *
 * Created by Evgeniy Malyarov on 09.03.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import LinkedProp from './LinkedProp';

class LinkedProps extends React.Component {

  render() {
    const {ts, cnstr, inset} = this.props;
    const {fields} = ts._owner._metadata(ts._name);
    const res = [];

    ts.find_rows({cnstr, inset}, (prow) => {
      const {param} = prow;
      const elm = <LinkedProp key={`prm-${_obj.row}`} _obj={prow} cnstr={cnstr} inset={inset} fields={fields} />;
      elm && res.push(elm);
    });
    return res;
  }

}

LinkedProps.propTypes = {
  ts: PropTypes.object.isRequired,
  cnstr: PropTypes.number,
  inset: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default LinkedProps;
