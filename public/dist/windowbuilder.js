;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Windowbuilder = factory();
  }
}(this, function() {

"use strict";

class SchemeLayers {

  constructor(cell, set_text, editor) {

    this._cell = cell;
    this._set_text = set_text;

    this.layout = cell.attachLayout({
      pattern: "2E",
      cells: [
        {id: "a", text: "tree", header: false, height: 200},
        {id: "b", text: "Доп. вставки в контур", header: true}
      ],
      offsets: {top: 0, right: 0, bottom: 0, left: 0},
    });

    this.tree = this.layout.cells("a").attachTreeView({
      checkboxes: true,
      multiselect: false
    });

    this.tree.attachEvent("onCheck", (id, state) => {
      const cnstr = Number(id);
      if(cnstr) {
        const contour = editor.project.getItem({cnstr});
        if(contour){
          contour.hidden = !state;
        }
      }
      else {
        editor.project.ox.builder_props = {[id]: state};
        editor.project.register_change(true);
      }
      editor.project.register_update();
    });

    this.tree.attachEvent("onSelect", (id, mode) => {
      if(!mode){
        return;
      }
      const contour = editor.project.getItem({cnstr: Number(id)});
      if(contour){
        if(editor.project.activeLayer != contour){
          contour.activate(true);
        }
        set_text(this.layer_text(contour));
      }
    });

    this.listener = this.listener.bind(this);
    this.layer_activated = this.layer_activated.bind(this);
    this.contour_redrawed = this.contour_redrawed.bind(this);
    this.editor = editor;
    this.eve = editor.eve.on({
      layer_activated: this.layer_activated,
      contour_redrawed: this.contour_redrawed,
      rows: this.listener,
    });

    this.layout.cells("a").setMinHeight(180);
    this.layout.cells("b").setMinHeight(180);
    this.layout.cells("a").setHeight(200);

  }

  layer_activated(contour) {
    const {tree} = this;
    if(contour && contour.cnstr && tree && tree.getSelectedId && contour.cnstr != tree.getSelectedId()){
      const layers = [];
      const {project} = this.editor;
      for(const elm of project.getSelectedItems()) {
        elm.layer instanceof $p.EditorInvisible.Contour && layers.indexOf(elm.layer) === -1 && layers.push(elm.layer);
      }
      if(layers.length > 1) {
        const parents = [];
        for(const elm of layers) {
          let parent = elm.parent;
          while (parent && parent.parent) {
            parent = parent.parent;
          }
          if(!parent) {
            parent = elm;
          }
          contour = parent;
          break;
        }
      }

      if(tree.items[contour.cnstr]){
        tree.selectItem(contour.cnstr);
        this._set_text(this.layer_text(contour));
      }
    }
  }

  contour_redrawed(contour, bounds) {
    const {tree} = this;
    if(tree && tree.setItemText){
      const text = this.layer_text(contour, bounds);
      tree.setItemText(contour.cnstr, text);
      if(contour.project.activeLayer == contour){
        this._set_text(text);
      }
    }
  }

  layer_text(layer, bounds){
    if(!bounds){
      bounds = layer.bounds;
    }
    return (layer.parent ? "Створка №" : "Рама №") + layer.cnstr +
      (bounds ? " " + bounds.width.toFixed() + "х" + bounds.height.toFixed() : "");
  }

  load_layer(layer) {
    this.tree.addItem(layer.cnstr, this.layer_text(layer), layer.parent ? layer.parent.cnstr : 0);
    this.tree.checkItem(layer.cnstr);
    layer.contours.forEach((l) => this.load_layer(l));
  }

  listener(obj, fields) {
    const {tree, editor: {project}} = this;

    if(tree && tree.clearAll && fields.constructions) {

      tree.clearAll();
      project.contours.forEach((layer) => {
        this.load_layer(layer);
        tree.openItem(layer.cnstr);
      });

      const props = {
        auto_lines: 'Авторазмерные линии',
        custom_lines: 'Доп. размерные линии',
        cnns: 'Соединители',
        visualization: 'Визуализация доп. элементов',
        txts: 'Комментарии',
      };
      for (const prop in props) {
        tree.addItem(prop, props[prop], 0);
      }

      const {builder_props} = project.ox;
      for (const prop in builder_props) {
        props[prop] && builder_props[prop] && tree.checkItem(prop);
      }
    }
  }

  drop_layer() {
    const {tree, editor: {project}} = this;
    let cnstr = tree.getSelectedId(), l;
    if(cnstr){
      l = project.getItem({cnstr: Number(cnstr)});
    }
    else if(l = project.activeLayer){
      cnstr = l.cnstr;
    }
    if(cnstr && l){
      tree.deleteItem(cnstr);
      cnstr = l.parent ? l.parent.cnstr : 0;
      l.remove();
      setTimeout(() => {
        project.zoom_fit();
        if(cnstr){
          tree.selectItem(cnstr);
        }
      }, 100);
    }
  }

  attach() {

  }

  unload() {
    this.eve.off('layer_activated', this.layer_activated);
    this.eve.off('contour_redrawed', this.contour_redrawed);
    this.eve.off('rows', this.listener);
    this.layout.cells("a").detachObject(true);
    this._cell.detachObject(true);
    for(const fld in this){
      delete this[fld];
    }
  }

}

class StvProps {

  constructor(cell, editor) {
    this.layout = cell;
    this.editor = editor;
    this.attach = this.attach.bind(this);
    this.reload = this.reload.bind(this);
    this.on_refresh_prm_links = this.on_refresh_prm_links.bind(this);

    this.eve = editor.eve.on({
      layer_activated: this.attach,
      furn_changed: this.reload,
      refresh_prm_links: this.on_refresh_prm_links,
    });
  }

  attach(obj) {

    if(!this.layout || !this.layout.attachHeadFields){
      return;
    }

    if(!obj || !obj.cnstr || (this._grid && this._grid._obj === obj)){
      return;
    }

    obj.refresh_prm_links();

    const attr = {
      obj: obj,
      oxml: {
        "Фурнитура": ["furn", "direction", "h_ruch"],
        "Параметры": []
      },
      ts: "params",
      ts_title: "Параметры",
      selection: {
        cnstr: obj.cnstr || -9999,
        inset: $p.utils.blank.guid,
        hide: {not: true}
      }
    };

    if(!this._grid){
      this._grid = this.layout.attachHeadFields(attr);
      this._grid.attachEvent("onPropertyChanged", (pname, new_value) => {
        pname = this._grid && this._grid.getSelectedRowId();
        setTimeout(() => this.on_prm_change(pname, new_value, true));
      });
    }else{
      this._grid.attach(attr);
    }

    if(!obj.parent && this._grid.getAllRowIds){
      const rids = this._grid.getAllRowIds();
      if(rids){
        this._grid.closeItem(rids.split(",")[0]);
      }
    }

    this.on_prm_change('0|0');
    this._grid.setSizes();

  }

  on_refresh_prm_links(contour) {
    const {_grid} = this;
    if(_grid && contour === _grid._obj){
      this.reload();
    }
  }

  on_prm_change(field, value, realy_changed) {

    const pnames = field && field.split('|');
    const {_grid, editor} = this;

    if(!field || !_grid || pnames.length < 2){
      return;
    }

    const {_obj} = _grid;
    let need_set_sizes;

    _obj.params.find_rows({
      cnstr: _obj.cnstr || -9999,
      inset: $p.utils.blank.guid,
      hide: {not: true}
    }, (prow) => {
      const {param} = prow;
      if(param == value){
        return;
      }
      const links = param.params_links({grid: _grid, obj: prow});
      const hide = links.some((link) => link.hide);
      const row = _grid.getRowById('params|'+param);

      if (row){
        if (hide && (row.style.display != "none")){
          row.style.display="none";
          need_set_sizes = realy_changed;
        }
        if (!hide && (row.style.display == "none")){
          row.style.display="";
          need_set_sizes = realy_changed;
        }
      }

      if(links.length && param.linked_values(links, prow)){
        editor.project.register_change();
        _grid._obj._manager.emit_async('update', prow, {value: prow._obj.value});
      }

    });

    if(need_set_sizes){
      _grid.setSizes();
    }
  }

  reload() {
    if(this._grid){
      this._grid.reload();
      this.on_prm_change('0|0', null, true);
    }
  }

  unload() {
    this.eve.off('layer_activated', this.attach);
    this.eve.off('furn_changed', this.reload);
    this.eve.off('refresh_prm_links', this.on_refresh_prm_links);
    this.layout.detachObject(true);
    for(const fld in this){
      delete this[fld];
    }
  }

}

class SchemeProps {

  constructor(cell, editor) {

    this.layout = cell;
    this.editor = editor;

    this.reflect_changes = this.reflect_changes.bind(this);
    this.contour_redrawed = this.contour_redrawed.bind(this);
    this.scheme_snapshot = this.scheme_snapshot.bind(this);

    this.eve = editor.eve.on({
      contour_redrawed: this.contour_redrawed,
      scheme_snapshot: this.scheme_snapshot,
    });
  }

  contour_redrawed() {
    const {_obj, _reflect_id} = this;
    if(_obj){
      _reflect_id && clearTimeout(_reflect_id);
      this._reflect_id = setTimeout(this.reflect_changes, 100);
    }
  }

  scheme_snapshot(scheme, attr) {
    const {_obj, editor: {project}} = this;
    const {_calc_order_row} = scheme._attr;
    if(_obj && scheme === project && !attr.clipboard && _calc_order_row){
      ["price_internal","amount_internal","price","amount"].forEach((fld) => {
        _obj[fld] = _calc_order_row[fld];
      });
    }
  }

  reflect_changes() {
    this._reflect_id = 0;
    const {_obj, editor: {project}} = this;
    if(project && _obj) {
      _obj.len = project.bounds.width.round();
      _obj.height = project.bounds.height.round();
      _obj.s = project.area;
    }
  }

  attach(_obj) {

    if(!this.layout || !this.layout.attachHeadFields){
      return;
    }

    this._obj = _obj;

    $p.cat.clrs.selection_exclude_service($p.dp.buyers_order.metadata("clr"), _obj);

    this._grid && this._grid.destructor && this._grid.destructor();

    const is_dialer = !$p.current_user.role_available('СогласованиеРасчетовЗаказов') && !$p.current_user.role_available('РедактированиеСкидок');
    const oxml = {
      'Свойства': ['sys', 'clr',
        {id: 'len', path: 'o.len', synonym: 'Ширина, мм', type: 'ro'},
        {id: 'height', path: 'o.height', synonym: 'Высота, мм', type: 'ro'},
        {id: 's', path: 'o.s', synonym: 'Площадь, м²', type: 'ro'}
      ]
    };

    if($p.wsql.get_user_param('hide_price_dealer')) {
      oxml['Строка заказа'] = [
        'quantity',
        {id: 'price', path: 'o.price', synonym: 'Цена', type: 'ro'},
        {id: 'discount_percent', path: 'o.discount_percent', synonym: 'Скидка %', type: is_dialer ? 'ro' : 'calck'},
        {id: 'amount', path: 'o.amount', synonym: 'Сумма', type: 'ro'},
        'note'
      ];
    }
    else {
      oxml['Строка заказа'] = [
        'quantity',
        {id: 'price_internal', path: 'o.price_internal', synonym: 'Цена дилера', type: 'ro'},
        {id: 'discount_percent_internal', path: 'o.discount_percent_internal', synonym: 'Скидка дил %', type: 'calck'},
        {id: 'amount_internal', path: 'o.amount_internal', synonym: 'Сумма дилера', type: 'ro'},
        {id: 'price', path: 'o.price', synonym: 'Цена пост', type: 'ro'},
        {id: 'discount_percent', path: 'o.discount_percent', synonym: 'Скидка пост %', type: is_dialer ? 'ro' : 'calck'},
        {id: 'amount', path: 'o.amount', synonym: 'Сумма пост', type: 'ro'},
        'note'
      ];
    }

    this._grid = this.layout.attachHeadFields({
      obj: _obj,
      oxml: oxml,
      ts: "extra_fields",
      ts_title: "Свойства",
      selection: {
        cnstr: 0,
        inset: $p.utils.blank.guid,
        hide: {not: true}
      }
    });

  }

  reload() {
    this._grid && this._grid.reload();
  }

  unload() {
    this.eve.off('contour_redrawed', this.contour_redrawed);
    this.eve.off('scheme_snapshot', this.scheme_snapshot);
    this.layout.detachObject(true);
    this._obj = null;
  }

}

class EditorAccordion {

  constructor(_editor, cell_acc) {

    this._cell = cell_acc;
    const tabs = [
      {
        id: 'lay',
        text: '<i class="fa fa-sitemap fa-fw"></i>',
        title: 'Слои изделия',
      },
      {
        id: 'elm',
        text: '<i class="fa fa-puzzle-piece fa-fw"></i>',
        title: 'Свойства элемента',
        active:  true,
      },
      {
        id: "stv",
        text: '<i class="fa fa-object-ungroup fa-fw"></i>',
        title: 'Свойства створки',
      },
      {
        id: "prod",
        text: '<i class="fa fa-picture-o fa-fw"></i>',
        title: 'Свойства изделия',
      },
    ];
    this.tabbar = cell_acc.attachTabbar({
      arrows_mode: "auto",
      tabs: tabs
    });

    const titles = this.tabbar.tabsArea.children[1].firstChild.children;
    tabs.forEach((tab, index) => {
      titles[index+1].title = tab.title;
    });

    this.elm = this.tabbar.cells('elm');
    this.elm._toolbar = this.elm.attachToolbar();
    this.elm._otoolbar = new $p.iface.OTooolBar({
      wrapper: this.elm.cell,
      width: '100%',
      height: '28px',
      top: '6px',
      left: '4px',
      class_name: "",
      name: 'aling_bottom',
      buttons: [
        {name: 'left', css: 'tb_align_left', tooltip: $p.msg.align_node_left, float: 'left'},
        {name: 'bottom', css: 'tb_align_bottom', tooltip: $p.msg.align_node_bottom, float: 'left'},
        {name: 'top', css: 'tb_align_top', tooltip: $p.msg.align_node_top, float: 'left'},
        {name: 'right', css: 'tb_align_right', tooltip: $p.msg.align_node_right, float: 'left'},
        {name: 'all', text: '<i class="fa fa-arrows-alt fa-fw"></i>', tooltip: $p.msg.align_all, float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'additional_inserts', text: '<i class="fa fa-tag fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_elm, float: 'left'},
        {name: 'glass_spec', text: '<i class="fa fa-list-ul fa-fw"></i>', tooltip: $p.msg.glass_spec + ' ' + $p.msg.to_elm, float: 'left'},
        {name: 'sep_1', text: '', float: 'left'},
        {name: 'arc', css: 'tb_cursor-arc-r', tooltip: $p.msg.bld_arc, float: 'left'},

        {name: 'delete', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: $p.msg.del_elm, float: 'right', paddingRight: '18px'},
        {name: 'spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию элемента', float: 'right'},
      ],
      image_path: "/imgs/",
      onclick: (name) => {
        switch (name) {
          case 'arc':
            _editor.profile_radius();
            break;

          case 'additional_inserts':
            _editor.additional_inserts('elm');
            break;

          case 'glass_spec':
            _editor.glass_inserts();
            break;

          case 'delete':
            _editor.project.selectedItems.forEach((path) => {
              const {parent} = path;
              if(parent instanceof $p.EditorInvisible.ProfileItem){
                parent.removeChildren();
                parent.remove();
              }
            });
            break;

        case 'spec':
          _editor.elm_spec();
          break;

        default:
          _editor.profile_align(name);
        }
      }
    });

    this._layers = this.tabbar.cells('lay');
    this._layers._toolbar = this._layers.attachToolbar();
    this._layers._otoolbar = new $p.iface.OTooolBar({
      wrapper: this._layers.cell,
      width: '100%',
      height: '28px',
      top: '6px',
      left: '4px',
      class_name: "",
      name: 'right',
      image_path: '/imgs/',
      buttons: [
        {name: 'new_layer', text: '<i class="fa fa-file-o fa-fw"></i>', tooltip: 'Добавить рамный контур', float: 'left'},
        {name: 'new_stv', text: '<i class="fa fa-file-code-o fa-fw"></i>', tooltip: $p.msg.bld_new_stv, float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'inserts_to_product', text: '<i class="fa fa-tags fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_product, float: 'left'},

        {name: 'drop_layer', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить слой', float: 'right', paddingRight: '20px'},

      ], onclick: (name) => {

        switch(name) {

          case 'new_stv':
            const fillings = _editor.project.getItems({class: $p.EditorInvisible.Filling, selected: true});
            if(fillings.length){
              fillings[0].create_leaf();
            }
            else{
              $p.msg.show_msg({
                type: "alert-warning",
                text: $p.msg.bld_new_stv_no_filling,
                title: $p.msg.bld_new_stv
              });
            }
            break;

          case 'drop_layer':
            this.tree_layers.drop_layer();
            break;

          case 'new_layer':

            new $p.EditorInvisible.Contour({parent: undefined});

            _editor.eve.emit_async('rows', _editor.project.ox, {constructions: true});
            break;

          case 'inserts_to_product':
            _editor.additional_inserts();
            break;

          case 'inserts_to_contour':
            _editor.additional_inserts('contour');
            break;

          default:
            $p.msg.show_msg(name);
            break;
        }

        return false;
      }
    });

    this.tree_layers = new SchemeLayers(this._layers, (text) => {
      this._stv._toolbar.setItemText("info", text);
      _editor.additional_inserts('contour', this.tree_layers.layout.cells('b'));
    }, _editor);

    this._stv = this.tabbar.cells('stv');
    this._stv._toolbar = this._stv.attachToolbar({
      items:[
        {id: "info", type: "text", text: ""},
      ],
    });
    this._stv._otoolbar = new $p.iface.OTooolBar({
      wrapper: this._stv.cell,
      width: '100%',
      height: '28px',
      top: '6px',
      left: '4px',
      class_name: "",
      name: 'bottom',
      image_path: '/imgs/',
      buttons: [
        {name: 'refill', text: '<i class="fa fa-retweet fa-fw"></i>', tooltip: 'Обновить параметры', float: 'right', paddingRight: '20px'},
        {name: 'spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию фурнитуры', float: 'right'},
      ], onclick: (name) => {

        switch(name) {

          case 'refill':
            const {_obj} = this.stv._grid;
            _obj.furn.refill_prm(_obj);
            this.stv.reload();
            break;

        case 'spec':
          _editor.layer_spec();
          break;

          default:
            $p.msg.show_msg(name);
            break;
        }

        return false;
      }
    });
    this.stv = new StvProps(this._stv, _editor);

    this._prod = this.tabbar.cells('prod');
    this._prod._toolbar = this._prod.attachToolbar();
    this._prod._otoolbar = new $p.iface.OTooolBar({
      wrapper: this._prod.cell,
      width: '100%',
      height: '28px',
      top: '6px',
      left: '4px',
      class_name: "",
      name: 'bottom',
      image_path: '/imgs/',
      buttons: [
        {name: 'inserts_to_product', text: '<i class="fa fa-tags fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_product, float: 'left'},
        {name: 'refill', text: '<i class="fa fa-retweet fa-fw"></i>', tooltip: 'Обновить параметры', float: 'right', paddingRight: '20px'}

      ], onclick: (name) => {

        switch(name) {

          case 'refill':
            _editor.project._dp.sys.refill_prm(_editor.project.ox);
            this.props.reload();
            break;

          case 'inserts_to_product':
            _editor.additional_inserts();
            break;

          default:
            $p.msg.show_msg(name);
            break;
        }

        return false;
      }
    });
    this.props = new SchemeProps(this._prod, _editor);


  }

  attach(obj) {
    this.tree_layers.attach();
    this.props.attach(obj);
  }

  unload() {
    if(this.elm) {
      this.elm._otoolbar.unload();
      this._layers._otoolbar.unload();
      this._prod._otoolbar.unload();
      this.tree_layers.unload();
      this.props.unload();
      this.stv.unload();
      this._cell.detachObject(true);
    }
    for(const fld in this){
      delete this[fld];
    }
  }

}




class AdditionalInserts {

  constructor(cnstr, project, cell) {
    this.create_wnd(cnstr, project, cell);
  }

  create_wnd(cnstr, project, cell) {
    const {utils, cat, msg, iface} = $p;
    this._fields = utils._clone(cat.characteristics.metadata('inserts').fields);
    this._caption = msg.additional_inserts;

    if(!cnstr) {
      cnstr = 0;
      this._caption += ' в изделие';
      this._fields.inset.choice_params[0].path = ['Изделие'];
    }
    else if(cnstr == 'elm'){
      cnstr = project.selected_elm;
      if(cnstr) {
        project.ox.add_inset_params(cnstr.inset, -cnstr.elm, utils.blank.guid);
        this._caption += ' элем. №' + cnstr.elm;
        cnstr = -cnstr.elm;
        this._fields.inset.choice_params[0].path = ['Элемент', 'Жалюзи'];
      }
      else {
        return;
      }
    }
    else if(cnstr == 'contour') {
      const {activeLayer} = project;
      cnstr = activeLayer.cnstr;
      this._caption += ` в ${activeLayer.layer ? 'створку' : 'раму'} №${cnstr}`;
      this._fields.inset.choice_params[0].path = ['МоскитнаяСетка', 'Подоконник', 'Откос', 'Контур'];
    }
    this.cnstr = cnstr;

    const options = {
      name: 'additional_inserts',
      wnd: {
        caption: this._caption,
        allow_close: true,
        width: 460,
        height: 420,
        modal: true
      }
    };

    if(cell){
      if(!cell.elmnts){
        cell.elmnts = {grids: {}};
      }
      const {grids} = cell.elmnts;
      if(grids.inserts && grids.inserts._obj && grids.inserts._obj == project.ox && grids.inserts.selection.cnstr == cnstr){
        return;
      }
      delete grids.inserts;
      delete grids.params;
      cell.detachObject(true);
    }

    this.wnd = cell || iface.dat_blank(null, options.wnd);
    const {elmnts} = this.wnd;

    elmnts.layout = this.wnd.attachLayout({
      pattern: '2E',
      cells: [{
        id: 'a',
        text: 'Вставки',
        header: false,
        height: 160
      }, {
        id: 'b',
        text: 'Параметры',
        header: false
      }],
      offsets: {top: 0, right: 0, bottom: 0, left: 0}
    });
    elmnts.layout.cells('a').setMinHeight(140);
    elmnts.layout.cells('a').setHeight(160);

    elmnts.grids.inserts = elmnts.layout.cells('a').attachTabular({
      obj: project.ox,
      ts: 'inserts',
      selection: {cnstr: cnstr},
      toolbar_struct: $p.injected_data['toolbar_add_del_compact.xml'],
      metadata: this._fields,
      ts_captions: {
        fields: ['inset', 'clr'],
        headers: 'Вставка,Цвет',
        widths: '*,*',
        min_widths: '100,100',
        aligns: '',
        sortings: 'na,na',
        types: 'ref,ref'
      }
    });

    elmnts.grids.params = elmnts.layout.cells('b').attachHeadFields({
      obj: project.ox,
      ts: 'params',
      selection: this.get_selection(),
      oxml: {
        'Параметры': []
      },
      ts_title: 'Параметры'
    });

    if(cell) {
      elmnts.layout.cells('a').getAttachedToolbar().addText(utils.generate_guid(), 3, options.wnd.caption);
    }

    this.refill_prms = this.refill_prms.bind(this);
    elmnts.grids.inserts.attachEvent('onRowSelect', this.refill_prms);
    elmnts.grids.inserts.attachEvent('onEditCell', (stage, rId, cInd) => {
      !cInd && setTimeout(this.refill_prms);
      project.register_change();
    });
  }

  get_selection() {
    const {inserts} = this.wnd.elmnts.grids;
    const {cnstr} = this;
    if(inserts){
      const row = inserts.get_cell_field();
      if(row && !row.obj.inset.empty()){
        return {
          cnstr,
          inset: row.obj.inset,
          hide: {not: true},
        };
      }
    }
    return {cnstr, inset: $p.utils.generate_guid()};
  }

  refill_prms(){
    const {inserts, params} = this.wnd.elmnts.grids;
    if(params && inserts){
      params.selection = this.get_selection();
      const row = inserts.get_cell_field();
      if(row && !row.obj.inset.empty()){
        const {inset, _owner} = row.obj;
        _owner._owner.add_inset_params(inset, params.selection.cnstr);
        $p.cat.clrs.selection_exclude_service(this._fields.clr, inset);
      }
    }
  }

}


function Clipbrd(_editor) {

  var fakecb = {
    clipboardData: {
      types: ['text/plain'],
      json: '{a: 0}',
      getData: function () {
        return this.json;
      }
    }
  };

  function onpaste(e) {
    var _scheme = _editor.project;

    if(!e) {
      e = fakecb;
    }

    if(!_scheme.ox.empty()) {

      if(e.clipboardData.types.indexOf('text/plain') == -1) {
        return;
      }

      try {
        var data = JSON.parse(e.clipboardData.getData('text/plain'));
        e.preventDefault();
      } catch (e) {}

    }
  }

  function oncopy(e) {

    if(e.target && ['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) != -1) {
      return;
    }

    var _scheme = _editor.project;
    if(!_scheme.ox.empty()) {

      var sitems = [];
      _scheme.selectedItems.forEach(function (el) {
        if(el.parent instanceof $p.EditorInvisible.Profile) {
          el = el.parent;
        }
        if(el instanceof $p.EditorInvisible.BuilderElement && sitems.indexOf(el) == -1) {
          sitems.push(el);
        }
      });

      var res = {
        sys: {
          ref: _scheme._dp.sys.ref,
          presentation: _scheme._dp.sys.presentation
        },

        clr: {
          ref: _scheme.clr.ref,
          presentation: _scheme.clr.presentation
        },

        calc_order: {
          ref: _scheme.ox.calc_order.ref,
          presentation: _scheme.ox.calc_order.presentation
        }
      };
      if(sitems.length) {
        res.product = {
          ref: _scheme.ox.ref,
          presentation: _scheme.ox.presentation
        };
        res.items = [];
        sitems.forEach(function (el) {
          res.items.push({
            elm: el.elm,
            elm_type: el._row.elm_type.name,
            inset: {
              ref: el.inset.ref,
              presentation: el.inset.presentation
            },
            clr: {
              ref: el.clr.ref,
              presentation: el.clr.presentation
            },
            path_data: el.path.pathData,
            x1: el.x1,
            x2: el.x2,
            y1: el.y1,
            y2: el.y2
          });
        });

      }
      else {
        _editor.project.save_coordinates({
          snapshot: true,
          clipboard: true,
          callback: function (scheme) {
            res.product = {}._mixin(scheme.ox._obj, [], ['extra_fields', 'glasses', 'specification', 'predefined_name']);
          }
        });
      }
      fakecb.clipboardData.json = JSON.stringify(res, null, '\t');

      e.clipboardData.setData('text/plain', fakecb.clipboardData.json);
      e.preventDefault();
    }
  }

  this.copy = function () {
    document.execCommand('copy');
  };

  this.paste = function () {
    onpaste();
  };

  _editor.eve.on('scheme_snapshot', function (scheme, attr) {
    if(attr.clipboard) {
      attr.callback(scheme);
    }
  });

  document.addEventListener('copy', oncopy);

  document.addEventListener('paste', onpaste);
}



class Editor extends $p.EditorInvisible {

  constructor(pwnd, handlers){

    super();

    const _editor = window.paper = this;

    this.activate();

    this.__define('_pwnd', {
      get() {
        return pwnd;
      }
    });

    this._layout = pwnd.attachLayout({
      pattern: '2U',
      cells: [{
        id: 'a',
        text: 'Изделие',
        header: false
      }, {
        id: 'b',
        text: 'Инструменты',
        collapsed_text: 'Инструменты',
        width: (pwnd.getWidth ? pwnd.getWidth() : pwnd.cell.offsetWidth) > 1200 ? 440 : 260
      }],
      offsets: {top: 28, right: 0, bottom: 0, left: 0}
    });

    this._wrapper = document.createElement('div');

    this._layout.cells("a").attachObject(_editor._wrapper);
    this._dxw.attachViewportTo(_editor._wrapper);

    this._wrapper.oncontextmenu = (event) => $p.iface.cancel_bubble(event, true);

    this._drawSelectionBounds = 0;


    this._keybrd = new Keybrd(this);

    this._undo = new UndoRedo(this);

    this._acc = new EditorAccordion(_editor, _editor._layout.cells("b"));

    this.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '14px', left: '8px', name: 'left', height: '320px',
      image_path: '/imgs/',
      buttons: [
        {name: 'select_node', css: 'tb_icon-arrow-white', title: $p.injected_data['tip_select_node.html']},
        {name: 'pan', css: 'tb_icon-hand', tooltip: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
        {name: 'zoom_fit', css: 'tb_cursor-zoom', tooltip: 'Вписать в окно'},
        {name: 'pen', css: 'tb_cursor-pen-freehand', tooltip: 'Добавить профиль'},
        {name: 'lay_impost', css: 'tb_cursor-lay-impost', tooltip: 'Вставить раскладку или импосты'},
        {name: 'arc', css: 'tb_cursor-arc-r', tooltip: 'Арка {Crtl}, {Alt}, {Пробел}'},
        {name: 'cut', css: 'tb_cursor-cut', tooltip: 'Тип соединения'},
        {name: 'fx', text: '<i class="fa fa-magic fa-fw"></i>', tooltip: 'Действия', sub:
            {
              width: '120px',
              height:'28px',
              align: 'hor',
              buttons: [
                {name: 'm1', float: 'left', text: '<small><i class="fa fa-magnet"></i><sub>0</sub></small>', tooltip: 'Импост по 0-штапику'},
                {name: 'm2', float: 'left', text: '<small><i class="fa fa-magnet"></i><sub>Т</sub></small>', tooltip: 'T в угол'},
                {name: 'm3', float: 'left', text: '<small><i class="fa fa-arrows-v"></i><sub>би</sub></small>', tooltip: 'Уравнять импост в балконе'},
                {name: 'm4', float: 'left', text: '<small><i class="fa fa-object-group"></i></small>', tooltip: 'Выделить группу'},
                ],
            }},
        {name: 'ruler', css: 'tb_ruler_ui', tooltip: 'Позиционирование и сдвиг'},
        {name: 'grid', css: 'tb_grid', tooltip: 'Таблица координат'},
        {name: 'text', css: 'tb_text', tooltip: 'Произвольный текст'},
      ],
      onclick: (name) => _editor.select_tool(name),
      on_popup: (popup, bdiv) => {
        popup.show(dhx4.absLeft(bdiv), 0, bdiv.offsetWidth, _editor._wrapper.offsetHeight);
        popup.p.style.top = (dhx4.absTop(bdiv) - 20) + 'px';
        popup.p.querySelector('.dhx_popup_arrow').style.top = '20px';
      }
    });

    this.tb_top = new $p.iface.OTooolBar({wrapper: _editor._layout.base, width: '100%', height: '28px', top: '0px', left: '0px', name: 'top',
      image_path: '/imgs/',
      buttons: [

        {name: 'save_close', text: '&nbsp;<i class="fa fa-floppy-o fa-fw"></i>', tooltip: 'Рассчитать, записать и закрыть', float: 'left', width: '34px'},
        {name: 'calck', text: '<i class="fa fa-calculator fa-fw"></i>', tooltip: 'Рассчитать и записать данные', float: 'left'},

        {name: 'stamp',  css: 'tb_stamp', tooltip: 'Загрузить из типового блока или заказа', float: 'left'},

        {name: 'copy', text: '<i class="fa fa-clone fa-fw"></i>', tooltip: 'Скопировать выделенное', float: 'left'},
        {name: 'paste', text: '<i class="fa fa-clipboard fa-fw"></i>', tooltip: 'Вставить', float: 'left'},
        {name: 'paste_prop', text: '<i class="fa fa-paint-brush fa-fw"></i>', tooltip: 'Применить скопированные свойства', float: 'left'},

        {name: 'back', text: '<i class="fa fa-undo fa-fw"></i>', tooltip: 'Шаг назад', float: 'left'},
        {name: 'rewind', text: '<i class="fa fa-repeat fa-fw"></i>', tooltip: 'Шаг вперед', float: 'left'},

        {name: 'open_spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию изделия', float: 'left'},
        {name: 'dxf', text: 'DXF', tooltip: 'Экспорт в DXF', float: 'left', width: '30px'},

        {name: 'close', text: '<i class="fa fa-times fa-fw"></i>', tooltip: 'Закрыть без сохранения', float: 'right'}


      ], onclick: function (name) {
        switch (name) {

        case 'save_close':
          if(_editor.project) {
            _editor.project.save_coordinates({save: true, close: true});
          }
          break;

        case 'close':
          _editor.close();
          break;

        case 'calck':
          if(_editor.project) {
            _editor.project.save_coordinates({save: true});
          }
          break;

        case 'stamp':
          _editor.load_stamp();
          break;

        case 'new_stv':
          var fillings = _editor.project.getItems({class: $p.EditorInvisible.Filling, selected: true});
          if(fillings.length) {
            fillings[0].create_leaf();
          }
          break;

        case 'back':
          _editor._undo.back();
          break;

        case 'rewind':
          _editor._undo.rewind();
          break;

        case 'copy':
          break;

        case 'paste':
          break;

        case 'paste_prop':
          $p.msg.show_msg(name);
          break;

        case 'open_spec':
          _editor.project.ox.form_obj();
          break;

        case 'dxf':
          $p.md.emit('dxf', _editor.project);
          break;

        case 'square':
          $p.msg.show_msg(name);
          break;

        case 'triangle1':
          $p.msg.show_msg(name);
          break;

        case 'triangle2':
          $p.msg.show_msg(name);
          break;

        case 'triangle3':
          $p.msg.show_msg(name);
          break;

        default:
          $p.msg.show_msg(name);
          break;
        }
      }
    });

    this.tb_top.buttons.paste.classList.add('disabledbutton');
    this.tb_top.buttons.paste_prop.classList.add('disabledbutton');

    this._layout.base.style.backgroundColor = '#f5f5f5';
    this.tb_top.cell.style.background = '#fff';
    this.tb_top.cell.style.boxShadow = 'none';

    this.on_keydown = this.on_keydown.bind(this);
    document.body.addEventListener('keydown', this.on_keydown, false);

    this.eve.on('characteristic_saved', (scheme, attr) => {
      if(attr.close) {
        this.close();
      }
      else {
        this.set_text();
      }
    });

    this.eve.on('coordinates_calculated', this.set_text.bind(this));

    this.on_del_row = this.on_del_row.bind(this);
    $p.cat.characteristics.on("del_row", this.on_del_row);

    this.on_alert = this.on_alert.bind(this);
    $p.on('alert', this.on_alert);


    new ZoomFit();

    new ToolSelectNode();

    new ToolPan();

    new ToolArc();

    new ToolCut();

    new ToolM2();

    new ToolPen();

    new ToolLayImpost();

    new ToolText();

    new ToolRuler();

    new ToolCoordinates();

    this.tools[1].activate();


    this.create_scheme();

    if(handlers){
      this.handlers = handlers;
      handlers.props.match.params.ref && this.open(handlers.props.match.params.ref);
    }

  }

  set_text() {
    const {handlers, project} = this;
    const {props, handleIfaceState} = handlers;
    if(project._calc_order_row){
      const title = project.ox.prod_name(true) + (project.ox._modified ? " *" : "");
      props.title != title && handleIfaceState({
        component: '',
        name: 'title',
        value: title,
      });

      if(project.getItems({class: $p.EditorInvisible.Profile}).some((p) => {
        return (p.angle_hor % 90) > 0.02;
      })){
        this._ortpos.style.display = '';
      }
      else {
        this._ortpos.style.display = 'none';
      }

      const {ОшибкаКритическая, ОшибкаИнфо} = $p.enm.elm_types;
      let has_errors;
      project.ox.specification.forEach(({nom}) => {
        if([ОшибкаКритическая, ОшибкаИнфо].includes(nom.elm_type)) {
          has_errors = true;
          return false;
        }
      });
      this._errpos.style.display = has_errors ? '' : 'none';
    }
  }

  show_ortpos(hide) {
    for (const elm of this.project.getItems({class: $p.EditorInvisible.Profile})) {
      if((elm.angle_hor % 90) > 0.02) {
        if(hide) {
          elm.path.fillColor = $p.EditorInvisible.BuilderElement.clr_by_clr.call(elm, elm._row.clr, false);
        }
        else {
          elm.path.fillColor = '#fcc';
        }
      }
    }
    if(!hide) {
      setTimeout(() => this.show_ortpos(true), 1300);
    }
  }

  show_errpos() {
    const wnd = $p.iface.dat_blank(this._dxw, {
      caption: 'Ошибки',
      height: 300,
      width: 420,
      allow_close: true,
    });
    const grid = wnd.attachGrid({
      columns: [{
        label: 'Элемент',
        width: 80,
        type: 'ro',
        sort: 'int',
        align: 'right'
      }, {
        label: 'Ошибка',
        width: 250,
        type: 'ro',
        sort: 'str',
        align: 'left'
      }]
    });

    grid.setHeader('Элемент,Ошибка');
    grid.setColTypes('ro,ro');
    grid.setColSorting('int,str');
    grid.setInitWidths('80,340');
    grid.setColAlign('right,left');
    grid.enableAutoWidth(true);
    grid.init();

    const {ОшибкаКритическая, ОшибкаИнфо} = $p.enm.elm_types;
    this.project.ox.specification.forEach(({elm, nom}) => {
      if([ОшибкаКритическая, ОшибкаИнфо].includes(nom.elm_type)) {
        grid.addRow(1, [elm, nom.name]);
      }
    });
  }

  get _dxw() {
    return this._layout.dhxWins;
  }

  create_scheme() {

    if(this.project){
      this.project.unload ? this.project.unload() : this.project.remove();
    }

    const _editor = this;
    const _canvas = document.createElement('canvas'); 
    _editor._wrapper.appendChild(_canvas);
    _canvas.style.backgroundColor = "#f9fbfa";

    const _scheme = new $p.EditorInvisible.Scheme(_canvas, _editor);
    const pwnd_resize_finish = () => {
      _editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
    };

    _scheme.magnetism = new Magnetism(_scheme);

    _editor._layout.attachEvent("onResizeFinish", pwnd_resize_finish);
    _editor._layout.attachEvent("onPanelResizeFinish", pwnd_resize_finish);
    _editor._layout.attachEvent("onCollapse", pwnd_resize_finish);
    _editor._layout.attachEvent("onExpand", pwnd_resize_finish);

    if(_editor._pwnd instanceof  dhtmlXWindowsCell){
      _editor._pwnd.attachEvent("onResizeFinish", pwnd_resize_finish);
    }

    pwnd_resize_finish();

    const _mousepos = document.createElement('div');
    _editor._wrapper.appendChild(_mousepos);
    _mousepos.className = 'mousepos';
    _scheme.view.on('mousemove', (event) => {
      const {bounds} = _scheme;
      if(bounds) {
        _mousepos.innerHTML = 'x:' + (event.point.x - bounds.x).toFixed(0) +
          ' y:' + (bounds.height + bounds.y - event.point.y).toFixed(0);
      }
    });

    const _toppos = document.createElement('div');
    _editor._wrapper.appendChild(_toppos);
    _toppos.className = 'toppos';

    this._ortpos = document.createElement('div');
    _toppos.appendChild(this._ortpos);
    this._ortpos.className = 'ortpos';
    this._ortpos.innerHTML = '<i class="fa fa-crosshairs"></i>';
    this._ortpos.setAttribute('title', 'Есть наклонные элементы');
    this._ortpos.style.display = 'none';
    this._ortpos.onclick = () => this.show_ortpos();

    this._errpos = document.createElement('div');
    _toppos.appendChild(this._errpos);
    this._errpos.className = 'errpos';
    this._errpos.innerHTML = '<i class="fa fa-ban"></i>';
    this._errpos.setAttribute('title', 'Есть ошибки');
    this._errpos.style.display = 'none';
    this._errpos.onclick = () => this.show_errpos();

    new function StableZoom(){

      function changeZoom(oldZoom, delta) {
        const factor = 1.05;
        if (delta < 0) {
          return oldZoom * factor;
        }
        if (delta > 0) {
          return oldZoom / factor;
        }
        return oldZoom;
      }

      dhtmlxEvent(_canvas, "mousewheel", (evt) => {

        if (evt.shiftKey || evt.altKey) {
          if(evt.shiftKey && !evt.deltaX){
            _editor.view.center = this.changeCenter(_editor.view.center, evt.deltaY, 0, 1);
          }
          else{
            _editor.view.center = this.changeCenter(_editor.view.center, evt.deltaX, evt.deltaY, 1);
          }
          return evt.preventDefault();
        }
        else if (evt.ctrlKey) {
          const mousePosition = new paper.Point(evt.offsetX, evt.offsetY);
          const viewPosition = _editor.view.viewToProject(mousePosition);
          const _ref1 = this.changeZoom(_editor.view.zoom, evt.deltaY, _editor.view.center, viewPosition);
          _editor.view.zoom = _ref1[0];
          _editor.view.center = _editor.view.center.add(_ref1[1]);
          evt.preventDefault();
          return _editor.view.draw();
        }
      });

      this.changeZoom = function(oldZoom, delta, c, p) {
        const newZoom = changeZoom(oldZoom, delta);
        const beta = oldZoom / newZoom;
        const pc = p.subtract(c);
        return [newZoom, p.subtract(pc.multiply(beta)).subtract(c)];
      };

      this.changeCenter = function(oldCenter, deltaX, deltaY, factor) {
        const offset = new paper.Point(deltaX, -deltaY);
        return oldCenter.add(offset.multiply(factor));
      };
    };

    _editor._acc.attach(_editor.project._dp);
  }

  select_tool(name) {

    switch (name) {
    case 'm1':
      this.project.magnetism.m1();
      break;

    case 'm3':
      this.project.magnetism.m3();
      break;

    case 'm4':
      this.project.magnetism.m4();
      break;

    default:
      this.tools.some((tool) => {
        if(tool.options.name == name){
          tool.activate();
          return true;
        }
      });
    }
  }

  open(ox) {
    ox && this.project.load(ox);
  }

  load_stamp(confirmed){

    if(!confirmed && this.project.ox.coordinates.count()){
      dhtmlx.confirm({
        title: $p.msg.bld_from_blocks_title,
        text: $p.msg.bld_from_blocks,
        cancel: $p.msg.cancel,
        callback: (btn) => btn && this.load_stamp(true)
      });
      return;
    }

    $p.cat.characteristics.form_selection_block(null, {
      on_select: this.project.load_stamp.bind(this.project)
    });
  }

  purge_selection(){
    let selected = this.project.selectedItems;
    const deselect = selected.filter((path) => path.parent instanceof $p.EditorInvisible.ProfileItem && path != path.parent.generatrix);
    while(selected = deselect.pop()){
      selected.selected = false;
    }
  }

  capture_selection_state() {

    const originalContent = [];

    this.project.selectedItems.forEach((item) => {
      if (item instanceof paper.Path && !item.guide){
        originalContent.push({
          id: item.id,
          json: item.exportJSON({asString: false}),
          selectedSegments: []
        });
      }
    });

    return originalContent;
  }

  restore_selection_state(originalContent) {

    originalContent.forEach((orig) => {
      const item = this.project.getItem({id: orig.id});
      if (item){
        const id = item.id;
        item.importJSON(orig.json);
        item._id = id;
      }
    });
  }

  drag_rect(p1, p2) {
    const {view} = this;
    const half = new paper.Point(0.5 / view.zoom, 0.5 / view.zoom);
    const start = p1.add(half);
    const end = p2.add(half);
    const rect = new paper.CompoundPath();

    rect.moveTo(start);
    rect.lineTo(new paper.Point(start.x, end.y));
    rect.lineTo(end);
    rect.moveTo(start);
    rect.lineTo(new paper.Point(end.x, start.y));
    rect.lineTo(end);
    rect.strokeColor = 'black';
    rect.strokeWidth = 1.0 / view.zoom;
    rect.dashOffset = 0.5 / view.zoom;
    rect.dashArray = [1.0 / view.zoom, 1.0 / view.zoom];
    rect.removeOn({
      drag: true,
      up: true
    });
    rect.guide = true;
    return rect;
  }

  glass_inserts(glasses){
    if(!Array.isArray(glasses)){
      glasses = this.project.selected_glasses();
    }
    return new GlassInserts(glasses);
  }

  fragment_spec(elm, name) {
    const {ui: {dialogs}, cat: {characteristics}} = $p;
    if(elm) {
      return dialogs.alert({
        timeout: 0,
        title: `Спецификация ${elm >= 0 ? 'элемента' : 'слоя'} №${Math.abs(elm)} (${name})`,
        Component: characteristics.SpecFragment,
        props: {_obj: this.project.ox, elm},
        initFullScreen: true,
        hide_btn: true,
        noSpace: true,
      });
    }
    dialogs.alert({text: 'Элемент не выбран', title: $p.msg.main_title});
  }

  elm_spec() {
    const {selected_elm: elm} = this.project;
    this.fragment_spec(elm ? elm.elm : 0, elm && elm.inset.toString());
  }

  layer_spec() {
    const {activeLayer} = this.project;
    this.fragment_spec(-activeLayer.cnstr, activeLayer.furn.toString());
  }

  additional_inserts(cnstr, cell){
    new AdditionalInserts(cnstr, this.project, cell);
  }

  profile_radius(){

    const elm = this.project.selected_elm;

    if(elm instanceof $p.EditorInvisible.ProfileItem){

      const options = {
        name: 'profile_radius',
        wnd: {
          caption: $p.msg.bld_arc,
          allow_close: true,
          width: 460,
          height: 180,
          modal: true
        }
      };

      const wnd = $p.iface.dat_blank(null, options.wnd);

      wnd.elmnts.grids.radius = wnd.attachHeadFields({
        obj: elm,
        oxml: {
          " ": ["r", "arc_h", "arc_ccw"]
        }
      });

    }
    else{
      $p.msg.show_msg({
        type: "alert-info",
        text: $p.msg.arc_invalid_elm,
        title: $p.msg.bld_arc
      });
    }
  }

  profile_align(name){

    if(name == "all"){

      if(this.glass_align()) {
        return;
      }

      if(this.lay_impost_align()) {
        return;
      }

      const {project, consts} = this;
      const layer = project.rootLayer();

      layer.profiles.forEach((profile) => {

        const {b, e} = profile;
        const bcnn = profile.cnn_point("b");
        const ecnn = profile.cnn_point("e");

        if(bcnn.profile){
          const d = bcnn.profile.e.getDistance(b);
          if(d > consts.epsilon && d < consts.sticking_l){
            bcnn.profile.e = b;
          }
        }
        if(ecnn.profile){
          const d = ecnn.profile.b.getDistance(e);
          if(d > consts.epsilon && d < consts.sticking_l){
            ecnn.profile.b = e;
          }
        }

        let mid;

        if(profile.orientation == $p.enm.orientations.vert && Math.abs(profile.x1 - profile.x2) > consts.epsilon){

          mid = (b.x + e.x) / 2;

          if(mid < layer.bounds.center.x) {
            mid = Math.min(profile.x1, profile.x2);
            profile.x1 = profile.x2 = mid;
          }
          else {
            mid = Math.max(profile.x1, profile.x2);
            profile.x1 = profile.x2 = mid;
          }

        }
        else if(profile.orientation == $p.enm.orientations.hor && Math.abs(profile.y1 - profile.y2) > consts.epsilon) {

          mid = (b.y + e.y) / 2;

          if(mid < layer.bounds.center.y) {
            mid = Math.max(profile.y1, profile.y2);
            profile.y1 = profile.y2 = mid;
          }
          else {
            mid = Math.min(profile.y1, profile.y2);
            profile.y1 = profile.y2 = mid;
          }
        }
        profile.selected = false;
      });
    }
    else{

      const profiles = project.selected_profiles();
      const contours = [];
      let changed;

      profiles.forEach(function (profile) {

        if(profile.angle_hor % 90 == 0){
          return;
        }

        changed = true;

        var minmax = {min: {}, max: {}};

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
        else if(name == 'delete') {
          profile.removeChildren();
          profile.remove();
        }
        else{
          $p.msg.show_msg({type: "info", text: $p.msg.align_invalid_direction});
        }

      });

      if(changed || profiles.length > 1){
        profiles.forEach(({layer}) => contours.indexOf(layer) == -1 && contours.push(layer));
        contours.forEach(({l_dimensions}) => l_dimensions && l_dimensions.clear());
      }

      if(name != 'delete' && profiles.length > 1){

        if(changed){
          project.register_change(true);
          setTimeout(this.profile_group_align.bind(this, name, profiles), 100);
        }
        else{
          this.profile_group_align(name);
        }
      }
      else if(changed){
        project.register_change(true);
      }
    }

  }

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

    profiles.forEach(function (p) {
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

  }

  do_glass_align(name = 'auto', glasses) {

    const {project, Point, Key, consts} = this;

    if(!glasses){
      glasses = project.selected_glasses();
    }
    if(glasses.length < 2){
      return;
    }

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
          $p.msg.show_msg({
            type: "alert-info",
            text: "Заполнения принадлежат разным рамным контурам",
            title: "Выравнивание"
          });
          return true;
        }
      })){
        return;
      }
    }

    if(name == 'auto'){
      name = 'width';
    }

    const orientation = name == 'width' ? $p.enm.orientations.vert : $p.enm.orientations.hor;
    const shift = parent_layer.getItems({class: $p.EditorInvisible.Profile}).filter((impost) => {
      const {b, e} = impost.rays;
      return impost.orientation == orientation && (b.is_tt || e.is_tt || b.is_i || e.is_i);
    });

    const galign = Key.modifiers.control || Key.modifiers.shift || project.auto_align == $p.enm.align_types.Геометрически;
    let medium = 0;

    const glmap = new Map();
    glasses = glasses.map((glass) => {
      const {bounds, profiles} = glass;
      const res = {
        glass,
        width: bounds.width,
        height: bounds.height,
      };

      if(galign){
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
          if(curr.outer || (profile != curr.profile && profile.cnn_side(curr.profile) == $p.enm.cnn_sides.Снаружи)){
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

    shift.forEach((impost) => {
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
  }

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
      return true;
    }
  }

  do_lay_impost_align(name = 'auto', glass) {

    const {project, Point} = this;

    if(!glass) {
      const glasses = project.selected_glasses();
      if(glasses.length != 1) {
        return;
      }
      glass = glasses[0];
    }

    if (!(glass instanceof $p.EditorInvisible.Filling)
      || !glass.imposts.length
      || glass.imposts.some(impost => impost.elm_type != $p.enm.elm_types.Раскладка)) {
        return;
    }

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

    if(name === 'auto') {
      name = 'width';
    }

    const orientation = name === 'width' ? $p.enm.orientations.vert : $p.enm.orientations.hor;
    const neighbors = [];
    const shift = glass.imposts.filter(impost => {
      const vert = (impost.angle_hor > 45 && impost.angle_hor <= 135) || (impost.angle_hor > 225 && impost.angle_hor <= 315);
      const passed = impost.orientation == orientation
        || (orientation === $p.enm.orientations.vert && vert)
        || (orientation === $p.enm.orientations.hor && !vert);
      if (!passed) {
        neighbors.push(impost);
      }
      return passed;
    });

    if (!shift.length) {
      return;
    }

    function get_nearest_link(link, src, pt) {
      const index = src.findIndex(elm => elm.b.is_nearest(pt) || elm.e.is_nearest(pt));
      if (index !== -1) {
        const impost = src[index];
        src.splice(index, 1);
        link.push(impost);
        get_nearest_link(link, src, impost.b);
        get_nearest_link(link, src, impost.e);
      }
    }

    const tmp = Array.from(shift);
    const links = [];
    while (tmp.length) {
      const link = [];
      get_nearest_link(link, tmp, tmp[0].b);
      if (link.length) {
        links.push(link);
      }
    }
    links.sort((a, b) => {
      return orientation === $p.enm.orientations.vert ? (a[0].b._x - b[0].b._x) : (a[0].b._y - b[0].b._y);
    });

    const widthNom = shift[0].nom.width;
    const bounds = glass.bounds_light(0);

    function get_delta(dist, pt) {
      return orientation === $p.enm.orientations.vert
        ? (bounds.x + dist - pt._x)
        : (bounds.y + dist - pt._y);
    }

    const width = (orientation === $p.enm.orientations.vert ? bounds.width : bounds.height) / links.length;
    const step = ((orientation === $p.enm.orientations.vert ? bounds.width : bounds.height) - widthNom * links.length) / (links.length + 1);
    let pos = 0;
    for (const link of links) {
      pos += step + widthNom / (pos === 0 ? 2 : 1);

      for (const impost of link) {
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

        let delta = get_delta(pos, impost.b);
        impost.select_node("b");
        impost.move_points(new Point(orientation === $p.enm.orientations.vert ? [delta, 0] : [0, delta]));
        glass.deselect_onlay_points();

        delta = get_delta(pos, impost.e);
        impost.select_node("e");
        impost.move_points(new Point(orientation === $p.enm.orientations.vert ? [delta, 0] : [0, delta]));
        glass.deselect_onlay_points();

        impost.generatrix.segments.forEach(segm => {
          if (segm.point === impost.b || segm.point === impost.e) {
            return;
          }
          delta = get_delta(pos, segm.point);
          segm.point = segm.point.add(delta);
        });

        nbs.forEach(node => {
          delta = get_delta(pos, node.impost[node.point]);
          node.impost.select_node(node.point);
          node.impost.move_points(new Point(orientation == $p.enm.orientations.vert ? [delta, 0] : [0, delta]));
          glass.deselect_onlay_points();
        });
      }
    }

    return true;
  }

  lay_impost_align(name = 'auto', glass) {
    const width = (name === 'auto' || name === 'width') && this.do_lay_impost_align('width', glass);
    const height = (name === 'auto' ||  name === 'height') && this.do_lay_impost_align('height', glass);
    if (!width && !height) {
      return;
    }

    this.project.contours.forEach(l => l.redraw());

    return true;
  }

  on_del_row({grid, tabular_section}) {
    if(tabular_section == 'inserts'){
      const {project} = this;
      const {obj} = grid.get_cell_field() || {};
      if(obj && obj._owner._owner == project.ox && !obj.inset.empty()){
        project.ox.params.clear({cnstr: obj.cnstr, inset: obj.inset});
        project.register_change();
      }
    }
  }

  on_keydown(ev) {
    this.eve.emit('keydown', ev);
  }

  on_alert(ev) {
    if(ev._shown) {
      return;
    }
    if(ev.obj === this.project.ox) {
      if(ev.row) {
        const {inset} = ev.row;
        if(inset && !inset.empty()) {
          ev.text += `<br/>вставка "${inset.name}"`;
        }
      }
      ev._shown = true;
      $p.msg.show_msg(ev);
    }
  }

  close(ox, calc_order) {
    const {project} = this;
    let path = '/';
    if(project) {
      project.getItems({class: Editor.DimensionLine}).forEach((el) => el.wnd && el.wnd.close());
      if(!ox) {
        ox = project.ox;
      }
      if(!calc_order) {
        calc_order = ox.calc_order;
      }

      if(calc_order && !calc_order.empty()){
        path += `${calc_order.class_name}/${calc_order.ref}`;
        if(ox && !ox.empty()){
          path += `/?ref=${ox.ref}`
        }
      }
    }
    this.handlers.handleNavigate(path);
  }

  unload() {
    const {tool, tools, tb_left, tb_top, _acc, _undo, _pwnd, project} = this;


    $p.cat.characteristics.off('del_row', this.on_del_row);
    $p.off('alert', this.on_alert);
    document.body.removeEventListener('keydown', this.on_keydown);

    if(tool && tool._callbacks.deactivate.length){
      tool._callbacks.deactivate[0].call(tool);
    }

    _acc.unload();
    _undo.unload();
    tb_left.unload();
    tb_top.unload();
    project.unload();
    _pwnd.detachAllEvents();
    _pwnd.detachObject(true);

    super.unload();

  }

};


$p.Editor = Editor;


Editor.BuilderElement.prototype.attache_wnd = function attache_wnd(cell) {
  if(!this._attr._grid || !this._attr._grid.cell){

    this._attr._grid = cell.attachHeadFields({
      obj: this,
      oxml: this.oxml
    });
    this._attr._grid.attachEvent('onRowSelect', function (id) {
      if(['x1', 'y1', 'a1', 'cnn1'].indexOf(id) != -1) {
        this._obj.select_node('b');
      }
      else if(['x2', 'y2', 'a2', 'cnn2'].indexOf(id) != -1) {
        this._obj.select_node('e');
      }
    });
  }
  else if(this._attr._grid._obj != this){
    this._attr._grid.attach({
      obj: this,
      oxml: this.oxml
    });
  }
}

Editor.BuilderElement.prototype.detache_wnd = function detache_wnd() {
  const {_grid} = this._attr;
  if(_grid && _grid.destructor && _grid._owner_cell){
    _grid._owner_cell.detachObject(true);
    delete this._attr._grid;
  }
}


class GlassInserts {

  constructor(glasses) {

    const elm = glasses.length && glasses[0];

    const {EditorInvisible, msg, enm, iface, injected_data} = $p;

    if(!(elm instanceof EditorInvisible.Filling)) {
      return msg.show_msg({
        type: 'alert-info',
        text: msg.glass_invalid_elm,
        title: msg.glass_spec
      });
    }

    if(elm.nom.elm_type === enm.elm_types.Заполнение) {
      return msg.show_msg({
        type: 'alert-info',
        text: msg.glass_invalid_type,
        title: msg.glass_spec
      });
    }

    this.elm = elm;
    this.glasses = glasses;

    const {project} = elm;

    const options = {
      name: 'glass_inserts',
      wnd: {
        caption: 'Составной пакет №' + elm.elm,
        allow_close: true,
        width: 460,
        height: 320,
        modal: true
      }
    };

    this.wnd = iface.dat_blank(null, options.wnd);

    this.wnd.elmnts.grids.inserts = this.wnd.attachTabular({
      obj: project.ox,
      ts: "glass_specification",
      selection: {elm: elm.elm},
      toolbar_struct: injected_data["toolbar_glass_inserts.xml"],
      ts_captions: {
        fields: ["inset", "clr"],
        headers: "Вставка,Цвет",
        widths: "*,*",
        min_widths: "100,100",
        aligns: "",
        sortings: "na,na",
        types: "ref,ref"
      }
    });
    this.wnd.attachEvent("onClose", this.onclose.bind(this));

    this.wnd.getAttachedToolbar().attachEvent("onclick", this.btn_click.bind(this));
  }

  onclose() {
    const {grids} = this.wnd.elmnts;
    const {elm, glasses} = this;
    const {glass_specification} = elm.project.ox;
    grids.inserts && grids.inserts.editStop();

    glass_specification.clear({elm: elm.elm, inset: $p.utils.blank.guid});

    for(let i = 1; i < glasses.length; i++) {
      const selm = glasses[i];
      glass_specification.clear({elm: selm.elm});
      glass_specification.find_rows({elm: elm.elm}, (row) => {
        glass_specification.add({
          elm: selm.elm,
          inset: row.inset,
          clr: row.clr
        });
      });
    }

    elm.project.register_change(true);
    elm._manager.emit_async('update', elm, {inset: true});
    return true;
  }

  btn_click(id) {
    if(id == "btn_inset"){
      const {project, inset, elm} = this.elm;
      project.ox.glass_specification.clear({elm: elm});
      inset.specification.forEach((row) => {
        if(row.nom instanceof $p.CatInserts){
          project.ox.glass_specification.add({
            elm: elm,
            inset: row.nom,
            clr: row.clr
          });
        }
      });
    }
  }
}


class Keybrd {

  constructor(_editor){

  }

}


class Magnetism {

  constructor(scheme) {
    this.scheme = scheme;
    this.on_impost_selected = this.on_impost_selected.bind(this);
  }

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
      }
      if(generatrix.lastSegment.selected) {
        if(selected.profile) {
          selected.break = true;
          break;
        }
        selected.profile = generatrix.parent;
        selected.point = 'e';
      }
    }
    return selected;
  }

  filter(selected) {
    const point = selected.profile[selected.point];
    const nodes = [selected];

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

  short_glass(point) {
    const {_scope: {consts}, activeLayer}  = this.scheme;
    for(const glass of activeLayer.glasses(false, true)){
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
    }
  }

  m1() {

    const {tb_left} = this.scheme._scope;
    const previous = tb_left && tb_left.get_selected();

    Promise.resolve().then(() => {

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
          const {segm, prev, next, glass} = res;

          let cl;
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

          const rSegm = (segm.outer ? segm.profile.rays.outer : segm.profile.rays.inner).equidistant(-segm.profile.nom.sizefaltz);
          const rNext = (pNext.outer ? pNext.profile.rays.outer : pNext.profile.rays.inner).equidistant(-pNext.profile.nom.sizefaltz);
          const rOur = (pOur.outer ? pOur.profile.rays.outer : pOur.profile.rays.inner).equidistant(-pOur.profile.nom.sizefaltz);

          const ps = rSegm.intersect_point(rOur, spoint);
          const be = ps.getDistance(segm.profile.b) > ps.getDistance(segm.profile.e) ? 'e' : 'b';
          const da = rSegm.angle_to(rNext, segm.profile[be]);

          let p0 = rSegm.intersect_point(rNext, ps);
          if(!p0 || da < 4) {
            p0 = rNext.getNearestPoint(segm.profile[be]);
          }
          const delta = p0.subtract(ps);
          selected.profile.move_points(delta, true);
          for(const node of ['b', 'e']) {
            try {
              selected.profile.do_sub_bind(selected.profile.rays[node].profile, node);
            }
            catch (e) {}
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

  on_impost_selected() {
    const {scheme, on_impost_selected} = this;
    scheme.view.off('click', on_impost_selected);
    const profiles = scheme.selected_profiles();
    if(profiles.length === 1 && profiles[0].elm_type === $p.enm.elm_types.Импост) {
      this.m3();
    }
  }

  m3() {
    const {enm: {elm_types, orientations}, ui: {dialogs}} = $p;
    const {scheme, on_impost_selected} = this;
    const profiles = scheme.selected_profiles();
    const {contours} = scheme;
    const title = 'Импост в балконном блоке';
    if(profiles.length !== 1 || profiles[0].elm_type !== elm_types.Импост) {
      scheme.view.on('click', on_impost_selected)
      return dialogs.alert({text: 'Укажите один импост на эскизе', title});
    }
    const profile = profiles[0];
    const {layer, orientation} = profile;
    if(orientation !== orientations.hor) {
      return dialogs.alert({text: 'Укажите горизонтальный импост', title});
    }
    if(contours.length < 2) {
      return dialogs.alert({text: 'В изделии только один контур - нечего уравнивать', title});
    }
    const {_corns} = profile._attr;
    const corns = _corns[3].y > _corns[2].y ? [_corns[1], _corns[2]] : [_corns[3], _corns[3]];
    let root = layer;
    while (root.layer) {
      root = layer.layer;
    }
    let nearest;
    let distance = Infinity;
    function check(cnt) {
      const candidat = cnt.profiles_by_side('bottom');
      const {_corns} = candidat._attr;
      const d03 = Math.abs(corns[0].x - _corns[3].x);
      const d04 = Math.abs(corns[0].x - _corns[4].x);
      const d13 = Math.abs(corns[1].x - _corns[3].x);
      const d14 = Math.abs(corns[1].x - _corns[4].x);
      const delta = Math.min(d03, d04, d13, d14);
      if(!nearest || (delta < distance && nearest.elm_type === elm_types.Рама)|| (delta < 300 && candidat.elm_type === elm_types.Створка)) {
        distance = delta;
        nearest = candidat;
        if(delta === d03) {
          corns.d = [0, 3];
        }
        else if(delta === d04) {
          corns.d = [0, 4];
        }
        else if(delta === d13) {
          corns.d = [1, 3];
        }
        else if(delta === d14) {
          corns.d = [1, 4];
        }
      }
    }
    for(const contour of contours) {
      if(contour === root) {
        continue;
      }
      check(contour);
      for(const cnt of contour.contours) {
        check(cnt);
      }
    }
    if(!nearest) {
      return dialogs.alert({text: 'Не найден подходящий профиль для уравнивания', title});
    }

    const delta = nearest._attr._corns[corns.d[1]].y - corns[corns.d[0]].y;
    if(delta) {
      scheme.move_points(new paper.Point(0, delta));
    }
  }

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
      .catch((err) => err);
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


class UndoRedo {

  constructor(_editor) {

    this._editor = _editor;
    this._pos = -1;

    this._diff = [];
    this.run_snapshot = this.run_snapshot.bind(this);
    this.scheme_changed = this.scheme_changed.bind(this);
    this.scheme_snapshot = this.scheme_snapshot.bind(this);
    this.clear = this.clear.bind(this);

    _editor.eve.on('scheme_changed', this.scheme_changed);

    _editor.eve.on('scheme_snapshot', this.scheme_snapshot);

  }

  run_snapshot() {
    const {project} = this._editor;
    if(project._ch.length){
      this._snap_timer = setTimeout(this.run_snapshot, 600);
    }
    else{
      this._pos >= 0 && project.save_coordinates({snapshot: true, clipboard: false});
    }
  }

  scheme_snapshot(scheme, attr) {
    scheme === this._editor.project && !attr.clipboard && this.save_snapshot(scheme);
  }

  scheme_changed(scheme, attr) {
    const snapshot = scheme._attr._snapshot || (attr && attr.snapshot);
    this._snap_timer && clearTimeout(this._snap_timer);
    this._snap_timer = 0;
    if(scheme._scope.tool.mouseDown) {
      return;
    }
    if (!snapshot && scheme == this._editor.project) {
      if (scheme._attr._loading) {
        this._snap_timer = setTimeout(() => {
          this.clear();
          this.save_snapshot(scheme);
        }, 600);
      }
      else {
        this._snap_timer = setTimeout(this.run_snapshot, 600);
      }
    }
  }

  calculate(pos) {
    const {_diff} = this;
    const curr = $p.utils._clone(_diff[0]);
    for (let i = 1; i < _diff.length && i <= pos; i++) {
      _diff[i].forEach((change) => {
        DeepDiff.applyChange(curr, true, change);
      });
    }
    return curr;
  }


  save_snapshot(scheme) {
    const {utils} = $p;
    const curr = utils._clone(utils._mixin({}, scheme.ox._obj, null, ['_row', 'extra_fields', 'glasses', 'specification', 'predefined_name']));
    const {_diff, _pos} = this;
    if (!_diff.length) {
      _diff.push(curr);
    }
    else {
      const diff = DeepDiff.diff(this.calculate(Math.min(_diff.length - 1, _pos)), curr);
      if (diff && diff.length) {
        if (_pos > 0 && _pos < (_diff.length - 1)) {
          _diff.splice(_pos, _diff.length - _pos - 1);
        }
        _diff.push(diff);
      }
    }
    this._pos = _diff.length - 1;
    this.enable_buttons();
  }

  apply_snapshot() {
    this.disable_buttons();
    this._editor.project.load_stamp(this.calculate(this._pos), true);
    this.enable_buttons();
  }

  enable_buttons() {
    const {back, rewind} = this._editor.tb_top.buttons;
    if (this._pos < 1)
      back.classList.add('disabledbutton');
    else
      back.classList.remove('disabledbutton');

    if (this._pos < (this._diff.length - 1))
      rewind.classList.remove('disabledbutton');
    else
      rewind.classList.add('disabledbutton');

  }

  disable_buttons() {
    const {back, rewind} = this._editor.tb_top.buttons;
    back.classList.add('disabledbutton');
    rewind.classList.add('disabledbutton');
  }

  clear() {
    this._diff.length = 0;
    this._pos = -1;
  }

  back() {
    if (this._pos > 0)
      this._pos--;
    if (this._pos >= 0)
      this.apply_snapshot();
    else
      this.enable_buttons();
  }

  rewind() {
    if (this._pos <= (this._diff.length - 1)) {
      this._pos++;
      this.apply_snapshot();
    }
  }

  unload() {
    this.clear();
    this._snap_timer && clearTimeout(this._snap_timer);
    this._editor.eve.off('scheme_changed', this.scheme_changed);
    this._editor.eve.off('scheme_snapshot', this.scheme_snapshot);
    for (const fld in this) {
      delete this[fld];
    }
  }

};




class ToolElement extends $p.EditorInvisible.ToolElement {

  constructor() {
    super();
    this.on_close = this.on_close.bind(this);
  }

  on_activate(cursor) {
    super.on_activate(cursor);
    this._scope.tb_left.select(this.options.name);
  }

  detache_wnd() {
    if (this.wnd) {

      if (this._grid && this._grid.destructor) {
        if (this.wnd.detachObject)
          this.wnd.detachObject(true);
        delete this._grid;
      }

      if (this.wnd.wnd_options) {
        if(!this.options.wnd){
          this.options.wnd = {};
        }
        this.wnd.wnd_options(this.options.wnd);
        $p.wsql.save_options("editor", this.options);
        this.wnd.close();
      }

      delete this.wnd;
    }
    this.profile = null;
  }

  on_close(wnd) {
    wnd && wnd.cell && setTimeout(() => this._scope.tools[1].activate());
    return true;
  }

}



class ToolArc extends ToolElement{

  constructor() {
    super();
    Object.assign(this, {
      options: {name: 'arc'},
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false,
    });

    this.on({

      activate() {
        this.on_activate('cursor-arc-arrow');
      },

      deactivate() {
        this._scope.hide_selection_bounds();
      },

      mousedown: this.mousedown,

      mouseup: this.mouseup,

      mousedrag: this.mousedrag,

      mousemove: this.hitTest,

      keydown: this.keydown,

    });

  }

  reset_arc(r) {
    const e = r.lastSegment.point;
    this.mode = null;

    r.removeSegments(1);
    r.firstSegment.handleIn = null;
    r.firstSegment.handleOut = null;
    r.lineTo(e);
    r.parent.rays.clear();
    r.parent._row.r = 0;
    r.selected = true;
    r.layer.notify({profiles: [r.parent], points: []}, this._scope.consts.move_points);
  }

  mousedown(event) {

    let b, e, r;

    this.mode = null;
    this.changed = false;

    if (this.hitItem && this.hitItem.item.parent instanceof $p.EditorInvisible.ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

      this.mode = this.hitItem.item.parent.generatrix;

      if (event.modifiers.control || event.modifiers.option){

        b = this.mode.firstSegment.point;
        e = this.mode.lastSegment.point;
        r = (b.getDistance(e) / 2) + 0.00001;

        this.do_arc(this.mode, event.point.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

        r = this.mode;
        this.mode = null;

      }
      else if(event.modifiers.space) {
        this.reset_arc(r = this.mode);
      }

      else {
        this.project.deselectAll();

        r = this.mode;
        r.selected = true;
        this.project.deselect_all_points();
        this.mouseStartPos = event.point.clone();
        this.originalContent = this._scope.capture_selection_state();

      }

      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        r.parent.attache_wnd(this._scope._acc.elm);
        this.eve.emit("layer_activated", r.layer);
      }, 10);

    }else{
      this.project.deselectAll();
    }
  }

  mouseup() {

    let item = this.hitItem ? this.hitItem.item : null;

    if(item instanceof $p.EditorInvisible.Filling && item.visible) {
      item.attache_wnd(this._scope._acc.elm);
      item.selected = true;

      if(item.selected && item.layer) {
        this.eve.emit('layer_activated', item.layer);
      }
    }

    if(this.mode) {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if(this.mode) {
          this.mode.parent.attache_wnd(this._scope._acc.elm);
          this.eve.emit('layer_activated', this.mode.layer);
        }
      }, 10);
    }

    this._scope.canvas_cursor('cursor-arc-arrow');

  }

  mousedrag(event) {
    if (this.mode) {

      this.changed = true;

      this._scope.canvas_cursor('cursor-arrow-small');

      this.do_arc(this.mode, event.point);


    }
  }

  keydown(event) {

    const {project} = this._scope;
    if(project.selectedItems.length === 1) {
      const {key, modifiers} = event;
      const step = modifiers.shift ? 1 : 10;
      const {parent} = project.selectedItems[0];

      if(parent instanceof $p.EditorInvisible.Profile && ['left', 'right', 'up', 'down'].includes(key)) {
        const {generatrix} = parent;

        if(event.modifiers.space){
          return this.reset_arc(generatrix);
        }

        const point = generatrix.getPointAt(generatrix.length/2);
        if (key == 'left') {
          this.do_arc(generatrix, point.add(-step, 0));
        }
        else if (key == 'right') {
          this.do_arc(generatrix, point.add(step, 0));
        }
        else if (key == 'up') {
          this.do_arc(generatrix, point.add(0, -step));
        }
        else if (key == 'down') {
          this.do_arc(generatrix, point.add(0, step));
        }

        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          parent.attache_wnd(this._scope._acc.elm);
          this.eve.emit("layer_activated", parent.layer);
        }, 100);
      }
    }
  }

  do_arc(element, point){
    const end = element.lastSegment.point.clone();
    element.removeSegments(1);

    try {
      element.arcTo(point, end);
    }
    catch (e) {
    }

    if(!element.curves.length) {
      element.lineTo(end);
    }

    element.parent.rays.clear();
    element.selected = true;

    element.layer.notify({profiles: [element.parent], points: []}, this._scope.consts.move_points);
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

    if(this.hitItem && this.hitItem.item.parent instanceof $p.EditorInvisible.ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      this._scope.canvas_cursor('cursor-arc');
    }
    else {
      this._scope.canvas_cursor('cursor-arc-arrow');
    }

    return true;
  }

}





class ToolCoordinates extends ToolElement{

  constructor() {
    super();
    Object.assign(this, {
      options: {
        name: 'grid',
        wnd: {
          caption: "Таблица координат",
          width: 290,
          height: 340
        },
      },
      profile: null,
      hitItem: null,
      originalContent: null,
      changed: false,
    });

    this.dp_update = this.dp_update.bind(this);

    this.on({

      activate() {
        this.on_activate('cursor-text-select');
        if(!this.dp) {
          this.dp = $p.dp.builder_coordinates.create(ToolCoordinates.defaultProps);
        }
      },

      deactivate: this.detache_wnd,

      mousedown: this.mousedown,

      mouseup() {
        this._scope.canvas_cursor('cursor-text-select');
      },

      mousemove: this.hitTest

    });
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

    if(this.hitItem && this.hitItem.item.parent instanceof $p.EditorInvisible.ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      this._scope.canvas_cursor('cursor-arrow-lay');
    }
    else {
      this.hitItem = null;
      this._scope.canvas_cursor('cursor-text-select');
    }

    return true;
  }


  mousedown() {
    this.project.deselectAll();

    if(this.hitItem) {
      if(this.profile !== this.hitItem.item.parent) {
        this.profile = this.hitItem.item.parent;

        if(!this.wnd || !this.wnd.elmnts) {
          this.create_wnd();
        }
        this.select_path();
      }
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
      disable_add_del: true,
    });
    this._grid.attachEvent("onRowSelect", (id) => {
      const row = this.dp.coordinates.get(id-1);
      this.grid && row && this.grid.grid_points(row.x);
    });
    this._layout.cells('b').detachToolbar();

    this._layout.cells('a').cell.firstChild.style.border = 'none';
    this._layout.cells('a').cell.lastChild.style.border = 'none';
    const {cell} = this._layout.cells('b');
    cell.firstChild.style.border = 'none';
    cell.lastChild.style.border = 'none';

    this._layout.setSizes();

    this.dp._manager.on({update: this.dp_update});

    if(this.grid){
      this.grid.visible = true;
    }
    else {
      this.grid = new $p.EditorInvisible.GridCoordinates({
        step: this.dp.step,
        offset: this.dp.offset,
        angle: this.dp.angle,
        bind: this.dp.bind.valueOf(),
      });
    }
  }

  detache_wnd() {
    super.detache_wnd();
    this.dp._manager.off({update: this.dp_update});
    if(this.grid) {
      this.grid.remove();
      this.grid = null;
    }
  }

  select_path() {
    const {path_kind} = $p.enm;
    this.profile.selected = false;

    let path = (this.dp.path === path_kind.generatrix ? this.profile.generatrix : this.profile.rays[this.dp.path.valueOf()])
      .clone({insert: false});
    const pts = [];
    for(let i = 1; i < 5; i++) {
      const pt = path.getNearestPoint(this.profile.corns(i));
      pts.push(path.getOffsetOf(pt));
    }
    pts.sort((a, b) => a - b);
    if(pts[3] < path.length){
      path.split(pts[3]);
    }
    if(pts[0]){
      path = path.split(pts[0]);
    }

    this.grid.path = path;
    this.dp.step_angle = 0;
    this.refresh_coordinates();
  }

  move_points(id) {

    const {profile, grid, dp, project} = this;
    const {generatrix} = profile;

    const {bind, path, line, step} = grid._attr;
    const segments = [];
    let reverce = path.firstSegment.point.getDistance(generatrix.firstSegment.point) >
      path.firstSegment.point.getDistance(generatrix.lastSegment.point);
    if(bind === 'e') {
      reverce = !reverce;
    }

    function add(tpath, x, y, tpoint, point) {
      const d1 = tpath.getOffsetOf(tpoint);
      const p1 = tpath.getPointAt(d1 + y);
      const delta = p1.subtract(point);

      if(x < step / 2) {
        segments.push((reverce ? generatrix.lastSegment.point : generatrix.firstSegment.point).add(delta));
      }
      else if(x > line.length - step / 2) {
        segments.push((reverce ? generatrix.firstSegment.point : generatrix.lastSegment.point).add(delta));
      }
      else {
        const intersections = generatrix.getIntersections(tpath);
        if(intersections.length) {
          segments.push(intersections[0].point.add(delta));
        }
      }
    }

    const n0 = line.getNormalAt(0).multiply(10000);
    dp.coordinates.forEach(({x, y}) => {
      const tpoint = x < line.length ? line.getPointAt(x) : line.lastSegment.point;
      const tpath = new paper.Path({
        segments: [tpoint.subtract(n0), tpoint.add(n0)],
        insert: false
      });
      const intersections = path.getIntersections(tpath);
      if(intersections.length) {
        add(tpath, x, y, tpoint, intersections[0].point);
      }
      else if(x < step / 2) {
        add(tpath, x, y, tpoint, bind === 'e' ? path.lastSegment.point : path.firstSegment.point);
      }
      else if(x > line.length - step / 2) {
        add(tpath, x, y, tpoint, bind === 'e' ? path.firstSegment.point : path.lastSegment.point);
      }
    });

    if(id === 0) {
      const segment = reverce ? generatrix.lastSegment : generatrix.firstSegment;
      const delta = segments[0].subtract(segment.point);
      segment.selected = true;
      profile.move_points(delta);
    }
    else if(id === segments.length - 1) {
      const segment = reverce ? path.firstSegment : path.lastSegment;
      const delta = segments[id].subtract(segment.point);
      segment.selected = true;
      profile.move_points(delta);
    }
    else {
      const pth = new paper.Path({
        insert: false,
        guide: true,
        strokeColor: 'red',
        strokeScaling: false,
        strokeWidth: 2,
        segments
      });

      pth.smooth({ type: 'catmull-rom',  factor: 0.5 });
      pth.simplify(0.8);
      reverce && pth.reverse();

      profile.generatrix = pth;
      project.register_change(true);
    }

    this.select_path();
    setTimeout(() => this._grid.selectCell(id, 2), 200);
  }

  dp_update(dp, fields) {

    if('path' in fields) {
      this.select_path();
    }
    if('bind' in fields) {
      this.grid.bind = dp.bind.valueOf();
      this.refresh_coordinates();
    }
    if('offset' in fields) {
      this.grid.offset = dp.offset;
      this.refresh_coordinates();
    }
    if('step' in fields) {
      if(dp.step <= 0) {
        dp.step = 100;
      }
      else {
        this.grid.step = dp.step;
        this.refresh_coordinates();
      }
    }
    if('step_angle' in fields) {
      this.grid.angle = dp.step_angle;
      this.refresh_coordinates();
    }
    if('y' in fields) {
      const id = this._grid.getSelectedRowId();
      if(id) {
        this.move_points(parseInt(id, 10) - 1);
      }
    }
    if('x' in fields) {
      const id = this._grid.getSelectedRowId();
      if(id) {
        this.refresh_coordinates();
        setTimeout(() => this._grid.selectCell(parseInt(id, 10) - 1, 2), 200);
      }
    }
  }

}

ToolCoordinates.defaultProps = {
  bind: 'b',
  path: 'generatrix',
  step: 200,
  offset: 200,
};


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
    if (event.key == 'escape') {
      this.remove_cont();
      this._scope.canvas_cursor('cursor-arrow-cut');
    }
  }

  mouseup(event) {

    const hitItem = this.project.hitTest(event.point, {fill: true, stroke: false, segments: false});
    if(hitItem && hitItem.item.parent instanceof $p.EditorInvisible.Profile) {
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

  create_cont() {
    const {nodes} = this;
    if(!this.cont && nodes.length) {
      const point = nodes[0].profile[nodes[0].point];
      const pt = this.project.view.projectToView(point);

      const buttons = [];
      if(nodes.length > 2) {
        buttons.push({name: 'cut', float: 'left', css: 'tb_cursor-cut tb_disable', tooltip: 'Разорвать Т'});
        buttons.push({name: 'uncut', float: 'left', css: 'tb_cursor-uncut', tooltip: 'Объединить разрыв в Т'});
      }
      else if(nodes.some(({point}) => point === 't')) {
        buttons.push({name: 'cut', float: 'left', css: 'tb_cursor-cut', tooltip: 'Разорвать Т'});
        buttons.push({name: 'uncut', float: 'left', css: 'tb_cursor-uncut tb_disable', tooltip: 'Объединить разрыв в Т'});
      }
      else {
        buttons.push({name: 'diagonal', float: 'left', css: 'tb_cursor-diagonal', tooltip: 'Диагональное'});
        buttons.push({name: 'vh', float: 'left', css: 'tb_cursor-vh', tooltip: 'Угловое к горизонтали'});
        buttons.push({name: 'hv', float: 'left', css: 'tb_cursor-hv', tooltip: 'Угловое к вертикали'});
      }
      const types = new Set();
      for(const {profile, point} of nodes) {
        if(point === 'b' || point === 'e') {
          const cnn = profile.rays[point];
          const cnns = $p.cat.cnns.nom_cnn(profile, cnn.profile, nodes.length > 2 ? undefined : cnn.cnn_types);
          for(const tcnn of cnns) {
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
          ){
            btn.css += ' tb_disable';
          }
          else if(['diagonal', 'vh', 'hv'].includes(btn.name) && nodes.every(({profile, point}) => {
            const {cnn} = profile.rays[point];
            const type = btn.name === 'diagonal' ? $p.enm.cnn_types.ad : (btn.name === 'vh' ? $p.enm.cnn_types.ah : $p.enm.cnn_types.av);
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

  remove_cont() {
    this.cont && this.cont.unload();
    this.square && this.square.remove();
    this.nodes = null;
    this.cont = null;
    this.square = null;
  }

  tb_click(name) {
    const {nodes} = this;
    if(!nodes) {
      return;
    }
    if(['diagonal', 'vh', 'hv'].includes(name)) {
      const type = name === 'diagonal' ? $p.enm.cnn_types.ad : (name === 'vh' ? $p.enm.cnn_types.ah : $p.enm.cnn_types.av);
      for(const {profile, point} of nodes) {
        if(point === 'b' || point === 'e') {
          const cnn = profile.rays[point];
          if(cnn.cnn.cnn_type !== type) {
            const cnns = $p.cat.cnns.nom_cnn(profile, cnn.profile, [type]);
            if(cnns.length) {
              cnn.cnn = cnns[0];
              this.project.register_change();
            }
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
    const rack2 = new $p.EditorInvisible.Profile({generatrix: generatrix.splitAt(loc), proto: rack.profile});

    cnn = rack2.cnn_point('e');
    if(base && cnn && cnn.profile) {
      if(!cnn.cnn || cnn.cnn.cnn_type !== base.cnn_type){
        const cnns = $p.cat.cnns.nom_cnn(rack2, cnn.profile, [base.cnn_type]);
        if(cnns.includes(base)) {
          cnn.cnn = base;
        }
        else if(cnns.length) {
          cnn.cnn = cnns[0];
        }
      }
      cnn = cnn.profile.cnn_point(cnn.profile_point);
      if(cnn.profile === rack2) {
        const cnns = $p.cat.cnns.nom_cnn(cnn.parent, rack2, [base.cnn_type]);
        if(cnns.includes(base)) {
          cnn.cnn = base;
        }
        else if(cnns.length) {
          cnn.cnn = cnns[0];
        }
      }
    }

    this.deselect();
  }

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

    rack1.profile.rays[rack1.point].clear(true);
    impost.profile.rays[impost.point].clear(true);

    rack1.profile[rack1.point] = rack2.profile[rack2.point === 'b' ? 'e' : 'b'];

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
          const cnns = $p.cat.cnns.nom_cnn(cnn.parent, rack1.profile, [base.cnn_type]);
          if(cnns.includes(base)) {
            cnn.cnn = base;
          }
          else if(cnns.length) {
            cnn.cnn = cnns[0];
          }
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

    if (this.hitItem && this.hitItem.item.parent instanceof $p.EditorInvisible.ProfileItem) {
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



class ZoomFit extends paper.Tool {

  constructor() {
    super();
    this.options = {name: 'zoom_fit'};
    this.on({activate: this.on_activate});
  }

  on_activate() {
    const {project, tb_left} = this._scope;
    const previous = tb_left.get_selected();
    project.zoom_fit();
    if(previous) {
      return this._scope.select_tool(previous.replace('left_', ''));
    }
  }

}


class ToolLayImpost extends ToolElement {

  constructor() {

    super();

    const tool = Object.assign(this, {
      options: {
        name: 'lay_impost',
        wnd: {
          caption: 'Импосты и раскладки',
          height: 420,
          width: 320,
          allow_close: true,
          region: 'r2',
        },
      },
      mode: null,
      hitItem: null,
      paths: [],
      changed: false,
      confirmed: true,
    });

    function tool_wnd() {

      tool.sys = tool._scope.project._dp.sys;

      const profile = tool.profile = $p.dp.builder_lay_impost.create();


      profile.elm_type_change = tool.elm_type_change.bind(tool);
      profile._manager.on('update', profile.elm_type_change);

      $p.wsql.restore_options('editor', tool.options);
      Object.assign(tool.options.wnd, {
        on_close: tool.on_close,
        height: 420,
        width: 320,
      });

      for (let prop in profile._metadata().fields) {
        if (tool.options.wnd.hasOwnProperty(prop))
          profile[prop] = tool.options.wnd[prop];
      }

      if (profile.elm_type.empty()) {
        profile.elm_type = $p.enm.elm_types.Импост;
      }

      $p.dp.builder_lay_impost.emit('value_change', {field: 'elm_type'}, profile);

      if (profile.align_by_y.empty()) {
        profile.align_by_y = $p.enm.positions.Центр;
      }
      if (profile.align_by_x.empty()) {
        profile.align_by_x = $p.enm.positions.Центр;
      }

      if (profile.clr.empty()) {
        profile.clr = tool.project.clr;
      }

      tool.choice_links_clr();


      profile._metadata('inset_by_x').choice_links = profile._metadata('inset_by_y').choice_links = [{
        name: ['selection', 'ref'],
        path: [(o, f) => {
          if ($p.utils.is_data_obj(o)) {
            return profile.rama_impost.indexOf(o) !== -1;
          }
          else {
            let refs = '';
            profile.rama_impost.forEach((o) => {
              if (refs) {
                refs += ', ';
              }
              refs += '"' + o.ref + '"';
            });
            return '_t_.ref in (' + refs + ')';
          }
        }],
      }];

      tool.wnd = $p.iface.dat_blank(tool._scope._dxw, tool.options.wnd);

      tool._grid = tool.wnd.attachHeadFields({
        obj: profile,
        oxml: tool.oxml(),
      });

      if (!tool.options.wnd.bounds_open) {
        tool._grid.collapseKids(tool._grid.getRowById(
          tool._grid.getAllRowIds().split(',')[13],
        ));
      }
      tool._grid.attachEvent('onOpenEnd', function (id, state) {
        if (id == this.getAllRowIds().split(',')[13])
          tool.options.wnd.bounds_open = state > 0;
      });

      if (!tool._grid_button_click)
        tool._grid_button_click = function (btn, bar) {
          tool.wnd.elmnts._btns.forEach(function (val, ind) {
            if (val.id == bar) {
              const suffix = (ind == 0) ? 'y' : 'x';
              profile['step_by_' + suffix] = 0;

              if (btn == 'clear') {
                profile['elm_by_' + suffix] = 0;

              } else if (btn == 'del') {

                if (profile['elm_by_' + suffix] > 0)
                  profile['elm_by_' + suffix] = profile['elm_by_' + suffix] - 1;
                else if (profile['elm_by_' + suffix] < 0)
                  profile['elm_by_' + suffix] = 0;

              } else if (btn == 'add') {

                if (profile['elm_by_' + suffix] < 1)
                  profile['elm_by_' + suffix] = 1;
                else
                  profile['elm_by_' + suffix] = profile['elm_by_' + suffix] + 1;
              }

            }
          });
        };

      tool.wnd.elmnts._btns = [];
      tool._grid.getAllRowIds().split(',').forEach(function (id, ind) {
        if (id.match(/^\d+$/)) {

          const cell = tool._grid.cells(id, 1);
          cell.cell.style.position = 'relative';

          if (ind < 10) {
            tool.wnd.elmnts._btns.push({
              id: id,
              bar: new $p.iface.OTooolBar({
                wrapper: cell.cell,
                top: '0px',
                right: '1px',
                name: id,
                width: '80px',
                height: '20px',
                class_name: '',
                buttons: [
                  {
                    name: 'clear',
                    text: '<i class="fa fa-trash-o"></i>',
                    title: 'Очистить направление',
                    class_name: 'md_otooolbar_grid_button',
                  },
                  {
                    name: 'del',
                    text: '<i class="fa fa-minus-square-o"></i>',
                    title: 'Удалить ячейку',
                    class_name: 'md_otooolbar_grid_button',
                  },
                  {
                    name: 'add',
                    text: '<i class="fa fa-plus-square-o"></i>',
                    title: 'Добавить ячейку',
                    class_name: 'md_otooolbar_grid_button',
                  },
                ],
                onclick: tool._grid_button_click,
              }),
            });
          } else {
            tool.wnd.elmnts._btns.push({
              id: id,
              bar: new $p.iface.OTooolBar({
                wrapper: cell.cell,
                top: '0px',
                right: '1px',
                name: id,
                width: '80px',
                height: '20px',
                class_name: '',
                buttons: [
                  {
                    name: 'clear',
                    text: '<i class="fa fa-trash-o"></i>',
                    title: 'Очистить габариты',
                    class_name: 'md_otooolbar_grid_button',
                  },
                ],
                onclick: function () {
                  profile.w = profile.h = 0;
                },
              }),
            });
          }

          cell.cell.title = '';
        }

      });

      const wnd_options = tool.wnd.wnd_options;
      tool.wnd.wnd_options = function (opt) {
        wnd_options.call(tool.wnd, opt);

        for (const prop in profile._metadata().fields) {
          if (prop.indexOf('step') === -1 && prop.indexOf('inset') === -1 && prop != 'clr' && prop != 'w' && prop != 'h') {
            const val = profile[prop];
            opt[prop] = $p.utils.is_data_obj(val) ? val.ref : val;
          }
        }
      };

    }

    this.on({

      activate() {
        this.on_activate('cursor-arrow-lay');
        tool_wnd();
      },

      deactivate: this.deactivate,

      mouseup: this.mouseup,

      mousemove: this.mousemove,
    });

  }

  oxml() {
    const {profile: {_manager, elm_type}} = this;
    const {form} = _manager.metadata();
    const oxml = form && form.obj && form.obj.head && $p.utils._clone(form.obj.head);
    if(oxml && elm_type === $p.enm.elm_types.Раскладка) {
      if(oxml[' '] && !oxml[' '].includes('region')) {
        oxml[' '].push('region');
      }
    }
    return oxml;
  }

  deactivate() {
    this._scope.clear_selection_bounds();
    this.paths.forEach((p) => p.remove());
    this.paths.length = 0;
    this.detache_wnd();
  }

  mouseup() {

    this._scope.canvas_cursor('cursor-arrow-lay');

    if(this.profile.elm_type == $p.enm.elm_types.Раскладка && this.hitItem instanceof $p.EditorInvisible.Filling && this.hitItem.imposts.length) {
      this.confirmed = false;
      dhtmlx.confirm({
        type: 'confirm',
        text: 'Раскладка уже существует, добавить к имеющейся?',
        title: $p.msg.glass_spec,
        callback: result => {
          result && this.add_profiles();
          this.confirmed = true;
        }
      });
    }
    else {
      this.add_profiles();
    }

  }

  mousemove(event) {

    if(!this.confirmed) {
      return;
    }

    const {_scope: {consts}, project, profile, hitItem}  = this;
    const {inset_by_y, inset_by_x} = profile;

    this.hitTest(event);

    this.paths.forEach((p) => p.removeSegments());


    if (inset_by_y.empty() && inset_by_x.empty()) {
      return;
    }

    let bounds, gen, hit = !!hitItem;

    if(hit) {
      bounds = (event.modifiers.control || event.modifiers.option || !hitItem.bounds_light) ?
        hitItem.bounds :
        hitItem.bounds_light().expand((inset_by_x || inset_by_y).width(), (inset_by_y || inset_by_x).width());
      gen = hitItem.path;
    }
    else if(profile.w && profile.h) {
      gen = new paper.Path({
        insert: false,
        segments: [[0, 0], [0, -profile.h], [profile.w, -profile.h], [profile.w, 0]],
        closed: true,
      });
      bounds = gen.bounds;
      project.zoom_fit(project.strokeBounds.unite(bounds));

    }
    else {
      return;
    }

    let stepy = profile.step_by_y || (profile.elm_by_y && bounds.height / (profile.elm_by_y + ((hit || profile.elm_by_y < 2) ? 1 : -1))),
      county = profile.elm_by_y > 0 ? profile.elm_by_y.round() : Math.round(bounds.height / stepy) - 1,
      stepx = profile.step_by_x || (profile.elm_by_x && bounds.width / (profile.elm_by_x + ((hit || profile.elm_by_x < 2) ? 1 : -1))),
      countx = profile.elm_by_x > 0 ? profile.elm_by_x.round() : Math.round(bounds.width / stepx) - 1,
      w2x = profile.inset_by_x.nom().width / 2,
      w2y = profile.inset_by_y.nom().width / 2,
      clr = $p.EditorInvisible.BuilderElement.clr_by_clr(profile.clr, false),
      by_x = [], by_y = [], base, pos, path, i, j, pts;

    const get_path = (segments, b, e) => {
      base++;
      if (base < this.paths.length) {
        path = this.paths[base];
        path.fillColor = clr;
        if(!path.isInserted()) {
          path.parent = hitItem ? hitItem.layer : project.activeLayer;
        }
      }
      else {
        path = new paper.Path({
          strokeColor: 'black',
          fillColor: clr,
          strokeScaling: false,
          guide: true,
          closed: true,
        });
        this.paths.push(path);
      }
      path.addSegments(segments);
      path.b = b.clone();
      path.e = e.clone();
      return path;
    };

    function get_points(p1, p2) {

      let res = {
          p1: new paper.Point(p1),
          p2: new paper.Point(p2),
        },
        c1 = gen.contains(res.p1),
        c2 = gen.contains(res.p2);

      if (c1 && c2)
        return res;

      const intersect = gen.getIntersections(new paper.Path({insert: false, segments: [res.p1, res.p2]}));

      if (c1) {
        intersect.reduce((sum, curr) => {
          const dist = sum.point.getDistance(curr.point);
          if (dist < sum.dist) {
            res.p2 = curr.point;
            sum.dist = dist;
          }
          return sum;
        }, {dist: Infinity, point: res.p2});
      }
      else if (c2) {
        intersect.reduce((sum, curr) => {
          const dist = sum.point.getDistance(curr.point);
          if (dist < sum.dist) {
            res.p1 = curr.point;
            sum.dist = dist;
          }
          return sum;
        }, {dist: Infinity, point: res.p1});
      }
      else if (intersect.length > 1) {
        intersect.reduce((sum, curr) => {
          const dist = sum.point.getDistance(curr.point);
          if (dist < sum.dist) {
            res.p2 = curr.point;
            sum.dist = dist;
          }
          return sum;
        }, {dist: Infinity, point: res.p2});
        intersect.reduce((sum, curr) => {
          const dist = sum.point.getDistance(curr.point);
          if (dist < sum.dist) {
            res.p1 = curr.point;
            sum.dist = dist;
          }
          return sum;
        }, {dist: Infinity, point: res.p1});
      }
      else {
        return null;
      }

      return res;
    }

    function do_x() {
      for (i = 0; i < by_x.length; i++) {

        if (!by_y.length || profile.split.empty() ||
          profile.split == $p.enm.lay_split_types.ДелениеГоризонтальных ||
          profile.split == $p.enm.lay_split_types.КрестПересечение) {

          if (pts = get_points([by_x[i], bounds.bottom], [by_x[i], bounds.top]))
            get_path([
              [pts.p1.x - w2x, pts.p1.y],
              [pts.p2.x - w2x, pts.p2.y],
              [pts.p2.x + w2x, pts.p2.y],
              [pts.p1.x + w2x, pts.p1.y]], pts.p1, pts.p2);
        }
        else {
          by_y.sort((a, b) => b - a);
          for (j = 0; j < by_y.length; j++) {
            if (j === 0) {
              if (hit && (pts = get_points([by_x[i], bounds.bottom], [by_x[i], by_y[j]])))
                get_path([
                  [pts.p1.x - w2x, pts.p1.y],
                  [pts.p2.x - w2x, pts.p2.y + w2x],
                  [pts.p2.x + w2x, pts.p2.y + w2x],
                  [pts.p1.x + w2x, pts.p1.y]], pts.p1, pts.p2);
            }
            else {
              if (pts = get_points([by_x[i], by_y[j - 1]], [by_x[i], by_y[j]]))
                get_path([
                  [pts.p1.x - w2x, pts.p1.y - w2x],
                  [pts.p2.x - w2x, pts.p2.y + w2x],
                  [pts.p2.x + w2x, pts.p2.y + w2x],
                  [pts.p1.x + w2x, pts.p1.y - w2x]], pts.p1, pts.p2);
            }
            if (j === by_y.length - 1) {
              if (hit && (pts = get_points([by_x[i], by_y[j]], [by_x[i], bounds.top])))
                get_path([
                  [pts.p1.x - w2x, pts.p1.y - w2x],
                  [pts.p2.x - w2x, pts.p2.y],
                  [pts.p2.x + w2x, pts.p2.y],
                  [pts.p1.x + w2x, pts.p1.y - w2x]], pts.p1, pts.p2);
            }
          }
        }
      }
    }

    function do_y() {
      for (i = 0; i < by_y.length; i++) {

        if (!by_x.length || profile.split.empty() ||
          profile.split == $p.enm.lay_split_types.ДелениеВертикальных ||
          profile.split == $p.enm.lay_split_types.КрестПересечение) {

          if (pts = get_points([bounds.left, by_y[i]], [bounds.right, by_y[i]]))
            get_path([
              [pts.p1.x, pts.p1.y - w2y],
              [pts.p2.x, pts.p2.y - w2y],
              [pts.p2.x, pts.p2.y + w2y],
              [pts.p1.x, pts.p1.y + w2y]], pts.p1, pts.p2);
        }
        else {
          by_x.sort((a, b) => a - b);
          for (j = 0; j < by_x.length; j++) {
            if (j === 0) {
              if (hit && (pts = get_points([bounds.left, by_y[i]], [by_x[j], by_y[i]])))
                get_path([
                  [pts.p1.x, pts.p1.y - w2y],
                  [pts.p2.x - w2y, pts.p2.y - w2y],
                  [pts.p2.x - w2y, pts.p2.y + w2y],
                  [pts.p1.x, pts.p1.y + w2y]], pts.p1, pts.p2);
            }
            else {
              if (pts = get_points([by_x[j - 1], by_y[i]], [by_x[j], by_y[i]]))
                get_path([
                  [pts.p1.x + w2y, pts.p1.y - w2y],
                  [pts.p2.x - w2y, pts.p2.y - w2y],
                  [pts.p2.x - w2y, pts.p2.y + w2y],
                  [pts.p1.x + w2y, pts.p1.y + w2y]], pts.p1, pts.p2);
            }
            if (j === by_x.length - 1) {
              if (hit && (pts = get_points([by_x[j], by_y[i]], [bounds.right, by_y[i]])))
                get_path([
                  [pts.p1.x + w2y, pts.p1.y - w2y],
                  [pts.p2.x, pts.p2.y - w2y],
                  [pts.p2.x, pts.p2.y + w2y],
                  [pts.p1.x + w2y, pts.p1.y + w2y]], pts.p1, pts.p2);
            }
          }
        }
      }
    }

    if (stepy) {
      if (profile.align_by_y == $p.enm.positions.Центр) {

        base = bounds.top + bounds.height / 2;
        if (county % 2) {
          by_y.push(base);
        }
        for (i = 1; i < county; i++) {

          if (county % 2)
            pos = base + stepy * i;
          else
            pos = base + stepy / 2 + (i > 1 ? stepy * (i - 1) : 0);

          if (pos + w2y + consts.sticking_l < bounds.bottom)
            by_y.push(pos);

          if (county % 2)
            pos = base - stepy * i;
          else
            pos = base - stepy / 2 - (i > 1 ? stepy * (i - 1) : 0);

          if (pos - w2y - consts.sticking_l > bounds.top)
            by_y.push(pos);
        }

      } else if (profile.align_by_y == $p.enm.positions.Верх) {

        if (hit) {
          for (i = 1; i <= county; i++) {
            pos = bounds.top + stepy * i;
            if (pos + w2y + consts.sticking_l < bounds.bottom)
              by_y.push(pos);
          }
        } else {
          for (i = 0; i < county; i++) {
            pos = bounds.top + stepy * i;
            if (pos - w2y - consts.sticking_l < bounds.bottom)
              by_y.push(pos);
          }
        }

      } else if (profile.align_by_y == $p.enm.positions.Низ) {

        if (hit) {
          for (i = 1; i <= county; i++) {
            pos = bounds.bottom - stepy * i;
            if (pos - w2y - consts.sticking_l > bounds.top)
              by_y.push(bounds.bottom - stepy * i);
          }
        } else {
          for (i = 0; i < county; i++) {
            pos = bounds.bottom - stepy * i;
            if (pos + w2y + consts.sticking_l > bounds.top)
              by_y.push(bounds.bottom - stepy * i);
          }
        }
      }
    }

    if (stepx) {
      if (profile.align_by_x == $p.enm.positions.Центр) {

        base = bounds.left + bounds.width / 2;
        if (countx % 2) {
          by_x.push(base);
        }
        for (i = 1; i < countx; i++) {

          if (countx % 2)
            pos = base + stepx * i;
          else
            pos = base + stepx / 2 + (i > 1 ? stepx * (i - 1) : 0);

          if (pos + w2x + consts.sticking_l < bounds.right)
            by_x.push(pos);

          if (countx % 2)
            pos = base - stepx * i;
          else
            pos = base - stepx / 2 - (i > 1 ? stepx * (i - 1) : 0);

          if (pos - w2x - consts.sticking_l > bounds.left)
            by_x.push(pos);
        }

      } else if (profile.align_by_x == $p.enm.positions.Лев) {

        if (hit) {
          for (i = 1; i <= countx; i++) {
            pos = bounds.left + stepx * i;
            if (pos + w2x + consts.sticking_l < bounds.right)
              by_x.push(pos);
          }
        } else {
          for (i = 0; i < countx; i++) {
            pos = bounds.left + stepx * i;
            if (pos - w2x - consts.sticking_l < bounds.right)
              by_x.push(pos);
          }
        }


      } else if (profile.align_by_x == $p.enm.positions.Прав) {

        if (hit) {
          for (i = 1; i <= countx; i++) {
            pos = bounds.right - stepx * i;
            if (pos - w2x - consts.sticking_l > bounds.left)
              by_x.push(pos);
          }
        } else {
          for (i = 0; i < countx; i++) {
            pos = bounds.right - stepx * i;
            if (pos + w2x + consts.sticking_l > bounds.left)
              by_x.push(pos);
          }
        }
      }
    }

    base = 0;
    if (profile.split == $p.enm.lay_split_types.ДелениеВертикальных) {
      do_y();
      do_x();
    } else {
      do_x();
      do_y();
    }

  }

  hitTest(event) {

    this.hitItem = null;

    if(event.point) {
      this.hitItem = this.project.hitTest(event.point, {fill: true, class: paper.Path});
    }

    if(this.hitItem && this.hitItem.item.parent instanceof $p.EditorInvisible.Filling) {
      this._scope.canvas_cursor('cursor-lay-impost');
      this.hitItem = this.hitItem.item.parent;
    }
    else {
      this._scope.canvas_cursor('cursor-arrow-lay');
      this.hitItem = null;
    }

    return true;
  }

  detache_wnd() {
    const {profile, wnd} = this;
    if (profile) {
      profile._manager.off('update', profile.elm_type_change);
      delete profile.elm_type_change;
    }
    if (wnd && wnd.elmnts) {
      wnd.elmnts._btns.forEach((btn) => {
        btn.bar && btn.bar.unload && btn.bar.unload();
      });
    }
    ToolElement.prototype.detache_wnd.call(this);
  }

  elm_type_clrs(profile, sys) {

    function add_by_clr(clr) {
      if (clr instanceof $p.CatClrs) {
        const {ref} = clr;
        if (clr.is_folder) {
          $p.cat.clrs.alatable.forEach((row) => row.parent == ref && profile._elm_type_clrs.push(row.ref));
        }
        else {
          profile._elm_type_clrs.push(ref);
        }
      }
      else if (clr instanceof $p.CatColor_price_groups) {
        clr.clr_conformity.forEach(({clr1}) => add_by_clr(clr1));
      }
    }

    if (!profile._elm_type_clrs) {
      const {inset_by_x, inset_by_y} = profile;
      profile._elm_type_clrs = [];

      if (profile.elm_type != $p.enm.elm_types.Раскладка) {
        add_by_clr(profile.clr);
      }

      if (inset_by_x.clr_group.empty() && inset_by_y.clr_group.empty()) {
        add_by_clr(sys.clr_group);
      }
      else {
        if (!inset_by_x.clr_group.empty()) {
          add_by_clr(inset_by_x.clr_group);
        }
        if (!inset_by_y.clr_group.empty() && inset_by_y.clr_group != inset_by_x.clr_group) {
          add_by_clr(inset_by_y.clr_group);
        }
      }
    }
    if (profile._elm_type_clrs.length && profile._elm_type_clrs.indexOf(profile.clr.ref) == -1) {
      profile.clr = profile._elm_type_clrs[0];
    }
    return profile._elm_type_clrs;
  }

  elm_type_change(obj, fields) {
    if (fields.hasOwnProperty('inset_by_x') || fields.hasOwnProperty('inset_by_y') || fields.hasOwnProperty('elm_type')) {
      const {profile, sys, _grid} = this;
      delete profile._elm_type_clrs;
      this.elm_type_clrs(profile, sys);
      _grid && _grid.attach({
        obj: profile,
        oxml: this.oxml(),
      });
    }
  }

  choice_links_clr() {

    const {profile, sys, elm_type_clrs} = this;

    $p.cat.clrs.selection_exclude_service(profile._metadata('clr'));

    profile._metadata('clr').choice_params.push({
      name: 'ref',
      get path() {
        const res = elm_type_clrs(profile, sys);
        return res.length ? {in: res} : {not: ''};
      },
    });


  }

  add_profiles() {
    const {profile, project, _scope: {consts}} = this;

    if (profile.inset_by_y.empty() && profile.inset_by_x.empty()) {
      return;
    }

    if (!this.hitItem && (profile.elm_type == $p.enm.elm_types.Раскладка || !profile.w || !profile.h)) {
      return;
    }

    this.check_layer();

    const layer = this.hitItem ? this.hitItem.layer : this.project.activeLayer;
    const lgeneratics = layer.profiles.map((p) => {
      const {generatrix, elm_type, rays, addls} = p;
      const res = {
        inner: elm_type === $p.enm.elm_types.Импост ? generatrix : rays.inner,
        gen: p.nearest() ? rays.outer : generatrix,
      };
      if(addls.length) {
        if(elm_type === $p.enm.elm_types.Импост) {

        }
        else {
          res.inner = addls[0].rays.inner;
          res.gen = addls[0].rays.outer;
        }
      }
      return res;
    });
    const nprofiles = [];

    function n1(p) {
      return p.segments[0].point.add(p.segments[3].point).divide(2);
    }

    function n2(p) {
      return p.segments[1].point.add(p.segments[2].point).divide(2);
    }

    function check_inset(inset, pos) {

      const nom = inset.nom();
      const rows = [];

      project._dp.sys.elmnts.each((row) => {
        if (row.nom.nom() == nom) {
          rows.push(row);
        }
      });

      for (let i = 0; i < rows.length; i++) {
        if (rows[i].pos == pos) {
          return rows[i].nom;
        }
      }

      return inset;
    }

    function rectification() {
      const ares = [];
      const group = new paper.Group({insert: false});

      function reverce(p) {
        const s = p.segments.map(function (s) {
          return s.point.clone();
        });
        p.removeSegments();
        p.addSegments([s[1], s[0], s[3], s[2]]);
      }

      function by_side(name) {

        ares.sort((a, b) => a[name] - b[name]);

        ares.forEach((p) => {
          if (ares[0][name] == p[name]) {

            let angle = n2(p.profile).subtract(n1(p.profile)).angle.round();

            if (angle < 0) {
              angle += 360;
            }

            if (name == 'left' && angle != 270) {
              reverce(p.profile);
            } else if (name == 'top' && angle != 0) {
              reverce(p.profile);
            } else if (name == 'right' && angle != 90) {
              reverce(p.profile);
            } else if (name == 'bottom' && angle != 180) {
              reverce(p.profile);
            }

            if (name == 'left' || name == 'right') {
              p.profile._inset = check_inset(profile.inset_by_x, $p.enm.positions[name]);
            }
            else {
              p.profile._inset = check_inset(profile.inset_by_y, $p.enm.positions[name]);
            }
          }
        });

      }

      this.paths.forEach((p) => {
        if (p.segments.length) {
          p.parent = group;
        }
      });

      const bounds = group.bounds;

      group.children.forEach((p) => {
        ares.push({
          profile: p,
          left: Math.abs(n1(p).x + n2(p).x - bounds.left * 2),
          top: Math.abs(n1(p).y + n2(p).y - bounds.top * 2),
          bottom: Math.abs(n1(p).y + n2(p).y - bounds.bottom * 2),
          right: Math.abs(n1(p).x + n2(p).x - bounds.right * 2),
        });
      });

      ['left', 'top', 'bottom', 'right'].forEach(by_side);
    }

    if (!this.hitItem) {
      rectification.call(this);
    }

    this.paths.forEach((p) => {

      let iter = 0, angle, proto = {clr: profile.clr};

      function do_bind() {

        let correctedp1 = false,
          correctedp2 = false;

        for (let {gen, inner} of lgeneratics) {
          if (!correctedp1) {
            const np = inner.getNearestPoint(p.b);
            if(np.getDistance(p.b) < consts.sticking) {
              correctedp1 = true;
              p.b = inner === gen ? np : gen.getNearestPoint(p.b);
            }
          }
          if (!correctedp2) {
            const np = inner.getNearestPoint(p.e);
            if (np.getDistance(p.e) < consts.sticking) {
              correctedp2 = true;
              p.e = inner === gen ? np : gen.getNearestPoint(p.e);
            }
          }
        }

        if (profile.split != $p.enm.lay_split_types.КрестВСтык && (!correctedp1 || !correctedp2)) {
          for (let profile of nprofiles) {
            let np = profile.generatrix.getNearestPoint(p.b);
            if (!correctedp1 && np.getDistance(p.b) < consts.sticking) {
              correctedp1 = true;
              p.b = np;
            }
            np = profile.generatrix.getNearestPoint(p.e);
            if (!correctedp2 && np.getDistance(p.e) < consts.sticking) {
              correctedp2 = true;
              p.e = np;
            }
          }
        }
      }

      p.remove();
      if (p.segments.length) {

        angle = p.e.subtract(p.b).angle;
        if ((angle > -40 && angle < 40) || (angle > 180 - 40 && angle < 180 + 40)) {
          proto.inset = p._inset || profile.inset_by_y;
        } else {
          proto.inset = p._inset || profile.inset_by_x;
        }

        if (profile.elm_type == $p.enm.elm_types.Раскладка) {
          nprofiles.push(new $p.EditorInvisible.Onlay({
            generatrix: new paper.Path({
              segments: [p.b, p.e],
            }),
            parent: this.hitItem,
            region: profile.region,
            proto: proto,
          }));
        }
        else {

          while (iter < 10) {

            iter++;
            do_bind();
            angle = p.e.subtract(p.b).angle;
            let delta = Math.abs(angle % 90);

            if (delta > 45) {
              delta -= 90;
            }
            if (delta < 0.02) {
              break;
            }
            if (angle > 180) {
              angle -= 180;
            }
            else if (angle < 0) {
              angle += 180;
            }

            if ((angle > -40 && angle < 40) || (angle > 180 - 40 && angle < 180 + 40)) {
              p.b.y = p.e.y = (p.b.y + p.e.y) / 2;
            }
            else if ((angle > 90 - 40 && angle < 90 + 40) || (angle > 270 - 40 && angle < 270 + 40)) {
              p.b.x = p.e.x = (p.b.x + p.e.x) / 2;
            }
            else {
              break;
            }
          }

          if (p.e.getDistance(p.b) > proto.inset.nom().width) {
            nprofiles.push(new $p.EditorInvisible.Profile({
              generatrix: new paper.Path({
                segments: [p.b, p.e],
              }),
              parent: layer,
              proto: proto,
            }));
          }
        }
      }
    });
    this.paths.length = 0;

    nprofiles.forEach((p) => {
      p.cnn_point('b');
      p.cnn_point('e');
    });
    nprofiles.forEach((p) => {
      p.cnn_point('b');
      p.cnn_point('e');
    });

    if (!this.hitItem)
      setTimeout(() => {
        this._scope.tools[1].activate();
      }, 100);
  }
}



class ToolM2 extends paper.Tool {

  constructor() {
    super();
    this.options = {name: 'm2'};
    this.on({activate: this.on_activate});
  }

  on_activate() {
    const {project, tb_left} = this._scope;
    const previous = tb_left.get_selected();

    Promise.resolve().then(() => {

      const {selected} = project.magnetism;

      if(selected.break) {
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Выделено более одного узла`,
          title: 'Соединение Т в угол'
        });
      }
      else if(!selected.profile) {
        $p.msg.show_msg({
          type: 'alert-info',
          text: `Не выделено ни одного узла профиля`,
          title: 'Соединение Т в угол'
        });
      }
      else {

        const nodes = project.magnetism.filter(selected);

        if(nodes.length >= 3) {

          for(const elm of nodes) {
            const cnn_point = elm.profile.cnn_point(elm.point);
            if(cnn_point && cnn_point.is_x) {
              this.split_angle(elm, nodes);
              break;
            }
            else if(cnn_point && cnn_point.is_t) {
              this.merge_angle(elm, nodes);
              break;
            }
          }

        }
      }
    });

    if(previous) {
      return this._scope.select_tool(previous.replace('left_', ''));
    }
  }

  merge_angle(impost, nodes) {

    let point, profile, cnn;
    nodes.some((elm) => {
      if(elm !== impost && elm.point !== 't') {
        profile = elm.profile;
        point = profile.nearest(true) ? (profile.corns(elm.point === 'b' ? 1 : 2)) : profile[elm.point];
        const cnns = $p.cat.cnns.nom_cnn(impost.profile, profile, [$p.enm.cnn_types.xx]);
        if(cnns.length) {
          cnn = cnns[0];
          return true;
        }
      }
    });

    if(cnn && !cnn.empty()) {

      for (const elm of nodes) {
        if((elm.profile === impost || !elm.profile.nearest(true)) && elm.point !== 't' && !point.equals(elm.profile[elm.point])) {
          elm.profile[elm.point] = point;
        }
      }

      const {rays, project} = impost.profile;
      const ray = rays[impost.point];
      if(ray.cnn != cnn || ray.profile != profile) {
        ray.clear();
        ray.cnn = cnn;
        ray.profile = profile;
        project.register_change();
      }
    }
    else {
      const p1 = impost.profile ? impost.profile.inset.presentation : '...';
      const p2 = profile ? profile.inset.presentation : '...';
      $p.msg.show_msg({
        type: 'alert-info',
        text: `Не найдено соединение 'Крест в стык' для профилей ${p1} и ${p2}`,
        title: 'Соединение Т в угол'
      });
    }

  }

  split_angle(impost, nodes) {

    let point, profile, cnn;
    nodes.some((elm) => {
      if(elm !== impost && elm.point !== 't') {
        profile = elm.profile;
        if(profile.nearest(true)) {
          const {outer} = profile.rays;
          const offset = elm.point === 'b' ? outer.getOffsetOf(profile.corns(1)) + 100 : outer.getOffsetOf(profile.corns(2)) - 100;
          point = outer.getPointAt(offset);
        }
        else {
          point = profile[elm.point];
        }
        const cnns = $p.cat.cnns.nom_cnn(impost.profile, profile, [$p.enm.cnn_types.t]);
        if(cnns.length) {
          cnn = cnns[0];
          return true;
        }
      }
    });

    if(cnn && !cnn.empty()) {

      impost.profile[impost.point] = point === profile.b ? profile.generatrix.getPointAt(100) : profile.generatrix.getPointAt(profile.generatrix.length - 100);

      const {rays, project} = impost.profile;
      const ray = rays[impost.point];
      ray.clear();
      ray.cnn = cnn;
      ray.profile = profile;
      project.register_change();
    }
    else {
      const p1 = impost.profile ? impost.profile.inset.presentation : '...';
      const p2 = profile ? profile.inset.presentation : '...';
      $p.msg.show_msg({
        type: 'alert-info',
        text: `Не найдено соединение Т для профилей ${p1} и ${p2}`,
        title: 'Соединение Т из угла'
      });
    }

  }

  merge_t() {

  }

  split_t() {

  }

}



class ToolPan extends ToolElement {

  constructor() {
    super();
    Object.assign(this, {
      options: {name: 'pan'},
      distanceThreshold: 10,
      minDistance: 10,
      mouseStartPos: new paper.Point(),
      mode: 'pan',
      zoomFactor: 1.1,
    });

    this.on({

      activate() {
        this.on_activate('cursor-hand');
      },

      deactivate() {
      },

      mousedown(event) {
        if (event.modifiers.shift) {
          this.mouseStartPos = event.point;
        }
        else{
          this.mouseStartPos = event.point.subtract(this._scope.view.center);
        }
        this.mode = '';
        if (event.modifiers.control || event.modifiers.option) {
          this.mode = 'zoom';
        }
        else {
          this._scope.canvas_cursor('cursor-hand-grab');
          this.mode = 'pan';
        }
      },

      mouseup(event) {
        const {view} = this._scope;
        if(this.mode == 'zoom') {
          const zoomCenter = event.point.subtract(view.center);
          const moveFactor = this.zoomFactor - 1.0;
          if(event.modifiers.control) {
            view.zoom *= this.zoomFactor;
            view.center = view.center.add(zoomCenter.multiply(moveFactor / this.zoomFactor));
          }
          else if(event.modifiers.option) {
            view.zoom /= this.zoomFactor;
            view.center = view.center.subtract(zoomCenter.multiply(moveFactor));
          }
        }
        else if(this.mode == 'zoom-rect') {
          const start = view.center.add(this.mouseStartPos);
          const end = event.point;
          view.center = start.add(end).multiply(0.5);
          const dx = view.bounds.width / Math.abs(end.x - start.x);
          const dy = view.bounds.height / Math.abs(end.y - start.y);
          view.zoom = Math.min(dx, dy) * view.zoom;
        }
        this.hitTest(event);
        this.mode = '';
      },

      mousedrag(event) {
        const {view} = this._scope;
        if (this.mode == 'zoom') {
          this.mode = 'zoom-rect';
        }
        else if (this.mode == 'zoom-rect') {
          this._scope.drag_rect(view.center.add(this.mouseStartPos), event.point);
        }
        else if (this.mode == 'pan') {
          if (event.modifiers.shift) {
            const {project} = this._scope;
            const delta = this.mouseStartPos.subtract(event.point);
            this.mouseStartPos = event.point;
            project.rootLayer().move(delta.negate());
          }
          else{
            const pt = event.point.subtract(view.center);
            const delta = this.mouseStartPos.subtract(pt);
            this.mouseStartPos = pt;
            view.scrollBy(delta);
          }
        }
      },

      mousemove: this.hitTest,

      keydown(event) {
        const rootLayer = this._scope.project.rootLayer();
        switch (event.key) {
          case 'left':
            rootLayer.move(new paper.Point(-10, 0));
            break;
          case 'right':
            rootLayer.move(new paper.Point(10, 0));
            break;
          case 'up':
            rootLayer.move(new paper.Point(0, -10));
            break;
          case 'down':
            rootLayer.move(new paper.Point(0, 10));
            break;
        }
      },

      keyup(event) {
        this.hitTest(event);
      }
    });
  }

  testHot(type, event, mode) {
    const spacePressed = event && event.modifiers.space;
    if(mode != 'tool-zoompan' && !spacePressed) {
      return false;
    }
    return this.hitTest(event);
  }

  hitTest(event) {

    if (event.modifiers.control) {
      this._scope.canvas_cursor('cursor-zoom-in');
    } else if (event.modifiers.option) {
      this._scope.canvas_cursor('cursor-zoom-out');
    } else {
      this._scope.canvas_cursor('cursor-hand');
    }

    return true;
  }

}


class PenControls {

  constructor(tool) {

    const t = this;
    const _cont = this._cont = document.createElement('div');

    this._tool = tool;
    this.mousemove = this.mousemove.bind(this);
    this.create_click = this.create_click.bind(this);

    function input_change() {

      switch(this.name) {

        case 'x':
        case 'y':
          setTimeout(() => {
            tool.emit("mousemove", {
              point: t.point,
              modifiers: {}
            });
          });
          break;

        case 'l':
        case 'a':

          if(!tool.path){
            return false;
          }

          const p = new paper.Point();
          p.length = parseFloat(t._l.value || 0);
          p.angle = parseFloat(t._a.value || 0);
          p.y = -p.y;

          t.mousemove({point: tool.point1.add(p)}, true);

          input_change.call({name: "x"});
          break;
      }
    }

    tool._scope._wrapper.appendChild(_cont);
    _cont.className = "pen_cont";

    tool.project.view.on('mousemove', this.mousemove);

    _cont.innerHTML = "<table><tr><td>x:</td><td><input type='number' name='x' /></td><td>y:</td><td><input type='number' name='y' /></td></tr>" +
      "<tr><td>l:</td><td><input type='number' name='l' /></td><td>α:</td><td><input type='number' name='a' /></td></tr>" +
      "<tr><td colspan='4'><input type='button' name='click' value='Создать точку' /></td></tr></table>";

    this._x = _cont.querySelector("[name=x]");
    this._y = _cont.querySelector("[name=y]");
    this._l = _cont.querySelector("[name=l]");
    this._a = _cont.querySelector("[name=a]");

    this._x.onchange = input_change;
    this._y.onchange = input_change;
    this._l.onchange = input_change;
    this._a.onchange = input_change;

    _cont.querySelector("[name=click]").onclick = this.create_click;

  }

  get point(){
    const {bounds} = this._tool.project,
      x = parseFloat(this._x.value || 0) + (bounds ? bounds.x : 0),
      y = (bounds ? (bounds.height + bounds.y) : 0) - parseFloat(this._y.value || 0);
    return new paper.Point([x, y]);
  }

  blur() {
    const focused = document.activeElement;
    if(focused == this._x) {
      this._x.blur();
    }
    else if(focused == this._y) {
      this._y.blur();
    }
    else if(focused == this._l) {
      this._l.blur();
    }
    else if(focused == this._a) {
      this._a.blur();
    }
  }

  mousemove(event, ignore_pos) {

    const {project: {bounds, view}, profile} = this._tool;

    if(!profile){
      return;
    }

    const pos = ignore_pos || view.projectToView(event.point);

    const {elm_type} = profile;
    if(elm_type == $p.enm.elm_types.Добор || elm_type == $p.enm.elm_types.Соединитель){
      this._cont.style.display = "none";
      return;
    }
    else{
      this._cont.style.display = "";
    }

    if (!ignore_pos) {
      this._cont.style.top = pos.y + 16 + "px";
      this._cont.style.left = pos.x - 20 + "px";

    }

    if (bounds) {
      this._x.value = (event.point.x - bounds.x).toFixed(0);
      this._y.value = (bounds.height + bounds.y - event.point.y).toFixed(0);

      if (!ignore_pos) {

        if (this._tool.path) {
          this._l.value = this._tool.point1.getDistance(this.point).round(1);
          const p = this.point.subtract(this._tool.point1);
          p.y = -p.y;
          let angle = p.angle;
          if (angle < 0){
            angle += 360;
          }
          this._a.value = angle.round(1);
        }
        else {
          this._l.value = 0;
          this._a.value = 0;
        }
      }
    }
  }

  create_click() {
    setTimeout(() => {
      this._tool.emit('mousedown', {
        modifiers: {}
      });
      setTimeout(() => {
        this._tool.emit('mouseup', {
          point: this.point,
          modifiers: {}
        });
      });
    });
  }

  unload() {
    const {_scope} = this._tool;
    _scope.project.view.off('mousemove', this.mousemove);
    _scope._wrapper.removeChild(this._cont);
    this._cont = null;
  }

}


class ToolPen extends ToolElement {

  constructor() {

    super();

    Object.assign(this, {
      options: {
        name: 'pen',
        wnd: {
          caption: 'Новый сегмент профиля',
          width: 320,
          height: 320,
          allow_close: true,
          bind_generatrix: true,
          bind_node: false,
          inset: '',
          clr: ''
        }
      },
      point1: new paper.Point(),
      last_profile: null,
      mode: null,
      hitItem: null,
      originalContent: null,
      start_binded: false,
    });

    this.on({
      activate: this.on_activate,
      deactivate: this.on_deactivate,
      mousedown: this.on_mousedown,
      mouseup: this.on_mouseup,
      mousemove: this.on_mousemove,
      keydown: this.on_keydown,
    });

    this.scheme_changed = this.scheme_changed.bind(this);
    this.layer_activated = this.layer_activated.bind(this);

  }

  tool_wnd() {

    this.profile = $p.dp.builder_pen.create();

    const {project, profile} = this;
    this.sys = project._dp.sys;

    $p.wsql.restore_options('editor', this.options);
    this.options.wnd.on_close = this.on_close;

    ['elm_type', 'inset', 'bind_generatrix', 'bind_node'].forEach((prop) => {
      if(prop == 'bind_generatrix' || prop == 'bind_node' || this.options.wnd[prop]) {
        profile[prop] = this.options.wnd[prop];
      }
    });

    if((profile.elm_type.empty() || profile.elm_type == $p.enm.elm_types.Рама) &&
      project.activeLayer instanceof $p.EditorInvisible.Contour && project.activeLayer.profiles.length) {
      profile.elm_type = $p.enm.elm_types.Импост;
    }
    else if((profile.elm_type.empty() || profile.elm_type == $p.enm.elm_types.Импост) &&
      project.activeLayer instanceof $p.EditorInvisible.Contour && !project.activeLayer.profiles.length) {
      profile.elm_type = $p.enm.elm_types.Рама;
    }

    $p.dp.builder_pen.emit('value_change', {field: 'elm_type'}, profile);

    profile.clr = project.clr;

    profile._metadata('inset').choice_links = [{
      name: ['selection', 'ref'],
      path: [(o, f) => {
          if($p.utils.is_data_obj(o)){
            return profile.rama_impost.indexOf(o) != -1;
          }
          else{
            let refs = '';
            profile.rama_impost.forEach((o) => {
              if(refs) {
                refs += ', ';
              }
              refs += `'${o.ref}'`;
            });
            return '_t_.ref in (' + refs + ')';
          }
        }]
    }];

    $p.cat.clrs.selection_exclude_service(profile._metadata('clr'), this);

    this.wnd = $p.iface.dat_blank(this._scope._dxw, this.options.wnd);
    this._grid = this.wnd.attachHeadFields({
      obj: profile
    });

    this.wnd.tb_mode = new $p.iface.OTooolBar({
      wrapper: this.wnd.cell,
      width: '100%',
      height: '28px',
      class_name: '',
      name: 'tb_mode',
      buttons: [{
        name: 'standard_form',
        text: '<i class="fa fa-file-image-o fa-fw"></i>',
        tooltip: 'Добавить типовую форму',
        float: 'left',
        sub: {
          width: '90px',
          height:'190px',
          buttons: [
            {name: 'square', img: 'square.png', float: 'left'},
            {name: 'triangle1', img: 'triangle1.png', float: 'left'},
            {name: 'triangle2', img: 'triangle2.png', float: 'right'},
            {name: 'triangle3', img: 'triangle3.png', float: 'left'},
            {name: 'semicircle1', img: 'semicircle1.png', float: 'left'},
            {name: 'semicircle2', img: 'semicircle2.png', float: 'right'},
            {name: 'circle',    img: 'circle.png', float: 'left'},
            {name: 'arc1',      img: 'arc1.png', float: 'left'},
            {name: 'trapeze1',  img: 'trapeze1.png', float: 'right'},
            {name: 'trapeze2',  img: 'trapeze2.png', float: 'left'},
            {name: 'trapeze3',  img: 'trapeze3.png', float: 'left'},
            {name: 'trapeze4',  img: 'trapeze4.png', float: 'right'},
            {name: 'trapeze5',  img: 'trapeze5.png', float: 'left'},
            {name: 'trapeze6',  img: 'trapeze6.png', float: 'left'},
            {name: 'trapeze7',  img: 'trapeze7.png', float: 'right'},
            {name: 'trapeze8',  img: 'trapeze8.png', float: 'left'},
            {name: 'trapeze9',  img: 'trapeze9.png', float: 'left'},
            {name: 'trapeze10',  img: 'trapeze10.png', float: 'right'}]}
            },
      ],
      image_path: '/imgs/',
      onclick: (name) => this.standard_form(name)
    });
    this.wnd.tb_mode.cell.style.backgroundColor = '#f5f5f5';
    this.wnd.cell.firstChild.style.marginTop = '22px';
    const {standard_form} = this.wnd.tb_mode.buttons;
    const {onmouseover} = standard_form;
    const wnddiv = this.wnd.cell.parentElement;
    standard_form.onmouseover = function() {
      if(wnddiv.style.transform) {
        wnddiv.style.transform = '';
      }
      onmouseover.call(this);
    };

    const wnd_options = this.wnd.wnd_options;
    this.wnd.wnd_options = (opt) => {
      wnd_options.call(this.wnd, opt);
      opt.bind_generatrix = profile.bind_generatrix;
      opt.bind_node = profile.bind_node;
    };
  }

  on_activate() {

    super.on_activate('cursor-pen-freehand');

    this._controls = new PenControls(this);

    this.tool_wnd();

    this.eve.on("layer_activated", this.layer_activated);

    this.eve.on("scheme_changed", this.scheme_changed);

    this.decorate_layers();
  }

  layer_activated(contour, virt) {
    const {_attr} = this.project;
    if(!virt && !_attr._loading && !_attr._snapshot){
      this.decorate_layers();
    }
  }

  scheme_changed(scheme) {
    if(this.sys != scheme._dp.sys){
      delete this.profile._metadata('inset').choice_links;
      this.detache_wnd();
      this.tool_wnd();
    }
  }

  on_deactivate() {
    this._scope.clear_selection_bounds();

    this.eve.off("scheme_changed", this.scheme_changed);
    this.eve.off("layer_activated", this.layer_activated);

    this.decorate_layers(true);

    delete this.profile._metadata('inset').choice_links;

    this.detache_wnd();

    if(this.path){
      this.path.removeSegments();
      this.path.remove();
    }
    this.path = null;
    this.last_profile = null;
    this.mode = null;

    this._controls.unload();
  }

  on_keydown(event) {

    if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

      if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1){
        return;
      }

      this.project.selectedItems.forEach((path) => {
        if(path.parent instanceof $p.EditorInvisible.ProfileItem){
          path = path.parent;
          path.removeChildren();
          path.remove();
        }
      });

      this.mode = null;
      this.path = null;

      event.stop();
      return false;

    }else if(event.key == 'escape'){

      if(this.path){
        this.path.remove();
        this.path = null;
      }
      this.mode = null;
      this._controls.blur();
    }
  }

  on_mousedown(event) {
    this.project.deselectAll();

    if(event.event && event.event.which && event.event.which > 1){
      return this.on_keydown({key: 'escape'});
    }

    this.last_profile = null;

    if(this.profile.elm_type == $p.enm.elm_types.Добор || this.profile.elm_type == $p.enm.elm_types.Соединитель){

      if(this.addl_hit){

      }

    }else{

      if(this.mode == 'continue'){
        this.mode = 'create';
        this.start_binded = false;
      }
    }
  }

  on_mouseup(event) {

    const {_scope, addl_hit, profile, project} = this;
    const {
      enm: {elm_types},
      EditorInvisible: {Sectional, ProfileAddl, ProfileConnective, Onlay, BaseLine, Profile, ProfileItem, Filling}
    } = $p;

    _scope.canvas_cursor('cursor-pen-freehand');

    if(event.event && event.event.which && event.event.which > 1){
      return this.on_keydown({key: 'escape'});
    }

    this.check_layer();

    let whas_select;

    if(addl_hit){

      if(addl_hit.glass && profile.elm_type == elm_types.Добор && !profile.inset.empty()){
        new ProfileAddl({
          generatrix: addl_hit.generatrix,
          proto: profile,
          parent: addl_hit.profile,
          side: addl_hit.side
        });
      }
      else if(profile.elm_type == elm_types.Соединитель && !profile.inset.empty()){

        const connective = new ProfileConnective({
          generatrix: addl_hit.generatrix,
          proto: profile,
          parent: project.l_connective,
        });
        connective.joined_nearests().forEach((rama) => {
          const {inner, outer} = rama.joined_imposts();
          for (const {profile} of inner.concat(outer)) {
            profile.rays.clear();
          }
          for (const {_attr, elm} of rama.joined_nearests()) {
            _attr._rays && _attr._rays.clear();
          }
          const {_attr, layer} = rama;
          _attr._rays && _attr._rays.clear();
          layer && layer.notify && layer.notify({profiles: [rama], points: []}, _scope.consts.move_points);
        });
      }
    }
    else if(this.mode == 'create' && this.path) {

      if (this.path.length < _scope.consts.sticking){
        return;
      }

      switch (profile.elm_type) {
      case elm_types.Раскладка:
        project.activeLayer.glasses(false, true).some((glass) => {
          if(glass.contains(this.path.firstSegment.point) && glass.contains(this.path.lastSegment.point)){
            new Onlay({
              generatrix: this.path,
              proto: profile,
              parent: glass
            });
            this.path = null;
            return true;
          }
        });
        break;

      case elm_types.Водоотлив:
        this.last_profile = new Sectional({generatrix: this.path, proto: profile});
        break;

      case elm_types.Линия:
        this.last_profile = new BaseLine({generatrix: this.path, proto: profile});
        break;

      default:
        this.last_profile = new Profile({generatrix: this.path, proto: profile});
      }

      this.path = null;

      if(profile.elm_type == elm_types.Рама){
        setTimeout(() => {
          if(this.last_profile){
            this._controls.mousemove({point: this.last_profile.e}, true);
            this.last_profile = null;
            this._controls.create_click();
          }
        }, 50);
      }
    }
    else if (this.hitItem && this.hitItem.item && (event.modifiers.shift || event.modifiers.control || event.modifiers.option)) {

      let item = this.hitItem.item.parent;
      if(event.modifiers.space && item.nearest && item.nearest()) {
        item = item.nearest();
      }

      if(event.modifiers.shift) {
        item.selected = !item.selected;
      }
      else {
        project.deselectAll();
        item.selected = true;
      }

      if(item instanceof ProfileItem && item.isInserted()) {
        item.attache_wnd(_scope._acc.elm);
        whas_select = true;
        this._controls.blur();
      }
      else if(item instanceof Filling && item.visible) {
        item.attache_wnd(_scope._acc.elm);
        whas_select = true;
        this._controls.blur();
      }

      if(item.selected && item.layer){
        item.layer.activate(true);
      }

    }

    if(!whas_select && !this.mode && !addl_hit) {

      this.mode = 'continue';
      this.point1 = this._controls.point;

      if (!this.path){
        this.path = new paper.Path({
          strokeColor: 'black',
          segments: [this.point1]
        });
        this.currentSegment = this.path.segments[0];
        this.originalHandleIn = this.currentSegment.handleIn.clone();
        this.originalHandleOut = this.currentSegment.handleOut.clone();
        this.currentSegment.selected = true;
      }
      this.start_binded = false;
      return;

    }

    if(this.path) {
      this.path.remove();
      this.path = null;
    }
    this.mode = null;
  }

  on_mousemove(event) {

    const {project} = this;

    this.hitTest(event);

    if(this.addl_hit){

      if (!this.path){
        this.path = new paper.Path({
          strokeColor: 'black',
          fillColor: 'white',
          strokeScaling: false,
          guide: true
        });
      }

      this.path.removeSegments();

      if(this.addl_hit.glass){
        this.draw_addl();
      }
      else{
        this.draw_connective();
      }
    }
    else if(this.path){

      if(this.mode){

        let delta = event.point.subtract(this.point1),
          dragIn = false,
          dragOut = false,
          invert = false,
          handlePos;

        if (delta.length < this._scope.consts.sticking){
          return;
        }

        if (this.mode == 'create') {
          dragOut = true;
          if (this.currentSegment.index > 0)
            dragIn = true;
        } else  if (this.mode == 'close') {
          dragIn = true;
          invert = true;
        } else  if (this.mode == 'continue') {
          dragOut = true;
        } else if (this.mode == 'adjust') {
          dragOut = true;
        } else  if (this.mode == 'join') {
          dragIn = true;
          invert = true;
        } else  if (this.mode == 'convert') {
          dragIn = true;
          dragOut = true;
        }

        if (dragIn || dragOut) {
          let res, bind = this.profile.bind_node ? "node_" : "";

          if(this.profile.bind_generatrix){
            bind += "generatrix";
          }

          if (invert){
            delta = delta.negate();
          }

          if (dragIn && dragOut) {
            handlePos = this.originalHandleOut.add(delta);
            if(!event.modifiers.shift) {
              handlePos = handlePos.snap_to_angle();
            }
            this.currentSegment.handleOut = handlePos;
            this.currentSegment.handleIn = handlePos.negate();

          }
          else if (dragOut) {

            let bpoint = this.point1.add(delta);
            if(!event.modifiers.shift) {
              if(!bpoint.bind_to_nodes(true, project)){
                bpoint = this.point1.add(delta.snap_to_angle());
              }
            }

            if(this.path.segments.length > 1){
              this.path.lastSegment.point = bpoint;
            }
            else{
              this.path.add(bpoint);
            }

            if(!this.start_binded){

              if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

                res = $p.EditorInvisible.Onlay.prototype.bind_node(this.path.firstSegment.point, project.activeLayer.glasses(false, true));
                if(res.binded){
                  this.path.firstSegment.point = this.point1 = res.point;
                }

              }
              else if(this.profile.elm_type == $p.enm.elm_types.Импост){

                res = {distance: Infinity};
                project.activeLayer.profiles.some((element) => {

                  if(element.children.some((addl) => {
                    if(addl instanceof $p.EditorInvisible.ProfileAddl &&
                      project.check_distance(addl, null, res, this.path.firstSegment.point, bind) === false) {
                      this.path.firstSegment.point = this.point1 = res.point;
                      return true;
                    }
                  })) {
                    return true;
                  }
                  else if(project.check_distance(element, null, res, this.path.firstSegment.point, bind) === false) {
                    this.path.firstSegment.point = this.point1 = res.point;
                    return true;
                  }
                });

                this.start_binded = true;
              }
              else {
                const {x, y} = this.path.firstSegment.point;
                this.path.firstSegment.point = this.point1 = new paper.Point((x / 10).round() * 10, (y / 10).round() * 10);
                this.start_binded = true;
              }
            }

            if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

              res = $p.EditorInvisible.Onlay.prototype.bind_node(this.path.lastSegment.point, project.activeLayer.glasses(false, true));
              if(res.binded)
                this.path.lastSegment.point = res.point;

            }
            else if(this.profile.elm_type == $p.enm.elm_types.Импост){

              res = {distance: Infinity};
              project.activeLayer.profiles.some((element) => {

                if(element.children.some((addl) => {
                    if(addl instanceof $p.EditorInvisible.ProfileAddl &&
                      project.check_distance(addl, null, res, this.path.lastSegment.point, bind) === false){
                      this.path.lastSegment.point = res.point;
                      return true;
                    }
                  })){
                  return true;

                }else if (project.check_distance(element, null, res, this.path.lastSegment.point, bind) === false ){
                  this.path.lastSegment.point = res.point;
                  return true;
                }

              });
            }

          }
          else {
            handlePos = this.originalHandleIn.add(delta);
            if(!event.modifiers.shift) {
              handlePos = handlePos.snap_to_angle();
            }
            this.currentSegment.handleIn = handlePos;
            this.currentSegment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
          }
          this.path.selected = true;
        }

      }
      else{
        this.path.removeSegments();
        this.path.remove();
        this.path = null;
      }

      if(event.className != 'ToolEvent') {
        project.register_update();
      }
    }
  }

  draw_addl() {

    const {profiles} = this.addl_hit.glass;
    const prev = this.addl_hit.rib==0 ? profiles[profiles.length-1] : profiles[this.addl_hit.rib-1];
    const curr = profiles[this.addl_hit.rib];
    const next = this.addl_hit.rib==profiles.length-1 ? profiles[0] : profiles[this.addl_hit.rib+1];

    const path_prev = prev.outer ? prev.profile.rays.outer : prev.profile.rays.inner;
    const path_curr = curr.outer ? curr.profile.rays.outer : curr.profile.rays.inner;
    const path_next = next.outer ? next.profile.rays.outer : next.profile.rays.inner;

    let p1 = path_curr.intersect_point(path_prev, curr.b),
      p2 = path_curr.intersect_point(path_next, curr.e),
      sub_path = path_curr.get_subpath(p1, p2);

    this.path.addSegments(sub_path.segments);

    sub_path = sub_path.equidistant(-(this.profile.inset.nom().width || 20));
    sub_path.reverse();
    this.path.addSegments(sub_path.segments);
    sub_path.removeSegments();
    sub_path.remove();
    this.path.closePath();

    if(!this.addl_hit.generatrix){
      this.addl_hit.generatrix = new paper.Path({insert: false});
    }
    p1 = prev.profile.generatrix.getNearestPoint(p1);
    p2 = next.profile.generatrix.getNearestPoint(p2);
    this.addl_hit.generatrix.removeSegments();
    this.addl_hit.generatrix.addSegments(path_curr.get_subpath(p1, p2).segments);

  }

  draw_connective() {

    const {rays, b, e} = this.addl_hit.profile;

    let sub_path = rays.outer.get_subpath(b, e);

    if(!this.addl_hit.generatrix){
      this.addl_hit.generatrix = new paper.Path({insert: false});
    }
    this.addl_hit.generatrix.removeSegments();
    this.addl_hit.generatrix.addSegments(sub_path.segments);

    this.path.addSegments(sub_path.equidistant(this.profile.inset.nom().width / 2 || 10).segments);

    sub_path = sub_path.equidistant(-(this.profile.inset.nom().width || 10));
    sub_path.reverse();
    this.path.addSegments(sub_path.segments);
    sub_path.removeSegments();
    sub_path.remove();
    this.path.closePath();

  }

  hitTest_addl(event) {

    const hitSize = 16;
    const {project, _scope} = this;

    if (event.point){
      this.hitItem = project.hitTest(event.point, { stroke:true, curves:true, tolerance: hitSize });
    }

    if (this.hitItem) {

      if(this.hitItem.item.layer == project.activeLayer &&
        this.hitItem.item.parent instanceof $p.EditorInvisible.ProfileItem && !(this.hitItem.item.parent instanceof $p.EditorInvisible.Onlay)){

        const hit = {
          point: this.hitItem.point,
          profile: this.hitItem.item.parent
        };

        if(hit.profile.rays.inner.getNearestPoint(event.point).getDistance(event.point, true) <
          hit.profile.rays.outer.getNearestPoint(event.point).getDistance(event.point, true)){
          hit.side = "inner";
        }
        else{
          hit.side = "outer";
        }

        hit.profile.layer.glasses(false, true).some((glass) => {
          return glass.profiles.some((rib, index) => {
            if(rib.profile == hit.profile && rib.sub_path && rib.sub_path.getNearestPoint(hit.point).is_nearest(hit.point, true)){
              if(hit.side == "outer" && rib.outer || hit.side == "inner" && !rib.outer){
                hit.rib = index;
                hit.glass = glass;
                return true;
              }
            }
          });

        });

        if(hit.glass){
          this.addl_hit = hit;
          _scope.canvas_cursor('cursor-pen-adjust');
        }

      }
      else if(this.hitItem.item.parent instanceof $p.EditorInvisible.Filling){


      }else{
        _scope.canvas_cursor('cursor-pen-freehand');
      }

    } else {

      this.hitItem = project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
      _scope.canvas_cursor('cursor-pen-freehand');
    }

  }

  hitTest_connective(event) {

    const hitSize = 16;
    const {project, _scope} = this;
    const rootLayer = project.rootLayer();

    if (event.point){
      this.hitItem = rootLayer.hitTest(event.point, { stroke:true, curves:true, tolerance: hitSize });
    }

    if (this.hitItem) {

      if(this.hitItem.item.parent instanceof $p.EditorInvisible.ProfileItem && !(this.hitItem.item.parent instanceof $p.EditorInvisible.Onlay)){

        const hit = {
          point: this.hitItem.point,
          profile: this.hitItem.item.parent
        };

        if(hit.profile.rays.inner.getNearestPoint(event.point).getDistance(event.point, true) <
          hit.profile.rays.outer.getNearestPoint(event.point).getDistance(event.point, true)){
          hit.side = "inner";
        }
        else{
          hit.side = "outer";
        }

        if(hit.side == "outer"){
          this.addl_hit = hit;
          _scope.canvas_cursor('cursor-pen-adjust');
        }

      }
      else{
        _scope.canvas_cursor('cursor-pen-freehand');
      }

    }
    else {
      this.hitItem = project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
      _scope.canvas_cursor('cursor-pen-freehand');
    }
  }

  hitTest(event) {

    this.addl_hit = null;
    this.hitItem = null;

    if(this.profile.elm_type == $p.enm.elm_types.Добор){
      this.hitTest_addl(event);
    }
    else if(this.profile.elm_type == $p.enm.elm_types.Соединитель){
      this.hitTest_connective(event);
    }
    else{

      const hitSize = 6;

      if (event.point){
        this.hitItem = this.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
      }

      if(!this.hitItem){
        this.hitItem = this.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
      }

      if (this.hitItem && this.hitItem.item.parent instanceof $p.EditorInvisible.ProfileItem
        && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
        this._scope.canvas_cursor('cursor-pen-adjust');
      }
      else {
        this._scope.canvas_cursor('cursor-pen-freehand');
      }
    }

    return true;
  }



  standard_form(name) {
    if(this['add_' + name]) {
      this['add_' + name](this.project.bounds);
      this.project.zoom_fit();
    }
    else {
      name !== 'standard_form' && $p.msg.show_not_implemented();
    }
  }

  add_sequence(points) {
    const profiles = [];
    points.forEach((segments) => {
      profiles.push(new $p.EditorInvisible.Profile({
        generatrix: new paper.Path({
          strokeColor: 'black',
          segments: segments
        }), proto: this.profile
      }));
    });
    return profiles;
  }

  add_square(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_triangle1(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_triangle2(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_triangle3(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([500, -500])],
      [point.add([500, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_semicircle1(bounds) {
    const point = bounds.bottomRight;
    const profiles = this.add_sequence([
      [point, point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
    profiles[0].arc_h = 500;
  }

  add_semicircle2(bounds) {
    const point = bounds.bottomRight;
    const profiles = this.add_sequence([
      [point, point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
    profiles[1].arc_h = 500;
  }

  add_circle(bounds) {
    const point = bounds.bottomRight;
    const profiles = this.add_sequence([
      [point, point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
    profiles[0].arc_h = 500;
    profiles[1].arc_h = 500;
  }

  add_arc1(bounds) {
    const point = bounds.bottomRight;
    const profiles = this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
    profiles[1].arc_h = 500;
  }

  add_trapeze1(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_trapeze2(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -750])],
      [point.add([0, -750]), point.add([250, -1000])],
      [point.add([250, -1000]), point.add([750, -1000])],
      [point.add([750, -1000]), point.add([1000, -750])],
      [point.add([1000, -750]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_trapeze3(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_trapeze4(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_trapeze5(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_trapeze6(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_trapeze7(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_trapeze8(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  add_trapeze9(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point.add([0, -500]), point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point.add([500, 0])],
      [point.add([500, 0]), point.add([0, -500])]
    ]);
  }

  add_trapeze10(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([500, 0])],
      [point.add([500, 0]), point]
    ]);
  }

  decorate_layers(reset) {
    const {activeLayer} = this.project;
    this.project.getItems({class: $p.EditorInvisible.Contour}).forEach((l) => {
      l.opacity = (l == activeLayer || reset) ? 1 : 0.5;
    });
  }

}




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

      wnd.tb_mode.buttons['1'].style.display = 'none';

      wnd.tb_mode.buttons[tool.mode].classList.add('muted');
      wnd.tb_mode.buttons[tool.base_line].classList.add('muted');
      wnd.tb_mode.cell.style.backgroundColor = '#f5f5f5';

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
        if (path.parent instanceof $p.EditorInvisible.DimensionLineCustom) {

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
        case 27:        
          !(tool instanceof ToolRuler) && wnd.close();
          break;
        case 37:        
          this.on_button_click({
            currentTarget: {name: 'left'},
          });
          break;
        case 38:        
          this.on_button_click({
            currentTarget: {name: 'top'},
          });
          break;
        case 39:        
          this.on_button_click({
            currentTarget: {name: 'right'},
          });
          break;
        case 40:        
          this.on_button_click({
            currentTarget: {name: 'bottom'},
          });
          break;

        case 109:       
        case 46:        
        case 8:         
          if (ev.target && ['textarea', 'input'].indexOf(ev.target.tagName.toLowerCase()) != -1) {
            return;
          }

          tool.project.selectedItems.some((path) => {
            if (path.parent instanceof $p.EditorInvisible.DimensionLineCustom) {
              path.parent.remove();
              return true;
            }
          });

          return $p.iface.cancel_bubble(ev);

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
      if (tool instanceof $p.EditorInvisible.DimensionLine) {
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


class ToolRuler extends ToolElement {

  constructor() {


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

          if (this.mode == 0) {

            this.add_hit_item(event);

            if (this.selected.a.length && this.selected.b.length) {
              if (this.selected.a[0].orientation == this.selected.b[0].orientation) {
                if (this.selected.a[0].orientation == $p.enm.orientations.Вертикальная) {
                  this.wnd.size = Math.abs(this.selected.a[0].ruler_line_coordin('x') - this.selected.b[0].ruler_line_coordin('x'));
                }
                else if (this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная) {
                  this.wnd.size = Math.abs(this.selected.a[0].ruler_line_coordin('y') - this.selected.b[0].ruler_line_coordin('y'));
                }
                else {

                }
              }
            }
            else if (this.wnd.size != 0) {
              this.wnd.size = 0;
            }

          }
          else if (this.mode == 1) {

            this.add_hit_point(event);

          }
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
              new $p.EditorInvisible.DimensionRadius({
                elm1: parent,
                p1: this.hitItem.item.getOffsetOf(this.hitPoint).round(),
                parent: parent.layer.l_dimensions,
                by_curve: event.modifiers.control || event.modifiers.shift || window.event.ctrlKey || window.event.shiftKey,
              });
              this.project.register_change(true);
            }

          }
          else {

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

                new $p.EditorInvisible.DimensionLineCustom({
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

            this.path_text.content = length.toFixed(0);
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

        if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

          if (event.event && event.event.target && ['textarea', 'input'].indexOf(event.event.target.tagName.toLowerCase()) != -1)
            return;

          this.project.selectedItems.some((path) => {
            if (path.parent instanceof $p.EditorInvisible.DimensionLineCustom) {
              path.parent.remove();
              return true;
            }
          });

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

      if (!this.mode) {
        this.hitItem = this.project.hitTest(event.point, {fill: true, tolerance: 10});
      }
      if (this.mode === 4) {
        this.hitItem = this.project.hitTest(event.point, {stroke: true, tolerance: 20});
      }
      else {
        const hit = this.project.hitPoints(event.point, 16, false, true);
        if (hit && hit.item.parent instanceof $p.EditorInvisible.ProfileItem) {
          this.hitItem = hit;
        }
      }
    }

    if (this.hitItem && this.hitItem.item.parent instanceof $p.EditorInvisible.ProfileItem) {
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

$p.EditorInvisible.ToolRuler = ToolRuler;




class ToolSelectNode extends ToolElement {

  constructor() {
    super();
    Object.assign(this, {
      options: {
        name: 'select_node',
        wnd: {
          caption: "Свойства элемента",
          height: 380
        }
      },
      mouseStartPos: new paper.Point(),
      mouseDown: false,
      mode: null,
      hitItem: null,
      originalContent: null,
      originalHandleIn: null,
      originalHandleOut: null,
      changed: false,
      minDistance: 10
    });

    this.on({

      activate() {
        this.on_activate('cursor-arrow-white');
      },

      deactivate: this.deactivate,

      mousedown: this.mousedown,

      mouseup: this.mouseup,

      mousedrag: this.mousedrag,

      mousemove: this.hitTest,

      keydown: this.keydown,
    });

  }

  deactivate() {
    this._scope.clear_selection_bounds();
    if(this.profile){
      this.profile.detache_wnd();
      delete this.profile;
    }
  }

  mousedown(event) {

    const {project, consts} = this._scope;

    this.mode = null;
    this.changed = false;
    this.mouseDown = true;

    if(event.event && event.event.which && event.event.which > 1){
    }

    if (this.hitItem && !event.modifiers.alt) {

      if(this.hitItem.item instanceof paper.PointText) {
        return;
      }


      let item = this.hitItem.item.parent;
      if (event.modifiers.space && item.nearest && item.nearest()) {
        item = item.nearest();
      }

      if (item && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

        if (event.modifiers.shift) {
          item.selected = !item.selected;
        } else {
          project.deselectAll();
          item.selected = true;
        }
        if (item.selected) {
          this.mode = consts.move_shapes;
          project.deselect_all_points();
          this.mouseStartPos = event.point.clone();
          this.originalContent = this._scope.capture_selection_state();

          if(item.layer){
            this.eve.emit("layer_activated", item.layer);
          }
        }

      }
      else if (this.hitItem.type == 'segment') {
        if (event.modifiers.shift) {
          this.hitItem.segment.selected = !this.hitItem.segment.selected;
        } else {
          if (!this.hitItem.segment.selected){
            project.deselect_all_points();
            project.deselectAll();
          }
          this.hitItem.segment.selected = true;
        }
        if (this.hitItem.segment.selected) {
          this.mode = consts.move_points;
          this.mouseStartPos = event.point.clone();
          this.originalContent = this._scope.capture_selection_state();
        }
      }
      else if (this.hitItem.type == 'handle-in' || this.hitItem.type == 'handle-out') {
        this.mode = consts.move_handle;
        this.mouseStartPos = event.point.clone();
        this.originalHandleIn = this.hitItem.segment.handleIn.clone();
        this.originalHandleOut = this.hitItem.segment.handleOut.clone();

      }

      if(item instanceof $p.EditorInvisible.ProfileItem || item instanceof $p.EditorInvisible.Filling){
        item.attache_wnd(this._scope._acc.elm);
        this.profile = item;
      }

      this._scope.clear_selection_bounds();

    } else {
      this.mouseStartPos = event.point.clone();
      this.mode = 'box-select';

      if(!event.modifiers.shift && this.profile){
        this.profile.detache_wnd();
        delete this.profile;
      }

    }
  }

  mouseup(event) {

    const {project, consts} = this._scope;

    if (this.mode == consts.move_shapes) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
      }
    }
    else if (this.mode == consts.move_points) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
      }
    }
    else if (this.mode == consts.move_handle) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
      }
    }
    else if (this.mode == 'box-select') {

      const box = new paper.Rectangle(this.mouseStartPos, event.point);

      if (!event.modifiers.shift){
        project.deselectAll();
      }

      if (event.modifiers.control) {

        const profiles = [];
        this._scope.paths_intersecting_rect(box).forEach((path) => {
          if(path.parent instanceof $p.EditorInvisible.ProfileItem){
            if(profiles.indexOf(path.parent) == -1){
              profiles.push(path.parent);
              path.parent.selected = !path.parent.selected;
            }
          }
          else{
            path.selected = !path.selected;
          }
        });
      }
      else {

        const selectedSegments = this._scope.segments_in_rect(box);
        if (selectedSegments.length > 0) {
          for (let i = 0; i < selectedSegments.length; i++) {
            selectedSegments[i].selected = !selectedSegments[i].selected;
          }
        }
        else {
          const profiles = [];
          this._scope.paths_intersecting_rect(box).forEach((path) => {
            if(path.parent instanceof $p.EditorInvisible.ProfileItem){
              if(profiles.indexOf(path.parent) == -1){
                profiles.push(path.parent);
                path.parent.selected = !path.parent.selected;
              }
            }
            else{
              path.selected = !path.selected;
            }
          });
        }
      }
    }

    this._scope.clear_selection_bounds();

    if (this.hitItem) {
      if (this.hitItem.item.selected || (this.hitItem.item.parent && this.hitItem.item.parent.selected)) {
        this._scope.canvas_cursor('cursor-arrow-small');
      }
      else {
        this._scope.canvas_cursor('cursor-arrow-white-shape');
      }
    }

    this.mouseDown = false;
    this.changed && project.register_change(true);
  }


  mousedrag(event) {

    const {project, consts} = this._scope;

    this.changed = true;

    if (this.mode == consts.move_shapes) {
      this._scope.canvas_cursor('cursor-arrow-small');

      let delta = event.point.subtract(this.mouseStartPos);
      if (!event.modifiers.shift){
        delta = delta.snap_to_angle(Math.PI*2/4);
      }
      this._scope.restore_selection_state(this.originalContent);
      project.move_points(delta, true);
      this._scope.clear_selection_bounds();
    }
    else if (this.mode == consts.move_points) {
      this._scope.canvas_cursor('cursor-arrow-small');

      let delta = event.point.subtract(this.mouseStartPos);
      if(!event.modifiers.shift) {
        delta = delta.snap_to_angle(Math.PI*2/4);
      }
      this._scope.restore_selection_state(this.originalContent);
      project.move_points(delta);
      this._scope.purge_selection();
    }
    else if (this.mode == consts.move_handle) {

      const delta = event.point.subtract(this.mouseStartPos);
      const noti = {
        type: consts.move_handle,
        profiles: [this.hitItem.item.parent],
        points: []
      };

      if (this.hitItem.type == 'handle-out') {
        let handlePos = this.originalHandleOut.add(delta);

        this.hitItem.segment.handleOut = handlePos;
        this.hitItem.segment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
      }
      else {
        let handlePos = this.originalHandleIn.add(delta);

        this.hitItem.segment.handleIn = handlePos;
        this.hitItem.segment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
      }

      noti.profiles[0].rays.clear();
      noti.profiles[0].layer.notify(noti);

      this._scope.purge_selection();
    }
    else if (this.mode == 'box-select') {
      this._scope.drag_rect(this.mouseStartPos, event.point);
    }
  }

  keydown(event) {

    const {project} = this._scope;
    const {key, modifiers} = event;
    const step = modifiers.shift ? 1 : 10;
    let j, segment, index, point, handle;

    if (key == '+' || key == 'insert') {

      for(let path of project.selectedItems){
        if (modifiers.space) {
          if(path.parent instanceof $p.EditorInvisible.Profile){

            const cnn_point = path.parent.cnn_point('e');
            cnn_point && cnn_point.profile && cnn_point.profile.rays.clear(true);
            path.parent.rays.clear(true);
            if(path.hasOwnProperty('insert')) {
              delete path.insert;
            }

            point = path.getPointAt(path.length * 0.5);
            const newpath = path.split(path.length * 0.5);
            path.lastSegment.point = path.lastSegment.point.add(newpath.getNormalAt(0));
            newpath.firstSegment.point = path.lastSegment.point;
            new $p.EditorInvisible.Profile({generatrix: newpath, proto: path.parent});
          }
        }
        else{
          let do_select = false;
          if(path.parent instanceof $p.EditorInvisible.GeneratrixElement && !(path instanceof $p.EditorInvisible.ProfileAddl)){
            for (let j = 0; j < path.segments.length; j++) {
              segment = path.segments[j];
              if (segment.selected){
                do_select = true;
                break;
              }
            }
            if(!do_select){
              j = 0;
              segment = path.segments[j];
              do_select = true;
            }
          }
          if(do_select){
            index = (j < (path.segments.length - 1) ? j + 1 : j);
            point = segment.curve.getPointAt(0.5, true);
            if(path.parent instanceof $p.EditorInvisible.Sectional){
              paper.Path.prototype.insert.call(path, index, new paper.Segment(point));
            }
            else{
              handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
              paper.Path.prototype.insert.call(path, index, new paper.Segment(point, handle.negate(), handle));
            }
          }
        }
      }

      event.stop();
      return false;


    } 
    else if (key == '-' || key == 'delete' || key == 'backspace') {

      if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
        return;

      project.selectedItems.some((path) => {

        let do_select = false;

        if(path.parent instanceof $p.EditorInvisible.DimensionLineCustom){
          path.parent.remove();
          return true;
        }
        else if(path.parent instanceof $p.EditorInvisible.GeneratrixElement){
          if(path instanceof $p.EditorInvisible.ProfileAddl){
            path.removeChildren();
            path.remove();
          }
          else{
            for (let j = 0; j < path.segments.length; j++) {
              segment = path.segments[j];
              do_select = do_select || segment.selected;
              if (segment.selected && segment != path.firstSegment && segment != path.lastSegment ){
                path.removeSegment(j);

                path.parent.x1 = path.parent.x1;
                break;
              }
            }
            if(!do_select){
              path = path.parent;
              path.removeChildren();
              path.remove();
            }
          }
        }
        else if(path instanceof $p.EditorInvisible.Filling){
          path.remove_onlays();
        }
      });

      event.stop();
      return false;

    }
    else if (key == 'left') {
      project.move_points(new paper.Point(-step, 0));
    }
    else if (key == 'right') {
      project.move_points(new paper.Point(step, 0));
    }
    else if (key == 'up') {
      project.move_points(new paper.Point(0, -step));
    }
    else if (key == 'down') {
      project.move_points(new paper.Point(0, step));
    }
  }

  testHot(type, event, mode) {
    if (mode == 'tool-direct-select'){
      return this.hitTest(event);
    }
  }

  hitTest({point}) {

    const hitSize = 6;
    const {project} = this._scope;
    this.hitItem = null;

    if (point) {

      this.hitItem = project.hitTest(point, {selected: true, fill: true, tolerance: hitSize});

      if (!this.hitItem){
        this.hitItem = project.hitTest(point, {fill: true, visible: true, tolerance: hitSize});
      }

      let hit = project.hitTest(point, {selected: true, handles: true, tolerance: hitSize});
      if (hit){
        this.hitItem = hit;
      }

      hit = project.hitPoints(point, 16, true);

      if (hit) {
        if (hit.item.parent instanceof $p.EditorInvisible.ProfileItem) {
          if (hit.item.parent.generatrix === hit.item){
            this.hitItem = hit;
          }
        }
        else{
          this.hitItem = hit;
        }
      }
    }

    const {hitItem} = this;
    if (hitItem) {
      if (hitItem.type == 'fill' || hitItem.type == 'stroke') {

        if (hitItem.item.parent instanceof $p.EditorInvisible.DimensionLine) {
        }
        else if (hitItem.item instanceof paper.PointText) {
          !(hitItem.item instanceof $p.EditorInvisible.EditableText) && this._scope.canvas_cursor('cursor-text');     
        }
        else if (hitItem.item.selected) {
          this._scope.canvas_cursor('cursor-arrow-small');
        }
        else {
          this._scope.canvas_cursor('cursor-arrow-white-shape');
        }
      }
      else if (hitItem.type == 'segment' || hitItem.type == 'handle-in' || hitItem.type == 'handle-out') {
        if (hitItem.segment.selected) {
          this._scope.canvas_cursor('cursor-arrow-small-point');
        }
        else {
          this._scope.canvas_cursor('cursor-arrow-white-point');
        }
      }
    }
    else {
      const hit = project.hitTest(point, {stroke: true, visible: true, tolerance: 16});
      if (hit && hit.item.parent instanceof $p.EditorInvisible.Sectional){
        this.hitItem = hit;
        this._scope.canvas_cursor('cursor-arrow-white-shape');
      }
      else{
        this._scope.canvas_cursor('cursor-arrow-white');
      }
    }

    return true;
  }

}


class ToolText extends ToolElement {

  constructor() {
    super();
    Object.assign(this, {
      options: {
        name: 'text',
        wnd: {
          caption: "Произвольный текст",
          width: 290,
          height: 290
        }
      },
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false
    });

    this.on({

      activate() {
        this.on_activate('cursor-text-select');
      },

      deactivate() {
        this._scope.hide_selection_bounds();
        this.detache_wnd();
      },

      mousedown(event) {
        this.text = null;
        this.changed = false;

        this.project.deselectAll();
        this.mouseStartPos = event.point.clone();

        if(this.hitItem) {

          if(this.hitItem.item instanceof paper.PointText) {
            this.text = this.hitItem.item;
            this.text.selected = true;

          }
          else {
            this.text = new $p.EditorInvisible.FreeText({
              parent: this.hitItem.item.layer.l_text,
              point: this.mouseStartPos,
              content: '...',
              selected: true
            });
          }

          this.textStartPos = this.text.point;

          if(!this.wnd || !this.wnd.elmnts) {
            $p.wsql.restore_options('editor', this.options);
            this.wnd = $p.iface.dat_blank(this._scope._dxw, this.options.wnd);
            this._grid = this.wnd.attachHeadFields({
              obj: this.text
            });
          }
          else {
            this._grid.attach({obj: this.text});
          }

        }
        else {
          this.detache_wnd();
        }

      },

      mouseup() {

        if (this.mode && this.changed) {
        }

        this._scope.canvas_cursor('cursor-arrow-lay');

      },

      mousedrag(event) {

        if (this.text) {
          let delta = event.point.subtract(this.mouseStartPos);
          if(event.modifiers.shift) {
            delta = delta.snap_to_angle();
          }
          this.text.move_points(this.textStartPos.add(delta));
        }
      },

      mousemove: this.hitTest,

      keydown(event) {

        if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

          if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1){
            return;
          }

          for (const text of  this.project.selectedItems) {
            if(text instanceof $p.EditorInvisible.FreeText){
              text.text = "";
              setTimeout(() => this._scope.view.update(), 100);
            }
          }

          event.preventDefault();
          return false;
        }
      }
    });
  }

  hitTest(event) {
    const hitSize = 6;
    const {project} = this;

    this.hitItem = project.hitTest(event.point, {class: paper.TextItem, bounds: true, fill: true, stroke: true, tolerance: hitSize});
    if(!this.hitItem) {
      this.hitItem = project.hitTest(event.point, {fill: true, stroke: false, tolerance: hitSize});
    }
    if(!this.hitItem) {
      const hit = project.hitTest(event.point, {fill: false, stroke: true, tolerance: hitSize});
      if(hit && hit.item.parent instanceof $p.EditorInvisible.Sectional) {
        this.hitItem = hit;
      }
    }

    if(this.hitItem) {
      if(this.hitItem.item instanceof paper.PointText) {
        this._scope.canvas_cursor('cursor-text');     
      }
      else {
        this._scope.canvas_cursor('cursor-text-add'); 
      }
    }
    else {
      this._scope.canvas_cursor('cursor-text-select');  
    }

    return true;
  }

}


$p.injected_data._mixin({"tip_select_node.html":"<div class=\"otooltip\">\r\n    <p class=\"otooltip\">Инструмент <b>Элемент и узел</b> позволяет:</p>\r\n    <ul class=\"otooltip\">\r\n        <li>Выделить элемент<br />для изменения его свойств или перемещения</li>\r\n        <li>Выделить отдельные узлы и рычаги узлов<br />для изменения геометрии</li>\r\n        <li>Добавить новый узел (изгиб)<br />(кнопка {+} на цифровой клавиатуре)</li>\r\n        <li>Удалить выделенный узел (изгиб)<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n        <li>Добавить новый элемент, делением текущего<br />(кнопка {+} при нажатой кнопке {пробел})</li>\r\n        <li>Удалить выделенный элемент<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n    </ul>\r\n    <hr />\r\n    <a title=\"Видеоролик, иллюстрирующий работу инструмента\" href=\"https://www.youtube.com/embed/UcBGQGqwUro?list=PLiVLBB_TTj5njgxk5E_EjwxzCGM4XyKlQ\" target=\"_blank\">\r\n        <i class=\"fa fa-video-camera fa-lg\"></i> Обучающее видео</a>\r\n    <a title=\"Справка по инструменту в WIKI\" href=\"http://www.oknosoft.ru/upzp/apidocs/classes/OTooolBar.html\" target=\"_blank\" style=\"margin-left: 9px;\">\r\n        <i class='fa fa-question-circle fa-lg'></i> Справка в wiki</a>\r\n</div>"});
return Editor;
}));
