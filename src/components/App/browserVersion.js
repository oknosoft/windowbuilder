import React from 'react';
import Typography from '@material-ui/core/Typography';

function Incompatable() {
  return <>
    <Typography variant="h5">Похоже, вы используете FireFox, Yandex или Safary</Typography>
    <Typography>Мы тестируем релизы только в браузере Chrome</Typography>
    <Typography>Стабильная работа на других версиях не гарантируется</Typography>
  </>;
};

export default function check(dialogs) {
  if(navigator.userAgent.match(/Firefox|YaBrowser|Yowser|Edg/)) {
    dialogs.alert({
      title: 'Браузер не поддерживается',
      text: <Incompatable />
    })
  }
}
