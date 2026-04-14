import React from 'react';
import {Treebeard, decorators, filters, theme} from 'wb-forms/dist/Treebeard';

function Column({text}) {
  return <span style={{width: 92, textAlign: 'right'}}>{text}</span>;
}

function Amount({text}) {
  return <span style={{width: 102, textAlign: 'right'}}>{text}</span>;
}

function Nom({text}) {
  return <span style={{flex: 1}}>{text}</span>;
}

function Row({values}) {
  const [nom, q, s, m, p, a] = values;
  return <>
    <Nom text={nom} />
    <Column text={q} />
    <Column text={s} />
    <Column text={m} />
    <Column text={p} />
    <Amount text={a} />
  </>;
}

const {utils, cat: {characteristics}, job_prm} =  $p;

function getStruct(raw) {
  const {Аксессуары, Материалы, Услуги, Продукция, СоставныеИзделия, ВсегоИзделий, ВсегоМасса, ВсегоМассаЗаполнений, ВсегоПлощадьИзделий, СуммаДокумента} = raw;
  const struct = {
    key: 'order',
    width: 1120,
    frozen: true,
    name: <Row values={[`Заказ ${raw.ЗаказНомер} от ${raw.ДатаЗаказаФорматD}`, '', ВсегоПлощадьИзделий.round(2), ВсегоМасса.round(1), '', parseFloat(СуммаДокумента).round()]}/>,
    children: [],
    toggled: true,
  };
  for(const [cx, {Изделия, ...det}] of СоставныеИзделия) {
    const {calc_order_row, extra} = cx;
    const compositeRow = {
      key: `c-${cx.ref}`,
      width: 1100,
      //frozen: true,
      //icon: 'icon',
      name: <Row values={[
        `${Изделия.length > 1 ? 'Составное ' : ''}${cx.name.split('/').filter((v, i) => i <= 1).join('/')}/${
        cx.owner.name}${extra.dimensions ? `/${(extra.dimensions.width).round()}x${(extra.dimensions.height).round()}` : ''}`,
        calc_order_row.quantity,
        (det.ПлощадьИзделий + det.ПлощадьДопов).round(2),
        (det.Масса + det.МассаДопов).round(1),
        '',
        det.Сумма + det.СуммаДопов,
      ]}/>,
      children: [],
      toggled: true,
      svg: cx.svg,
    };
    if(Изделия.length > 1) {
      compositeRow.children.push({
        key: `cpg-${cx.ref}`,
        width: 1082,
        name: <Row values={['Изделия', '', det.ПлощадьИзделий.round(2), det.Масса.round(1), '', det.Сумма]}/>,
        children: [],
      });
      for(const sub of Изделия) {
        const {characteristic} = sub;
        const subRow = {
          key: `cp-${characteristic.ref}`,
          width: 1066,
          name: <Row values={[
            `${characteristic.prod_name(true)}/${characteristic.x.round()}x${characteristic.y.round()}`,
            '',
            characteristic.s.round(2),
            characteristic.weight?.round(1),
            sub.price,
            sub.amount,
          ]}/>,
          svg: characteristic.leading_elm ? characteristic.svg : characteristic.constructions.find({parent: 0}).dop.svg,
        };
        compositeRow.children[0].children.push(subRow);
      }
    }
    struct.children.push(compositeRow);
    if(det.Допы.length) {
      const dopRow = {
        key: `cpd-${cx.ref}`,
        width: 1082,
        //frozen: true,
        //icon: 'icon',
        name: <Row values={['Допы', '', det.ПлощадьДопов.round(2) || '', det.МассаДопов.round(1), '', det.СуммаДопов]}/>,
        children: [],
      };
      compositeRow.children.push(dopRow);
      for(const sub of det.Допы) {
        const {characteristic} = sub;
        const subRow = {
          key: `cd-${characteristic.ref}`,
          width: 1066,
          name: <Row values={[
            `${characteristic.name.split('/').filter((v, i) => i > 1 && !v.startsWith('m:') && !v.startsWith('s:')).join('/')}`,
            '',
            characteristic.s.round(2) || '',
            characteristic.weight?.round(1),
            sub.price,
            sub.amount,
          ]}/>,
        };
        dopRow.children.push(subRow);
      }
    }
  }

  function isFree(ref) {
    const ox = characteristics.get(ref);
    for(const [cx, det] of СоставныеИзделия) {
      if(cx === ox) {
        return false;
      }
      for(const sub of det.Изделия.concat(det.Допы)) {
        if(sub.characteristic === ox) {
          return false;
        }
      }
    }
    return ox;
  }

  for(const prod of Продукция) {
    const cx = isFree(prod.ref);
    if(cx) {
      if(cx.coordinates.count()) {
        const prodRow = {
          key: `p-${prod.ref}`,
          width: 1100,
          name: <Row values={[
            `${cx.prod_name(true)}/${cx.x.round()}x${cx.y.round()}`,
            prod.Количество,
            cx.s.round(2),
            cx.weight?.round(1),
            prod.Цена,
            prod.Сумма,
          ]}/>,
          children: [],
          frozen: true,
          toggled: true,
          svg: cx.svg,
        };
        struct.children.push(prodRow);
      }
      else if(cx.owner === job_prm.nom.accessories) {
        const prodRow = {
          key: `p-${prod.ref}`,
          width: 1100,
          name: <Row values={[
            prod.Номенклатура,
            prod.Количество,
            '',
            cx.weight?.round(1),
            prod.Цена,
            prod.Сумма,
          ]}/>,
          children: [],
          frozen: true,
          toggled: true,
        };
        struct.children.push(prodRow);
      }
      else {
        Аксессуары.push(prod);
      }
    }
  }
  for(const prod of Аксессуары) {
    const cx = characteristics.get(prod.ref);
    const prodRow = {
      key: `d-${cx.ref}`,
      width: 1100,
      name: <Row values={[
        `${cx.name.split('/').filter((v, i) => i > 1 && !v.startsWith('m:') && !v.startsWith('s:')).join('/')}`,
        prod.Количество,
        cx.s.round(2) || '',
        cx.weight?.round(1) || '',
        prod.Цена,
        prod.Сумма,
      ]}/>,
      children: [],
      frozen: true,
      toggled: true,
      svg: cx.svg,
    };
    struct.children.push(prodRow);
  }
  for(const prod of Услуги) {
    const cx = characteristics.get(prod.ref);
    const part = cx.name.split('/').filter((v, i) => i > 1);
    const last = part[part.length - 1].split('|').filter((v) => !v.startsWith('m:') && !v.startsWith('s:'));
    const prodRow = {
      key: `u-${prod.ref}`,
      width: 1100,
      name: <Row values={[
        `${cx.prod_name(true)}/${last.join('/')}`,
        prod.Количество,
        cx.s.round(2) || '',
        '',
        prod.Цена,
        prod.Сумма,
      ]}/>,
      children: [],
      frozen: true,
      toggled: true,
    };
    struct.children.push(prodRow);
  }
  return struct;
}

