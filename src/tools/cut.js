/**
 * ### Разрыв и слияние узла Т
 *
 * @module tools
 * @submodule tool_cut
 */

/**
 * ### Изменяет тип соединения
 *
 * @class ToolCut
 * @extends ToolElement
 * @constructor
 * @menuorder 56
 * @tooltip Разрыв
 */
class ToolCut extends ToolElement{

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'cut'},
      mouseStartPos: new paper.Point(),
      nodes: null,
      hitItem: null,
      cont: null,
      square: null,
    })

    this.on({

      activate() {
        this.on_activate('cursor-arrow-cut');
      },

      deactivate() {
        this.remove_cont();
      },

      keydown(event) {
        if (event.key == 'escape') {
          this.remove_cont();
          this._scope.canvas_cursor('cursor-arrow-cut');
        }
      },

      mouseup(event) {

        this.remove_cont();
        this._scope.canvas_cursor('cursor-arrow-cut');

      },

      mousemove: this.hitTest

    })

  }

  create_cont() {
    const {nodes} = this;
    if(!this.cont && nodes.length) {
      const point = nodes[0].profile[nodes[0].point];
      const pt = this.project.view.projectToView(point);

      // определим, какие нужны кнопки
      const buttons = [];
      if(nodes.length > 2) {
        buttons.push({name: 'cut', float: 'left', css: 'tb_cursor-cut tb_disable', tooltip: 'Разорвать Т'});
        buttons.push({name: 'uncut', float: 'left', css: 'tb_cursor-uncut', tooltip: 'Объединить разрыв в Т'});
      }
      // если есть T
      else if(nodes.some(({point}) => point === 't')) {
        buttons.push({name: 'cut', float: 'left', css: 'tb_cursor-cut', tooltip: 'Разорвать Т'});
        buttons.push({name: 'uncut', float: 'left', css: 'tb_cursor-uncut tb_disable', tooltip: 'Объединить разрыв в Т'});
      }
      else {
        buttons.push({name: 'diagonal', float: 'left', css: 'tb_cursor-diagonal', tooltip: 'Диагональное'});
        buttons.push({name: 'vh', float: 'left', css: 'tb_cursor-vh', tooltip: 'Угловое к горизонтали'});
        buttons.push({name: 'hv', float: 'left', css: 'tb_cursor-hv', tooltip: 'Угловое к вертикали'});
      }
      // доступные соединения
      const types = new Set();
      for(const {profile, point} of nodes) {
        if(point === 'b' || point === 'e') {
          const cnn = profile.rays[point];
          for(const tcnn of $p.cat.cnns.nom_cnn(profile, cnn.profile, cnn.cnn_types)) {
            types.add(tcnn.cnn_type);
          }
        }
      }
      for(const btn of buttons) {
        if(!btn.css.includes('tb_disable')) {
          if(btn.name === 'uncut' && !types.has($p.enm.cnn_types.t) ||
            btn.name === 'vh' && !types.has($p.enm.cnn_types.ah) ||
            btn.name === 'hv' && !types.has($p.enm.cnn_types.av) ||
            btn.name === 'diagonal' && !types.has($p.enm.cnn_types.ad)
          )
          btn.css += ' tb_disable';
        }
      }

      this.cont = new $p.iface.OTooolBar({
        wrapper: this._scope._wrapper,
        top: `${pt.y + 10}px`,
        left: `${pt.x - 20}px`,
        name: 'tb_cut',
        height: '28px',
        width: `${29 * buttons.length + 1}px`,
        buttons,
        onclick: this.tb_click.bind(this),
      });

      this.square = new paper.Path.Rectangle({
        point: point.add([-50, -50]),
        size: [100, 100],
        strokeColor: 'blue',
        strokeWidth: 3,
        dashArray: [8, 8],
      });
    }
    this._scope.canvas_cursor('cursor-arrow-white');
  }

  remove_cont() {
    this.cont && this.cont.unload();
    this.square && this.square.remove();
    this.nodes = null;
    this.cont = null;
    this.square = null;
  }

  tb_click(name) {
    $p.msg.show_not_implemented();
  }

  do_cut(element, point){

  }

  do_uncut(element, point){

  }

  nodes_different(nn) {
    const {nodes} = this;
    if(!nodes || nn.length !== nodes.length) {
      return true;
    }
    for(const n1 in nodes) {
      let ok;
      for(const n2 in nn) {
        if(n1.profile === n2.profile && n1.point === n2.point) {
          ok = true;
          break;
        }
      }
      if(!ok) {
        return false;
      }
    }
    return true;
  }

  hitTest(event) {

    const hitSize = 30;
    this.hitItem = null;

    if (event.point) {
      this.hitItem = this.project.hitTest(event.point, { ends: true, tolerance: hitSize });
    }

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem) {
      const {activeLayer, magnetism} = this.project;
      const profile = this.hitItem.item.parent;
      if(profile.parent === activeLayer) {
        const {profiles} = activeLayer;
        const {b, e} = profile;
        const selected = {profiles, profile, point: b.getDistance(event.point) < e.getDistance(event.point) ? 'b' : 'e'};
        const nodes = magnetism.filter(selected);
        if(this.nodes_different(nodes)) {
          this.remove_cont();
          this.nodes = nodes;
          this.create_cont();
        }
      }
    }
    else {
      this._scope.canvas_cursor('cursor-arrow-cut');
    }

    return true;
  }

}

