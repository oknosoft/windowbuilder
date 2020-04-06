import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
//import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import withStyles from './styles';
import {stat} from './Progress';


function Report1D({hide_head, ...props}) {
  return <div className={props.classes.root}>
    {!hide_head && <Head key="head" {...props}/>}
    <div className={props.classes.data} key="table"><NomTable {...props}/></div>
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
            <TableCell><Typography variant="subtitle1">Участок</Typography></TableCell>
            <TableCell>{_obj.key.presentation}</TableCell>
            <TableCell><Typography variant="subtitle1">Получатель</Typography></TableCell>
            <TableCell>{_obj.recipient.presentation}</TableCell>
          </TableRow>
          <TableRow className={classes.row}>
            <TableCell><Typography variant="subtitle1">Заказы</Typography></TableCell>
            <TableCell colSpan={3}>{Array.from(orders).map((v) => v.number_doc).sort().join(', ')}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
  </div>;
}

// рисует таблицу по номенклатуре
function NomTable({_obj, classes}) {
  const res = [];
  const {debit_credit_kinds} = $p.enm;

  // бежим по свёрнутой табчасти раскроя
  const fragments = _obj.fragments();
  fragments.forEach((characteristics, nom) => {
    for(const [characteristic] of characteristics) {
      const crows = _obj.cutting.find_rows({nom, characteristic});
      const cuts_in = _obj.cuts.find_rows({record_kind: debit_credit_kinds.credit, nom, characteristic});
      const cuts_out = _obj.cuts.find_rows({record_kind: debit_credit_kinds.debit, nom, characteristic});

      const products_len = crows.reduce((sum, row) => sum + row.len, 0);
      const workpieces_len = cuts_in.reduce((sum, row) => sum + row.len, 0);
      const scraps_len = cuts_out.reduce((sum, row) => sum + row.len, 0);
      const knifewidth = nom.knifewidth || 7;
      const workpieces = cuts_in.map(({len, stick}) => {
        crows.forEach((row) => {
          if(stick === row.stick) {
            len -= (row.len + knifewidth);
          }
        });
        return len > 0 ? len : 0;
      });
      const scraps_percent = (workpieces_len - products_len - scraps_len - crows.length * knifewidth) * 100 / workpieces_len;

      const status = {
        rows: crows,
        cuts_in,
        workpieces,
        products_len,
        workpieces_len,
        scraps_len,
        scraps_percent: scraps_percent > 0 ? scraps_percent : 0,
        userData: {usefulscrap: 600, knifewidth}
      };

      res.push(<div key={`${nom.ref}-${characteristic.ref}`} className={classes.nom}>
        <Typography variant="h6">{nom.name + (characteristic.empty() ? '' : ` ${characteristic.name}`)}</Typography>
        <Typography variant="subtitle1">{stat(status)}</Typography>
        <Visualization classes={classes} status={status}/>
      </div>);
    }
  });
  return res;
}

class V1D extends paper.Project {

  redraw({userData, cuts_in, rows}) {

    this.clear();

    let x=0, h=88;

    for (let i = 0; i < cuts_in.length; i++) {

      const workpiece = cuts_in[i];
      const w = workpiece.len;
      const y = Math.round(h * 1.3) * i;

      new paper.Path({
        segments: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]],
        strokeColor: 'grey',
        strokeScaling: false,
        strokeWidth: 1,
        closed: true
      });

      const res = [];
      rows.forEach(({stick, len}) => {
        if(stick === workpiece.stick){
          res.push(len);
        }
      });
      res.sort((a, b) => b - a);
      res.reduce((sum, curr) => {
        new paper.Path({
          segments: [[x + sum + h / 2, y + 4], [x + sum + curr - h / 2, y + 4], [x + sum + curr, y + h - 4], [x + sum, y + h - 4]],
          fillColor: new paper.Color(Math.random() * 0.1 + 0.7, Math.random() * 0.2 + 0.8, Math.random() * 0.1 + 0.88),
          closed: true
        });
        new paper.PointText({
          point: [x + sum + curr / 2, y + 24 + h / 2],
          content: curr,
          fillColor: 'black',
          justification: 'center',
          fontSize: 72
        });
        return sum + curr + userData.knifewidth;
      }, 0);

    }

    this.zoom_fit();
    this.view.update();
  }

  zoom_fit () {

    var bounds = this.activeLayer && this.activeLayer.strokeBounds;

    if(bounds && bounds.height && bounds.width){
      this.view.zoom = Math.min((this.view.viewSize.height - 8) / bounds.height, (this.view.viewSize.width - 8) / bounds.width);
      this.view.center = bounds.center;
    }
  }

}

// рисует результат раскроя
function Visualization({status, classes}) {
  return <canvas className={classes.canvas} ref={(canvas) => {
    if(canvas) {
      canvas.height = status.cuts_in.length * 27 * canvas.width / 1530;
      const scheme = new V1D(canvas);
      scheme.redraw(status);
    }
  }}/>;
}

Report1D.propTypes = {
  classes: PropTypes.object.isRequired,
  _obj: PropTypes.object.isRequired,
  hide_head: PropTypes.bool,
};

NomTable.propTypes = {
  _obj: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

Head.propTypes = {
  _obj: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

Visualization.propTypes = {
  status: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};


export default withStyles(Report1D);
