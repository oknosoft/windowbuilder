import React from 'react';
import PropTypes from 'prop-types';
import Production from './Production';
import Params from './Params';
import {alasql_schemas, fill_data, fill_schemas} from '../CalcOrderAdditions/connect';

class Additions extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.group = $p.enm.inserts_types.Параметрик;
    this.items = [this.group];
    this.state = {product: null};
  }

  componentDidMount() {
    fill_data.call(this, this.props.dialog.ref, [this.group]);
    fill_schemas.call(this, alasql_schemas());
    $p.dp.buyers_order.on('update', this.inset_change);
  }

  componentWillUnmount() {
    $p.dp.buyers_order.off('update', this.inset_change);
  }

  inset_change = (obj, fields) => {
    const {groups, dp} = this;
  }

  setProduct = (product) => {
    this.setState({product});
  }

  render() {
    const {state, props, dp, components, group} = this;
    return state.schemas ?
      <div>
        <Production
          dp={dp}
          group={group}
          {...components.get(group)}
          scheme={state.schemas.get(group)}
          onSelect={this.setProduct}
        />
        <Params
          dp={dp}
          product={state.product}
          {...props}
        />
      </div>
      :
      <div>Чтение настроек компоновки...</div>;
  }
}

Additions.propTypes = {
  dialog: PropTypes.object.isRequired,
};

export default Additions;
