
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
    super();
    Object.assign(this, {
      options: {name: 'cut'},
      mouseStartPos: new paper.Point(),
      nodes: null,
      hitItem: null,
      cont: null,
      square: null,
      profile: null,
    });

    this.on({

      activate() {
        this.on_activate('cursor-arrow-cut');
      },

      deactivate: this.remove_cont,

      keydown: this.keydown,

      mouseup: this.mouseup,

      mousemove: this.hitTest

    });
  }

  keydown(event) {
    if (event.event.code === 'Escape') {
      this.remove_cont();
      this._scope.canvas_cursor('cursor-arrow-cut');
    }
  }

  /**
   * по mouseup, выделяем/снимаем выделение профилей
   * @param event
   */
  mouseup(event) {
    const hitItem = this.project.hitTest(event.point, {fill: true, stroke: false, segments: false});
    if(hitItem && hitItem.item.parent instanceof Editor.Profile) {
      let item = hitItem.item.parent;
      if(event.modifiers.shift) {
        item.selected = !item.selected;
      }
      else {
        this.project.deselectAll();
        item.selected = true;
      }
      item.attache_wnd(this._scope._acc.elm);
      this.profile = item;
    }
    else {
      this.profile = null;
    }

    this.remove_cont();
    this._scope.canvas_cursor('cursor-arrow-cut');

  }

  /**
   * создаёт панель команд над узлом
   */
  create_cont() {
    const {nodes} = this;
    const {cnn_types} = $p.enm;
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
          const cnns = $p.cat.cnns.nom_cnn(profile, cnn.profile, nodes.length > 2 ? undefined : cnn.cnn_types);
          // if(profile !== cnn.profile) {
          //   cnns.push.apply(cnns, $p.cat.cnns.nom_cnn(cnn.profile, profile, nodes.length > 2 ? undefined : cnn.cnn_types));
          // }
          for(const tcnn of cnns) {
            types.add(tcnn.cnn_type);
          }
        }
      }
      for(const btn of buttons) {
        if(!btn.css.includes('tb_disable')) {
          if(btn.name === 'uncut' && !types.has(cnn_types.t) ||
            btn.name === 'vh' && !types.has(cnn_types.ah) ||
            btn.name === 'hv' && !types.has(cnn_types.av) ||
            btn.name === 'diagonal' && !types.has(cnn_types.ad)
          ){
            btn.css += ' tb_disable';
          }
          else if(['diagonal', 'vh', 'hv'].includes(btn.name) && nodes.every(({profile, point}) => {
            const {cnn} = profile.rays[point];
            const type = btn.name === 'diagonal' ? cnn_types.ad : (btn.name === 'vh' ? cnn_types.ah : cnn_types.av);
            return cnn && cnn.cnn_type === type;
          })){
            btn.css += ' tb_disable';
          }
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

  /**
   * удаляет панель команд над узлом
   */
  remove_cont() {
    this.cont && this.cont.unload();
    this.square && this.square.remove();
    this.nodes = null;
    this.cont = null;
    this.square = null;
  }

  /**
   * switch команды
   * @param name
   */
  tb_click(name) {
    const {nodes, project} = this;
    if(!nodes) {
      return;
    }
    project.deselectAll();
    const {cnn_types, orientations} = $p.enm;
    if(['diagonal', 'vh', 'hv'].includes(name)) {
      const type = name === 'diagonal' ? cnn_types.ad : (name === 'vh' ? cnn_types.ah : cnn_types.av);
      for(const {profile, point} of nodes) {
        if(point === 'b' || point === 'e') {
          const cnn = profile.rays[point];
          const types = name === 'diagonal' ||
            (profile.orientation === orientations.vert && name === 'hv') ||
            (profile.orientation === orientations.hor && name === 'vh') ?
            [type] :
            cnn_types.acn.a.filter((v) => v !== cnn_types.ad);
          const cnns = $p.cat.cnns.nom_cnn(profile, cnn.profile, types);
          if(cnns.length) {
            cnn.cnn = cnns[0];
            this.project.register_change();
          }
        }
      }
    }
    else if(name === 'cut') {
      this.do_cut();
    }
    else if(name === 'uncut') {
      this.do_uncut();
    }
    this.remove_cont();
  }

  deselect() {
    const {project, profile} = this;
    if(profile) {
      profile.detache_wnd();
      this.profile = null;
    }
    project.deselectAll();
    project.register_change();
  }

  // делает разрыв и вставляет в него импост
  do_cut(){
    let impost, rack;
    for(const node of this.nodes) {
      if(node.point === 'b' || node.point === 'e') {
        impost = node;
      }
      else if(node.point === 't') {
        rack = node;
      }
    }
    if(!impost || !rack) {
      return;
    }

    const {enm: {cnn_types}, cat} = $p;
    let cnn = rack.profile.cnn_point('e');
    const base = cnn.cnn;
    cnn && cnn.profile && cnn.profile_point && cnn.profile.rays[cnn.profile_point].clear(true);
    cnn.clear(true);
    impost.profile.rays[impost.point].clear(true);

    const {generatrix} = rack.profile;
    if(generatrix.hasOwnProperty('insert')) {
      delete generatrix.insert;
    }

    const loc = generatrix.getNearestLocation(impost.profile[impost.point]);
    const rack2 = new Editor.Profile({generatrix: generatrix.splitAt(loc), proto: rack.profile});

    // соединения конца нового профиля из разрыва
    cnn = rack2.cnn_point('e');
    if(base && cnn && cnn.profile) {
      if(!cnn.cnn || cnn.cnn.cnn_type !== base.cnn_type){
        const cnns = cat.cnns.nom_cnn(rack2, cnn.profile, [base.cnn_type]);
        if(cnns.includes(base)) {
          cnn.cnn = base;
        }
        else if(cnns.length) {
          cnn.cnn = cnns[0];
        }
      }
      cnn = cnn.profile.cnn_point(cnn.profile_point);
      if(cnn.profile === rack2) {
        cnn.cnn = null;
      }
    }
    const atypes = [cnn_types.ah, cnn_types.av, cnn_types.t];

    cnn = rack2.cnn_point('b');
    if(cnn && cnn.profile === impost.profile) {
      const cnns = cat.cnns.nom_cnn(rack2, cnn.profile, atypes);
      if(cnns.length) {
        cnn.cnn = cnns[0];
      }
    }
    cnn = rack.profile.cnn_point('e');
    if(cnn && cnn.profile === impost.profile) {
      const cnns = cat.cnns.nom_cnn(rack.profile, cnn.profile, atypes);
      if(cnns.length) {
        cnn.cnn = cnns[0];
      }
    }

    this.deselect();
  }

  // объединяет разрыв и делает Т
  do_uncut(){
    const nodes = this.nodes.filter(({point}) => point === 'b' || point === 'e');
    let impost, rack1, rack2;
    for(const n1 of nodes) {
      for(const n2 of nodes) {
        if(n1 === n2) continue;
        const angle = n1.profile.generatrix.angle_to(n2.profile.generatrix, n1.profile[n1.point]);
        if(!rack1 && !rack2) {
          if(angle < 20 || angle > 340) {
            rack1 = n1;
            rack2 = n2;
          }
        }
        else if((angle > 70 && angle < 110) || (angle > 250 && angle < 290)) {
          if(rack1 !== n1 && rack2 !== n1) {
            impost = n1;
          }
          else if(rack1 !== n2 && rack2 !== n2) {
            impost = n2;
          }
        }
      }
    }
    if(!impost || !rack1 || !rack2) {
      return;
    }

    // чистим лучи импоста и рамы
    rack1.profile.rays[rack1.point].clear(true);
    impost.profile.rays[impost.point].clear(true);

    // двигаем конец рамы
    rack1.profile[rack1.point] = rack2.profile[rack2.point === 'b' ? 'e' : 'b'];

    // удаляем rack2
    let base;
    let cnn = rack2.profile.cnn_point('b');
    if(rack2.point === 'e') {
      base = cnn.cnn;
    }
    cnn && cnn.profile && cnn.profile_point && cnn.profile.rays[cnn.profile_point].clear(true);
    cnn = rack2.profile.cnn_point('e');
    if(rack2.point === 'b') {
      base = cnn.cnn;
    }
    cnn && cnn.profile && cnn.profile_point && cnn.profile.rays[cnn.profile_point].clear(true);
    const imposts = rack2.profile.joined_imposts();
    for(const ji of imposts.inner.concat(imposts.outer)) {
      cnn = ji.cnn_point('b');
      if(cnn.profile === rack2.profile) {
        cnn.clear(true);
      }
      cnn = ji.cnn_point('e');
      if(cnn.profile === rack2.profile) {
        cnn.clear(true);
      }
    }
    rack2.profile.rays.clear(true);
    rack2.profile.removeChildren();
    rack2.profile.remove();

    cnn = rack1.profile.cnn_point(rack1.point);
    if(base && cnn && cnn.profile) {
      if(!cnn.cnn || cnn.cnn.cnn_type !== base.cnn_type){
        const cnns = $p.cat.cnns.nom_cnn(rack1.profile, cnn.profile, [base.cnn_type]);
        if(cnns.includes(base)) {
          cnn.cnn = base;
        }
        else if(cnns.length) {
          cnn.cnn = cnns[0];
        }
        cnn = cnn.profile.cnn_point(cnn.profile_point);
        if(cnn.profile === rack1.profile) {
          cnn.cnn = null;
        }
      }
    }

    this.deselect();
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

    if (this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem) {
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

Editor.ToolCut = ToolCut;
