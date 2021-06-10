import React from 'react';
import Grid from '@material-ui/core/Grid';
import ReactDataGrid from 'react-data-grid';
import {withStyles} from '@material-ui/styles';
import Proto from 'wb-forms/dist/ObjHistory/RevsDetales';

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    marginRight: theme.spacing(),
  },
});

const DateFormatter = ({value}) => {
  const values = moment(value).format(moment._masks.date_time).split(' ');
  return <div>{values[0]}<small>{` ${values[1]}`}</small></div>;
};

const NomFormatter = ({value}) => {
  const nom = $p.cat.nom.get(value);
  return nom.presentation;
};

const columns_doc = [
  {key: 'state', name: 'Статус', width: 100, resizable: true},
  {key: 'date', name: 'Дата', width: 140, resizable: true, formatter: DateFormatter},
  {key: 'user', name: 'Автор', resizable: true},
  {key: 'count', name: 'Строк', width: 70, resizable: true},
  {key: 'doc_amount', name: 'Сумма', width: 100, resizable: true},
];

const columns_prod = [
  {key: 'nom', name: 'Номенклатура', resizable: true, formatter: NomFormatter},
  {key: 'len', name: 'x', width: 70, resizable: true},
  {key: 'width', name: 'y', width: 70, resizable: true},
  {key: 's', name: 's', width: 70, resizable: true},
  {key: 'quantity', name: 'Колич', width: 60, resizable: true},
  {key: 'price', name: 'Цена', width: 80, resizable: true},
  {key: 'discount_percent', name: 'Скид%', width: 60, resizable: true},
  {key: 'amount', name: 'Сумма', width: 80, resizable: true},
];

class RevsDetales extends Proto {

  revs_rows(src) {
    const rows = [];
    for(const {timestamp, _rev, production, doc_amount, obj_delivery_state} of src) {
      if(timestamp) {
        const row = {
          _rev,
          date: moment(timestamp.moment, 'YYYY-MM-DDTHH:mm:ss ZZ').toDate(),
          user: timestamp.user,
          count: production.length,
          doc_amount,
          production,
          state: obj_delivery_state,
        };
        rows.push(row);
      }
    }
    return Promise.resolve(rows);
  }

  render() {
    let {state: {rows, production}, props: {classes}} = this;
    if(!production) {
      production = [];
    }
    return rows ? <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item sm={12} md={5}>
          <ReactDataGrid
            columns={columns_doc}
            rowGetter={i => rows[i]}
            rowsCount={rows.length}
            onCellSelected={({rowIdx}) => {
              this.setState({production: rows[rowIdx].production});
            }}
          />
        </Grid>
        <Grid item sm={12} md={7}>
          <ReactDataGrid
            columns={columns_prod}
            rowGetter={i => production[i]}
            rowsCount={production.length}
          />
        </Grid>
      </Grid>
    </div> : 'loading...';
  }
}

export default withStyles(styles)(RevsDetales);
