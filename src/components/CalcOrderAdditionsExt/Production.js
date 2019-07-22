/**
 * ### Табчасть параметрических продукций
 *
 * @module Production
 *
 * Created by Evgeniy Malyarov on 22.07.2019.
 */

import React from 'react';
import TabularSection from 'metadata-react/TabularSection';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/Delete';
import {handleAdd, handleRemove} from '../CalcOrderAdditions/connect';

class Production extends React.Component {

  constructor(props) {
    super(props);
    this.selectedRow = null;
    this.handleAdd = handleAdd.bind(this);
    this.handleRemove = handleRemove.bind(this);
    this.state = {count: props.dp.production.count()};
  }

  render() {
    const {props, state: {count}} = this;
    const {dp, classes, scheme, meta} = props;
    const style = {flex: 'initial'};
    if(count) {
      style.minHeight = 80 + (33 * (count - 1));
      //style.maxHeight = 320;
    }

    return <div style={{height: (style.minHeight || 0) + 35}}>
      <IconButton title="Добавить строку" onClick={this.handleAdd}><AddIcon/></IconButton>
      <IconButton title="Удалить строку" disabled={!count} onClick={this.handleRemove}><RemoveIcon/></IconButton>
      <TabularSection
        ref={(el) => this.tabular = el}
        _obj={dp}
        _meta={meta}
        _tabular="production"
        scheme={scheme}
        onRowUpdated={this.onRowUpdated}
        onCellSelected={this.onCellSelected}
        onCellDeSelected={() => this.selectedRow = null}
        minHeight={style.minHeight}
        hideToolbar
      />
    </div>;
  }
}

export default Production;
