import React from 'react';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

function calcStat(obj) {
  const stat = new Map();
  for(const row of obj.cuts) {
    if(!stat.has(row.nom)) {
      stat.set(row.nom, {
        debit: {count: 0, area: 0},
        credit: {count: 0, area: 0},
        product: {count: 0, area: 0},
      });
    }
    const res = stat.get(row.nom);
    const mark = row.record_kind.is('debit') ? res.debit : res.credit;
    mark.count += 1;
    mark.area += row.len * row.width / 1e6;
  }
  for(const row of obj.cutting) {
    const res = stat.get(row.nom);
    res.product.count += 1;
    res.product.area += row.len * row.width / 1e6;
  }
  for(const [nom, res] of stat) {
    res.useArea = res.debit.area - res.credit.area;
  }
  return stat;
}

export default function Additions2DReport({obj}) {
  const stat = calcStat(obj);
  const children = [];
  for(const [nom, res] of stat) {
    children.push(<TableRow key={nom.ref}>
      <TableCell>{nom.name}</TableCell>
      <TableCell>{`${res.product.count} шт ${res.product.area.round(3)} м²`}</TableCell>
      <TableCell>{`${res.debit.count} шт ${res.debit.area.round(3)} м²`}</TableCell>
      <TableCell>{`${res.credit.count} шт ${res.credit.area.round(3)} м²`}</TableCell>
      <TableCell>{`${(res.product.area * 100 / res.debit.area).round()} % использ, ${100 - (res.product.area * 100 / res.debit.area).round()} % отход`}</TableCell>
      <TableCell>{`${(res.product.area * 100 / res.useArea).round()} % использ, ${100 - (res.product.area * 100 / res.useArea).round()} % отход`}</TableCell>
    </TableRow>)
  }
  return <>
    <Typography variant="h5">Статистика</Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Материал</TableCell>
          <TableCell>Изделий</TableCell>
          <TableCell>Заготовок</TableCell>
          <TableCell>Деловая обрезь</TableCell>
          <TableCell>Коэфф чистый</TableCell>
          <TableCell>С учетом обрези</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {children}
      </TableBody>
    </Table>
  </>;
}
