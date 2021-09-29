
/**
 * Относительное позиционирование и сдвиг
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author    Evgeniy Malyarov
 * @module  tool_ruler
 */

/**
 * ### Окно инструмента
 * @param options
 * @param tool
 * @constructor
 */
class RulerWnd {

  constructor(options, tool) {

    const init = {
      name: 'sizes',
      wnd: {
        caption: 'Размеры и сдвиг',
        width: 290,
        height: 320,
        modal: true,
      },
    };

    if (!options) {
      options = Object.assign({}, init);
    }
    options.wnd.allow_close = true;
    $p.wsql.restore_options('editor', options);
    if (options.mode > 2) {
      options.mode = 2;
    }
    if(tool instanceof ToolRuler) {
      if(options.wnd.width < init.wnd.width) {
        options.wnd.width = init.wnd.width;
      }
      if(options.wnd.height < init.wnd.height) {
        options.wnd.height = init.wnd.height;
      }
    }
    options.wnd.on_close = this.on_close.bind(this);
    this.options = options;

    this.tool = tool;
    const wnd = this.wnd = $p.iface.dat_blank((tool._scope || tool.project._scope)._dxw, options.wnd);

    this.on_keydown = this.on_keydown.bind(this);
    this.on_button_click = this.on_button_click.bind(this);

    tool.eve.on('keydown', this.on_keydown);

    const div = document.createElement('table');
    div.innerHTML = '<tr><td ></td><td align="center"></td><td></td></tr>' +
      '<tr><td></td><td><input type="text" style="width: 70px;  text-align: center;" readonly value="0"></td><td></td></tr>' +
      '<tr><td></td><td align="center"></td><td></td></tr>';
    div.style.width = '130px';
    div.style.margin = 'auto';
    div.style.borderSpacing = 0;

    this.table = div.firstChild.childNodes;

    $p.iface.add_button(this.table[0].childNodes[1], null,
      {name: 'top', css: 'tb_align_vert', tooltip: $p.msg.align_set_top}).onclick = this.on_button_click;
    $p.iface.add_button(this.table[1].childNodes[0], null,
      {name: 'left', css: 'tb_align_hor', tooltip: $p.msg.align_set_left}).onclick = this.on_button_click;
    $p.iface.add_button(this.table[1].childNodes[2], null,
      {name: 'right', css: 'tb_align_hor', tooltip: $p.msg.align_set_right}).onclick = this.on_button_click;
    $p.iface.add_button(this.table[2].childNodes[1], null,
      {name: 'bottom', css: 'tb_align_vert', tooltip: $p.msg.align_set_bottom}).onclick = this.on_button_click;

    if (tool instanceof ToolRuler) {

      div.style.marginTop = '22px';

      wnd.tb_mode = new $p.iface.OTooolBar({
        wrapper: wnd.cell,
        width: '100%',
        height: '28px',
        class_name: '',
        name: 'tb_mode',
        buttons: [
          {name: '0', img: 'ruler_elm.png', tooltip: $p.msg.ruler_elm, float: 'left'},
          {name: '1', img: 'ruler_node.png', tooltip: $p.msg.ruler_node, float: 'left'},
          {name: '2', img: 'ruler_arrow.png', tooltip: $p.msg.ruler_new_line, float: 'left'},
          {name: '4', css: 'tb_cursor-arc-r', tooltip: $p.msg.ruler_arc, float: 'left'},

          {name: 'sep_0', text: '', float: 'left'},
          {name: 'base', img: 'ruler_base.png', tooltip: $p.msg.ruler_base, float: 'left'},
          {name: 'inner', img: 'ruler_inner.png', tooltip: $p.msg.ruler_inner, float: 'left'},
          {name: 'outer', img: 'ruler_outer.png', tooltip: $p.msg.ruler_outer, float: 'left'},
        ],
        image_path: '/imgs/',
        onclick: (name) => {
          const names = ['0', '1', '2', '4'];
          if (names.indexOf(name) != -1) {

            names.forEach((btn) => {
              if (btn != name) {
                wnd.tb_mode.buttons[btn] && wnd.tb_mode.buttons[btn].classList.remove('muted');
              }
            });
            wnd.tb_mode.buttons[name].classList.add('muted');
            tool.mode = name;
          }
          else {
            ['base', 'inner', 'outer'].forEach((btn) => {
              if (btn != name) {
                wnd.tb_mode.buttons[btn] && wnd.tb_mode.buttons[btn].classList.remove('muted');
              }
            });
            wnd.tb_mode.buttons[name].classList.add('muted');
            tool.base_line = name;
          }

          return false;
        },
      });

      // прячем среднюю кнопку
      wnd.tb_mode.buttons['1'].style.display = 'none';

      wnd.tb_mode.buttons[tool.mode].classList.add('muted');
      wnd.tb_mode.buttons[tool.base_line].classList.add('muted');
      wnd.tb_mode.cell.style.backgroundColor = '#f5f5f5';

      // создаём экземпляр обработки
      this.dp = $p.dp.builder_size.create();
      this.dp.align = $p.enm.text_aligns.center;

      this.layout = wnd.attachLayout({
        pattern: '2E',
        cells: [
          {id: 'a', text: 'Размер', header: false, height: 120, fix_size: [null, true]},
          {id: 'b', text: 'Свойства', header: false},
        ],
        offsets: {top: 0, right: 0, bottom: 0, left: 0}
      });
      this.layout.cells('a').cell.lastChild.style.border = 'none';
      this.layout.cells('a').attachObject(div);
      this.grid = this.layout.cells('b').attachHeadFields({
        obj: this.dp,
        read_only: true,
        oxml: {
          ' ': ['fix_angle', 'angle', 'align', 'offset', 'hide_c1', 'hide_c2', 'hide_line']
        },
        widths: '60,40',
      });
    }
    else {
      wnd.attachObject(div);
    }

    this.input = this.table[1].childNodes[1];
    this.input.grid = {
      editStop: () => {
        tool.sizes_wnd({
          wnd: wnd,
          name: 'size_change',
          size: this.size,
          tool: tool,
        });
      },
      getPosition: (v) => {
        let {offsetLeft, offsetTop} = v;
        while (v = v.offsetParent) {
          offsetLeft += v.offsetLeft;
          offsetTop += v.offsetTop;
        }
        return [offsetLeft + 7, offsetTop + 9];
      },
    };
    this.input.firstChild.onclick = function () {
      if(!wnd.elmnts.calck) {
        wnd.elmnts.calck = new eXcell_calck(this);
      }
      setTimeout(() => {
        wnd.elmnts.calck.edit();
      }, 100);
    };

    this.input.firstChild.click();

  }

