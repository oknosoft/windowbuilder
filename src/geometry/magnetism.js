/**
 * Варианты притягивания узлов
 * @module magnetism
 *
 * Created by Evgeniy Malyarov on 04.02.2018.
 */

class Magnetism {

  constructor(scheme) {
    this.scheme = scheme;
  }

  /**
   * Возвращает единственный выделенный узел
   */
  get selected() {
    const {profiles} = this.scheme.activeLayer;
    const selected = {profiles};
    for(const {generatrix} of profiles) {
      if(generatrix.firstSegment.selected) {
        if(selected.profile) {
          selected.break = true;
          break;
        }
        selected.profile = generatrix.parent;
        selected.point = 'b';
      };
      if(generatrix.lastSegment.selected) {
        if(selected.profile) {
          selected.break = true;
          break;
        }
        selected.profile = generatrix.parent;
        selected.point = 'e';
      };
    }
    return selected;
  }

  filter(selected) {
    const point = selected.profile[selected.point];
    const nodes = [selected];

    // рассмотрим вариант с углом...
    for(const profile of selected.profiles) {
      if(profile !== selected.profile) {
        if(profile.b.is_nearest(point, true)) {
          nodes.push({profile, point: 'b'});
        }
        if(profile.e.is_nearest(point, true)) {
          nodes.push({profile, point: 'e'});
        }
        const px = (profile.nearest(true) ? profile.rays.outer : profile.generatrix).getNearestPoint(point);
        if(px.is_nearest(point, true)) {
          nodes.push({profile, point: 't'});
        }
      }
    }
    return nodes;
  }

  short_glass(point) {
    for(const glass of this.scheme.activeLayer.glasses(false, true)){
      for(const segm of glass.outer_profiles) {
        if((segm.b.is_nearest(point) || segm.e.is_nearest(point)) &&
          segm.sub_path && segm.sub_path.length < consts.sticking) {
          return {segm, glass};
        }
      }
    };
  }

  m1() {

    const {tb_left} = this.scheme._scope;
    const previous = tb_left && tb_left.get_selected();

    Promise.resolve().then(() => {

      // получаем выделенные узлы
      const {selected} = this;

      if(selected.break) {
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Выделено более одного узла`,
          title: 'Магнит 0-штапик'
        });
      }
      else if(!selected.profile) {
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Не выделено ни одного узла профиля`,
          title: 'Магнит 0-штапик'
        });
      }
      else {
        const res = this.short_glass(selected.profile[selected.point]);
        if(res) {
          // находим штапик, связанный с этим ребром
          const {segm, glass} = res;
          const {Штапик} = $p.enm.elm_types;
          let dl, cl;
          segm.cnn.specification.forEach((row) => {
            if(row.nom.elm_type = Штапик) {
              dl = row.sz;
              return false;
            }
          });
          this.scheme.ox.cnn_elmnts.find_rows({elm1: glass.elm, elm2: segm.profile.elm}, (row) => {
            cl = row.aperture_len;
          });

          if(!dl) {
            $p.msg.show_msg({
              type: 'alert-info',
              text: `Не найдено штапиков в спецификации соединения ${segm.cnn.name}`,
              title: 'Магнит 0-штапик'
            });
          }
          else if(!cl) {
            $p.msg.show_msg({
              type: 'alert-info',
              text: `Не найдена строка соединения короткого ребра с профилем`,
              title: 'Магнит 0-штапик'
            });
          }
          else {
            const cnn = selected.profile.cnn_point(selected.point);
            const {profile} = cnn;
            const point = profile.generatrix.getNearestPoint(selected.profile[selected.point]);
            const offset = profile.generatrix.getOffsetOf(point);
            let tangent = profile.generatrix.getTangentAt(offset);
            if(profile.e.getDistance(point) > profile.b.getDistance(point)) {
              tangent = tangent.negate();
            }
            selected.profile.move_points(tangent.multiply(cl + dl));
          }
        }
        else {
          $p.msg.show_msg({
            type: 'alert-info',
            text: `Не найдено коротких сегментов заполнений<br />в окрестности выделенной точки`,
            title: 'Магнит 0-штапик'
          });
        }
      }
    });

    if(previous) {
      return this.scheme._scope.select_tool(previous.replace('left_', ''));
    }
  }

}
