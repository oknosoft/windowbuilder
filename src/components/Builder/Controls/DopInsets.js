/**
 * Доп. вставки в изделие, слой, элемент
 *
 * @module DopInsets
 *
 * Created by Evgeniy Malyarov on 13.02.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import TabularSection from 'metadata-react/TabularSection';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/DeleteOutline';
import Toolbar from '@material-ui/core/Toolbar';
import LinkedProps from './LinkedProps';

class DopInsets extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('inserts'));
    cat.scheme_settings.find_rows({obj: 'cat.characteristics.inserts'}, (scheme) => {
      if(scheme.name.endsWith('dop')) {
        this.scheme = scheme;
      }
    });
    this.state = {row: null, inset: null};
  }

  filter = (collection) => {
    const res = [];
    const {cnstr} = this.props;
    collection.forEach((row) => {
      if(row.cnstr === cnstr) {
        res.push(row);
      }
    });
    return res;
  };

  defferedUpdate = () => {
    this.rowUpdate();
    setTimeout(() => {
      const {editor} = this.props;
      editor && editor.project && editor.project.register_change();
      this.forceUpdate();
    }, 300);
  };

  handleAdd = () => {
    const {ox, cnstr} = this.props;
    /* eslint-disable-next-line */
    const row = ox.inserts.add({cnstr});
    this.defferedUpdate();
  };

  handleRemove = () => {
    this._grid.handleRemove();
    this.defferedUpdate();
  };

  handleRef = (el) => {
    this._grid = el;
  };

  rowUpdate = (sel, row) => {
    if(!row && sel && sel.hasOwnProperty('rowIdx')) {
      row = this._grid.rowGetter(sel.rowIdx);
    }
    this.setState({row, inset: (!row || row.inset.empty()) ? null : row.inset});
  };

  btns() {
    return [
      <IconButton key="btn_add" title="Добавить вставку" onClick={this.handleAdd}><AddIcon /></IconButton>,
      <IconButton key="btn_del" title="Удалить строку" onClick={this.handleRemove}><RemoveIcon /></IconButton>,
    ];
  }

  render() {
    /* eslint-disable-next-line */
    const {state: {row, inset}, props: {ox, cnstr, kind}} = this;
    const minHeight = 170;

    return this.scheme ?
      <div>
        <Typography>{`Доп. вставки в ${kind}${cnstr ? ` №${cnstr}` : ''}`}</Typography>
        <div style={{height: minHeight}}>
          <TabularSection
            ref={this.handleRef}
            _obj={ox}
            _meta={this._meta}
            _tabular="inserts"
            scheme={this.scheme}
            filter={this.filter}
            minHeight={minHeight}
            denyAddDel
            denyReorder
            btns={this.btns()}
            onCellSelected={this.rowUpdate}
            onRowUpdated={this.defferedUpdate}
          />
        </div>
        {inset && <Toolbar disableGutters variant="dense">
          <Typography color="primary">{`Параметры `}</Typography>&nbsp;<Typography color="secondary">{` ${inset.name}`}</Typography>
        </Toolbar>}
        {inset && <LinkedProps ts={ox.params} cnstr={cnstr} inset={inset} />}
      </div>
      :
      <Typography color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.inserts", name: "cat.characteristics.inserts.dop"}`}
      </Typography>;
  }

}

DopInsets.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
  editor: PropTypes.object,
  kind: PropTypes.string,
};

export default DopInsets;