  on_button_click(ev) {

    const {wnd, tool, size} = this;

    if (!tool.project.selectedItems.some((path) => {
        if (path.parent instanceof Editor.DimensionLineCustom) {

          switch (ev.currentTarget.name) {

            case 'left':
            case 'bottom':
              path.parent.offset -= 20;
              this.dp.offset = path.parent.offset;
              break;

            case 'top':
            case 'right':
              path.parent.offset += 20;
              this.dp.offset = path.parent.offset;
              break;

          }

          return true;
        }
      })) {
      tool.sizes_wnd({wnd, size, tool, name: ev.currentTarget.name});
    }
  }

  on_keydown(ev) {

    const {wnd, tool} = this;

    if (wnd) {
      switch (ev.keyCode) {
        case 27:        // закрытие по {ESC}
          !(tool instanceof ToolRuler) && wnd.close();
          break;
        case 37:        // left
          this.on_button_click({
            currentTarget: {name: 'left'},
          });
          break;
        case 38:        // up
          this.on_button_click({
            currentTarget: {name: 'top'},
          });
          break;
        case 39:        // right
          this.on_button_click({
            currentTarget: {name: 'right'},
          });
          break;
        case 40:        // down
          this.on_button_click({
            currentTarget: {name: 'bottom'},
          });
          break;

        case 109:       // -
        case 46:        // del
        case 8:         // backspace
          if (ev.target && ['textarea', 'input'].indexOf(ev.target.tagName.toLowerCase()) != -1) {
            return;
          }

          tool.project.selectedItems.some((path) => {
            if (path.parent instanceof Editor.DimensionLineCustom) {
              path.parent.remove();
              return true;
            }
          });

          // Prevent the key event from bubbling
          return $p.iface.cancel_bubble(ev);

      case 86:        // v - zoom_fit
        tool.project.zoom_fit();
        tool.project.view.update();
        break;

      }
      return $p.iface.cancel_bubble(ev);
    }

  }

