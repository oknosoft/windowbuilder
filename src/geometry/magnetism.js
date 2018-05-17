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

  /**
   * Ищет короткий сегмент заполнения в окрестности point
   * @param point
   * @return {{segm: *, prev: *, next: *, glass}}
   */
  short_glass(point) {
    for(const glass of this.scheme.activeLayer.glasses(false, true)){
      const len = glass.outer_profiles.length - 1;
      for(let i = 0; i <= len; i++) {
        const segm = glass.outer_profiles[i];
        if((segm.b.is_nearest(point) || segm.e.is_nearest(point)) &&
          segm.sub_path && segm.sub_path.length < consts.sticking) {
          const prev = i === 0 ? glass.outer_profiles[len] : glass.outer_profiles[i - 1];
          const next = i === len ? glass.outer_profiles[0] : glass.outer_profiles[i + 1];
          return {segm, prev, next, glass};
        }
      }
    };
  }

  /**
   * Двигает узел наклонного импоста для получения 0-штапика
   */
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
        const spoint = selected.profile[selected.point];
        const res = this.short_glass(spoint);
        if(res) {
          // находим штапик, связанный с этим ребром
          const {segm, prev, next, glass} = res;

          let cl, negate;
          this.scheme.cnns.find_rows({elm1: glass.elm, elm2: segm.profile.elm}, (row) => {
            cl = row.aperture_len;
          });

          if(!cl) {
            return $p.msg.show_msg({
              type: 'alert-info',
              text: `Не найдена строка соединения короткого ребра заполнения с профилем`,
              title: 'Магнит 0-штапик'
            });
          }

          let pNext, pOur;
          if(prev.profile === selected.profile){
            pNext = next;
            pOur = prev;
          }
          else if(next.profile === selected.profile) {
            pNext = prev;
            pOur = next;
          }
          else {
            return $p.msg.show_msg({
              type: 'alert-info',
              text: `Выделен неподходящий сегмент профиля`,
              title: 'Магнит 0-штапик'
            });
          }

          if(!pNext.profile.nom.sizefaltz || !segm.profile.nom.sizefaltz || !pOur.profile.nom.sizefaltz) {
            return $p.msg.show_msg({
              type: 'alert-info',
              text: `Не задан размер фальца примыкающих профилей`,
              title: 'Магнит 0-штапик'
            });
          }

          // строим линии фальца примыкающих к импосту профилей
          const rSegm = (segm.outer ? segm.profile.rays.outer : segm.profile.rays.inner).equidistant(-segm.profile.nom.sizefaltz);
          const rNext = (pNext.outer ? pNext.profile.rays.outer : pNext.profile.rays.inner).equidistant(-pNext.profile.nom.sizefaltz);
          const rOur = (pOur.outer ? pOur.profile.rays.outer : pOur.profile.rays.inner).equidistant(-pOur.profile.nom.sizefaltz);

          const p1 = rSegm.intersect_point(rOur, spoint);
          const p0 = rSegm.intersect_point(rNext, p1);
          const delta = p0.subtract(p1);
          selected.profile.move_points(delta, true);

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
