// модификаторы объектов и менеджеров данных

// // модификаторы справочников
import catalogs from './catalogs';
//
// модификаторы документов
import documents from './documents';
//
// модификаторы планов видов характеристик
//import chartscharacteristics from './chartscharacteristics';
//
// модификаторы отчетов
import reports from './reports';
//
// модификаторы обработок
import dataprocessors from './dataprocessors';
//
// общие модули
import common from './common/index';

// обработчик экспорта в dxf
import export_dxf from '../openjscad/export_dxf';

export default function ($p) {

  // правим состав полей прочистки
  const {_sys_fields} = $p.classes.Meta;
  _sys_fields.push.apply(_sys_fields, ['partner', 'department', 'organization', 'obj_delivery_state']);

  catalogs($p);
  // documents($p);
  // chartscharacteristics($p);
  reports($p);
  dataprocessors($p);
  common($p);
  export_dxf($p);
  documents($p);
}