  on_close() {

    const {tool, size, wnd} = this;

    if (wnd && wnd.elmnts.calck && wnd.elmnts.calck.obj && wnd.elmnts.calck.obj.removeSelf) {
      wnd.elmnts.calck.obj.removeSelf();
    }

    tool.eve.off('keydown', this.on_keydown);

    tool.sizes_wnd({
      wnd: wnd,
      name: 'close',
      size: size,
      tool: tool,
    });

    if (this.options) {
      if (tool instanceof Editor.DimensionLine) {
        delete this.options.wnd.on_close;
        wnd.wnd_options(this.options.wnd);
        $p.wsql.save_options('editor', this.options);
      }
      else {
        setTimeout(() => tool._scope && tool._scope.tools[1].activate());
      }
      delete this.options;
    }
    delete this.wnd;
    delete this.tool;

    return true;

  }

  close() {
    this.wnd && this.wnd.close();
  }

  wnd_options(options) {
    this.wnd && this.wnd.wnd_options(options);
  }

  get size() {
    return parseFloat(this.input.firstChild.value) || 0;
  }

  set size(v) {
    this.input.firstChild.value = parseFloat(v).round(1);
  }

  attach(line) {
    if(line.selected) {
      this.dp.angle = line.angle;
      this.dp.fix_angle = line.fix_angle;
      this.dp.align = line.align;
      this.dp.offset = line.offset;
      this.dp.hide_c1 = line.hide_c1;
      this.dp.hide_c2 = line.hide_c2;
      this.dp.hide_line = line.hide_line;
      this.dp.value_change = function(f, mf, v) {
        line[f] = v;
      };
    }
    else {
      delete this.dp.value_change;
      this.dp.angle = 0;
      this.dp.fix_angle = false;
      this.dp.align = $p.enm.text_aligns.center;
      this.dp.offset = 0;
    }
    this.grid.setEditable(line.selected);
  }
}

$p.EditorInvisible.RulerWnd = RulerWnd;


/**
 * ### Относительное позиционирование и сдвиг
 *
 * @class ToolRuler
 * @extends ToolElement
 * @constructor
 * @menuorder 57
 * @tooltip Позиция и сдвиг
 */
class ToolRuler extends ToolElement {

