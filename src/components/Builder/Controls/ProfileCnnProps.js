
import React from 'react';
import LinkedProp from 'wb-forms/dist/Common/LinkedProp';

export default function ProfileCnnProps({elm}) {
  const {b, e} = elm;
  let node1;
  if(b.selected) {
    node1 = 'b';
  }
  else if(e.selected) {
    node1 = 'e';
  }
  if(node1) {
    const cnn_point = elm.cnn_point(node1);
    const params = new Set();
    if(cnn_point?.cnn && !cnn_point.cnn.empty()) {
      for(const row of cnn_point.cnn.selection_params) {
        row.origin.is('cnn') && params.add(row);
      }
      for(const row of cnn_point.cnn.sizes) {
        row.origin.is('cnn') && params.add(row);
      }
    }
    if(params.size) {
      const {Editor, enm} = $p;
      const elm2 = cnn_point.profile;
      let node2;
      if(elm2 instanceof Editor.Filling) {
        node2 = 't';
      }
      else {
        node2 = elm2 ? (elm2.b.is_nearest(cnn_point.point, true) ? 'b' : (elm2.e.is_nearest(cnn_point.point, true) ? 'e' : 't')) : 'Пустота';
      }
      const cnrow = elm.ox.cnn_elmnts.find({elm1: elm.elm, elm2: elm2?.elm || 0, node1, node2: node2 === 'Пустота' ? '' : node2});
      if(cnrow) {
        const {fields} = elm.ox._metadata('params');
        const res = [];
        for(const prm_row of params) {
          const {param, origin} = prm_row;
          const _obj = {
            param,
            get _row() {
              return cnrow;
            },
            get params() {
              return [{param}];
            },
            get value() {
              return param.is_calculated ?
                param.calculated_value({ox: elm.ox, elm, elm2, origin, layer: elm.layer, prm_row, node: node1, node2}) :
                param.extract_pvalue({ox: elm.ox, elm, elm2, origin, layer: elm.layer, prm_row, node: node1, node2, cnrow});
            },
            set value(v) {
              const old = elm.dop[node1] || {};
              old[param.ref] = v?.valueOf();
              elm.dop = {[node1]: old};
              elm.layer.redraw();
            }
          };
          res.push(<LinkedProp key={cnrow.row} _obj={_obj} param={param} fields={fields}/>);
        }
        return res;
      }
    }
  }
  return null;
}
