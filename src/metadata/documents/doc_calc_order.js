/**
 * ### Модуль менеджера и документа Расчет
 */

//import {handleIfaceState} from '../../redux';
import RepParams from 'wb-forms/dist/CalcOrder/FrmList/Params';

export default function ($p) {
  /* eslint-disable-next-line */
  const {doc: {calc_order}} = $p;
  calc_order.RepParams = RepParams;
}

