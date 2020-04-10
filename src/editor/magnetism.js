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

  /**
   * Возвращает массив узлов, примыкающих к текущему
   * @param selected
   * @return {*[]}
   */
  filter(selected) {
    const point = selected.profile[selected.point];
    const nodes = [selected];

    // рассмотрим вариант с углом...
    for(const profile of selected.profiles) {
      if(profile !== selected.profile) {
        let pushed;
        if(profile.b.is_nearest(point, true)) {
          nodes.push({profile, point: 'b'});
          pushed = true;
        }
        if(profile.e.is_nearest(point, true)) {
          nodes.push({profile, point: 'e'});
          pushed = true;
        }
        if(!pushed) {
          const px = (profile.nearest(true) ? profile.rays.outer : profile.generatrix).getNearestPoint(point);
          if(px.is_nearest(point, true)) {
            nodes.push({profile, point: 't'});
          }
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

          const ps = rSegm.intersect_point(rOur, spoint);
          // если next является почти продолжением segm (арка), точку соединения ищем иначе
          const be = ps.getDistance(segm.profile.b) > ps.getDistance(segm.profile.e) ? 'e' : 'b';
          const da = rSegm.angle_to(rNext, segm.profile[be]);

          let p0 = rSegm.intersect_point(rNext, ps);
          if(!p0 || da < 4) {
            p0 = rNext.getNearestPoint(segm.profile[be]);
          }
          const delta = p0.subtract(ps);
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

  /**
   * Уравнивает профиль в балконном блоке
   */
  m3() {
    const {dialogs} = $p.ui;
    const profiles = this.scheme.selected_profiles();
    if(profiles.length !== 1 || profiles[0].elm_type != 'Импост') {
      dialogs.alert({text: 'm3', title: 'Импост в балконном блоке'});
    }
  }

  /**
   * Групповое выделение элементов
   */
  m4() {
    const {dialogs} = $p.ui;
    const list = [
      {value: 'all', text: 'Во всём изделии'},
      {value: 'contour', text: 'В текущем слое'},
    ];
    dialogs.input_value({
      text: 'Выделить элементы',
      title: 'Область выделения',
      list,
      initialValue: list[0],
    })
      .then((mode) => {
        list.length = 0;
        list.push(
          {value: 'rm', text: 'Рамы'},
          {value: 'stv', text: 'Створки'},
          {value: 'imp', text: 'Импосты'},
          {value: 'profiles', text: 'Все профили'},
          {value: 'gl', text: 'Заполнения'},
          {value: 'lay', text: 'Раскладки'},
          );
        return dialogs.input_value({
          text: 'Выделить элементы',
          title: 'Типы элементов',
          list,
          initialValue: list[5],
        })
          .then((type) => {
            const contours = mode === 'all' ? this.scheme.contours : [this.scheme.activeLayer];
            this.scheme.deselectAll();
            this.attached = false;
            for(const contour of contours) {
              this.select_elmnts(contour, type);
            }
          });
      })
      .catch((err) => null);
  }

  select_attache(elm) {
    elm.selected = true;
    if(!this.attached) {
      elm.attache_wnd(this.scheme._scope._acc.elm);
      this.attached = true;
    }
  }

  select_elmnts(contour, type) {
    for(const cnt of contour.contours) {
      this.select_elmnts(cnt, type);
    }
    if(type === 'gl' || type === 'lay') {
      for(const glass of contour.glasses(false, true)) {
        if(type === 'gl') {
          this.select_attache(glass);
        }
        else {
          for(const onlay of glass.imposts) {
            this.select_attache(onlay);
          }
        }
      }
    }
    else {
      const {elm_types} = $p.enm;
      for(const profile of contour.profiles) {
        if(type === 'profiles') {
          this.select_attache(profile);
        }
        else if(type === 'imp' && profile.elm_type === elm_types.Импост) {
          this.select_attache(profile);
        }
        else if(type === 'stv' && profile.elm_type === elm_types.Створка) {
          this.select_attache(profile);
        }
        else if(type === 'rm' && profile.elm_type === elm_types.Рама) {
          this.select_attache(profile);
        }
      }
    }

  }
}

$p.EditorInvisible.Magnetism = Magnetism;
