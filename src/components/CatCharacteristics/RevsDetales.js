import React from 'react';
import Grid from '@material-ui/core/Grid';
import ReactDataGrid from 'react-data-grid';
import {withStyles} from '@material-ui/styles';
import Proto from 'wb-forms/dist/ObjHistory/RevsDetales';
import {DateFormatter, NomFormatter, styles} from '../CalcOrder/RevsDetales';

const PropFormatter = ({value}) => value ? value.presentation : '';

const EmptyRowsView = (classes) => () => <div className={classes.empty}>Укажите строку версии продукции (слева)</div>;

const columns_doc = [
  {key: 'date', name: 'Дата', width: 140, resizable: true, formatter: DateFormatter},
  {key: 'user', name: 'Автор', resizable: true},
  {key: 'owner', name: 'Номенклатура', resizable: true, formatter: NomFormatter},
  {key: 'x', name: 'X', width: 70, resizable: true},
  {key: 'y', name: 'Y', width: 70, resizable: true},
  {key: 's', name: 'S', width: 70, resizable: true},
];

const columns_prop = [
  {key: 'cnstr', name: 'Слой', width: 70, resizable: true},
  {key: 'param', name: 'Параметр', resizable: true, formatter: PropFormatter},
  {key: 'value', name: 'Значение', resizable: true, formatter: PropFormatter},
];

class RevsDetales extends Proto {

  componentDidMount() {
    super.componentDidMount();
    const {props, handleClose} = this;
    if(!props.isRoot) {
      props.setClose({handler: handleClose, text: 'Вернуться в заказ'});
    }
  }

  componentWillUnmount() {
    const {props, unmounted} = this;
    if(!unmounted && !props.isRoot) {
      props.setClose({handler: null, text: ''});
    }
  }

  handleClose = () => {
    const {props} = this;
    props.resetObj();
    return props.isRoot;
  };

  filter_params(tx, tparams) {
    const res = [];
    if(tparams) {
      tx.params.load(tparams.filter((row) => !row.hide));
      for(const {cnstr, inset, param, value} of tx.params) {
        if(!param.is_calculated || param.show_calculated) {
          res.push({cnstr, inset, param, value});
        }
      }
    }
    return res;
  }

  revs_rows = (src) => {
    const rows = [];
    const tx = $p.cat.characteristics.create({}, false, true);

    for(const {timestamp, _rev, owner, params, x, y, s} of src) {
      if(timestamp) {
        const row = {
          _rev,
          date: moment(timestamp.moment, 'YYYY-MM-DDTHH:mm:ss ZZ').toDate(),
          user: timestamp.user,
          owner,
          params: this.filter_params(tx, params),
          x,
          y,
          s,
        };
        rows.push(row);
      }
    }
    tx.unload();

    return Promise.resolve(rows);
  };

  render() {
    let {state: {rows, params}, props: {classes}} = this;
    if(!params) {
      params = [];
    }
    return rows ? <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item sm={12} md={5}>
          <ReactDataGrid
            columns={columns_doc}
            rowGetter={i => rows[i]}
            rowsCount={rows.length}
            onCellSelected={({rowIdx}) => {
              this.setState({params: rows[rowIdx].params});
            }}
          />
        </Grid>
        <Grid item sm={12} md={7}>
          <ReactDataGrid
            columns={columns_prop}
            rowGetter={i => params[i]}
            rowsCount={params.length}
            emptyRowsView={EmptyRowsView(classes)}
          />
        </Grid>
      </Grid>
    </div> : 'loading...';
  }
}

export default withStyles(styles)(RevsDetales);
