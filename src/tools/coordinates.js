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
          width: 290,
          height: 320
        },
      },
      profile: null,
      bind_point: null,
      hitItem: null,
      originalContent: null,
      changed: false,
    });

    this.on({

      activate: function() {
        this.on_activate('cursor-text-select');
        if(!this.dp) {
          this.dp = $p.dp.builder_coordinates.create(ToolCoordinates.defaultProps);
        }
        this.dp._manager.on({
          update: this.dp_update.bind(this),
          rows: this.dp_rows.bind(this),
        });
      },

      deactivate: function() {
        this.dp._manager.off();
        this.detache_wnd();
      },

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
        $p.wsql.restore_options('editor', this.options);
        this.wnd = $p.iface.dat_blank(this._scope._dxw, this.options.wnd);
        this._grid = this.wnd.attachHeadFields({
          obj: this.dp
        });
      }
      else {
        this._grid.attach({obj: this.dp});
      }

    }
    else {
      this.detache_wnd();
    }
  }

  detache_wnd() {
    super.detache_wnd();
    if(this.bind_point) {
      this.bind_point.remove();
      this.bind_point = null;
    }
  }

  select_path() {
    this.profile.selected = false;
    this.profile.ruler_line_select(this.dp.path.valueOf());
    this.select_bind();
  }

  select_bind() {
    let point;
    if(this.dp.bind == 'product') {
      point = this.project.bounds.bottomLeft;
    }
    else if(this.dp.bind == 'contour') {
      point = this.profile.layer.bounds.bottomLeft;
    }
    else {
      switch (`${this.dp.bind.valueOf()}_${this.dp.path.valueOf()}`) {
      case 'b_generatrix':
        point = this.profile.b;
        break;
      case 'e_generatrix':
        point = this.profile.e;
        break;
      case 'b_inner':
      case 'b_outer':
        point = this.profile._attr.ruler_line_path.firstSegment.point;
        break;
      case 'e_inner':
      case 'e_outer':
        point = this.profile._attr.ruler_line_path.lastSegment.point;
        break;
      }
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

