import React from 'react';

const {scale_svg} =   $p.utils;

export default function Additions2DSvg({row, height}) {
  const svg = row?.dop ?
    (row.dop.svg ? scale_svg(row.dop.svg, {height, zoom: 1}, 8) : 'Раскрой не выполнен') : 'Не выбрана строка заготовок';
  return <div dangerouslySetInnerHTML={{__html: svg}}/>;
}
