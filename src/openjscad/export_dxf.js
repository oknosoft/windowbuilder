/**
 * ### Слушатель событий экспорта в dxf и открытия 3d-рендера
 */

function serialize(scheme) { /* eslint-disable-line */
  return {};
}

export default function ($p) {
  $p.md.on({

    dxf(scheme) {
      //import('@jscad/openjscad')
      import('dxf-writer/src/Drawing')
        .then((jscad) => import('./exec_js_dxf')
          .then(({exec_dxf}) => exec_dxf(scheme, jscad.default || jscad)));
    },

    d3d(scheme) {
      // ключ окна 3d
      let d3d_key = sessionStorage.getItem('d3d_key');
      if(!d3d_key) {
        d3d_key = `builder-${Date.now()}`;
        sessionStorage.setItem('d3d_key', d3d_key);
      }

      if(window.d3d_wnd && !window.d3d_wnd.closed) {
        window.d3d_wnd.focus();
        window.d3d_wnd.postMessage(serialize(scheme));
      }
      else {
        window.d3d_wnd = window.open($p.job_prm.d3d, d3d_key);
        window.d3d_wnd.addEventListener('load', () => {
          setTimeout(() => {
            window.d3d_wnd.postMessage(serialize(scheme));
          }, 1000);
        }, false);
      }
    },

  });
}
