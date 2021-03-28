/**
 * Методы выравнивания
 *
 * @module align
 *
 * Created by Evgeniy Malyarov on 24.02.2020.
 */

export default function align(Editor, {enm, msg, ui}) {

  Object.assign(Editor.prototype, {

    /**
     * ### Поворот кратно 90° и выравнивание
     *
     * @method profile_align
     * @for Editor
     * @param name {String} - ('left', 'right', 'top', 'bottom', 'all')
     */
    profile_align(name){

      // если "все", получаем все профили активного или родительского контура
      if(name == 'all') {

        if(this.glass_align()) {
          return;
        }

        if(this.lay_impost_align()) {
          return;
        }

        // получаем текущий внешний контур
        const layer = this.project.rootLayer();

        layer.profiles.forEach((profile) => {

          const {b, e} = profile;
          const bcnn = profile.cnn_point("b");
          const ecnn = profile.cnn_point("e");

          if(bcnn.profile){
            const d = bcnn.profile.e.getDistance(b);
            if(d && d < this.consts.sticking_l){
              bcnn.profile.e = b;
            }
          }
          if(ecnn.profile){
            const d = ecnn.profile.b.getDistance(e);
            if(d && d < this.consts.sticking_l){
              ecnn.profile.b = e;
            }
          }

          let mid;

          if(profile.orientation == enm.orientations.vert){
            mid = b.x + e.x / 2;
            if(mid < layer.bounds.center.x){
              mid = Math.min(profile.x1, profile.x2);
              profile.x1 = profile.x2 = mid;
            }
            else{
              mid = Math.max(profile.x1, profile.x2);
              profile.x1 = profile.x2 = mid;
            }
          }
          else if(profile.orientation == enm.orientations.hor){
            mid = b.y + e.y / 2;
            if(mid < layer.bounds.center.y){
              mid = Math.max(profile.y1, profile.y2);
              profile.y1 = profile.y2 = mid;
            }
            else{
              mid = Math.min(profile.y1, profile.y2);
              profile.y1 = profile.y2 = mid;
            }
          }
        });
      }
      else{
        const profiles = this.project.selected_profiles();
        const contours = [];
        let changed;
        for(const profile of profiles) {
          if(profile.angle_hor % 90 == 0){
            continue;
          }
          changed = true;
          const minmax = {min: {}, max: {}};

          minmax.min.x = Math.min(profile.x1, profile.x2);
          minmax.min.y = Math.min(profile.y1, profile.y2);
          minmax.max.x = Math.max(profile.x1, profile.x2);
          minmax.max.y = Math.max(profile.y1, profile.y2);
          minmax.max.dx = minmax.max.x - minmax.min.x;
          minmax.max.dy = minmax.max.y - minmax.min.y;

          if(name == 'left' && minmax.max.dx < minmax.max.dy){
            if(profile.x1 - minmax.min.x > 0){
              profile.x1 = minmax.min.x;
            }
            if(profile.x2 - minmax.min.x > 0){
              profile.x2 = minmax.min.x;
            }
          }
          else if(name == 'right' && minmax.max.dx < minmax.max.dy){
            if(profile.x1 - minmax.max.x < 0){
              profile.x1 = minmax.max.x;
            }
            if(profile.x2 - minmax.max.x < 0){
              profile.x2 = minmax.max.x;
            }
          }
          else if(name == 'top' && minmax.max.dx > minmax.max.dy){
            if(profile.y1 - minmax.max.y < 0){
              profile.y1 = minmax.max.y;
            }
            if(profile.y2 - minmax.max.y < 0){
              profile.y2 = minmax.max.y;
            }
          }
          else if(name == 'bottom' && minmax.max.dx > minmax.max.dy) {
            if (profile.y1 - minmax.min.y > 0){
              profile.y1 = minmax.min.y;
            }
            if (profile.y2 - minmax.min.y > 0){
              profile.y2 = minmax.min.y;
            }
          }
          else{
            ui.dialogs.alert({title: 'Сдвиг профилей', text: msg.align_invalid_direction});
          }
          profile.setSelection(1);
        }

        // прочищаем размерные линии
        if(changed || profiles.length > 1){
          profiles.forEach(({layer}) => contours.indexOf(layer) == -1 && contours.push(layer));
          contours.forEach(({l_dimensions}) => l_dimensions && l_dimensions.clear());
        }

        // если выделено несколько, запланируем групповое выравнивание
        if(profiles.length > 1){

          if(changed){
            this.project.register_change(true);
            setTimeout(this.profile_group_align.bind(this, name, profiles), 100);
          }
          else{
            this.profile_group_align(name);
          }
        }
        else if(changed){
          this.project.register_change(true);
        }
      }
    },

    /**
     * ### Групповое выравнивание профилей
     * @param name
     * @param profiles
     */
    profile_group_align(name, profiles) {

      let	coordin = name == 'left' || name == 'bottom' ? Infinity : 0;

      if(!profiles){
        profiles = this.project.selected_profiles();
      }

      if(!profiles.length){
        return;
      }

      profiles.forEach(function (p) {
        switch (name){
        case 'left':
          if(p.x1 < coordin)
            coordin = p.x1;
          if(p.x2 < coordin)
            coordin = p.x2;
          break;
        case 'bottom':
          if(p.y1 < coordin)
            coordin = p.y1;
          if(p.y2 < coordin)
            coordin = p.y2;
          break;
        case 'top':
          if(p.y1 > coordin)
            coordin = p.y1;
          if(p.y2 > coordin)
            coordin = p.y2;
          break;
        case 'right':
          if(p.x1 > coordin)
            coordin = p.x1;
          if(p.x2 > coordin)
            coordin = p.x2;
          break;
        }
      });

      profiles.forEach((p) => {
        switch (name){
        case 'left':
        case 'right':
          p.x1 = p.x2 = coordin;
          break;
        case 'bottom':
        case 'top':
          p.y1 = p.y2 = coordin;
          break;
        }
      });

    },

    /**
     * ### Смещает импосты чтобы получить одинаковые размеры заполнений
     * возвращает массив дельт
     * @param name
     * @param glasses
     * @return {Array|undefined}
     */
    do_glass_align(name = 'auto', glasses) {

      const {project, Point, Key, consts} = this;

      if(!glasses){
        glasses = project.selected_glasses();
      }
      if(glasses.length < 2){
        return;
      }

      // получаем текущий внешний контур
      let parent_layer;
      if(glasses.some(({layer}) => {
        const gl = layer.layer || layer;
        if(!parent_layer){
          parent_layer = gl;
        }
        else if(parent_layer != gl){
          return true;
        }
      })){
        parent_layer = null;
        if(glasses.some(({layer}) => {
          const gl = project.rootLayer(layer);
          if(!parent_layer){
            parent_layer = gl;
          }
          else if(parent_layer != gl){
            ui.dialogs.alert({title: 'Выравнивание', text: 'Заполнения принадлежат разным рамным контурам'});
            return true;
          }
        })){
          return;
        }
      }

      // выясняем направление, в котром уравнивать
      if(name == 'auto'){
        name = 'width';
      }

      // собираем в массиве shift все импосты подходящего направления
      const orientation = name == 'width' ? enm.orientations.vert : enm.orientations.hor;
      // parent_layer.profiles
      const shift = parent_layer.getItems({class: Editor.Profile}).filter((impost) => {
        const {b, e} = impost.rays;
        // отрезаем плохую ориентацию и неимпосты
        return impost.orientation == orientation && (b.is_tt || e.is_tt || b.is_i || e.is_i);
      });

      // признак уравнивания геометрически, а не по заполнению
      const galign = Key.modifiers.control || Key.modifiers.shift || project.auto_align == enm.align_types.Геометрически;
      let medium = 0;

      // модифицируем коллекцию заполнений - подклеиваем в неё импосты, одновременно, вычиляем средний размер
      const glmap = new Map();
      glasses = glasses.map((glass) => {
        const {bounds, profiles} = glass;
        const res = {
          glass,
          width: bounds.width,
          height: bounds.height,
        };

        if(galign){
          // находим левый-правый-верхний-нижний профили
          const by_side = glass.profiles_by_side(null, profiles);
          res.width = (by_side.right.b.x + by_side.right.e.x - by_side.left.b.x - by_side.left.e.x) / 2;
          res.height = (by_side.bottom.b.y + by_side.bottom.e.y - by_side.top.b.y - by_side.top.e.y) / 2;
          medium += name == 'width' ? res.width : res.height;
        }
        else{
          medium += bounds[name];
        }

        profiles.forEach((curr) => {
          const profile = curr.profile.nearest() || curr.profile;

          if(shift.indexOf(profile) != -1){

            if(!glmap.has(profile)){
              glmap.set(profile, {dx: new Set, dy: new Set});
            }

            const gl = glmap.get(profile);
            if(curr.outer || (profile != curr.profile && profile.cnn_side(curr.profile) == enm.cnn_sides.Снаружи)){
              gl.is_outer = true;
            }
            else{
              gl.is_inner = true;
            }

            const point = curr.b.add(curr.e).divide(2);
            if(name == 'width'){
              gl.dx.add(res);
              if(point.x < bounds.center.x){
                res.left = profile;
              }
              else{
                res.right = profile;
              }
            }
            else{
              gl.dy.add(res);
              if(point.y < bounds.center.y){
                res.top = profile;
              }
              else{
                res.bottom = profile;
              }
            }
          }
        });
        return res;
      });
      medium /= glasses.length;

      // дополняем в glmap структуры подходящих заполнений
      shift.forEach((impost) => {
        // если примыкают с двух сторон или вторая сторона рамная - импост проходит
        const gl = glmap.get(impost);
        if(!gl){
          return;
        }
        gl.ok = (gl.is_inner && gl.is_outer);
        gl.dx.forEach((glass) => {
          if(glass.left == impost && !glass.right){
            gl.delta = (glass.width - medium);
            gl.ok = true;
          }
          if(glass.right == impost && !glass.left){
            gl.delta = (medium - glass.width);
            gl.ok = true;
          }
        });
      });

      // рассчитываем, на сколько и в какую сторону двигать
      const res = [];

      shift.forEach((impost) => {

        const gl = glmap.get(impost);
        if(!gl || !gl.ok){
          return;
        }

        let delta = gl.delta || 0;

        if (name == 'width') {
          if(!gl.hasOwnProperty('delta')){
            gl.dx.forEach((glass) => {
              const double = 1.1 * gl.dx.size;
              if(glass.right == impost){
                delta += (medium - glass.width) / double;
              }
              else if(glass.left == impost){
                delta += (glass.width - medium) / double;
              }
            });
          }
          delta = new Point([delta,0]);
        }
        else {
          delta = new Point([0, delta]);
        }

        if(delta.length > consts.epsilon){
          impost.move_points(delta, true);
          res.push(delta);
        }
      });

      return res;
    },

    /**
     * ### Уравнивание по ширинам заполнений
     * выполняет в цикле до получения приемлемой дельты
     */
    glass_align(name = 'auto', glasses) {

      const shift = this.do_glass_align(name, glasses);
      if(!shift){
        return;
      }

      const {_attr} = this.project;
      if(!_attr._align_counter){
        _attr._align_counter = 1;
      }
      if(_attr._align_counter > 24){
        _attr._align_counter = 0;
        return;
      }

      if(shift.some((delta) => delta.length > 0.3)){
        _attr._align_counter++;
        this.project.contours.forEach((l) => l.redraw());
        return this.glass_align(name, glasses);
      }
      else{
        _attr._align_counter = 0;
        this.project.contours.forEach((l) => l.redraw());
      }
    },

    /**
     * ### Смещает раскладку по световому проему, с учетом толщины раскладки
     * возвращает истину в случае успеха
     * @param name
     * @param glass
     * @return {Boolean}
     */
    do_lay_impost_align(name = 'auto', glass) {

      const {project, Point} = this;

      // выбираем заполнение, если не выбрано
      if(!glass) {
        const glasses = project.selected_glasses();
        if(glasses.length != 1) {
          return;
        }
        glass = glasses[0];
      }

      // проверяем наличие раскладки у заполнения
      if (!(glass instanceof Editor.Filling)
        || !glass.imposts.length
        || glass.imposts.some(impost => impost.elm_type != enm.elm_types.Раскладка)) {
        return;
      }

      // восстановление соединений с заполнением
      let restored;
      for(const impost of glass.imposts) {
        for(const node of ['b','e']) {
          const {cnn} = impost.rays[node];
          if(cnn && cnn.cnn_type !== cnn.cnn_type._manager.i) {
            continue;
          }
          const point = impost.generatrix.clone({insert: false})
            .elongation(1500)
            .intersect_point(glass.path, impost[node], false, node === 'b' ? impost.e : impost.b);
          if(point && !impost[node].is_nearest(point, 0)) {
            impost[node] = point;
            restored = true;
          }
        }
      }
      if(restored) {
        return true;
      }

      // выясняем направление, в котором уравнивать
      if(name === 'auto') {
        name = 'width';
      }

      // собираем в массиве shift все импосты подходящего направления, остальные помещаем в neighbors
      const orientation = name === 'width' ? enm.orientations.vert : enm.orientations.hor;
      const neighbors = [];
      const shift = glass.imposts.filter(impost => {
        // отрезаем плохую ориентацию, учитываем наклонные импосты
        const vert = (impost.angle_hor > 45 && impost.angle_hor <= 135) || (impost.angle_hor > 225 && impost.angle_hor <= 315);
        const passed = impost.orientation == orientation
          || (orientation === enm.orientations.vert && vert)
          || (orientation === enm.orientations.hor && !vert);
        if (!passed) {
          neighbors.push(impost);
        }
        return passed;
      });

      // выходим, если отсутствуют импосты подходящего направления
      if (!shift.length) {
        return;
      }

      // получение ближайших связанных импостов
      function get_nearest_link(link, src, pt) {
        // поиск близжайшего импоста к точке
        const index = src.findIndex(elm => elm.b.is_nearest(pt) || elm.e.is_nearest(pt));
        if (index !== -1) {
          // запоминаем импост
          const impost = src[index];
          // удаляем импост из доступных импостов
          src.splice(index, 1);
          // добавляем импост в связь
          link.push(impost);
          // получаем близжайшие импосты
          get_nearest_link(link, src, impost.b);
          get_nearest_link(link, src, impost.e);
        }
      }

      // группируем импосты для сдвига
      const tmp = Array.from(shift);
      const links = [];
      while (tmp.length) {
        const link = [];
        get_nearest_link(link, tmp, tmp[0].b);
        if (link.length) {
          links.push(link);
        }
      }
      // сортируем группы по возрастанию координат начальной точки первого импоста в связи
      links.sort((a, b) => {
        return orientation === enm.orientations.vert ? (a[0].b._x - b[0].b._x) : (a[0].b._y - b[0].b._y);
      });

      // извлекаем ширину раскладки из номенклатуры первого импоста
      const widthNom = shift[0].nom.width;
      // определяем границы светового проема
      const bounds = glass.bounds_light(0);

      // вычисление смещения
      function get_delta(dist, pt) {
        return orientation === enm.orientations.vert
          ? (bounds.x + dist - pt._x)
          : (bounds.y + dist - pt._y);
      }

      // получаем ширину строки или столбца
      //const width = (orientation === enm.orientations.vert ? bounds.width : bounds.height) / links.length;
      // получаем шаг между осями накладок без учета ширины элементов раскладки
      const step = ((orientation === enm.orientations.vert ? bounds.width : bounds.height) - widthNom * links.length) / (links.length + 1);
      // накопительная переменная
      let pos = 0;
      // двигаем строки или столбцы
      for (const link of links) {
        // рассчитываем расположение осевой линии импоста с учетом предыдущей
        pos += step + widthNom / (pos === 0 ? 2 : 1);

        for (const impost of link) {
          // собираем соседние узлы для сдвига
          let nbs = [];
          for (const nb of neighbors) {
            if (nb.b.is_nearest(impost.b) || nb.b.is_nearest(impost.e)) {
              nbs.push({
                impost: nb,
                point: 'b'
              });
            }
            if (nb.e.is_nearest(impost.b) || nb.e.is_nearest(impost.e)) {
              nbs.push({
                impost: nb,
                point: 'e'
              });
            }
          }

          // двигаем начальную точку
          let delta = get_delta(pos, impost.b);
          impost.select_node("b");
          impost.move_points(new Point(orientation === enm.orientations.vert ? [delta, 0] : [0, delta]));
          glass.deselect_onlay_points();

          // двигаем конечную точку
          delta = get_delta(pos, impost.e);
          impost.select_node("e");
          impost.move_points(new Point(orientation === enm.orientations.vert ? [delta, 0] : [0, delta]));
          glass.deselect_onlay_points();

          // двигаем промежуточные точки импоста
          impost.generatrix.segments.forEach(segm => {
            if (segm.point === impost.b || segm.point === impost.e) {
              return;
            }
            delta = get_delta(pos, segm.point);
            segm.point = segm.point.add(delta);
          });

          // двигаем соседние узлы
          nbs.forEach(node => {
            delta = get_delta(pos, node.impost[node.point]);
            node.impost.select_node(node.point);
            node.impost.move_points(new Point(orientation == enm.orientations.vert ? [delta, 0] : [0, delta]));
            glass.deselect_onlay_points();
          });
        }
      }

      return true;
    },

    /**
     * ### Уравнивание раскладки по световому проему
     * выполняет смещение по ширине и высоте
     * @param name
     * @param glass
     * @return {Boolean}
     */
    lay_impost_align(name = 'auto', glass) {
      // выравниваем по длине
      const width = (name === 'auto' || name === 'width') && this.do_lay_impost_align('width', glass);
      // выравниваем по высоте
      const height = (name === 'auto' ||  name === 'height') && this.do_lay_impost_align('height', glass);
      if (!width && !height) {
        return;
      }

      // перерисовываем контуры
      this.project.contours.forEach(l => l.redraw());

      return true;
    },

  });

}
