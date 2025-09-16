/**
 * ### Слушатель событий экспорта в dxf и открытия 3d-рендера
 */

function serialize(scheme) { /* eslint-disable-line */
  return {};
}

export default function ($p) {

  $p.ui.dxf = () => import('dxf-writer/src/Drawing').then(jscad => jscad.default || jscad);

  $p.md.on({

    dxf(scheme) {
      //import('@jscad/openjscad')
      import('dxf-writer/src/Drawing')
        .then((jscad) => import('./exec_js_dxf')
          .then(({exec_dxf}) => exec_dxf(scheme, jscad.default || jscad)));
    },

  });
}
