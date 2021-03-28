// модификаторы объектов и менеджеров данных

// общие модули
import common from './common';
import editor from '../drawer/editor';


// модификаторы справочников
import catalogs from './catalogs';

// модификаторы документов
import documents from './documents';

// модификаторы отчетов
import reports from './reports';

// модификаторы обработок
import dataprocessors from './dataprocessors';


export default function ($p) {
  common($p);
  editor($p);
  catalogs($p);
  documents($p);
  reports($p);
  dataprocessors($p);
}
