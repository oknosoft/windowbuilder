import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from 'metadata-react/App/Dialog';

import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
  text: {
    width: 'calc(100% - 8px)',
    height: 80,
  },
});

const processing = 'Обработка данных...\nДлительная операция';

const presentation = (raw) => {
  const {cat} = $p;
  if(raw && typeof raw === 'string') {
    return raw;
  }
  if(raw?.date && raw.number_doc) {
    const date = moment(raw.date);
    return `Расчет-заказ №${raw.number_doc} от ${date.format('LL')}
cтрок: ${raw.production.length}, сумма: ${raw.doc_amount}, автор: ${cat.users.get(raw.manager).toString()}`;
  }
  if(raw?.sys && raw.x && raw.y) {
    return `Система: ${cat.production_params.get(raw.sys).name}
Цвет: ${cat.clrs.get(raw.clr).name}
Габариты: ${raw.x}x${raw.y}, площадь: ${raw.s}м²`;
  }
  return '';
};

export default function FromClipboard(props) {

  let {queryClose, handlers, dialog} = props;
  if(!queryClose && handlers) {
    queryClose = () => {
      handlers.handleIfaceState({
        component: 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    };
  }

  const wrong = `В буфере обмена нет корректных данных о ${dialog ? 'продукции' : 'заказе'}`;

  const classes = useStyles();
  //const [enable_clone, setClone] = React.useState(false);
  const [enable_copy, setCopy] = React.useState(false);
  const [refill, setRefill] = React.useState(false);
  const [raw, setRaw] = React.useState({});

  const onPaste = async ({clipboardData}) => {

    try {
      const text = clipboardData.getData('text/plain');
      const tmp = JSON.parse(text);
      if(tmp?.ref && !dialog && tmp?.class_name === 'doc.calc_order') {
        setRaw(tmp);
        // если заказ существует в текущем кластере - разрешаем только копирование
        // если сохраненного заказа нет и у пользователя мощная роль - разрешаем клон
        // TODO: на время отладки, проверку делаем только в текущей базе
        const {current_user, doc: {calc_order}} = $p;
        const doc = await calc_order.get(tmp.ref, 'promise');
        setCopy(true);
      }
      else if(dialog && tmp?.class_name === 'cat.characteristics') {
        setRaw(tmp);
        setCopy(true);
      }
      else {
        setRaw(wrong);
      }
    }
    catch (e) {
      setRaw(wrong);
    }
  };
  const onKeyDown = (e) => {
    if(e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      e.stopPropagation();
      setRaw({});
      //setClone(false);
      setCopy(false);
    }
  };

  const copy = () => {
    if(dialog) {
      queryClose();
      dialog.cmd.fin(raw, refill);
    }
    const src = raw;
    Object.defineProperty(src, 'refill_props', {
      value: refill,
      enumerable: false,
      configurable: true,
    });
    setRaw(processing);
    const {doc: {calc_order}, ui: {dialogs}} = $p;
    calc_order
      .clone(src)
      .then((doc) => {
        queryClose();
        dialogs.handleNavigate(`/doc.calc_order/${doc.ref}`);
      })
      .catch((e) => {
        setRaw(e.message);
      });
  };

  const clone = () => {
    queryClose();
  };

  const handleChange = ({target}) => {
    setRefill(target.checked);
  };

  return <Dialog
    open
    title={`Импорт ${dialog ? 'продукции' : 'заказа'}`}
    onClose={queryClose}
    actions={[
      <FormControlLabel
        control={<Checkbox checked={refill} onChange={handleChange} />}
        label="Свойства из системы"
      />,
      //<Button key="clone" onClick={clone} disabled={!enable_clone}>Вставить клон</Button>,
      <Button key="copy" onClick={copy} disabled={!enable_copy}>{`Создать ${dialog ? 'продукцию' : 'копию'}`}</Button>,
      <Button key="cancel" onClick={queryClose} color="primary">Закрыть</Button>
    ]}
  >
    <textarea
      className={classes.text}
      placeholder="Вставьте сюда содержимое буфера обмена..."
      value={presentation(raw)}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
      onChange={() => null}
    />
  </Dialog>;
}

FromClipboard.propTypes = {
  queryClose: PropTypes.func.isRequired,
};
