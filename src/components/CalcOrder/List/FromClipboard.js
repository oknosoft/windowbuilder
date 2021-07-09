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

const wrong = 'В буфере обмена нет корректных данных о заказе';
const processing = 'Обработка данных...\nДлительная операция';

const presentation = (raw) => {
  if(raw && typeof raw === 'string') {
    return raw;
  }
  if(raw && raw.date && raw.number_doc) {
    const date = moment(raw.date);
    return `Расчет-заказ №${raw.number_doc} от ${date.format('LL')}
cтрок: ${raw.production.length}, сумма: ${raw.doc_amount}, автор: ${$p.cat.users.get(raw.manager).toString()}`;
  }
  return '';
};

export default function FromClipboard({queryClose}) {

  const classes = useStyles();
  const [enable_clone, setClone] = React.useState(false);
  const [enable_copy, setCopy] = React.useState(false);
  const [raw, setRaw] = React.useState({});

  const onPaste = async ({clipboardData}) => {

    try {
      const text = clipboardData.getData('text/plain');
      const tmp = JSON.parse(text);
      if(tmp.ref && tmp.class_name === 'doc.calc_order') {
        setRaw(tmp);
        // если заказ существует в текущем кластере - разрешаем только копирование
        // если сохраненного заказа нет и у пользователя мощная роль - разрешаем клон
        // TODO: на время отладки, проверку делаем только в текущей базе
        const {current_user, doc: {calc_order}} = $p;
        const doc = await calc_order.get(tmp.ref, 'promise');
        setCopy(true);
        if(doc.is_new() &&
          (current_user.role_available('СогласованиеРасчетовЗаказов') ||
            current_user.role_available('РедактированиеЦен') ||
            current_user.roles.includes('doc_full'))) {
          setClone(true);
        }
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
      setClone(false);
      setCopy(false);
    }
  };

  const copy = () => {
    const src = raw;
    Object.defineProperty(src, 'refill_props', {
      value: true,
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

  return <Dialog
    open
    title="Импорт заказа"
    onClose={queryClose}
    actions={[
      <Button key="clone" onClick={clone} disabled={!enable_clone}>Вставить клон</Button>,
      <Button key="copy" onClick={copy} disabled={!enable_copy}>Создать копию</Button>,
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
