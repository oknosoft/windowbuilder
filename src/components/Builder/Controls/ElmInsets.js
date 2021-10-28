/**
 * Вставки в элемент
 *
 * Created by Evgeniy Malyarov on 25.08.2021.
 */

import React from 'react';
import Typography from '@material-ui/core/Typography';
import TabularSection from 'metadata-react/TabularSection';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/DeleteOutline';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Bar from './Bar';
import ElmInsetProps from './ElmInsetProps';

export default class ElmInsets extends React.Component {

  constructor(props, context) {
    super(props, context);

    const {inset} = props.elm;
    if(inset.inserts.count()) {
      const {cat, utils} = $p;
      this._meta = utils._clone(cat.characteristics.metadata('inserts'));
      this._meta.fields.inset.choice_params = [{name: 'ref', path: inset.inserts.unload_column('inset')}];
      cat.scheme_settings.find_rows({obj: 'cat.characteristics.inserts'}, (scheme) => {
        if(!this.scheme || scheme.name.endsWith('main')) {
          this.scheme = scheme;
        }
      });
    }
    this.state = {row: null, inset: null};
  }

  filter = (collection) => {
    const {elm} = this.props.elm;
    const res = [];
    collection.find_rows({cnstr: -elm}, (row) => {
      res.push(row);
    });
    return res;
  };

  defferedUpdate = () => {
    setTimeout(() => {
      this._grid && this._grid.forceUpdate();
    }, 100);
  };

  handleAdd = () => {
    const {ox, elm, inset} = this.props.elm;
    $p.ui.dialogs.input_value({
      title: 'Укажите вставку',
      list: inset.inserts.unload_column('inset'),
    })
      .then((inset) => {
        const row = ox.inserts.add({cnstr: -elm, inset});
        return row;
      })
      .then((row) => {
        if(this._grid) {
          this._grid.cache_actual = false;
        }
        this.setState({row, inset: row.inset})
      });
  };

  handleRemove = () => {
    this._grid.handleRemove();
    this.setState({row: null, inset: null});
  };

  handleRef = (el) => {
    this._grid = el;
  };

  handleCellSelected = (sel, row) => {
    if(!row && sel && sel.hasOwnProperty('rowIdx')) {
      row = this._grid.rowGetter(sel.rowIdx);
    }
    this.setState({row, inset: (!row || row.inset.empty()) ? null : row.inset});
  };


  render() {

    const {props: {elm}, state: {row, inset}} = this;

    if(!elm.inset.inserts.count()) {
      return null;
    }

    return <>
      <Bar>Вложенные вставки</Bar>
      <Toolbar disableGutters variant="dense">
        <IconButton key="btn_add" title="Добавить вставку" onClick={this.handleAdd}><AddIcon /></IconButton>
        <IconButton key="btn_del" title="Удалить строку" onClick={this.handleRemove}><RemoveIcon /></IconButton>
      </Toolbar>
      {this.scheme ? <>
          <div style={{height: 110}}>
            <TabularSection
              ref={this.handleRef}
              _obj={elm.ox}
              _meta={this._meta}
              _tabular="inserts"
              scheme={this.scheme}
              filter={this.filter}
              minHeight={110}
              hideToolbar
              denyReorder
              onCellSelected={this.handleCellSelected}
              //onRowUpdated={this.defferedUpdate}
            />
          </div>
          <ElmInsetProps elm={elm} inset={inset} row={row}/>
        </>
        :
        <Typography color="error">
          {`Не найден элемент scheme_settings {obj: "cat.characteristics.inserts", name: "inserts.main"}`}
        </Typography>}
    </>;
  }
};
