import React from 'react';
import Frame from '../Additions/Frame';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import Composition from './Composition';
import useStyles from '../../Builder/Controls/stylesAccordion';

export default function CompositionFrame({dialog, handlers}) {

  const {ref, _mgr} = dialog;
  const calc_order = _mgr.by_ref[ref];
  const classes = useStyles();
  const [dialogRef, registerDialod] = React.useState(null);

  const {handleCancel, handleCommit, prms} = React.useMemo(() => {

    const composition = calc_order.composition.toJSON().map(v => ({...v}));

    const {job_prm: {properties: {compoundable}}, cat: {inserts}, ui, msg} = $p;
    const prms = {calc_order, compoundable: new Map(), composition};
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

    return {
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
    actions={[
      <Button key="ok" onClick={handleCommit} color="primary">Рассчитать и записать</Button>,
      <Button key="cancel" onClick={handleCancel} color="secondary">Отмена</Button>
    ]}
  >
    <Composition dialog={dialog} dialogRef={dialogRef} classes={classes} prms={prms}/>
  </Dialog>;
}

