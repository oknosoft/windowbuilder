import React from 'react';
import {ClipBoard} from './ClipBoard';

export function patch($p) {
  const {ui, DocCalc_order, doc: {calc_order}, utils} = $p;

  function execute(obj, text) {
    obj[text];
  }

  Object.defineProperties(DocCalc_order.prototype, {
    importGlasses: {
      value({interactive, text='', wnd}) {
        if(interactive) {
          ui.dialogs.alert({
            title: 'Импорт стеклопакетов',
            timeout: 0,
            Component: ClipBoard,
            props: {obj: this, execute, wnd},
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


