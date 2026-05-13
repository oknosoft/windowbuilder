import React from 'react';
const MontageBagFrame = React.lazy(() => import('./Frame'));

function MontageBag(props) {
  return <React.Suspense fallback="Загрузка...">
      <MontageBagFrame {...props}/>
    </React.Suspense>;
}

export function patch($p) {
  const {ui, DocCalc_order, doc: {calc_order}, utils} = $p;

  Object.defineProperties(DocCalc_order.prototype, {
    montageBag: {
      value({interactive, text='', wnd}) {
        if(interactive) {
          ui.dialogs.alert({
            title: 'Монтажные мешки',
            timeout: 0,
            Component: MontageBag,
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


