/**
 * Дополняет ProfileItem математикой расчета статических нагрузок
 *
 * @module static_load
 *
 * Created 29.10.2020.
 */

/*
Снеговые районы Российской Федерации (принимаются по карте 1 обязательного приложения 5)(СНиП 2.01.07-85*)
*/
function table4(val) {
  return table4.map.get(val) || 0;
}
table4.map = new Map([['I', 80], ['II', 120], ['III', 180], ['IV', 240], ['V', 320], ['VI', 400], ['VII', 480], ['VIII', 560]]);

/*
Ветровые районы СССР (принимаются по карте 3  обязательного приложения 5)(СНиП 2.01.07-85*)
*/
function table5(val) {
  return table5.map.get(val) || 0;
}
table5.map = new Map([['Ia', 17], ['I', 23], ['II', 30], ['III', 38], ['IV', 48], ['V', 6], ['VI', 73], ['VII', 85]]);

/*
    Профили для ограждающих конструкций рассчитываются
    из условия прогиба: fфакт < fдоп.
    Здесь fдоп — допускаемый прогиб для ограждающих конструкций.
    fдоп определяется согласно СНиП2.03.06–85 Табл42 в зависимости от
    высоты стойки и типа остекления: в случае заполнения проема одинарным
    стеклом fдоп = H/200 см, в случае заполнения стеклопакетами fдоп = H/300 см
    fфакт — фактический прогиб для однопролетной балки со свободными опорами и
    равномерно распределенной нагрузкой:
    fфакт = 5/384 · (qрасч. · H4) / (Е · Jx),  [см ],
    Выбор подходящей стойки осуществляется из ограничения на минимально
    допустимый момент инерции
    Jx : Jx (min)  >   5/384 · (qрасч. · H4) / (Е · fдоп) , [ см4  ]
*/


function table6(val = 0, type_area = 'a') {

  let idx = 0;
  const {height} = table6;

  for (let i = 0; i < height.length; i++) {

    if(idx !== 0) {
      break;
    }
    if(height[i] >= val) {
      idx = height[i];
      break;
    }

    if(height[i] > val && height[i + 1] <= val && i < height.length) {
      idx = height[i + 1];
      break;
    }
    else {
      if(i === height.length) {
        idx = height[i];
      }
    }
  }

  return table6.map.get(idx)[type_area.toLowerCase()] || 0.75;

}
table6.map = new Map([
  [5, {a: 0.75, b: 0.5, c: 0.4}],
  [10, {a: 1, b: 0.65, c: 0.4}],
  [20, {a: 1.25, b: 0.85, c: 0.55}],
  [40, {a: 1.5, b: 1.1, c: 0.8}],
  [60, {a: 1.7, b: 1.3, c: 1}],
  [80, {a: 1.85, b: 1.45, c: 1.15}],
  [100, {a: 2, b: 1.6, c: 1.25}],
  [150, {a: 2.25, b: 1.9, c: 1.55}],
  [200, {a: 2.45, b: 2.1, c: 1.8}],
  [250, {a: 2.65, b: 2.3, c: 2}],
  [300, {a: 2.75, b: 2.5, c: 2.2}],
  [350, {a: 2.75, b: 2.75, c: 2.75}],
  [480, {a: 2.75, b: 2.75,c: 2.75}]
]);
table6.height = Array.from(table6.map.keys());



