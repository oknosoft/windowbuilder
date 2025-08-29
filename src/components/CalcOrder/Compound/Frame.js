import React from 'react';
import Frame from '../Additions/Frame';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from 'metadata-react/App/Dialog';
import Composition from './Composition';
import Svgs from './Svgs';
import useStyles from '../../Builder/Controls/stylesAccordion';

const {job_prm: {properties: {compoundable}}, cat: {inserts}, ui, msg} = $p;
let initFolder;
for(const ref in compoundable) {
  initFolder = inserts.get(ref);
  break;
}
function initProd(calc_order) {
  for(const {characteristic} of calc_order.production) {
    if(characteristic.calc_order === calc_order) {
      return characteristic;
    }
  }
  return null;
}

export default function CompositionFrame({dialog, handlers}) {

  const {ref, _mgr} = dialog;
  const calc_order = _mgr.by_ref[ref];
  const classes = useStyles();
  const [dialogRef, registerDialod] = React.useState(null);
  const [currentFolder, setFolder] = React.useState(initFolder);
  const [currentProd, setProd] = React.useState(initProd(calc_order));

  const {handleCancel, handleCommit, prms, imgs} = React.useMemo(() => {

    const composition = calc_order.composition.toJSON().map(v => ({...v}));

    const prms = {calc_order, compoundable: new Map(), composition, setFolder, setProd};
    for(const ref in compoundable) {
      const param = compoundable[ref];
      const folder = inserts.get(ref);
      prms.compoundable.set(folder, {param, inserts: folder._children()});
    }

    const handleCancel = () => {
      handlers.handleIfaceState({
        component: dialog?.cmd?.area || 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    };

    const handleCommit = () => {
      Promise.resolve(handleCancel())
        .then(() => {
          calc_order.composition = composition;
          const {wnd} = dialog;
          wnd.progressOn();
          calc_order.recalc({save: true})
            .catch((err) => {
              ui.dialogs.alert({
                title: 'Пересчёт заказа',
                type: 'alert-error',
                text: err.stack || err.message,
                timeout: 5000,
              });
            })
            .then(() => {
              wnd.progressOff();
              wnd.set_text();
            });
        })
        .catch(console.error);
    };

    const imgs = [];
    for(const {characteristic} of calc_order.production) {
      if(characteristic.svg) {
        imgs.push(characteristic);
      }
    }

    return {
      imgs,
      prms,
      handleCancel,
      handleCommit,
    };
  }, [calc_order]);


  return <Dialog
    ref={registerDialod}
    open
    initFullScreen
    large
    title={`Редактор состава к ${calc_order.presentation}`}
    onClose={handleCancel}
    actions={<>
      <Svgs imgs={imgs} currentProd={currentProd} setProd={setProd}/>
      <Button key="ok" onClick={handleCommit} color="primary">Рассчитать и записать</Button>
      <Button key="cancel" onClick={handleCancel} color="secondary">Отмена</Button>
    </>}
  >
    <Composition
      dialog={dialog}
      dialogRef={dialogRef}
      classes={classes}
      prms={prms}
      currentFolder={currentFolder}
      currentProd={currentProd}
    />
  </Dialog>;
}

