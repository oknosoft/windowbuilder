/**
 * Парамерты допвставок
 *
 * @module DopInsetsProps
 *
 * Created by Evgeniy Malyarov on 13.02.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import TabularSection from 'metadata-react/TabularSection';
import Typography from '@material-ui/core/Typography';

class InsetsProps extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('params'));
    // this._meta.fields.w.type.fraction = 0;
    // this._meta.fields.h.type.fraction = 0;

    cat.scheme_settings.find_rows({obj: 'cat.characteristics.params'}, (scheme) => {
      if(scheme.name.endsWith('dop')) {
        this.scheme = scheme;
      }
    });
  }

  filter = (collection) => {
    const res = [];
    const {cnstr, inset} = this.props;
    collection.forEach((row) => {
      if(row.cnstr === cnstr && row.inset === inset && !row.hide) {
        res.push(row);
      }
    });
    return res;
  }

  render() {
    const {ox, cnstr} = this.props;
    const minHeight = 120;
    return this.scheme ?
      <div>
        <div style={{height: minHeight}}>
          <TabularSection
            _obj={ox}
            _meta={this._meta}
            _tabular="params"
            scheme={this.scheme}
            filter={this.filter}
            minHeight={minHeight}
            hideToolbar
          />
        </div>
      </div>
      :
      <Typography color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.params", name: "cat.characteristics.params.dop"}`}
      </Typography>;
  }

}

InsetsProps.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
  inset: PropTypes.object.isRequired,
};

export default InsetsProps;
