import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';

import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
  text: {
    width: 'calc(100% - 8px)',
    height: 80,
  },
});

const presentation = (raw) => {
  const date = moment(raw.date);
  return `Расчет-заказ №${raw.number_doc} от ${date.format('LL')}`;
};

export default function FromClipboard({queryClose}) {

  const classes = useStyles();
  const [enable_clone, setClone] = React.useState(false);
  const [enable_copy, setCopy] = React.useState(false);
  const [descr, setDescr] = React.useState('');
  const onPaste = async ({clipboardData}) => {
    const wrong = 'В буфере обмена нет корректных данных о заказе';
    try {
      const text = clipboardData.getData('text/plain');
      const raw = JSON.parse(text);
      if(raw.ref && raw.class_name === 'doc.calc_order') {
        setDescr(presentation(raw));
      }
      else {
        setDescr(wrong);
      }
    }
    catch (e) {
      setDescr(wrong);
    }
  };
  const onKeyDown = (e) => {
    if(e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      e.stopPropagation();
      setDescr('');
    }
  };

  return <Dialog
    open
    title="Импорт заказа"
    onClose={queryClose}
    actions={[
      <Button key="clone" onClick={queryClose} disabled={!enable_clone}>Вставить клон</Button>,
      <Button key="copy" onClick={queryClose} disabled={!enable_copy}>Создать копию</Button>,
      <Button key="cancel" onClick={queryClose} color="primary">Закрыть</Button>
    ]}
  >
    <textarea
      readOnly
      className={classes.text}
      placeholder="Вставьте сюда содержимое буфера обмена..."
      value={descr}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
    />
  </Dialog>;
}

FromClipboard.propTypes = {
  queryClose: PropTypes.func.isRequired,
};
