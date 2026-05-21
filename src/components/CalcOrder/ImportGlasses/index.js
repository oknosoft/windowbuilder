import React from 'react';
const ClipBoard = React.lazy(() => import('./ClipBoard'));

function ImportGlasses(props) {
  return <React.Suspense fallback="Загрузка...">
    <ClipBoard {...props}/>
  </React.Suspense>;
}

export function patch($p) {
  const {ui, DocCalc_order, doc: {calc_order}, utils} = $p;

  Object.defineProperties(DocCalc_order.prototype, {
    importGlasses: {
      value({interactive, text='', wnd}) {
        if(interactive) {
          ui.dialogs.alert({
            title: 'Импорт стеклопакетов',
            timeout: 0,
            Component: ImportGlasses,
            props: {obj: this, wnd},
            large: true,
            //initFullScreen: true,
            hide_btn: true,
            //noSpace: true,
          });
        }
      }
    },
  });
}


