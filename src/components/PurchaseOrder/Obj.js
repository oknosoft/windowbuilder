import React from 'react';
import PropTypes from 'prop-types';
import WindowSizer from 'metadata-react/WindowSize';
import LoadingModal from 'metadata-react/DumbLoader/LoadingModal';
import Head from './Head';
import Goods from './Goods';
import Toolbar from './ObjToolbar';

function PurchaseOrderObj({match, _mgr, handlers}) {

  const {ref} = match.params;
  const [obj, setObj] = React.useState(null);
  const [err, setErr] = React.useState(null);

  React.useEffect(() => {
    _mgr.get(ref, 'promise')
      .then((obj) => {
        setObj(obj);
        handlers.handleIfaceState({
          component: '',
          name: 'title',
          value: obj.presentation,
        });
      })
      .catch(setErr);
  }, [ref]);

  if(err) {
    return err.message || 'error';
  }
  if(!obj) {
    return <LoadingModal open text="Читаем документ из базы..." />;
  }
  return <>
    <Toolbar obj={obj} _mgr={_mgr} handlers={handlers}/>
    <Head obj={obj} />
    <Goods obj={obj} />
  </>;

}

PurchaseOrderObj.propTypes = {
  handlers: PropTypes.object,
  match: PropTypes.object,
  _mgr: PropTypes.object,
};

export default WindowSizer(PurchaseOrderObj);


