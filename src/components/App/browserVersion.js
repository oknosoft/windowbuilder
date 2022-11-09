import React from 'react';
import Typography from '@material-ui/core/Typography';

function Incompatable() {
  return <>
    <Typography variant="h5">Похоже, вы используете FireFox, Yandex или Safari</Typography>
    <Typography>Мы тестируем релизы только в браузере Chrome</Typography>
    <Typography>Стабильная работа на других версиях не гарантируется</Typography>
  </>;
}

export default function check(dialogs) {
  const {userAgent} = navigator;
  if(!userAgent.match(/Chrome/) || userAgent.match(/Firefox|YaBrowser|Yowser|Edg|OPR/)) {
    dialogs.alert({
      title: 'Браузер не поддерживается',
      text: <Incompatable />
    });
  }
}
