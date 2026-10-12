import React from 'react';
import Button from '@material-ui/core/Button';

const Materials = React.lazy(() => import('./Materials'));

function MinVolume(props) {
  return <React.Suspense fallback="Загрузка...">
      <Materials {...props}/>
    </React.Suspense>;
}

function Actions({handleOk, tunnel, calc_order, wnd, ...other}) {
  return <Button key="ok" onClick={() => {
    const min_order_volume = {};
    for(const {nom, quantity} of tunnel.obj.production) {
      if(!nom.empty() && quantity) {
        min_order_volume[nom.ref] = quantity;
      }
    }
    calc_order.extra = {min_order_volume};
    calc_order.reset_specify();
    calc_order.recalc_insets();
    calc_order.spread_min_volume();
    calc_order.production.sync_grid(wnd.elmnts.grids.production);
    handleOk();
  }} color="primary">Ок</Button>;
}

export function patch($p) {
  const {ui, DocCalc_order} = $p;
  const tunnel = {};

  Object.defineProperties(DocCalc_order.prototype, {
    minVolumes: {
      value(wnd) {
        ui.dialogs.alert({
          title: 'Минимальные количества',
          timeout: 0,
          Component: MinVolume,
          props: {calc_order: this, wnd},
          large: true,
          //initFullScreen: true,
          hide_btn: true,
          //noSpace: true,
          Actions,
          tunnel,
        });
      }
    },
  });
}


