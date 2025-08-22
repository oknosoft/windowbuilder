import React from 'react';
import Frame from '../Additions/Frame';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import Composition from './Composition';

export default function CompositionFrame({dialog, handlers}) {

  const {ref, _mgr} = dialog;
  const calc_order = _mgr.by_ref[ref];

  const [dialogRef, registerDialod] = React.useState(null);

  const {handleCancel, handleCommit, obj, orderRow, cmeta, pmeta} = React.useMemo(() => {

    const handleCancel = () => {
      handlers.handleIfaceState({
        component: dialog?.cmd?.area || 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    };

    return {
      handleCancel,
      handleCommit() {
        Promise.resolve()
          .then(handleCancel)
          .catch(console.error);
      },
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
      <Button key="ok" onClick={handleCommit} color="primary">Записать</Button>,
      <Button key="cancel" onClick={handleCancel} color="secondary">Отмена</Button>
    ]}
  >
    <Composition dialog={dialog} dialogRef={dialogRef}/>
  </Dialog>;
}

