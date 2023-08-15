
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import DataField from 'metadata-react/DataField/PropField';

const {classes: {BaseDataObj}, utils: {blank}, adapters: {pouch}, ui: {dialogs}} = $p;

class ParamObj extends BaseDataObj {

  constructor({_obj}) {
    const {stage, basis, _manager} = _obj;
    super({date: new Date('-'), stage, basis}, _manager, false, true);
    this._data._is_new = false;
  }

  get date() {
    return this._getter('date');
  }
  set date(v) {
    this._setter('date', v);
  }

  get stage() {
    return this._getter('stage');
  }
  set stage(v) {
    this._setter('stage', v);
  }

  get basis() {
    return this._getter('basis');
  }
  set basis(v) {
    this._setter('basis', v);
  }

}

export default function FillByPlan({open, setClose, _obj}) {

  const [param, fill] = React.useMemo(() => {
    const param = new ParamObj({_obj});
    const fill = () => {
      if(param.basis.empty()) {
        dialogs.alert({
          title: 'Остатки потребности',
          text: `В настоящий момент, поддержано только заполнение по Расчёту-заказу
Укажите документ-основание`
        });
      }
      else {
        pouch.fetch(`/adm/api/needs/totals?calc_order=${param.basis.ref}&detail=planing_key`);
      }
    };
    return [param, fill];
  }, [_obj]);

  return <Dialog
    open={open}
    initFullScreen
    large
    title="Параметры остатков потребности"
    onClose={setClose}
    actions={<>
      <Button onClick={fill}>Заполнить</Button>
      <Button onClick={setClose} color="primary">Отмена</Button>
    </>}
  >
    <DataField _obj={param} _fld="date" read_only/>
    <DataField _obj={param} _fld="stage" read_only/>
    <DataField _obj={param} _fld="basis"/>
  </Dialog>;
}
