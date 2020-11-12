/**
 * Дополняет ProfileItem математикой расчета статических нагрузок
 *
 * @module static_load
 *
 * Created 29.10.2020.
 */

// если нужно подключить другие файлы...
// import ... from ...;

export default function ({Editor}) {
  Editor.ProfileItem.prototype.static_load = function () {
    // получаем номенклатуру  длину ссылку на проект и ориентацию элемента
    const {
      nom,
      length,
      project,
      orientation
    } = this;
    /*
     * 1) нет понимания как выбирать стекло или стеклопакет если в примыкании
     * к элементу могут быть разные типы (стекло и стеклопакет )
     * 2) Длинна в мм  из построителя конвертируется в сантимеры внутри вычислений
     * перенести на верхний уровень
     * 3) снеговой район пока не используем (как появятся наклонные фасады
     * будем дополнять математику)
     *
     *
     */
    /*ссылка на расёт заказ
  разименовать до расчёта
    */

    const {
      calc_order
    } = project.ox.calc_order;



    /* РЕзультат расчёта */
    var res = {
      can_use: true
    };


    /*
    тут получаем значения параметров

    */

    /*Значения из параметров документа расчёт заказ*/
    const snow_region_val = calc_order.extra_fields.find_rows({
      property: $p.cch.properties.predefined('snow_region')
    })[0]._row.value.name || "I";
    const wind_region_val = calc_order.extra_fields.find_rows({
      property: $p.cch.properties.predefined('wind_region')
    })[0]._row.value.name || "I";
    const type_of_terrain_val = calc_order.extra_fields.find_rows({
      property: $p.cch.properties.predefined('type_of_terrain')
    })[0]._row.value.name || "A";
    const mounting_height_val = calc_order.extra_fields.find_rows({
      property: $p.cch.properties.predefined('mounting_height')
    })[0].value || 0;

    /*
    Jx  — момент инерции стойки, [см 4] (данные каталога); ;номенклатура вставки */
    /*

    РАсстояние между вертикалями


    arr = paper.project.getItems({class:$p.Editor.Profile,match:((rw)=>{
     return rw.orientation === $p.enm.orientations.Вертикальная && rw.elm_type !== $p.enm.elm_types.Створка
    //debugger
    })})

    arr_idx = arr.findIndex(function(item, index, array) {
    return item === el;

    })
    Если индекс Указывает на начало или Конец то тоступ от стойки один
    иначе будет 2 и нужно выбрать наибольший
    */
    const jx_val = nom.extra_fields.find_rows({
      property: $p.cch.properties.predefined('jx')
    })[0].value;
    const jy_val = nom.extra_fields.find_rows({
      property: $p.cch.properties.predefined('jy')
    })[0].value;

    /**/


    const {
      Вертикальная,
      Горизонтальная
    } = orientation._manager;

    /*Вид заполнения Стекло или Стеклопакет*/

    //const fill_type = true;



    /*
      H — высота стойки  [см]; length*/
    //var l = length;

    /*
    В — шаг стоек [см];

    */
    var b = 0;
    //debugger;
    /*

    РАсстояние между вертикалями

  */
    if (orientation === Горизонтальная) {

      b = this.generatrix.length;
    } else {


      var arr_vert = paper.project.getItems({
        class: $p.Editor.Profile,
        match: ((rw) => {
          return rw.orientation === $p.enm.orientations.Вертикальная &&
            rw.elm_type !== $p.enm.elm_types.Створка;
          //debugger
        })
      });

      arr_vert.sort((a, b) => {
        //debugger;
        return a.x1 - b.x1;

      });
      /**/
      var el = this;
      var arr_idx = arr_vert.findIndex(function(item) {
        return item === el;
      });

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


      const {
        c,
        e,
        g
      } = project.ox.sys;


    // const {
    //   c,
    //   e,
    //   g
    // } = $p.job_prm.builder;
    /*

      Wo  — нормативное значение ветрового давления  [кг/ м2] (табл. 5, СНиП 2.01.07-85*);*/
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
    q = Wm· В  — нормативная линейная равномерная нагрузка к единице поверхности [кгс/м, Н/м];*/

    const q = wm * (b / 10) / 10000;

    /*
    q расч. = q · g  — расчетная линейная равномерная нагрузка к единице поверхности [кгс/м, Н/м];*/

    const q_ras = q * g;


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




    /*
    Ветровые районы СССР (принимаются по карте 3  обязательного приложения 5)(СНиП 2.01.07-85*)
    */
    function table5(val) {

      const table = new Map([
        ["Ia", 17],
        ["I", 23],
        ["II", 30],
        ["III", 38],
        ["IV", 48],
        ["V", 6],
        ["VI", 73],
        ["VII", 85]

      ]);
      return table.get(val) || 0;
    }


    /*Снеговые районы Российской Федерации (принимаются по карте 1 обязательного приложения 5)(СНиП 2.01.07-85*)*/


    function table4(val) {

      const table = new Map([
        ["I", 80],
        ["II", 120],
        ["III", 180],
        ["IV", 240],
        ["V", 320],
        ["VI", 400],
        ["VII", 480],
        ["VIII", 560]


      ]);
      return table.get(val) || 0;
    }



    function table6(val = 0, type_area = "a") {

      const height = [5, 10, 20, 40, 60, 80, 100, 150, 200, 250, 300, 350, 480];
      var idx = 0;


      for (var i = 0; i < height.length; i++) {
        if (idx !== 0) {
          break;
        }
        if (height[i] >= val) {
          idx = height[i];
          break;

        }

        if (height[i] > val && height[i + 1] <= val && i < height.length) {
          idx = height[i + 1];
          break;

        } else {

          if (i === height.length) {
            idx = height[i];

          }

        }
      }

      const table = new Map([
        [5, {
          a: 0.75,
          b: 0.5,
          c: 0.4
        }],
        [10, {
          a: 1,
          b: 0.65,
          c: 0.4
        }],
        [20, {
          a: 1.25,
          b: 0.85,
          c: 0.55
        }],
        [40, {
          a: 1.5,
          b: 1.1,
          c: 0.8
        }],
        [60, {
          a: 1.7,
          b: 1.3,
          c: 1
        }],
        [80, {
          a: 1.85,
          b: 1.45,
          c: 1.15
        }],
        [100, {
          a: 2,
          b: 1.6,
          c: 1.25

        }],
        [150, {
          a: 2.25,
          b: 1.9,
          c: 1.55
        }],
        [200, {
          a: 2.45,
          b: 2.1,
          c: 1.8
        }],
        [250, {
          a: 2.65,
          b: 2.3,
          c: 2
        }],
        [300, {
          a: 2.75,
          b: 2.5,
          c: 2.2
        }],
        [350, {
          a: 2.75,
          b: 2.75,
          c: 2.75
        }],
        [480, {
          a: 2.75,
          b: 2.75,
          c: 2.75
        }]




      ]);
      return table.get(idx)[type_area.toLowerCase()] || 0.75;
    }


    /*
     вертикаль это стойка
     горизонталь это ригель
    */
    if (orientation === Вертикальная || orientation === Горизонтальная) {


      var f_dp = (length / 10) / 200;



      /*

      не используется
          var f_fact = (5 / 384) * (q_ras * Math.pow((length / 10), 4) / (e * jx_val));
      */

      var jx_min = (5 / 384) * (q_ras * Math.pow((length / 10), 4) / (e * f_dp));
      // f_fact = (5/384) *Math.pow((q_ras*(len/100)),4)/(e*jx)
      // jx_min = (5/384) *Math.pow((q_ras*(len/100)),4)/(e*f_dp)
      if (jx_min > jx_val) {
        res.can_use = false;

      }
      res.jx_calc = jx_min;
    }

    if (orientation === Горизонтальная && this.nearest_glasses.top[0]) {

      //Дополнит  на прогиб  от веса ,стеклопакета
      var mass_filling = this.nearest_glasses.top[0].weight;

      var mass_filling2 = mass_filling / 2;

      /*потребный момент инеерции Ригеля*/
      var jy_min = mass_filling2 * Math.pow(15, 3) * (3 * Math.pow(b / 10, 2) / Math.pow(15, 2) - 4) / (24 * e * 0.3);
      /*
      Прогиб фактический не используется

      cm2 = mass_filling2 * 15 * (3 * Math.pow(b / 10, 2) - 4 * Math.pow(15, 2)) / (24 * e * jy_val);
      */
      if (jy_min > jy_val) {
        res.can_use = false;
      }

      res.jy_calc = jy_min;


    }

    return res;
  };
}
