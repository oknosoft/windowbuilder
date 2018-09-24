/**
 * ### Модуль менеджера и документа Задание на производство
 *
 * @module work_centers_task
 */

import FrmObj from '../../components/WorkCentersTask/FrmObj';

export default function ({doc, DocWork_centers_task}) {

  // подключаем особую форму объекта
  doc.work_centers_task.FrmObj = FrmObj;

  // модифицируем класс документа
  const {prototype} = DocWork_centers_task;

}
