/**
 * ### Разрыв и слияние узла Т
 *
 * @module tools
 * @submodule tool_cut
 */

/**
 * ### Манипуляции с соединением T в углу
 *
 * @class ToolM2
 * @extends ToolElement
 * @constructor
 * @menuorder 56
 * @tooltip Разрыв
 */
class ToolM2 extends paper.Tool {

  constructor() {
    super();
    this.options = {name: 'm2'};
    this.on({activate: this.on_activate});
  }

  on_activate() {
    const {project, tb_left} = this._scope;
    const previous = tb_left.get_selected();

    Promise.resolve().then(() => {

      // получаем выделенные узлы
      const {selected} = project.magnetism;

      if(selected.break) {
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Выделено более одного узла`,
          title: 'Соединение Т в угол'
        });
      }
      else if(!selected.profile) {
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Не выделено ни одного узла профиля`,
          title: 'Соединение Т в угол'
        });
      }
      else {

        const nodes = project.magnetism.filter(selected);

        if(nodes.length >= 3) {

          // находим профили импоста и углов
          for(const elm of nodes) {
            const cnn_point = elm.profile.cnn_point(elm.point);
            if(cnn_point && cnn_point.is_x) {
              this.split_angle(elm, nodes);
              break;
            }
            else if(cnn_point && cnn_point.is_t) {
              this.merge_angle(elm, nodes);
              break;
            }
          }

        }
      }
    });

    if(previous) {
      return this._scope.select_tool(previous.replace('left_', ''));
    }
  }

  // объединяет в Т-крест профили углового соединения
  merge_angle(impost, nodes) {

    // получаем координаты узла
    let point, profile, cnn;
    nodes.some((elm) => {
      if(elm !== impost && elm.point !== 't') {
        profile = elm.profile;
        point = profile.nearest(true) ? (profile.corns(elm.point === 'b' ? 1 : 2)) : profile[elm.point];
        const cnns = $p.cat.cnns.nom_cnn(impost.profile, profile, [$p.enm.cnn_types.xx]);
        if(cnns.length) {
          cnn = cnns[0];
          return true;
        }
      }
    });

    // а есть ли вообще подходящее соединение
    if(cnn && !cnn.empty()) {

      // приводим координаты трёх профилей к одной точке
      for (const elm of nodes) {
        if((elm.profile === impost || !elm.profile.nearest(true)) && elm.point !== 't' && !point.equals(elm.profile[elm.point])) {
          elm.profile[elm.point] = point;
        }
      }

      // изменяем тип соединения
      const {rays, project} = impost.profile;
      const ray = rays[impost.point];
      if(ray.cnn != cnn || ray.profile != profile) {
        ray.clear();
        ray.cnn = cnn;
        ray.profile = profile;
        project.register_change();
      }
    }
    else {
      const p1 = impost.profile ? impost.profile.inset.presentation : '...';
      const p2 = profile ? profile.inset.presentation : '...';
      $p.msg.show_msg({
        type: 'alert-info',
        text: `Не найдено соединение 'Крест в стык' для профилей ${p1} и ${p2}`,
        title: 'Соединение Т в угол'
      });
    }

  }

  // превращает Т-крест углового соединения в обычный угол и Т
  split_angle(impost, nodes) {

    // получаем координаты узла
    let point, profile, cnn;
    nodes.some((elm) => {
      if(elm !== impost && elm.point !== 't') {
        profile = elm.profile;
        if(profile.nearest(true)) {
          const {outer} = profile.rays;
          const offset = elm.point === 'b' ? outer.getOffsetOf(profile.corns(1)) + 100 : outer.getOffsetOf(profile.corns(2)) - 100;
          point = outer.getPointAt(offset);
        }
        else {
          point = profile[elm.point];
        }
        const cnns = $p.cat.cnns.nom_cnn(impost.profile, profile, [$p.enm.cnn_types.t]);
        if(cnns.length) {
          cnn = cnns[0];
          return true;
        }
      }
    });

    // а есть ли вообще подходящее соединение
    if(cnn && !cnn.empty()) {

      // отодвигаем импост от угла
      impost.profile[impost.point] = point === profile.b ? profile.generatrix.getPointAt(100) : profile.generatrix.getPointAt(profile.generatrix.length - 100);

      // изменяем тип соединения
      const {rays, project} = impost.profile;
      const ray = rays[impost.point];
      ray.clear();
      ray.cnn = cnn;
      ray.profile = profile;
      project.register_change();
    }
    else {
      const p1 = impost.profile ? impost.profile.inset.presentation : '...';
      const p2 = profile ? profile.inset.presentation : '...';
      $p.msg.show_msg({
        type: 'alert-info',
        text: `Не найдено соединение Т для профилей ${p1} и ${p2}`,
        title: 'Соединение Т из угла'
      });
    }

  }

  merge_t() {

  }

  split_t() {

  }

}

