import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import PostAddIcon from '@material-ui/icons/PostAdd';
import Divider from '@material-ui/core/Divider';
import HtmlTooltip from 'metadata-react/App/Tip';
import {insets} from './columns';
import LinkedProp from 'wb-forms/dist/Common/LinkedProp';

const {ui: {dialogs}, cat} = $p;

export function ByInset({rows, prodRow, setRows, setRow, select}) {
  const delAll = () => {
    const {quantity, characteristic} = prodRow;
    characteristic.specification.clear();
    prodRow.value_change('quantity', null, quantity);
    setRows([]);
    setRow(null);
  }
  const auto = async () => {
    try {
      let inset = insets.length > 1 ? await dialogs.input_value({
        title: 'Уточните вставку авторасчёта',
        initialValue: insets[0],
        list: insets,
      }) : insets[0];
      inset = cat.inserts.get(inset);

      const {characteristic: ox, quantity} = prodRow;
      const elm = {
        elm: 0,
        layer: null,
        nom: prodRow.nom,
        inset,
        is_linear() {
          return true;
        },
        _row: {
          len: 0,
          angle_hor: 0,
          s: 1,
        }
      };
      const params = inset.used_params();
      let fields;
      if(params.length) {
        const render = [];
        params.forEach((param, index) => {
          const prow = ox.params.find({param}) || ox.params.add({param});
          if(!fields) {
            fields = {value: prow._metadata('value')};
          }
          render.push(<LinkedProp key={index} param={param} inset={inset} _obj={prow} fields={fields}/>);
        });
        await dialogs.input_value({
          title: 'Уточните параметры авторасчёта',
          render: <div style={{margin: '8px'}}>{render}</div>,
          timeout: 90000,
        }).catch(e => null);
      }
      inset.calculate_spec({
        elm,
        ox,
        spec: ox.specification,
        fake: true,
      });
      prodRow.value_change('quantity', null, quantity);
      const newRows = Array.from(prodRow.characteristic.specification);
      setRows(newRows);
      if(newRows.length) {
        const last = newRows.length - 1;
        select(newRows[last], last);
      }
      else {
        setRow(null);
      }
    }
    catch (e) {

    }
  }
  return <>
    <HtmlTooltip title="Удалить всё (очистить)">
      <IconButton disabled={!rows.length} onClick={delAll}><DeleteSweepIcon/></IconButton>
    </HtmlTooltip>
    <Divider orientation="vertical" flexItem style={{margin: 4, marginRight: 8}} />
    <HtmlTooltip title="Добавить авторасчёт">
      <IconButton disabled={!prodRow} onClick={auto}><PostAddIcon/></IconButton>
    </HtmlTooltip>
  </>;
}

