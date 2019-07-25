import React from 'react';
import PropTypes from 'prop-types';
import Production from './Production';
import Params from './Params';
import FormGroup from '@material-ui/core/FormGroup';
import {alasql_schemas, fill_data, fill_schemas} from '../CalcOrderAdditions/connect';

class Additions extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.group = $p.enm.inserts_types.Параметрик;
    this.items = [this.group];
    this.state = {row: null};
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

  setProduct = (row) => {
    this.setState({row});
  }

  render() {
    const {state, props, dp, components, group} = this;
    const ext = state.schemas && components.get(group);
    return state.schemas ?
      <FormGroup>
        <Production
          dp={dp}
          group={group}
          {...ext}
          scheme={state.schemas.get(group)}
          onSelect={this.setProduct}
        />
        <Params
          dp={dp}
          row={state.row}
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
