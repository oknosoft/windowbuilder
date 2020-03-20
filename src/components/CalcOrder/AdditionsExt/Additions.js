import React from 'react';
import PropTypes from 'prop-types';
import Production from './Production';
import Params from './Params';
import FormGroup from '@material-ui/core/FormGroup';
import {fill_data, fill_schemas} from '../Additions/connect';

class Additions extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.group = $p.enm.inserts_types.Параметрик;
    this.items = [this.group];
    this.state = {row: null, inset: null};
  }

  componentDidMount() {
    fill_data.call(this, this.props.dialog.ref, [this.group]);
    const {cat, dp} = $p;
    fill_schemas.call(this, cat.scheme_settings.find_rows({obj: 'dp.buyers_order.production', user: ''}));
    dp.buyers_order.on('update', this.inset_change);
  }

  componentWillUnmount() {
    $p.dp.buyers_order.off('update', this.inset_change);
  }

  inset_change = (obj, fields) => {
    if(Object.prototype.hasOwnProperty.call(fields, 'inset')) {
      this.setState({inset: obj.inset});
    }
  };

  setProduct = (row) => {
    const {inset} = row || {};
    if(row && this.state.inset != inset) {
      row.value_change('inset', '', inset);
    }
    this.setState({row, inset});
  };

  render() {
    const {state: {schemas, row, inset}, props, dp, components, group} = this;
    const ext = schemas && Object.assign({}, components.get(group), row && row._meta && {meta: row._meta});
    return schemas ?
      <FormGroup>
        <Production
          dp={dp}
          group={group}
          {...ext}
          scheme={schemas.get(group)}
          onSelect={this.setProduct}
        />
        <Params
          dp={dp}
          row={row}
          inset={inset}
          {...ext}
          {...props}
        />
      </FormGroup>
      :
      <div>Чтение настроек компоновки...</div>;
  }
}

Additions.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Additions;
