/**
 * ### Табчасть параметрических продукций
 *
 * @module Production
 *
 * Created by Evgeniy Malyarov on 22.07.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import TabularSection from 'metadata-react/TabularSection';
import {handleAdd, handleRemove} from '../Additions/connect';
import CustomToolbar from './CustomToolbar';

class Production extends React.Component {

  constructor(props) {
    super(props);
    this.selectedRow = null;
    this.handleAdd = handleAdd.bind(this);
    this.handleRemove = handleRemove.bind(this);
    this.state = {count: props.dp.production.count()};
  }

  cellSelect = ({idx, rowIdx}) => {
    const {tabular, props, selectedRow} = this;
    const row = tabular && tabular.rowGetter(rowIdx);
    if(row !== selectedRow) {
      this.selectedRow = row;
      props.onSelect(row, idx);
    }
  };

  cellDeSelect = () => {
    if(this.selectedRow) {
      this.selectedRow = null;
      this.props.onSelect(null);
    }
  };

  render() {
    const {props, state: {count}} = this;
    const {dp, scheme, meta} = props;
    let minHeight = 120;
    if(count) {
      minHeight += (33 * ((count < 8 ? count : 8) - 1));
    }

    const Toolbar = () => {
      return <CustomToolbar handleAdd={this.handleAdd} handleRemove={this.handleRemove} count={count}/>;
    };

    return <div style={{height: minHeight + 35}}>
      <TabularSection
        ref={(el) => this.tabular = el}
        _obj={dp}
        _meta={meta}
        _tabular="production"
        scheme={scheme}
        onCellSelected={this.cellSelect}
        onCellDeSelected={this.cellDeSelect}
        minHeight={minHeight}
        Toolbar={Toolbar}
      />
    </div>;
  }
}

Production.propTypes = {
  dp: PropTypes.object.isRequired,
  scheme: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Production;