const style = utils._clone(theme);
Object.assign(style.tree.node.header.title, {display: 'flex'});

export function OrderTotals({ox, calc_order, obj}) {
  if(!calc_order) {
    calc_order = ox?.calc_order || obj;
  }
  const [svg, setSvg] = React.useState('');
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

  const onClickHeader = (node) => {
    setSvg(node.svg || '');
  };

  const handleMenuOpen = () => {

  };

  return struct ? <div className="dsn-tree" style={{minHeight: 480, position: 'relative'}}>
    <div style={{display: 'flex', width: 1144}}><Row values={[<hr style={{marginTop: 13, opacity: 0.3}}/>, 'Колич', 'Площ.изд', 'Масса', 'Цена', 'Сумма']} /></div>
    <Treebeard
      data={struct}
      decorators={decorators}
      separateToggleEvent={true}
      onToggle={onToggle}
      onClickHeader={onClickHeader}
      onRightClickHeader={handleMenuOpen}
      style={style}
    />
    <div style={{width: 220, height: 88, position: 'absolute', bottom: 0}} dangerouslySetInnerHTML={{
      __html: svg ? utils.scale_svg(svg, {width: 200, height: 82, zoom: 0.2}, 0) : 'Изделие не выбрано',
    }} />
  </div> : 'Получаем данные...';
}
