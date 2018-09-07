/**
 * ### Таблица координат
 *
 * Created 07.09.2018
 *
 * @module tools
 * @submodule tool_coordinates
 */

/**
 * ### Таблица координат
 *
 * @class ToolCoordinates
 * @extends ToolElement
 * @constructor
 * @menuorder 56
 * @tooltip Координаты
 */
class ToolCoordinates extends ToolElement{

  constructor() {

    super()

    Object.assign(this, {
      options: {
        name: 'grid',
        wnd: {
          caption: "Таблица координат",
          width: 300,
          height: 400
        },
      },
      profile: null,
      bind_point: null,
      hitItem: null,
      originalContent: null,
      changed: false,
    });

    this.dp_update = this.dp_update.bind(this);
    this.dp_rows = this.dp_rows.bind(this);

    this.on({

      activate: function() {
        this.on_activate('cursor-text-select');
        if(!this.dp) {
          this.dp = $p.dp.builder_coordinates.create(ToolCoordinates.defaultProps);
        }
      },

      deactivate: this.detache_wnd,

      mousedown: this.mousedown,

      mouseup: function(event) {


        this._scope.canvas_cursor('cursor-text-select');

      },

      mousemove: this.hitTest

    })

  }

  hitTest(event) {

    const hitSize = 6;
    this.hitItem = null;

    if(event.point) {
      this.hitItem = this.project.hitTest(event.point, {fill: true, stroke: true, selected: true, tolerance: hitSize});
    }
    if(!this.hitItem) {
      this.hitItem = this.project.hitTest(event.point, {fill: true, tolerance: hitSize});
    }

    if(this.hitItem && this.hitItem.item.parent instanceof ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      this._scope.canvas_cursor('cursor-arrow-lay');
    }
    else {
      this.hitItem = null;
      this._scope.canvas_cursor('cursor-text-select');
    }

    return true;
  }


  mousedown(event) {
    this.project.deselectAll();

    if(this.hitItem) {
      this.profile = this.hitItem.item.parent;
      this.select_path();

      // включить диалог свойст текстового элемента
      if(!this.wnd || !this.wnd.elmnts) {
        this.create_wnd();
      }
      else {
        this.refresh_coordinates();
      }

    }
    else {
      this.detache_wnd();
    }
  }

  refresh_coordinates() {
    const {coordinates} = this.dp;
    coordinates.clear();
    const points = this.path.grid_points({
      step: this.dp.step,
      angle: this.dp.angle,
      reverse: this.dp.bind === $p.enm.bind_coordinates.e,
      point: this.bind_point.position,
      //offset = 200
    });
    points.forEach((point) => coordinates.add(point));
  }

  create_wnd() {

    $p.wsql.restore_options('editor', this.options);
    this.wnd = $p.iface.dat_blank(this._scope._dxw, this.options.wnd);
    this._layout = this.wnd.attachLayout({
      pattern: '2E',
      cells: [
        {id: 'a', text: 'Шапка', header: false, height: 120, fix_size: [null, true]},
        {id: 'b', text: 'Координаты', header: false},
      ],
      offsets: {top: 0, right: 0, bottom: 0, left: 0}
    });


    this._head = this._layout.cells('a').attachHeadFields({
      obj: this.dp
    });

    this._grid = this._layout.cells('b').attachTabular({
      obj: this.dp,
      ts: 'coordinates',
      reorder: false,
    });
    const toolbar = this._layout.cells('b').getAttachedToolbar();
    toolbar.forEachItem((name) => {
      ['btn_add', 'btn_delete'].indexOf(name) == -1 && toolbar.removeItem(name);
    });

    this._layout.cells('a').cell.firstChild.style.border = 'none';
    this._layout.cells('a').cell.lastChild.style.border = 'none';
    const {cell} = this._layout.cells('b');
    cell.firstChild.style.border = 'none';
    cell.lastChild.style.border = 'none';
    const cell_tb = cell.querySelector('.dhx_cell_toolbar_def');
    cell_tb.style.padding = 0;
    cell_tb.lastChild.style.paddingLeft = 0;

    this._layout.setSizes();

    this.refresh_coordinates();

    this.dp._manager.on({
      update: this.dp_update,
      rows: this.dp_rows,
    });


  }

  detache_wnd() {
    super.detache_wnd();
    this.dp._manager.off({
      update: this.dp_update,
      rows: this.dp_rows,
    });
    if(this.bind_point) {
      this.bind_point.remove();
      this.bind_point = null;
    }
  }

  select_path() {
    const {path_kind} = $p.enm;

    this.profile.selected = false;
    this.profile.ruler_line_select(this.dp.path.valueOf());

    switch (this.dp.path) {
    case path_kind.generatrix:
      this.path = this.profile.generatrix;
      break;
    case path_kind.inner:
    case path_kind.outer:
      this.path = this.profile._attr.ruler_line_path;
      break;
    }

    this.select_bind();
  }

  select_bind() {
    const {bind_coordinates} = $p.enm;
    let point;
    switch (this.dp.bind) {
    case bind_coordinates.b:
      point = this.path.b;
      break;
    case bind_coordinates.e:
      point = this.path.e;
      break;
    case bind_coordinates.product:
      point = this.project.bounds.bottomLeft;
      break;
    case bind_coordinates.contour:
      point = this.profile.layer.bounds.bottomLeft;
      break;
    }

    if(!this.bind_point) {
      this.bind_point = new paper.Path.Circle({
        center: point,
        radius: 28,
        fillColor: new paper.Color(0, 0.7, 0, 0.7),
        guide: true,
      });
    }
    else {
      this.bind_point.position = point;
    }
  }

  dp_update(dp, fields) {
    if('path' in fields) {
      this.select_path();
    }
    else if('bind' in fields) {
      this.select_bind();
    }
  }

  dp_rows(dp, fields) {

  }
}

ToolCoordinates.defaultProps = {
  bind: 'b',
  path: 'generatrix',
  step: 200,
}

