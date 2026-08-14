const min = 148;
const text = `Рекомендуется Google Chrome версии ${min} или выше\n
Возможны ошибки в расчёте и ценах и сбои в графическом построителе`;

export function browser_version({ui}) {
  const parts = navigator.userAgent.split('Chrome/');
  if(parts.length < 2) {
    ui.dialogs.alert({title: 'Несовместимый браузер', text});
  }
  else {
    const num = parseInt(parts[1].split('.')[0]);
    if(isNaN(num) || num < min) {
      ui.dialogs.alert({title: 'Устаревший браузер', text});
    }
  }
}