  constructor() {

    // mode : ["Элементы","Узлы","Новая линия","Новая линия узел2"];
    // base_line : ["base","inner","outer"];

    super();

    Object.assign(this, {
      options: {
        name: 'ruler',
        mode: 0,
        base_line: 0,
        wnd: {
          caption: 'Размеры и сдвиг',
          height: 200,
        },
      },
      mouseStartPos: new paper.Point(),
      hitItem: null,
      hitPoint: null,
      changed: false,
      //minDistance: 10,
      selected: {
        a: [],
        b: [],
      },
    });

    this.on({

      activate () {

        this.selected.a.length = 0;
        this.selected.b.length = 0;

        this.on_activate('cursor-arrow-ruler-light');

        this.project.deselectAll();
        this.wnd = new RulerWnd(this.options, this);
      },

      deactivate () {

        this.remove_path();

        this.detache_wnd();

      },

      mousedown (event) {

        if (this.hitItem) {

          // mode == 0 - это расстояние между элементами
          if (this.mode == 0) {

            this.add_hit_item(event);

            // Если выделено 2 элемента, рассчитаем сдвиг
            if (this.selected.a.length && this.selected.b.length) {
              if (this.selected.a[0].orientation == this.selected.b[0].orientation) {
                if (this.selected.a[0].orientation == $p.enm.orientations.Вертикальная) {
                  this.wnd.size = Math.abs(this.selected.a[0].ruler_line_coordin('x') - this.selected.b[0].ruler_line_coordin('x'));
                }
                else if (this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная) {
                  this.wnd.size = Math.abs(this.selected.a[0].ruler_line_coordin('y') - this.selected.b[0].ruler_line_coordin('y'));
                }
                else {
                  // для наклонной ориентации используем interiorpoint

                }
              }
            }
            else if (this.wnd.size != 0) {
              this.wnd.size = 0;
            }

          }
          // mode == 1 - это расстояние между узлами
          else if (this.mode == 1) {

            this.add_hit_point(event);

          }
          // mode == 4 - это радиус элемента
          else if (this.mode == 4 && this.hitPoint) {

            const {parent} = this.hitItem.item;

            if(parent.is_linear()) {
              $p.msg.show_msg({
                type: 'alert-info',
                text: `Выделен прямой элемент`,
                title: 'Размерная линия радиуса'
              });
            }
            else {
              // создаём размерную линию
              new Editor.DimensionRadius({
                elm1: parent,
                p1: this.hitItem.item.getOffsetOf(this.hitPoint).round(),
                parent: parent.layer.l_dimensions,
                by_curve: event.modifiers.control || event.modifiers.shift || window.event.ctrlKey || window.event.shiftKey,
              });
              this.project.register_change(true);
            }

          }
          // mode > 1 - это размерная линия
          else {

            // если есть hitPoint
            if (this.hitPoint) {

              if (this.mode == 2) {

                this.selected.a.push(this.hitPoint);

                if (!this.path) {
                  this.path = new paper.Path({
                    parent: this.hitPoint.profile.layer.l_dimensions,
                    segments: [this.hitPoint.point, event.point],
                  });
                  this.path.strokeColor = 'black';
                }

                this.mode = 3;

              }
              else {

                // создаём размерную линию
                new Editor.DimensionLineCustom({
                  elm1: this.selected.a[0].profile,
                  elm2: this.hitPoint.profile,
                  p1: this.selected.a[0].point_name,
                  p2: this.hitPoint.point_name,
                  parent: this.hitPoint.profile.layer.l_dimensions,
                });

                this.project.register_change(true);
                this.reset_selected();

              }
            }
          }

        }
        // кликнули в пустое место
        else {
          this.reset_selected();
        }

      },

      mouseup () {

      },

      mousedrag () {

      },

      mousemove (event) {

        this.hitTest(event);

        const {mode, path} = this;

        if (mode === 3 && path) {

          if (path.segments.length == 4) {
            path.removeSegments(1, 3, true);
          }

          if (!this.path_text) {
            this.path_text = new paper.PointText({
              justification: 'center',
              fillColor: 'black',
              fontSize: 72,
            });
          }

          path.lastSegment.point = event.point;

          const {length} = path;
          if (length) {
            const normal = path.getNormalAt(0).multiply(120);
            path.insertSegments(1, [path.firstSegment.point.add(normal), path.lastSegment.point.add(normal)]);
            // path.firstSegment.selected = true;
            // path.lastSegment.selected = true;

            this.path_text.content = length.toFixed(0);
            //this.path_text.rotation = e.subtract(b).angle;
            this.path_text.point = path.curves[1].getPointAt(.5, true);

          } else {
            this.path_text.visible = false;
          }
        }
        else if(mode === 4 && this.hitPoint) {
          if (!this.path) {
            this.path = new paper.Path.Circle({
              center: this.hitPoint,
              radius: 20,
              fillColor: new paper.Color(0, 0, 1, 0.5),
              guide: true,
            });
          }
          else {
            this.path.position = this.hitPoint;
          }
        }

      },

      keydown (event) {
        const {event: {code}} = event;
        // удаление размерной линии
            if (['Delete','NumpadSubtract','Backspace'].includes(code)) {

          if (event.event && event.event.target && ['textarea', 'input'].indexOf(event.event.target.tagName.toLowerCase()) != -1)
            return;

          this.project.selectedItems.some((path) => {
            if (path.parent instanceof Editor.DimensionLineCustom) {
              path.parent.remove();
              return true;
            }
          });

          // Prevent the key event from bubbling
          event.stop();
          return false;

        }
      },
    });

  }

  hitTest(event) {

    this.hitItem = null;
    this.hitPoint = null;

    if (event.point) {

      // если режим - расстояние между элементами, ловим профили, а точнее - заливку путей
      if (!this.mode) {
        this.hitItem = this.project.hitTest(event.point, {fill: true, tolerance: 10});
      }
      if (this.mode === 4) {
        this.hitItem = this.project.hitTest(event.point, {stroke: true, tolerance: 20});
      }
      else {
        // Hit test points
        let hit = this.project.hitPoints(event.point, 16, false, true);
        if (hit) {
          if(hit.item.parent instanceof Editor.ProfileItem) {
            this.hitItem = hit;
          }
        }
        else if (this.mode === 2) {
          hit = this.project.hitTest(event.point, {fill: true, stroke: true, tolerance: 20});
          // размерные линии сами разберутся со своими курсорами
          if (hit && hit.item.parent instanceof Editor.DimensionLine) {
            return true;
          }
        }
      }
    }

    if (this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem) {
      if (this.mode) {
        this._scope.canvas_cursor('cursor-arrow-white-point');
        if (this.mode === 4) {
          this.hitPoint = this.hitItem.item.getNearestPoint(event.point);
        }
        else {
          this.hitPoint = this.hitItem.item.parent.select_corn(event.point);
        }
      }
    }
    else {
      if (this.mode) {
        this._scope.canvas_cursor('cursor-text-select');
        if (this.mode === 4) {
          this.remove_path();
        }
      }
      else {
        this._scope.canvas_cursor('cursor-arrow-ruler-light');
      }
      this.hitItem = null;
    }

    return true;
  }

