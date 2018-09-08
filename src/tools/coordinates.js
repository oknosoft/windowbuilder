/**
 * ### Инструмент "Таблица координат"
 *
 * Created 07.09.2018
 *
 * @module tools
 * @submodule tool_coordinates
 */



/**
 * ### Инструмент "Таблица координат"
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

      // включить диалог свойст текстового элемента
      if(!this.wnd || !this.wnd.elmnts) {
        this.create_wnd();
      }

      this.select_path();

    }
    else {
      this.detache_wnd();
    }
  }

  refresh_coordinates() {
    const {coordinates} = this.dp;
    coordinates.clear();
    const points = this.grid.grid_points();
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

    this.dp._manager.on({
      update: this.dp_update,
      rows: this.dp_rows,
    });

    if(this.grid){
      this.grid.visible = true;
    }
    else {
      this.grid = new GridCoordinates({
        step: this.dp.step,
        offset: this.dp.offset,
        angle: this.dp.angle,
        bind: this.dp.bind.valueOf(),
      });
    }
  }

  detache_wnd() {
    super.detache_wnd();
    this.dp._manager.off({
      update: this.dp_update,
      rows: this.dp_rows,
    });
    if(this.grid) {
      this.grid.remove();
      this.grid = null;
    }
  }

  select_path() {
    const {path_kind} = $p.enm;

    this.profile.selected = false;
    this.profile.ruler_line_select(this.dp.path.valueOf());

    switch (this.dp.path) {
    case path_kind.generatrix:
      this.grid.path = this.profile.generatrix;
      break;
    case path_kind.inner:
    case path_kind.outer:
      this.grid.path = this.profile._attr.ruler_line_path;
      break;
    }
    this.refresh_coordinates();
  }

  dp_update(dp, fields) {
    if('path' in fields) {
      this.select_path();
    }
    if('bind' in fields) {
      this.grid.bind = this.dp.bind.valueOf();
      this.refresh_coordinates();
    }
    if('offset' in fields) {
      this.grid.offset = this.dp.offset;
      this.refresh_coordinates();
    }
  }

  dp_rows(dp, fields) {

  }
}

ToolCoordinates.defaultProps = {
  bind: 'b',
  path: 'generatrix',
  step: 200,
  offset: 200,
}

