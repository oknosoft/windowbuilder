/**
 * @summary Модуль менеджера и документа Задание на производство
 *
 */

export default function ({doc: {work_centers_task}}) {

  import('wb-forms/dist/WorkCentersTask')
    .then((module) => {
      // подключаем особую форму объекта
      work_centers_task.FrmObj = module.default;
    });

}