export default function ({Editor, enm}) {
  Editor.ProfileItem.prototype.static_load = function () {
    // получаем номенклатуру  длину ссылку на проект и ориентацию элемента
    const {nom, length, project: {ox}, orientation} = this;
    /* ссылка на расёт заказ */
    const {calc_order} = ox;

    const {vert, hor} = orientation._manager;

    /*
     * 1) нет понимания как выбирать стекло или стеклопакет если в примыкании
     * к элементу могут быть разные типы (стекло и стеклопакет )
     * 2) Длинна в мм  из построителя конвертируется в сантимеры внутри вычислений
     * перенести на верхний уровень
     * 3) снеговой район пока не используем (как появятся наклонные фасады
     * будем дополнять математику)
     *
     */

    /* Результат расчёта */
    const res = {can_use: true};

    /* Значения из параметров документа расчёт заказ */
    const snow_region_val = (calc_order._extra('snow_region') || "I").toString(); /* eslint-disable-line */
    const wind_region_val = (calc_order._extra('wind_region') || "I").toString();
    const type_of_terrain_val = (calc_order._extra('type_of_terrain') || "A").toString();
    const mounting_height_val = calc_order._extra('mounting_height') || 0;

    /*
    Jx  — момент инерции стойки, [см 4] (данные каталога); ;номенклатура вставки */
    /*

    Расстояние между вертикалями


    Если индекс Указывает на начало или Конец то тоступ от стойки один
    иначе будет 2 и нужно выбрать наибольший
    */
    const jx_val = nom._extra('jx');
    const jy_val = nom._extra('jy');

    /**/




    /*Вид заполнения Стекло или Стеклопакет*/

    //const fill_type = true;


    /*
      H — высота стойки  [см]; length*/
    //var l = length;

    /*
    В — шаг стоек [см];

    */
    let b = 0;
    //debugger;
    /*

    РАсстояние между вертикалями

  */
    if (orientation === hor) {
      b = this.generatrix.length;
    }
    else {
      const arr_vert = this.layer.getItems({
        class: Editor.Profile,
        match: ((rw) => {
          return rw.orientation === vert && rw.elm_type !== enm.elm_types.Створка;
        })
      });

      arr_vert.sort((a, b) => a.x1 - b.x1);

      const arr_idx = arr_vert.findIndex((item) => item === this);

      if (arr_idx === 0) {
        b = arr_vert[arr_idx + 1].x1 - arr_vert[arr_idx].x1;
      }

      if (arr_idx === arr_vert.length - 1) {
        b = arr_vert[arr_idx].x1 - arr_vert[arr_idx - 1].x1;
      }
      if (arr_idx !== 0 && arr_idx !== arr_vert.length - 1) {
        b = Math.max(
          (arr_vert[arr_idx].x1 - arr_vert[arr_idx - 1].x1),
          (arr_vert[arr_idx + 1].x1 - arr_vert[arr_idx].x1)
        );
      }
    }

    /*

    */
    /*Пока не определим переменные*/
    /*

    e,c  из Параметров Системы

    Е = 7,1· 106 Н/см2 = 7,1· 105 кгс/см2  — модуль упругости для алюминия;

    с — аэродинамический коэффициент (Приложение 4, СНиП 2.01.07-85*).

    g = 1,4 — коэффициент надежности по ветровой нагрузке (СНиП 2.01.07-85*);
    g = 1.4;

    */
    const {c, e, g} = ox.sys;


    /*  Wo  — нормативное значение ветрового давления  [кг/ м2] (табл. 5, СНиП 2.01.07-85*);*/
    const wo = table5(wind_region_val);

    /*
    k — коэффициент, учитывающий изменение ветрового давления по высоте
     (Табл.6 , СНиП 2.01.07-85*);*/
    const k = table6(mounting_height_val, type_of_terrain_val);

    /*
    Wm = Wo · k · c, — нормативное значение средней составляющей ветровой нагрузки [кгс/ м2];
    */
    const wm = wo * k * c;


    /*
    q = Wm· В  — нормативная линейная равномерная нагрузка к единице поверхности [кгс/м, Н/м];
    */
    const q = wm * (b / 10) / 10000;

    /*
    q расч. = q · g  — расчетная линейная равномерная нагрузка к единице поверхности [кгс/м, Н/м];
    */
    const q_ras = q * g;


    /*
     вертикаль это стойка
     горизонталь это ригель
    */
    if (orientation === vert || orientation === hor) {

      const f_dp = (length / 10) / 200;


      /*
      не используется
          var f_fact = (5 / 384) * (q_ras * Math.pow((length / 10), 4) / (e * jx_val));
      */

      const jx_min = (5 / 384) * (q_ras * Math.pow((length / 10), 4) / (e * f_dp));
      // f_fact = (5/384) *Math.pow((q_ras*(len/100)),4)/(e*jx)
      // jx_min = (5/384) *Math.pow((q_ras*(len/100)),4)/(e*f_dp)
      if (jx_min > jx_val) {
        res.can_use = false;
      }
      res.jx_calc = jx_min;
    }

    if (orientation === hor) {

      const {top} = this.nearest_glasses;
      if(top.length) {
        //Дополнит на прогиб от веса стеклопакетов сверху
        const mass_fillings = top.reduce((sum, curr) => sum + curr.weight, 0) / 2;

        /*потребный момент инеерции Ригеля*/
        const jy_min = mass_fillings * Math.pow(15, 3) * (3 * Math.pow(b / 10, 2) / Math.pow(15, 2) - 4) / (24 * e * 0.3);
        /*
        Прогиб фактический не используется

        cm2 = mass_fillings * 15 * (3 * Math.pow(b / 10, 2) - 4 * Math.pow(15, 2)) / (24 * e * jy_val);
        */
        if (jy_min > jy_val) {
          res.can_use = false;
        }

        res.jy_calc = jy_min;
      }
    }

    return res;
  };
}
