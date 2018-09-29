import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import withStyles from './styles';

function Report1D(props) {
  return <div className={props.classes.root}>
    <Head key="head" {...props}/>
    <NomTable key="table" {...props}/>
    <Stick key="stick" {...props}/>
    <Footer key="footer" {...props}/>
  </div>;
}

// рисует шапку
function Head({_obj, classes}) {
  const orders = new Set();
  _obj.planning.forEach(({obj}) => orders.add(obj.calc_order));
  return <div>
    <Typography variant="headline">{_obj.presentation}</Typography>
      <Table classes={{cell: classes.cell}}>
        <TableBody>
          <TableRow className={classes.row}>
            <TableCell><Typography variant="subheading">Участок</Typography></TableCell>
            <TableCell>{_obj.key.presentation}</TableCell>
            <TableCell><Typography variant="subheading">Получатель</Typography></TableCell>
            <TableCell>{_obj.recipient.presentation}</TableCell>
          </TableRow>
          <TableRow className={classes.row}>
            <TableCell><Typography variant="subheading">Заказы</Typography></TableCell>
            <TableCell colspan={3}>{Array.from(orders).map((v) => v.number_doc).sort().join(', ')}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
  </div>;
}

// рисует таблицу по номенклатуре
function NomTable(props) {
  return <div>Table</div>;
}

// рисует одну палку
function Stick(props) {
  return <div>Stick</div>;
}

// рисует подвал
function Footer(props) {
  return <div>Footer</div>;
}

export default withStyles(Report1D);