  remove_path() {

    if (this.path) {
      this.path.removeSegments();
      this.path.remove();
      this.path = null;
    }

    if (this.path_text) {
      this.path_text.remove();
      this.path_text = null;
    }
  }

  reset_selected() {

    this.remove_path();
    this.project.deselectAll();
    this.selected.a.length = 0;
    this.selected.b.length = 0;
    if (this.mode > 2) {
      this.mode = 2;
    }
    if (this.wnd.size) {
      this.wnd.size = 0;
    }
  }

  add_hit_point() {

  }

  add_hit_item(event) {

    const item = this.hitItem.item.parent;

    if (paper.Key.isDown('1') || paper.Key.isDown('a')) {

      if (this.selected.a.indexOf(item) == -1) {
        this.selected.a.push(item);
      }

      if (this.selected.b.indexOf(item) != -1) {
        this.selected.b.splice(this.selected.b.indexOf(item), 1);
      }

    }
    else if (paper.Key.isDown('2') || paper.Key.isDown('b') ||
      event.modifiers.shift || (this.selected.a.length && !this.selected.b.length)) {

      if (this.selected.b.indexOf(item) == -1) {
        this.selected.b.push(item);
      }

      if (this.selected.a.indexOf(item) != -1) {
        this.selected.a.splice(this.selected.a.indexOf(item), 1);
      }

    }
    else {
      this.project.deselectAll();
      this.selected.a.length = 0;
      this.selected.b.length = 0;
      this.selected.a.push(item);
    }

    // обозначим выделение в зависимости от base_line
    item.ruler_line_select(this.base_line);

  }

  get mode() {
    return this.options.mode || 0;
  }

  set mode(v) {
    this.project.deselectAll();
    this.options.mode = parseInt(v);
  }

  get base_line() {
    return this.options.base_line || 'base';
  }

  set base_line(v) {
    this.options.base_line = v;
  }

  _move_points(event, xy) {

    // сортируем группы выделенных элеметов по правл-лево или верх-низ
    // left_top == true, если элементы в массиве _a_ выше или левее элементов в массиве _b_
    const pos1 = this.selected.a.reduce((sum, curr) => {
      return sum + curr.ruler_line_coordin(xy);
    }, 0) / (this.selected.a.length);
    const pos2 = this.selected.b.reduce((sum, curr) => {
      return sum + curr.ruler_line_coordin(xy);
    }, 0) / (this.selected.b.length);
    let delta = Math.abs(pos2 - pos1);

    if(xy == 'x') {
      if(event.name == 'right') {
        delta = new paper.Point(event.size - delta, 0);
      }
      else {
        delta = new paper.Point(delta - event.size, 0);
      }
    }
    else {
      if(event.name == 'bottom') {
        delta = new paper.Point(0, event.size - delta);
      }
      else {
        delta = new paper.Point(0, delta - event.size);
      }
    }

    if (delta.length) {

      let to_move;

      // TODO: запомнить ruler_line и восстановить после перемещения

      this.project.deselectAll();

      if(event.name == 'right' || event.name == 'bottom') {
        to_move = pos1 < pos2 ? this.selected.b : this.selected.a;
      }
      else {
        to_move = pos1 < pos2 ? this.selected.a : this.selected.b;
      }

      to_move.forEach((p) => {
        p.generatrix.segments.forEach((segm) => segm.selected = true);
      });

      this.project.move_points(delta);

      setTimeout(() => {
        this.project.deselectAll();
        this.project.register_update();
      }, 200);
    }

  }

  sizes_wnd(event) {

    if (this.wnd && event.wnd == this.wnd.wnd) {

      if (!this.selected.a.length || !this.selected.b.length) {
        return;
      }

      switch (event.name) {

        case 'left':
        case 'right':
          if (this.selected.a[0].orientation == $p.enm.orientations.Вертикальная)
            this._move_points(event, 'x');
          break;

        case 'top':
        case 'bottom':
          if (this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная)
            this._move_points(event, 'y');
          break;
      }
    }

  }

}

Editor.ToolRuler = ToolRuler;
