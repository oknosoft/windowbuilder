import React from 'react';
import {Treebeard, decorators, filters, theme} from 'wb-forms/dist/Treebeard';

const width = {width: 90, textAlign: 'right'};
function getStruct(raw) {
  const struct = {
    key: 'root',
    frozen: true,
    width: 920,
    //icon: 'icon',
    name: <>
      <span style={{flex: 1}}><hr style={{marginTop: 13, opacity: 0.3}}/></span>
      <span style={width}>Колич</span>
      <span style={width}>Площадь</span>
      <span style={width}>Масса</span>
      <span style={width}>Цена</span>
      <span style={width}>Сумма</span>
    </>,
    children: [{
      key: 'order',
      width: 900,
      //frozen: true,
      //icon: 'icon',
      name: <>
        <span style={{flex: 1}}>{`Заказ ${raw.ЗаказНомер} от ${raw.ДатаЗаказаФорматD}`}</span>
        <span style={width}>0</span>
        <span style={width}>0</span>
        <span style={width}>0</span>
        <span style={width}>0</span>
        <span style={width}>0</span>
      </>,
      children: [],
      toggled: true,
    }],
    toggled: true,
  };
  return struct;
}

const style = $p.utils._clone(theme);
Object.assign(style.tree.node.header.title, {display: 'flex'});

export default function OrderTotals({ox, calc_order}) {
  if(!calc_order) {
    calc_order = ox.calc_order;
  }
  const [struct, setStruct] = React.useState(null);
  React.useEffect(() => {
    calc_order.print_data().then((raw) => {
      setStruct(getStruct(raw));
    });
  }, [calc_order]);

  const forceUpdate = () => setStruct({...struct});

  const onToggle = (node, toggled) => {
    if (node.children && !node.frozen) {
      node.toggled = toggled;
      forceUpdate();
    }
  };

  const onClickHeader = () => {

  };

  const handleMenuOpen = () => {

  };

  return struct ? <div className="dsn-tree" style={{minHeight: 420}}>
    <Treebeard
      data={struct}
      decorators={decorators}
      separateToggleEvent={true}
      onToggle={onToggle}
      onClickHeader={onClickHeader}
      onRightClickHeader={handleMenuOpen}
      style={style}
    />
  </div> : 'Получаем данные...';
}
