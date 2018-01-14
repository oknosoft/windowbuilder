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

  constructor(cell, set_text, eve) {

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
      const contour = paper.project.getItem({cnstr: Number(id)});
      if(contour){
        contour.hidden = !state;
      }
      paper.project.register_update();
    });

    this.tree.attachEvent("onSelect", (id, mode) => {
      if(!mode){
        return;
      }
      const contour = paper.project.getItem({cnstr: Number(id)});
      if(contour){
        if(contour.project.activeLayer != contour){
          contour.activate(true);
        }
        set_text(this.layer_text(contour));
      }
    });

    this.listener = this.listener.bind(this);
    this.layer_activated = this.layer_activated.bind(this);
    this.contour_redrawed = this.contour_redrawed.bind(this);
    this.eve = eve.on({
      layer_activated: this.layer_activated,
      contour_redrawed: this.contour_redrawed,
      rows: this.listener,
    });

    this.layout.cells("a").setMinHeight(180);
    this.layout.cells("b").setMinHeight(180);
    this.layout.cells("a").setHeight(200);

  }

  layer_activated(contour) {
    if(contour && contour.cnstr && this.tree && this.tree.getSelectedId && contour.cnstr != this.tree.getSelectedId()){
      if(this.tree.items[contour.cnstr]){
        this.tree.selectItem(contour.cnstr);
        this._set_text(this.layer_text(contour));
      }
    };
  }

  contour_redrawed(contour, bounds) {
    if(this.tree && this.tree.setItemText){
      const text = this.layer_text(contour, bounds);
      this.tree.setItemText(contour.cnstr, text);
      if(contour.project.activeLayer == contour){
        this._set_text(text);
      };
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
    if (this.tree && this.tree.clearAll && fields.constructions){

      this.tree.clearAll();
      paper.project.contours.forEach((layer) => {
        this.load_layer(layer);
        this.tree.openItem(layer.cnstr);

      });

      this.tree.addItem("l_dimensions", "Размерные линии", 0);

      this.tree.addItem("l_connective", "Соединители", 0);

      this.tree.addItem("l_visualization", "Визуализация доп. элементов", 0);

      this.tree.addItem("l_text", "Комментарии", 0);

    }
  }

  drop_layer() {
    let cnstr = this.tree.getSelectedId(), l;
    if(cnstr){
      l = paper.project.getItem({cnstr: Number(cnstr)});
    }
    else if(l = paper.project.activeLayer){
      cnstr = l.cnstr;
    }
    if(cnstr && l){
      this.tree.deleteItem(cnstr);
      cnstr = l.parent ? l.parent.cnstr : 0;
      l.remove();
      setTimeout(() => {
        paper.project.zoom_fit();
        if(cnstr){
          this.tree.selectItem(cnstr);
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

  constructor(cell, eve) {
    this.layout = cell;
    this.attach = this.attach.bind(this);
    this.reload = this.reload.bind(this);
    this.on_refresh_prm_links = this.on_refresh_prm_links.bind(this);

    this.eve = eve.on({
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
    if(_grid && contour == _grid._obj){
      this.on_prm_change('0|0', null, true);
    }
  }

  on_prm_change(field, value, realy_changed) {

    const pnames = field && field.split('|');
    const {_grid} = this;

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
        paper.project.register_change();
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

  constructor(cell, eve) {

    this.layout = cell;

    this.reflect_changes = this.reflect_changes.bind(this);
    this.contour_redrawed = this.contour_redrawed.bind(this);
    this.scheme_snapshot = this.scheme_snapshot.bind(this);

    this.eve = eve.on({
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
    const {_obj, _reflect_id} = this;
    const {_calc_order_row} = scheme._attr;
    if(_obj && scheme == paper.project && !attr.clipboard && _calc_order_row){
      ["price_internal","amount_internal","price","amount"].forEach((fld) => {
        _obj[fld] = _calc_order_row[fld];
      });
    }
  }

  reflect_changes() {
    this._reflect_id = 0;
    const {_obj} = this;
    const {project} = paper;
    _obj.len = project.bounds.width.round(0);
    _obj.height = project.bounds.height.round(0);
    _obj.s = project.area;
  }

  attach(_obj) {

    if(!this.layout || !this.layout.attachHeadFields){
      return;
    }

    this._obj = _obj;

    $p.cat.clrs.selection_exclude_service($p.dp.buyers_order.metadata("clr"), _obj);

    this._grid && this._grid.destructor && this._grid.destructor();

    const is_dialer = !$p.current_user.role_available("СогласованиеРасчетовЗаказов") && !$p.current_user.role_available("РедактированиеСкидок");
    const oxml = {
      "Свойства": ["sys","clr",
        {id: "len", path: "o.len", synonym: "Ширина, мм", type: "ro"},
        {id: "height", path: "o.height", synonym: "Высота, мм", type: "ro"},
        {id: "s", path: "o.s", synonym: "Площадь, м²", type: "ro"}
      ]
    };

    if($p.wsql.get_user_param("hide_price_dealer")){
      oxml["Строка заказа"] = [
        "quantity",
        {id: "price", path: "o.price", synonym: "Цена", type: "ro"},
        {id: "discount_percent", path: "o.discount_percent", synonym: "Скидка %", type: is_dialer ? "ro" : "calck"},
        {id: "amount", path: "o.amount", synonym: "Сумма", type: "ro"},
        "note"
      ];
    }else{
      oxml["Строка заказа"] = [
        "quantity",
        {id: "price_internal", path: "o.price_internal", synonym: "Цена дилера", type: "ro"},
        {id: "discount_percent_internal", path: "o.discount_percent_internal", synonym: "Скидка дил %", type: "calck"},
        {id: "amount_internal", path: "o.amount_internal", synonym: "Сумма дилера", type: "ro"},
        {id: "price", path: "o.price", synonym: "Цена пост", type: "ro"},
        {id: "discount_percent", path: "o.discount_percent", synonym: "Скидка пост %", type: is_dialer ? "ro" : "calck"},
        {id: "amount", path: "o.amount", synonym: "Сумма пост", type: "ro"},
        "note"
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
        {name: 'delete', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: $p.msg.del_elm, float: 'right', paddingRight: '20px'}
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
              if(parent instanceof ProfileItem){
                parent.removeChildren();
                parent.remove();
              }
            });
            break;

          default:
            _editor.profile_align(name)
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
        {name: 'drop_layer', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить слой', float: 'right', paddingRight: '20px'}

      ], onclick: (name) => {

        switch(name) {

          case 'new_stv':
            const fillings = _editor.project.getItems({class: Filling, selected: true});
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

            new Contour({parent: undefined});

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
    }, _editor.eve);

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
        {name: 'refill', text: '<i class="fa fa-retweet fa-fw"></i>', tooltip: 'Обновить параметры', float: 'right', paddingRight: '20px'}

      ], onclick: (name) => {

        switch(name) {

          case 'refill':
            const {_obj} = this.stv._grid;
            _obj.furn.refill_prm(_obj);
            this.stv.reload();
            break;

          default:
            $p.msg.show_msg(name);
            break;
        }

        return false;
      }
    });
    this.stv = new StvProps(this._stv, _editor.eve);

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
    this.props = new SchemeProps(this._prod, _editor.eve);


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

};




class AdditionalInserts {

  constructor(cnstr, project, cell) {
    this.create_wnd(cnstr, project, cell);
  }

  create_wnd(cnstr, project, cell) {
    this._fields = $p.cat.characteristics.metadata("inserts").fields._clone();
    this._caption = $p.msg.additional_inserts;

    if(!cnstr){
      cnstr = 0;
      this._caption+= ' в изделие';
      this._fields.inset.choice_params[0].path = ["Изделие"];
    }
    else if(cnstr == 'elm'){
      cnstr = project.selected_elm;
      if(cnstr){
        project.ox.add_inset_params(cnstr.inset, -cnstr.elm, $p.utils.blank.guid);
        this._caption+= ' элем. №' + cnstr.elm;
        cnstr = -cnstr.elm;
        this._fields.inset.choice_params[0].path = ["Элемент"];
      }
      else{
        return;
      }
    }
    else if(cnstr == 'contour'){
      const {activeLayer} = project;
      cnstr = activeLayer.cnstr;
      this._caption+= ` в ${activeLayer.layer ? 'створку' : 'раму'} №${cnstr}`;
      this._fields.inset.choice_params[0].path = ["МоскитнаяСетка", "Подоконник", "Откос", "Контур"];
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

    this.wnd = cell || $p.iface.dat_blank(null, options.wnd);
    const {elmnts} = this.wnd;

    elmnts.layout = this.wnd.attachLayout({
      pattern: "2E",
      cells: [{
        id: "a",
        text: "Вставки",
        header: false,
        height: 160
      }, {
        id: "b",
        text: "Параметры",
        header: false
      }],
      offsets: {top: 0, right: 0, bottom: 0, left: 0}
    });
    elmnts.layout.cells("a").setMinHeight(140);
    elmnts.layout.cells("a").setHeight(160);

    elmnts.grids.inserts = elmnts.layout.cells("a").attachTabular({
      obj: project.ox,
      ts: "inserts",
      selection: {cnstr: cnstr},
      toolbar_struct: $p.injected_data["toolbar_add_del_compact.xml"],
      metadata: this._fields,
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

    elmnts.grids.params = elmnts.layout.cells("b").attachHeadFields({
      obj: project.ox,
      ts: "params",
      selection: this.get_selection(),
      oxml: {
        "Параметры": []
      },
      ts_title: "Параметры"
    });

    if(cell){
      elmnts.layout.cells("a").getAttachedToolbar().addText($p.utils.generate_guid(), 3, options.wnd.caption);
    }

    this.refill_prms = this.refill_prms.bind(this);
    elmnts.grids.inserts.attachEvent("onRowSelect", this.refill_prms);
    elmnts.grids.inserts.attachEvent("onEditCell", (stage, rId, cInd) => {
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
        return {cnstr, inset: row.obj.inset}
      }
    }
    return {cnstr, inset: $p.utils.generate_guid()}
  }

  refill_prms(){
    const {inserts, params} = this.wnd.elmnts.grids;
    if(params && inserts){
      params.selection = this.get_selection();
      const row = inserts.get_cell_field();
      if(row && !row.obj.inset.empty()){
        $p.cat.clrs.selection_exclude_service(this._fields.clr, row.obj.inset);
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
      } catch (e) {
        return;
      }

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
        if(el.parent instanceof Profile) {
          el = el.parent;
        }
        if(el instanceof BuilderElement && sitems.indexOf(el) == -1) {
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
};



class Editor extends paper.PaperScope {

  constructor(pwnd, handlers){

    super();

    const _editor = this;

    this.activate();

    consts.tune_paper(this.settings);

    this.__define('_pwnd', {
      get: function () {
        return pwnd;
      }
    });

    this.eve = new (Object.getPrototypeOf($p.md.constructor))();

    this._layout = pwnd.attachLayout({
      pattern: "2U",
      cells: [{
        id: "a",
        text: "Изделие",
        header: false
      }, {
        id: "b",
        text: "Инструменты",
        collapsed_text: "Инструменты",
        width: (pwnd.getWidth ? pwnd.getWidth() : pwnd.cell.offsetWidth) > 1200 ? 440 : 260
      }],
      offsets: { top: 28, right: 0, bottom: 0, left: 0}
    })

    this._wrapper = document.createElement('div');

    this._layout.cells("a").attachObject(_editor._wrapper);
    this._dxw.attachViewportTo(_editor._wrapper);

    this._wrapper.oncontextmenu = (event) => $p.iface.cancel_bubble(event, true);

    this._drawSelectionBounds = 0;


    this._keybrd = new Keybrd(this);

    this._undo = new UndoRedo(this);

    this._acc = new EditorAccordion(_editor, _editor._layout.cells("b"));

    this.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '14px', left: '2px', name: 'left', height: '294px',
      image_path: '/imgs/',
      buttons: [
        {name: 'select_node', css: 'tb_icon-arrow-white', title: $p.injected_data['tip_select_node.html']},
        {name: 'pan', css: 'tb_icon-hand', tooltip: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
        {name: 'zoom_fit', css: 'tb_cursor-zoom', tooltip: 'Вписать в окно'},
        {name: 'pen', css: 'tb_cursor-pen-freehand', tooltip: 'Добавить профиль'},
        {name: 'lay_impost', css: 'tb_cursor-lay-impost', tooltip: 'Вставить раскладку или импосты'},
        {name: 'arc', css: 'tb_cursor-arc-r', tooltip: 'Арка {Crtl}, {Alt}, {Пробел}'},
        {name: 'cut', css: 'tb_cursor-cut', tooltip: 'Разрыв T-соединения'},
        {name: 'ruler', css: 'tb_ruler_ui', tooltip: 'Позиционирование и сдвиг'},
        {name: 'grid', css: 'tb_grid', tooltip: 'Таблица координат'},
        {name: 'text', css: 'tb_text', tooltip: 'Произвольный текст'},
      ],
      onclick: (name) => _editor.select_tool(name),
      on_popup: (popup, bdiv) => {
        popup.show(dhx4.absLeft(bdiv), 0, bdiv.offsetWidth, _editor._wrapper.offsetHeight);
        popup.p.style.top = (dhx4.absTop(bdiv) - 20) + "px";
        popup.p.querySelector(".dhx_popup_arrow").style.top = "20px";
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
        {name: 'dxf', text: 'DXF', tooltip: 'Экспорт в DXF', float: 'left'},

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
          var fillings = _editor.project.getItems({class: Filling, selected: true});
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

        case 'triangle3':
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

    this.tb_top.buttons.paste.classList.add("disabledbutton");
    this.tb_top.buttons.paste_prop.classList.add("disabledbutton");

    this._layout.base.style.backgroundColor = "#f5f5f5";
    this.tb_top.cell.style.background = "transparent";
    this.tb_top.cell.style.boxShadow = "none";

    this.on_keydown = this.on_keydown.bind(this);
    document.body.addEventListener('keydown', this.on_keydown, false);

    this.eve.on("characteristic_saved", (scheme, attr) => {
      if(attr.close){
        this.close();
      }
      else{
        this.set_text();
      }
    });

    this.eve.on("coordinates_calculated", this.set_text.bind(this));

    this.on_del_row = this.on_del_row.bind(this);
    $p.cat.characteristics.on("del_row", this.on_del_row);



    new function ZoomFit() {

      const tool = new paper.Tool();
      tool.options = {name: 'zoom_fit'};
      tool.on({
        activate: function () {
          _editor.project.zoom_fit();

          const previous = _editor.tb_left.get_selected();

          if(previous){
            return _editor.select_tool(previous.replace("left_", ""));
          }
        }
      });

      return tool;
    };

    new ToolSelectNode();

    new ToolPan();

    new ToolArc();

    new ToolCut();

    new ToolPen();

    new ToolLayImpost();

    new ToolText();

    new ToolRuler();

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
    }
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

    const _scheme = new Scheme(_canvas, _editor);
    const pwnd_resize_finish = () => {
      _editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
    };

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
    _mousepos.className = "mousepos";
    _scheme.view.on('mousemove', (event) => {
      const {bounds} = _scheme;
      if(bounds){
        _mousepos.innerHTML = "x:" + (event.point.x - bounds.x).toFixed(0) +
          " y:" + (bounds.height + bounds.y - event.point.y).toFixed(0);
      }
    });

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

        if (evt.shiftKey || evt.ctrlKey) {
          if(evt.shiftKey && !evt.deltaX){
            _editor.view.center = this.changeCenter(_editor.view.center, evt.deltaY, 0, 1);
          }
          else{
            _editor.view.center = this.changeCenter(_editor.view.center, evt.deltaX, evt.deltaY, 1);
          }
          return evt.preventDefault();
        }
        else if (evt.altKey) {
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

  canvas_cursor(name) {
    this.projects.forEach((_scheme) => {
      for(let i=0; i<_scheme.view.element.classList.length; i++){
        const class_name = _scheme.view.element.classList[i];
        if(class_name == name)
          return;
        else if((/\bcursor-\S+/g).test(class_name))
          _scheme.view.element.classList.remove(class_name);
      }
      _scheme.view.element.classList.add(name);
    })
  }

  select_tool(name) {
    this.tools.some((tool) => {
      if(tool.options.name == name){
        tool.activate();
        return true;
      }
    })
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

  segments_in_rect(rect) {
    var segments = [];

    function checkPathItem(item) {
      if (item._locked || !item._visible || item._guide)
        return;
      var children = item.children || [];
      if (!rect.intersects(item.bounds))
        return;
      if (item instanceof paper.Path) {

        if(item.parent instanceof ProfileItem){
          if(item != item.parent.generatrix)
            return;

          for (var i = 0; i < item.segments.length; i++) {
            if (rect.contains(item.segments[i].point))
              segments.push(item.segments[i]);
          }
        }

      } else {
        for (var j = children.length-1; j >= 0; j--)
          checkPathItem(children[j]);
      }
    }

    this.project.getItems({class: Contour}).forEach(checkPathItem);

    return segments;
  }

  purge_selection(){
    let selected = this.project.selectedItems;
    const deselect = selected.filter((path) => path.parent instanceof ProfileItem && path != path.parent.generatrix);
    while(selected = deselect.pop()){
      selected.selected = false;
    }
  }

  elm(num) {
    return this.project.getItem({class: BuilderElement, elm: num});
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
    })
  }

  paths_intersecting_rect(rect) {

    const paths = [];
    const boundingRect = new paper.Path.Rectangle(rect);

    this.project.getItems({class: ProfileItem}).forEach((item) => {
      if (rect.contains(item.generatrix.bounds)) {
        paths.push(item.generatrix);
        return;
      }
    });

    boundingRect.remove();

    return paths;
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

  additional_inserts(cnstr, cell){
    new AdditionalInserts(cnstr, this.project, cell)
  }

  profile_radius(){

    const elm = this.project.selected_elm;

    if(elm instanceof ProfileItem){

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

      if(this.glass_align()){
        return
      }

      const layer = this.project.rootLayer();

      layer.profiles.forEach((profile) => {

        const {b, e} = profile;
        const bcnn = profile.cnn_point("b");
        const ecnn = profile.cnn_point("e");

        if(bcnn.profile){
          const d = bcnn.profile.e.getDistance(b);
          if(d && d < consts.sticking_l){
            bcnn.profile.e = b;
          }
        }
        if(ecnn.profile){
          const d = ecnn.profile.b.getDistance(e);
          if(d && d < consts.sticking_l){
            ecnn.profile.b = e;
          }
        }

        let mid;

        if(profile.orientation == $p.enm.orientations.vert){

          mid = b.x + e.x / 2;

          if(mid < layer.bounds.center.x){
            mid = Math.min(profile.x1, profile.x2);
            profile.x1 = profile.x2 = mid;
          }
          else{
            mid = Math.max(profile.x1, profile.x2);
            profile.x1 = profile.x2 = mid;
          }

        }else if(profile.orientation == $p.enm.orientations.hor){

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

  }

  profile_group_align(name, profiles) {

    let	coordin = name == 'left' || name == 'bottom' ? Infinity : 0;

    if(!profiles){
      profiles = this.project.selected_profiles();
    }

    if(!profiles.length){
      return
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

    const {project, Point, Key} = this;

    if(!glasses){
      glasses = project.selected_glasses();
    }
    if(glasses.length < 2){
      return
    }

    let layer;
    if(glasses.some((glass) => {
        const gl = project.rootLayer(glass.layer);
        if(!layer){
          layer = gl;
        }
        else if(layer != gl){
          $p.msg.show_msg({
            type: "alert-info",
            text: "Заполнения принадлежат разным рамным контурам",
            title: "Выравнивание"
          });
          return true
        }
      })){
      return;
    }

    if(name == 'auto'){
      name = 'width'
    }

    const orientation = name == 'width' ? $p.enm.orientations.vert : $p.enm.orientations.hor;
    const shift = layer.profiles.filter((impost) => {
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
      }
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
              res.left = profile
            }
            else{
              res.right = profile
            }
          }
          else{
            gl.dy.add(res);
            if(point.y < bounds.center.y){
              res.top = profile
            }
            else{
              res.bottom = profile
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
    })

    return res;
  }

  glass_align(name = 'auto', glasses) {

    const shift = this.do_glass_align(name, glasses);
    if(!shift){
      return
    }

    const {_attr} = this.project;
    if(!_attr._align_counter){
      _attr._align_counter = 1;
    }
    if(_attr._align_counter > 12){
      _attr._align_counter = 0;
      return
    }

    if(shift.some((delta) => delta.length > 0.3)){
      _attr._align_counter++;
      this.project.contours.forEach((l) => l.redraw());
      return this.glass_align(name, glasses);
    }
    else{
      _attr._align_counter = 0;
    }
  }

  on_del_row({grid, tabular_section}) {
    if(tabular_section == 'inserts'){
      const {project} = this;
      const {obj} = grid.get_cell_field() || {};
      if(obj && obj._owner._owner == project.ox){
        project.ox.params.clear({cnstr: obj.cnstr, inset: obj.inset});
        project.register_change();
      }
    }
  }

  on_keydown(ev) {
    this.eve.emit('keydown', ev);
  }

  clear_selection_bounds() {
    if (this._selectionBoundsShape) {
      this._selectionBoundsShape.remove();
    }
    this._selectionBoundsShape = null;
  }

  hide_selection_bounds() {
    if (this._drawSelectionBounds > 0)
      this._drawSelectionBounds--;
    if (this._drawSelectionBounds == 0) {
      if (this._selectionBoundsShape)
        this._selectionBoundsShape.visible = false;
    }
  }

  prompt(loc) {
    const {ox} = this.project;
    return (ox && ox._modified) ? `Изделие ${ox.prod_name(true)} изменено.\n\nЗакрыть без сохранения?` : true;
  }

  close() {
    const {ox} = this.project;
    const {calc_order} = ox;
    if(calc_order && !calc_order.empty()){
      this.handlers.handleNavigate(`/${calc_order.class_name}/${calc_order.ref}/?ref=${ox.ref}`);
    }
    else{
      this.handlers.handleNavigate(`/`);
    }
  }

  unload() {
    const {tool, tools, tb_left, tb_top, _acc, _undo, _pwnd, eve, project, on_keydown, on_del_row} = this;

    eve.removeAllListeners();
    $p.cat.characteristics.off("del_row", on_del_row);
    document.body.removeEventListener('keydown', on_keydown);

    if(tool && tool._callbacks.deactivate.length){
      tool._callbacks.deactivate[0].call(tool);
    }
    for(const fld in tools){
      tools[fld] && tools[fld].remove && tools[fld].remove();
      tools[fld] = null;
    }
    _acc.unload();
    _undo.unload();
    tb_left.unload();
    tb_top.unload();
    project.unload();
    _pwnd.detachAllEvents();
    _pwnd.detachObject(true);
    for(const fld in this){
      delete this[fld];
    }
  }

};


$p.Editor = Editor;


class GlassInserts {

  constructor(glasses) {

    const elm = glasses.length && glasses[0];

    if(!(elm instanceof Filling)){
      return $p.msg.show_msg({
        type: "alert-info",
        text: $p.msg.glass_invalid_elm,
        title: $p.msg.glass_spec
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

    this.wnd = $p.iface.dat_blank(null, options.wnd);

    this.wnd.elmnts.grids.inserts = this.wnd.attachTabular({
      obj: project.ox,
      ts: "glass_specification",
      selection: {elm: elm.elm},
      toolbar_struct: $p.injected_data["toolbar_glass_inserts.xml"],
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
    grids.inserts && grids.inserts.editStop();

    for(let i = 1; i < glasses.length; i++) {
      const selm = glasses[i];
      const {glass_specification} = elm.project.ox;
      glass_specification.clear({elm: selm.elm});
      glass_specification.find_rows({elm: elm.elm}, (row) => {
        glass_specification.add({
          elm: selm.elm,
          inset: row.inset,
          clr: row.clr
        })
      })
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
          })
        }
      });
    }
  }
}


class Keybrd {

  constructor(_editor){

  }

}


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
    const curr = _diff[0]._clone();
    for (let i = 1; i < _diff.length && i <= pos; i++) {
      _diff[i].forEach((change) => {
        DeepDiff.applyChange(curr, true, change);
      });
    }
    return curr;
  }


  save_snapshot(scheme) {
    const curr = scheme.ox._obj._clone(['_row', 'extra_fields', 'glasses', 'specification', 'predefined_name']);
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




const AbstractFilling = (superclass) => class extends superclass {

  is_pos(pos) {
    if(this.project.contours.count == 1 || this.parent){
      return true;
    }

    let res = Math.abs(this.bounds[pos] - this.project.bounds[pos]) < consts.sticking_l;

    if(!res){
      let rect;
      if(pos == "top"){
        rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.topRight.add([0, -200]));
      }
      else if(pos == "left"){
        rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.bottomLeft.add([-200, 0]));
      }
      else if(pos == "right"){
        rect = new paper.Rectangle(this.bounds.topRight, this.bounds.bottomRight.add([200, 0]));
      }
      else if(pos == "bottom"){
        rect = new paper.Rectangle(this.bounds.bottomLeft, this.bounds.bottomRight.add([0, 200]));
      }

      res = !this.project.contours.some((l) => {
        return l != this && rect.intersects(l.bounds);
      });
    }

    return res;
  }

  profiles_by_side(side, profiles) {
    if(!profiles){
      profiles = this.profiles;
    }
    const bounds = {
      left: Infinity,
      top: Infinity,
      bottom: -Infinity,
      right: -Infinity
    };
    const res = {};
    const ares = [];

    function by_side(name) {
      ares.some((elm) => {
        if(elm[name] == bounds[name]){
          res[name] = elm.profile;
          return true;
        }
      })
    }

    if (profiles.length) {
      profiles.forEach((profile) => {
        const {b, e} = profile;
        const x = b.x + e.x;
        const y = b.y + e.y;
        if(x < bounds.left){
          bounds.left = x;
        }
        if(x > bounds.right){
          bounds.right = x;
        }
        if(y < bounds.top){
          bounds.top = y;
        }
        if(y > bounds.bottom){
          bounds.bottom = y;
        }
        ares.push({
          profile: profile,
          left: x,
          top: y,
          bottom: y,
          right: x
        });
      });
      if (side) {
        by_side(side);
        return res[side];
      }

      Object.keys(bounds).forEach(by_side);
    }

    return res;
  }

  get contours() {
    return this.children.filter((elm) => elm instanceof Contour);
  }

  get l_dimensions() {
    const {_attr} = this;
    return _attr._dimlns || (_attr._dimlns = new DimensionDrawer({parent: this}));
  }

  get dimension_bounds() {
    let {bounds} = this;
    this.getItems({class: DimensionLineCustom}).forEach((dl) => {
      bounds = bounds.unite(dl.bounds);
    });
    return bounds;
  }

}



class GlassSegment {

  constructor(profile, b, e, outer) {

    this.profile = profile;
    this.b = b.clone();
    this.e = e.clone();
    this.outer = !!outer;

    this.segment();

  }

  segment() {

    let gen;

    if (this.profile.children.some((addl) => {

        if (addl instanceof ProfileAddl && this.outer == addl.outer) {

          if (!gen) {
            gen = this.profile.generatrix;
          }

          const b = this.profile instanceof ProfileAddl ? this.profile.b : this.b;
          const e = this.profile instanceof ProfileAddl ? this.profile.e : this.e;


          if (b.is_nearest(gen.getNearestPoint(addl.b), true) && e.is_nearest(gen.getNearestPoint(addl.e), true)) {
            this.profile = addl;
            this.outer = false;
            return true;
          }
        }
      })) {

      this.segment();
    }

  }

  get _sub() {
    const {sub_path} = this;
    return {
      get b() {
        return sub_path ? sub_path.firstSegment.point : new paper.Point();
      },
      set b(v) {
        sub_path && (sub_path.firstSegment.point = v);
      },
      get e() {
        return sub_path ? sub_path.lastSegment.point : new paper.Point();
      },
      set e(v) {
        sub_path && (sub_path.lastSegment.point = v);
      },
    };
  }
}

class Contour extends AbstractFilling(paper.Layer) {

  constructor(attr) {

    super({parent: attr.parent});

    this._attr = {};

    const {ox, l_connective} = this.project;

    if (attr.row) {
      this._row = attr.row;
    }
    else {
      const {constructions} = ox;
      this._row = constructions.add({parent: attr.parent ? attr.parent.cnstr : 0});
      this._row.cnstr = constructions.aggregate([], ['cnstr'], 'MAX') + 1;
    }

    const {cnstr} = this;
    if (cnstr) {

      const {coordinates} = ox;

      coordinates.find_rows({cnstr, elm_type: {in: $p.enm.elm_types.profiles}}, (row) => new Profile({row, parent: this}));

      coordinates.find_rows({cnstr, elm_type: {in: $p.enm.elm_types.glasses}}, (row) => new Filling({row, parent: this}));

      coordinates.find_rows({cnstr, elm_type: $p.enm.elm_types.Водоотлив}, (row) => new Sectional({row, parent: this}));

      coordinates.find_rows({cnstr, elm_type: $p.enm.elm_types.Текст}, (row) => new FreeText({row, parent: this.l_text}));
    }

    l_connective.bringToFront();

  }

  activate(custom) {
    this.project._activeLayer = this;
    if (this._row) {
      this.notify(this, 'layer_activated', !custom);
      this.project.register_update();
    }
  }


  get furn() {
    return this._row.furn;
  }

  set furn(v) {
    if (this._row.furn == v) {
      return;
    }

    this._row.furn = v;

    if (this.direction.empty()) {
      this.project._dp.sys.furn_params.find_rows({
        param: $p.job_prm.properties.direction,
      }, function (row) {
        this.direction = row.value;
        return false;
      }.bind(this._row));
    }

    this._row.furn.refill_prm(this);

    this.project.register_change(true);

    this.notify(this, 'furn_changed');
  }

  glasses(hide, glass_only) {
    return this.children.filter((elm) => {
      if ((!glass_only && elm instanceof Contour) || elm instanceof Filling) {
        if (hide) {
          elm.visible = false;
        }
        return true;
      }
    });
  }

  get fillings() {
    const fillings = [];
    for(const glass of this.glasses()){
      if(glass instanceof Contour){
        fillings.push.apply(fillings, glass.fillings);
      }
      else{
        fillings.push(glass);
      }
    }
    return fillings;
  }

  get glass_contours() {
    const segments = this.glass_segments;
    const res = [];
    let curr, acurr;

    function find_next(curr) {
      if (!curr.anext) {
        curr.anext = [];
        segments.forEach((segm) => {
          if (segm == curr || segm.profile == curr.profile)
            return;
          if (curr.e.is_nearest(segm.b) && curr.profile.has_cnn(segm.profile, segm.b)) {

            if (segments.length < 3 || curr.e.subtract(curr.b).getDirectedAngle(segm.e.subtract(segm.b)) >= 0)
              curr.anext.push(segm);
          }

        });
      }
      return curr.anext;
    }

    function go_go(segm) {
      const anext = find_next(segm);
      for (let i = 0; i < anext.length; i++) {
        if (anext[i] == curr) {
          return anext;
        }
        else if (acurr.every((el) => el != anext[i])) {
          acurr.push(anext[i]);
          return go_go(anext[i]);
        }
      }
    }

    while (segments.length) {

      curr = segments[0];
      acurr = [curr];
      if (go_go(curr) && acurr.length > 1) {
        res.push(acurr);
      }

      acurr.forEach((el) => {
        const ind = segments.indexOf(el);
        if (ind != -1) {
          segments.splice(ind, 1);
        }
      });
    }

    return res;
  }

  glass_nodes(path, nodes, bind) {
    const curve_nodes = [];
    const path_nodes = [];
    const ipoint = path.interiorPoint.negate();
    let curve, findedb, findede, d, node1, node2;

    if (!nodes) {
      nodes = this.nodes;
    }

    for (let i in path.curves) {
      curve = path.curves[i];

      let d1 = Infinity;
      let d2 = Infinity;
      nodes.forEach((n) => {
        if ((d = n.getDistance(curve.point1, true)) < d1) {
          d1 = d;
          node1 = n;
        }
        if ((d = n.getDistance(curve.point2, true)) < d2) {
          d2 = d;
          node2 = n;
        }
      });

      if (path_nodes.indexOf(node1) == -1)
        path_nodes.push(node1);
      if (path_nodes.indexOf(node2) == -1)
        path_nodes.push(node2);

      if (!bind)
        continue;

      if (node1 == node2)
        continue;
      findedb = false;
      for (let n in curve_nodes) {
        if (curve_nodes[n].node1 == node1 && curve_nodes[n].node2 == node2) {
          findedb = true;
          break;
        }
      }
      if (!findedb) {
        findedb = this.profile_by_nodes(node1, node2);
        const loc1 = findedb.generatrix.getNearestLocation(node1);
        const loc2 = findedb.generatrix.getNearestLocation(node2);
        if (node1.add(ipoint).getDirectedAngle(node2.add(ipoint)) < 0)
          curve_nodes.push({
            node1: node2,
            node2: node1,
            profile: findedb,
            out: loc2.index == loc1.index ? loc2.parameter > loc1.parameter : loc2.index > loc1.index,
          });
        else
          curve_nodes.push({
            node1: node1,
            node2: node2,
            profile: findedb,
            out: loc1.index == loc2.index ? loc1.parameter > loc2.parameter : loc1.index > loc2.index,
          });
      }
    }

    this.sort_nodes(curve_nodes);

    return path_nodes;
  }

  glass_recalc() {
    const {glass_contours} = this;      
    const glasses = this.glasses(true); 
    const binded = new Set();

    function calck_rating(glcontour, glass) {

      const {outer_profiles} = glass;

      let crating = 0;

      if (outer_profiles.length) {
        glcontour.some((cnt) => {
          outer_profiles.some((curr) => {
            if (cnt.profile == curr.profile &&
              cnt.b.is_nearest(curr.b) &&
              cnt.e.is_nearest(curr.e)) {
              crating++;
              return true;
            }
          });
          if (crating > 2) {
            return true;
          }
        });
      }
      else {
        const {nodes} = glass;
        glcontour.some((cnt) => {
          nodes.some((node) => {
            if (cnt.b.is_nearest(node)) {
              crating++;
              return true;
            }
          });
          if (crating > 2) {
            return true;
          }
        });
      }

      return crating;

    }

    glasses.forEach((glass) => {
      if (glass.visible) {
        return;
      }
      glass_contours.some((glcontour) => {
        if (binded.has(glcontour)) {
          return;
        }
        if (calck_rating(glcontour, glass) > 2) {
          glass.path = glcontour;
          glass.visible = true;
          if (glass instanceof Filling) {
            glass.redraw();
          }
          binded.add(glcontour);
          return true;
        }
      });
    });

    glass_contours.forEach((glcontour) => {

      if (binded.has(glcontour)) {
        return;
      }

      let rating = 0, glass, crating, cglass, glass_center;

      for (let g in glasses) {

        glass = glasses[g];
        if (glass.visible) {
          continue;
        }

        crating = calck_rating(glcontour, glass);

        if (crating > rating || !cglass) {
          rating = crating;
          cglass = glass;
        }
        if (crating == rating && cglass != glass) {
          if (!glass_center) {
            glass_center = glcontour.reduce((sum, val) => sum.add(val.b), new paper.Point).divide(glcontour.length);
          }
          if (glass_center.getDistance(glass.bounds.center, true) < glass_center.getDistance(cglass.bounds.center, true)) {
            cglass = glass;
          }
        }
      }

      if (cglass || (cglass = this.getItem({class: Filling, visible: false}))) {
        cglass.path = glcontour;
        cglass.visible = true;
        if (cglass instanceof Filling) {
          cglass.redraw();
        }
      }
      else {
        if (glass = this.getItem({class: Filling})) {

        }
        else if (glass = this.project.getItem({class: Filling})) {

        }
        else {

        }
        cglass = new Filling({proto: glass, parent: this, path: glcontour});
        cglass.redraw();
      }
    });
  }

  get glass_segments() {
    const nodes = [];

    function fn_sort(a, b) {
      const da = this.getOffsetOf(a.point);
      const db = this.getOffsetOf(b.point);
      if (da < db) {
        return -1;
      }
      else if (da > db) {
        return 1;
      }
      return 0;
    }

    this.profiles.forEach((p) => {

      const sort = fn_sort.bind(p.generatrix);

      const ip = p.joined_imposts();
      const pb = p.cnn_point('b');
      const pe = p.cnn_point('e');

      const pbg = pb.is_t && pb.profile.d0 ? pb.profile.generatrix.getNearestPoint(p.b) : p.b;
      const peg = pe.is_t && pe.profile.d0 ? pe.profile.generatrix.getNearestPoint(p.e) : p.e;

      if (ip.inner.length) {

        ip.inner.sort(sort);

        if (!pb.is_i && !pbg.is_nearest(ip.inner[0].point)) {
          nodes.push(new GlassSegment(p, pbg, ip.inner[0].point));
        }

        for (let i = 1; i < ip.inner.length; i++) {
          nodes.push(new GlassSegment(p, ip.inner[i - 1].point, ip.inner[i].point));
        }

        if (!pe.is_i && !ip.inner[ip.inner.length - 1].point.is_nearest(peg)) {
          nodes.push(new GlassSegment(p, ip.inner[ip.inner.length - 1].point, peg));
        }

      }
      if (ip.outer.length) {

        ip.outer.sort(sort);

        if (!pb.is_i && !ip.outer[0].point.is_nearest(pbg)) {
          nodes.push(new GlassSegment(p, ip.outer[0].point, pbg, true));
        }

        for (let i = 1; i < ip.outer.length; i++) {
          nodes.push(new GlassSegment(p, ip.outer[i].point, ip.outer[i - 1].point, true));
        }

        if (!pe.is_i && !peg.is_nearest(ip.outer[ip.outer.length - 1].point)) {
          nodes.push(new GlassSegment(p, peg, ip.outer[ip.outer.length - 1].point, true));
        }
      }

      if (!ip.inner.length) {
        if (!pb.is_i && !pe.is_i) {
          nodes.push(new GlassSegment(p, pbg, peg));
        }
      }

      if (!ip.outer.length && (pb.is_cut || pe.is_cut || pb.is_t || pe.is_t)) {
        if (!pb.is_i && !pe.is_i) {
          nodes.push(new GlassSegment(p, peg, pbg, true));
        }
      }

    });

    return nodes;
  }

  get is_rectangular() {
    return (this.side_count != 4) || !this.profiles.some((profile) => {
      return !(profile.is_linear() && Math.abs(profile.angle_hor % 90) < 0.2);
    });
  }

  move(delta) {
    const {contours, profiles, project} = this;
    const crays = (p) => p.rays.clear();
    this.translate(delta);
    contours.forEach((elm) => elm.profiles.forEach(crays));
    profiles.forEach(crays);
    project.register_change();
  }

  get nodes() {
    const nodes = [];
    this.profiles.forEach((p) => {
      let findedb;
      let findede;
      nodes.forEach((n) => {
        if (p.b.is_nearest(n)) {
          findedb = true;
        }
        if (p.e.is_nearest(n)) {
          findede = true;
        }
      });
      if (!findedb) {
        nodes.push(p.b.clone());
      }
      if (!findede) {
        nodes.push(p.e.clone());
      }
    });
    return nodes;
  }


  notify(obj, type = 'update') {
    if (obj.type) {
      type = obj.type;
    }
    this.project._scope.eve.emit_async(type, obj);
    type === consts.move_points && this.project.register_change();
  }

  get outer_nodes() {
    return this.outer_profiles.map((v) => v.elm);
  }

  get outer_profiles() {
    const {profiles} = this;
    const to_remove = [];
    const res = [];

    let findedb, findede;

    for (let i = 0; i < profiles.length; i++) {
      const elm = profiles[i];
      if (elm._attr.simulated)
        continue;
      findedb = false;
      findede = false;
      for (let j = 0; j < profiles.length; j++) {
        if (profiles[j] == elm)
          continue;
        if (!findedb && elm.has_cnn(profiles[j], elm.b) && elm.b.is_nearest(profiles[j].e))
          findedb = true;
        if (!findede && elm.has_cnn(profiles[j], elm.e) && elm.e.is_nearest(profiles[j].b))
          findede = true;
      }
      if (!findedb || !findede)
        to_remove.push(elm);
    }
    for (let i = 0; i < profiles.length; i++) {
      const elm = profiles[i];
      if (to_remove.indexOf(elm) != -1)
        continue;
      elm._attr.binded = false;
      res.push({
        elm: elm,
        profile: elm.nearest(),
        b: elm.b,
        e: elm.e,
      });
    }
    return res;
  }

  profile_by_furn_side(side, cache) {

    if (!cache || !cache.profiles) {
      cache = {
        profiles: this.outer_nodes,
        bottom: this.profiles_by_side('bottom'),
      };
    }

    const profile_node = this.direction == $p.enm.open_directions.Правое ? 'b' : 'e';
    const other_node = profile_node == 'b' ? 'e' : 'b';

    let profile = cache.bottom;

    const next = () => {
      side--;
      if (side <= 0) {
        return profile;
      }

      cache.profiles.some((curr) => {
        if (curr[other_node].is_nearest(profile[profile_node])) {
          profile = curr;
          return true;
        }
      });

      return next();
    };

    return next();

  }


  profile_by_nodes(n1, n2, point) {
    const profiles = this.profiles;
    for (let i = 0; i < profiles.length; i++) {
      const {generatrix} = profiles[i];
      if (generatrix.getNearestPoint(n1).is_nearest(n1) && generatrix.getNearestPoint(n2).is_nearest(n2)) {
        if (!point || generatrix.getNearestPoint(point).is_nearest(point))
          return profiles[i];
      }
    }
  }

  remove() {
    const {children, _row, cnstr} = this;
    while (children.length) {
      children[0].remove();
    }

    if (_row) {
      const {ox} = this.project;
      ox.coordinates.clear({cnstr});
      ox.params.clear({cnstr});

      if (ox === _row._owner._owner) {
        _row._owner.del(_row);
      }
      this._row = null;
    }

    super.remove();
  }

  get _manager() {
    return this.project._dp._manager;
  }

  _metadata(fld) {

    const {tabular_sections} = this.project.ox._metadata();
    const _xfields = tabular_sections.constructions.fields;

    return fld ? (_xfields[fld] || tabular_sections[fld]) : {
      fields: {
        furn: _xfields.furn,
        direction: _xfields.direction,
        h_ruch: _xfields.h_ruch,
      },
      tabular_sections: {
        params: tabular_sections.params,
      },
    };

  }

  get bounds() {
    const {_attr, parent} = this;
    if (!_attr._bounds || !_attr._bounds.width || !_attr._bounds.height) {

      this.profiles.forEach((profile) => {
        const path = profile.path && profile.path.segments.length ? profile.path : profile.generatrix;
        if (path) {
          _attr._bounds = _attr._bounds ? _attr._bounds.unite(path.bounds) : path.bounds;
          if (!parent) {
            const {d0} = profile;
            if (d0) {
              _attr._bounds = _attr._bounds.unite(profile.generatrix.bounds);
            }
          }
        }
      });

      if (!_attr._bounds) {
        _attr._bounds = new paper.Rectangle();
      }
    }
    return _attr._bounds;
  }

  get cnstr() {
    return this._row ? this._row.cnstr : 0;
  }

  set cnstr(v) {
    this._row && (this._row.cnstr = v);
  }

  get dimension_bounds() {
    let bounds = super.dimension_bounds;
    const ib = this.l_visualization._by_insets.bounds;
    if (ib.height && ib.bottom > bounds.bottom) {
      const delta = ib.bottom - bounds.bottom + 10;
      bounds = bounds.unite(
        new paper.Rectangle(bounds.bottomLeft, bounds.bottomRight.add([0, delta < 250 ? delta * 1.1 : delta * 1.2]))
      );
    }
    return bounds;
  }

  get direction() {
    return this._row.direction;
  }

  set direction(v) {
    this._row.direction = v;
    this.project.register_change(true);
  }

  zoom_fit() {
    const {strokeBounds, view} = this;
    if (strokeBounds) {
      let {width, height, center} = strokeBounds;
      if (width < 800) {
        width = 800;
      }
      if (height < 800) {
        height = 800;
      }
      width += 120;
      height += 120;
      view.zoom = Math.min(view.viewSize.height / height, view.viewSize.width / width);
      const shift = (view.viewSize.width - width * view.zoom);
      view.center = center.add([shift, 40]);
    }
  }

  draw_cnn_errors() {

    const {l_visualization} = this;

    if (l_visualization._cnn) {
      l_visualization._cnn.removeChildren();
    }
    else {
      l_visualization._cnn = new paper.Group({parent: l_visualization});
    }

    const err_attrs = {
      strokeColor: 'red',
      strokeWidth: 2,
      strokeCap: 'round',
      strokeScaling: false,
      dashOffset: 4,
      dashArray: [4, 4],
      guide: true,
      parent: l_visualization._cnn,
    };

    this.glasses(false, true).forEach((elm) => {
      let err;
      elm.profiles.forEach(({cnn, sub_path}) => {
        if (!cnn) {
          Object.assign(sub_path, err_attrs);
          err = true;
        }
      });
      if (err) {
        elm.fill_error();
      }
      else {
        elm.path.fillColor = BuilderElement.clr_by_clr.call(elm, elm._row.clr, false);
      }
    });

    this.profiles.forEach((elm) => {
      const {_corns, _rays} = elm._attr;
      _rays.b.check_err(err_attrs);
      _rays.e.check_err(err_attrs);
      if (elm.nearest() && (!elm._attr._nearest_cnn || elm._attr._nearest_cnn.empty())) {
        Object.assign(elm.path.get_subpath(_corns[1], _corns[2]), err_attrs);
      }
      elm.addls.forEach((elm) => {
        if (elm.nearest() && (!elm._attr._nearest_cnn || elm._attr._nearest_cnn.empty())) {
          Object.assign(elm.path.get_subpath(_corns[1], _corns[2]), err_attrs);
        }
      });
    });
  }

  draw_mosquito() {
    const {l_visualization} = this;
    this.project.ox.inserts.find_rows({cnstr: this.cnstr}, (row) => {
      if (row.inset.insert_type == $p.enm.inserts_types.МоскитнаяСетка) {
        const props = {
          parent: new paper.Group({parent: l_visualization._by_insets}),
          strokeColor: 'grey',
          strokeWidth: 3,
          dashArray: [6, 4],
          strokeScaling: false,
        };
        let sz, imposts;
        row.inset.specification.forEach((rspec) => {
          if (!sz && rspec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру && rspec.nom.elm_type == $p.enm.elm_types.Рама) {
            sz = rspec.sz;
          }
          if (!imposts && rspec.count_calc_method == $p.enm.count_calculating_ways.ПоШагам && rspec.nom.elm_type == $p.enm.elm_types.Импост) {
            imposts = rspec;
          }
        });

        const perimetr = [];
        if (typeof sz != 'number') {
          sz = 20;
        }
        this.outer_profiles.forEach((curr) => {
          const profile = curr.profile || curr.elm;
          const is_outer = Math.abs(profile.angle_hor - curr.elm.angle_hor) > 60;
          const ray = is_outer ? profile.rays.outer : profile.rays.inner;
          const segm = ray.get_subpath(curr.b, curr.e).equidistant(sz);
          perimetr.push(Object.assign(segm, props));
        });

        const count = perimetr.length - 1;
        perimetr.forEach((curr, index) => {
          const prev = index == 0 ? perimetr[count] : perimetr[index - 1];
          const next = index == count ? perimetr[0] : perimetr[index + 1];
          const b = curr.getIntersections(prev);
          const e = curr.getIntersections(next);
          if (b.length) {
            curr.firstSegment.point = b[0].point;
          }
          if (e.length) {
            curr.lastSegment.point = e[0].point;
          }
        });

        const {elm_font_size} = consts;
        const {bounds} = props.parent;
        new paper.PointText({
          parent: props.parent,
          fillColor: 'black',
          fontSize: consts.elm_font_size,
          guide: true,
          content: row.inset.presentation,
          point: bounds.bottomLeft.add([elm_font_size * 1.2, -elm_font_size * 0.4]),
        });

        if (imposts) {
          const {offsets, do_center, step} = imposts;

          function add_impost(y) {
            const impost = Object.assign(new paper.Path({
              insert: false,
              segments: [[bounds.left, y], [bounds.right, y]],
            }), props);
            const {length} = impost;
            perimetr.forEach((curr) => {
              const aloc = curr.getIntersections(impost);
              if (aloc.length) {
                const l1 = impost.firstSegment.point.getDistance(aloc[0].point);
                const l2 = impost.lastSegment.point.getDistance(aloc[0].point);
                if (l1 < length / 2) {
                  impost.firstSegment.point = aloc[0].point;
                }
                if (l2 < length / 2) {
                  impost.lastSegment.point = aloc[0].point;
                }
              }
            });
          }

          if (step) {
            const height = bounds.height - offsets;
            if (height >= step) {
              if (do_center) {
                add_impost(bounds.centerY);
              }
              else {
                for (let y = step; y < height; y += step) {
                  add_impost(y);
                }
              }
            }
          }
        }

        return false;
      }
    });
  }

  draw_sill() {
    const {l_visualization, project, cnstr} = this;
    const {ox} = project;
    const {properties} = $p.job_prm;
    if (!properties) {
      return;
    }
    const {length, width} = $p.job_prm.properties;

    ox.inserts.find_rows({cnstr}, (row) => {
      if (row.inset.insert_type == $p.enm.inserts_types.Подоконник) {

        const bottom = this.profiles_by_side('bottom');
        let vlen, vwidth;
        ox.params.find_rows({cnstr: cnstr, inset: row.inset}, (prow) => {
          if (prow.param == length) {
            vlen = prow.value;
          }
          if (prow.param == width) {
            vwidth = prow.value;
          }
        });
        if (!vlen) {
          vlen = bottom.length + 160;
        }
        if (vwidth) {
          vwidth = vwidth * 0.7;
        }
        else {
          vwidth = 200;
        }
        const delta = (vlen - bottom.length) / 2;

        new paper.Path({
          parent: new paper.Group({parent: l_visualization._by_insets}),
          strokeColor: 'grey',
          fillColor: BuilderElement.clr_by_clr(row.clr),
          shadowColor: 'grey',
          shadowBlur: 20,
          shadowOffset: [10, 20],
          opacity: 0.7,
          strokeWidth: 1,
          strokeScaling: false,
          closed: true,
          segments: [
            bottom.b.add([delta, 0]),
            bottom.e.add([-delta, 0]),
            bottom.e.add([-delta - vwidth, vwidth]),
            bottom.b.add([delta - vwidth, vwidth]),
          ],
        });

        return false;
      }
    });
  }

  draw_opening() {

    const _contour = this;
    const {l_visualization, furn} = this;

    if (!this.parent || !$p.enm.open_types.is_opening(furn.open_type)) {
      if (l_visualization._opening && l_visualization._opening.visible)
        l_visualization._opening.visible = false;
      return;
    }

    const cache = {
      profiles: this.outer_nodes,
      bottom: this.profiles_by_side('bottom'),
    };

    function rotary_folding() {

      const {_opening} = l_visualization;
      const {side_count} = _contour;

      furn.open_tunes.forEach((row) => {

        if (row.rotation_axis) {
          const axis = _contour.profile_by_furn_side(row.side, cache);
          const other = _contour.profile_by_furn_side(
            row.side + 2 <= side_count ? row.side + 2 : row.side - 2, cache);

          _opening.moveTo(axis.corns(3));
          _opening.lineTo(other.rays.inner.getPointAt(other.rays.inner.length / 2));
          _opening.lineTo(axis.corns(4));

        }
      });
    }

    function sliding() {
      const {center} = _contour.bounds;
      const {_opening} = l_visualization;

      if (_contour.direction == $p.enm.open_directions.Правое) {
        _opening.moveTo(center.add([-100, 0]));
        _opening.lineTo(center.add([100, 0]));
        _opening.moveTo(center.add([30, 30]));
        _opening.lineTo(center.add([100, 0]));
        _opening.lineTo(center.add([30, -30]));
      }
      else {
        _opening.moveTo(center.add([100, 0]));
        _opening.lineTo(center.add([-100, 0]));
        _opening.moveTo(center.add([-30, 30]));
        _opening.lineTo(center.add([-100, 0]));
        _opening.lineTo(center.add([-30, -30]));
      }
    }

    if (!l_visualization._opening) {
      l_visualization._opening = new paper.CompoundPath({
        parent: _contour.l_visualization,
        strokeColor: 'black',
      });
    }
    else {
      l_visualization._opening.removeChildren();
    }

    return furn.is_sliding ? sliding() : rotary_folding();

  }

  draw_visualization(rows) {

    const {profiles, l_visualization, contours} = this;
    const glasses = this.glasses(false, true);
    l_visualization._by_spec.removeChildren();

    if(!rows){
      rows = [];
      this.project.ox.specification.find_rows({dop: -1}, (row) => rows.push(row));
    }

    for(const row of rows){
      if(!profiles.some((elm) => {
          if (row.elm == elm.elm) {
            row.nom.visualization.draw(elm, l_visualization, row.len * 1000);
            return true;
          }
        })){
        glasses.some((elm) => {
          if (row.elm == elm.elm) {
            row.nom.visualization.draw(elm, l_visualization, row.len * 1000, row.width * 1000);
            return true;
          }
        })
      }
    }

    for(const contour of contours){
      contour.draw_visualization(rows);
    }

  }

  get hidden() {
    return !!this._hidden;
  }

  set hidden(v) {
    if (this.hidden != v) {
      this._hidden = v;
      const visible = !this._hidden;
      this.children.forEach((elm) => {
        if (elm instanceof BuilderElement) {
          elm.visible = visible;
        }
      });
      this.l_visualization.visible = visible;
      this.l_dimensions.visible = visible;
    }

  }

  hide_generatrix() {
    this.profiles.forEach((elm) => {
      elm.generatrix.visible = false;
    });
  }

  get imposts() {
    return this.getItems({class: Profile}).filter((elm) => {
      const {b, e} = elm.rays;
      return b.is_tt || e.is_tt || b.is_i || e.is_i;
    });
  }

  get params() {
    return this.project.ox.params;
  }

  get path() {
    return this.bounds;
  }

  set path(attr) {
    if (!Array.isArray(attr)) {
      return;
    }

    const noti = {type: consts.move_points, profiles: [], points: []};
    const {outer_nodes} = this;

    let need_bind = attr.length,
      available_bind = outer_nodes.length,
      elm, curr;

    function set_node(n) {
      if (!curr[n].is_nearest(elm[n], 0)) {
        elm.rays.clear(true);
        elm[n] = curr[n];
        if (noti.profiles.indexOf(elm) == -1) {
          noti.profiles.push(elm);
        }
        if (!noti.points.some((point) => point.is_nearest(elm[n], 0))) {
          noti.points.push(elm[n]);
        }
      }
    }

    if (need_bind) {
      for (let i = 0; i < attr.length; i++) {
        curr = attr[i];             
        for (let j = 0; j < outer_nodes.length; j++) {
          elm = outer_nodes[j];   
          if (elm._attr.binded) {
            continue;
          }
          if (curr.profile.is_nearest(elm)) {
            elm._attr.binded = true;
            curr.binded = true;
            need_bind--;
            available_bind--;

            set_node('b');
            set_node('e');

            break;
          }
        }
      }
    }

    if (need_bind) {
      for (let i = 0; i < attr.length; i++) {
        curr = attr[i];
        if (curr.binded)
          continue;
        for (let j = 0; j < outer_nodes.length; j++) {
          elm = outer_nodes[j];
          if (elm._attr.binded)
            continue;
          if (curr.b.is_nearest(elm.b, true) || curr.e.is_nearest(elm.e, true)) {
            elm._attr.binded = true;
            curr.binded = true;
            need_bind--;
            available_bind--;

            set_node('b');
            set_node('e');

            break;
          }
        }
      }
    }

    if (need_bind && available_bind) {
      for (let i = 0; i < attr.length; i++) {
        curr = attr[i];
        if (curr.binded)
          continue;
        for (let j = 0; j < outer_nodes.length; j++) {
          elm = outer_nodes[j];
          if (elm._attr.binded)
            continue;
          elm._attr.binded = true;
          curr.binded = true;
          need_bind--;
          available_bind--;

          set_node('b');
          set_node('e');

          break;
        }
      }
    }

    if (need_bind) {
      for (let i = 0; i < attr.length; i++) {
        curr = attr[i];
        if (curr.binded) {
          continue;
        }
        elm = new Profile({
          generatrix: curr.profile.generatrix.get_subpath(curr.b, curr.e),
          proto: outer_nodes.length ? outer_nodes[0] : {parent: this, clr: curr.profile.clr},
        });
        elm._attr._nearest = curr.profile;
        elm._attr.binded = true;
        elm._attr.simulated = true;

        curr.profile = elm;
        delete curr.outer;
        curr.binded = true;

        noti.profiles.push(elm);
        noti.points.push(elm.b);
        noti.points.push(elm.e);

        need_bind--;
      }
    }

    if (available_bind) {
      outer_nodes.forEach((elm) => {
        if (!elm._attr.binded) {
          elm.rays.clear(true);
          elm.remove();
          available_bind--;
        }
      });
    }

    this.profiles.forEach((p) => p.default_inset());

    if (noti.points.length) {
      this.profiles.forEach((p) => p._attr._rays && p._attr._rays.clear());
      this.notify(noti);
    }

    this._attr._bounds = null;
  }

  get perimeter() {
    const res = [];
    this.outer_profiles.forEach((curr) => {
      const tmp = curr.sub_path ? {
        len: curr.sub_path.length,
        angle: curr.e.subtract(curr.b).angle,
      } : {
        len: curr.elm.length,
        angle: curr.elm.angle_hor,
      };
      res.push(tmp);
      if (tmp.angle < 0) {
        tmp.angle += 360;
      }
      tmp.angle_hor = tmp.angle;
      tmp.profile = curr.profile || curr.elm;
    });
    return res;
  }

  perimeter_inner(size) {
    const {center} = this.bounds;
    const res = this.outer_profiles.map((curr) => {
      const profile = curr.profile || curr.elm;
      const {inner, outer} = profile.rays;
      const sub_path = inner.getNearestPoint(center).getDistance(center, true) < outer.getNearestPoint(center).getDistance(center, true) ?
        inner.get_subpath(inner.getNearestPoint(curr.b), inner.getNearestPoint(curr.e)) : outer.get_subpath(outer.getNearestPoint(curr.b), outer.getNearestPoint(curr.e));
      const tmp = {
        profile,
        sub_path,
        angle: curr.e.subtract(curr.b).angle,
        b: curr.b,
        e: curr.e,
      };
      if (tmp.angle < 0) {
        tmp.angle += 360;
      }
      ;
      return tmp;
    });
    const ubound = res.length - 1;
    return res.map((curr, index) => {
      let sub_path = curr.sub_path.equidistant(size);
      const prev = !index ? res[ubound] : res[index - 1];
      const next = (index == ubound) ? res[0] : res[index + 1];
      const b = sub_path.intersect_point(prev.sub_path.equidistant(size), curr.b, true);
      const e = sub_path.intersect_point(next.sub_path.equidistant(size), curr.e, true);
      if (b && e) {
        sub_path = sub_path.get_subpath(b, e);
      }
      return {
        profile: curr.profile,
        angle: curr.angle,
        len: sub_path.length,
        sub_path,
      };
    });
  }

  bounds_inner(size) {
    const path = new paper.Path({insert: false});
    for (let curr of this.perimeter_inner(size)) {
      path.addSegments(curr.sub_path.segments);
    }
    if (path.segments.length && !path.closed) {
      path.closePath(true);
    }
    path.reduce();
    return path.bounds;
  }

  get pos() {

  }

  get profiles() {
    return this.children.filter((elm) => elm instanceof Profile);
  }

  get sectionals() {
    return this.children.filter((elm) => elm instanceof Sectional);
  }

  redraw(on_redrawed) {

    if (!this.visible) {
      return;
    }

    this._attr._bounds = null;

    const {l_visualization} = this;

    l_visualization._by_insets.removeChildren();
    !this.project._attr._saving && l_visualization._by_spec.removeChildren();

    this.profiles.forEach((elm) => elm.redraw());

    this.glass_recalc();

    this.draw_opening();

    this.contours.forEach((elm) => elm.redraw());

    this.draw_cnn_errors();

    this.draw_mosquito();

    this.draw_sill();

    this.sectionals.forEach((elm) => elm.redraw());

    this.notify(this, 'contour_redrawed', this._attr._bounds);

  }

  refresh_prm_links() {

    const {cnstr} = this;
    let notify;

    this.params.find_rows({
      cnstr: cnstr || -9999,
      inset: $p.utils.blank.guid,
      hide: {not: true},
    }, (prow) => {
      const {param} = prow;
      const links = param.params_links({grid: {selection: {cnstr}}, obj: prow});
      const hide = links.some((link) => link.hide);

      if (links.length && param.linked_values(links, prow)) {
        notify = true;
        prow._manager.emit_async('update', prow, {value: prow._obj.value});
      }
      if (!notify) {
        notify = hide;
      }
    });

    notify && this.notify(this, 'refresh_prm_links');

  }

  save_coordinates(short) {

    if (!short) {
      this.glasses(false, true).forEach((glass) => !glass.visible && glass.remove());

      const {l_text, l_dimensions} = this;
      for (let elm of this.children) {
        if (elm.save_coordinates) {
          elm.save_coordinates();
        }
        else if (elm == l_text || elm == l_dimensions) {
          elm.children.forEach((elm) => elm.save_coordinates && elm.save_coordinates());
        }
      }
    }

    const {bounds} = this;
    this._row.x = bounds ? bounds.width.round(4) : 0;
    this._row.y = bounds ? bounds.height.round(4) : 0;
    this._row.is_rectangular = this.is_rectangular;
    if (this.parent) {
      this._row.w = this.w.round(4);
      this._row.h = this.h.round(4);
    }
    else {
      this._row.w = 0;
      this._row.h = 0;
    }
  }

  sort_nodes(nodes) {
    if (!nodes.length) {
      return nodes;
    }
    let prev = nodes[0];
    const res = [prev];
    let couner = nodes.length + 1;

    while (res.length < nodes.length && couner) {
      couner--;
      for (let i = 0; i < nodes.length; i++) {
        const curr = nodes[i];
        if (res.indexOf(curr) != -1)
          continue;
        if (prev.node2 == curr.node1) {
          res.push(curr);
          prev = curr;
          break;
        }
      }
    }
    if (couner) {
      nodes.length = 0;
      for (let i = 0; i < res.length; i++) {
        nodes.push(res[i]);
      }
      res.length = 0;
    }
  }


  get furn_cache() {
    return {
      profiles: this.outer_nodes,
      bottom: this.profiles_by_side('bottom'),
      ox: this.project.ox,
      w: this.w,
      h: this.h,
    };
  }

  handle_line(elm) {

    const {bounds, h_ruch} = this;
    const by_side = this.profiles_by_side();
    return (elm == by_side.top || elm == by_side.bottom) ?
      new paper.Path({
        insert: false,
        segments: [[bounds.left + h_ruch, bounds.top - 200], [bounds.left + h_ruch, bounds.bottom + 200]],
      }) :
      new paper.Path({
        insert: false,
        segments: [[bounds.left - 200, bounds.bottom - h_ruch], [bounds.right + 200, bounds.bottom - h_ruch]],
      });

  }

  update_handle_height(cache, from_setter) {

    const {furn, _row, project} = this;
    const {furn_set, handle_side} = furn;
    if (!handle_side || furn_set.empty()) {
      return;
    }

    if (!cache) {
      cache = this.furn_cache;
      cache.ignore_formulas = true;
    }

    const elm = this.profile_by_furn_side(handle_side, cache);
    if (!elm) {
      return;
    }

    const {len} = elm._row;
    let handle_height;

    function set_handle_height(row) {
      const {handle_height_base, fix_ruch} = row;
      if (handle_height_base < 0) {
        if (fix_ruch || _row.fix_ruch != -3) {
          _row.fix_ruch = fix_ruch ? -2 : -1;
          return handle_height = (len / 2).round(0);
        }
      }
      else if (handle_height_base > 0) {
        if (fix_ruch || _row.fix_ruch != -3) {
          _row.fix_ruch = fix_ruch ? -2 : -1
          return handle_height = handle_height_base;
        }
      }
    }

    furn.furn_set.specification.find_rows({dop: 0}, (row) => {

      if (!row.quantity || !row.check_restrictions(this, cache)) {
        return;
      }
      if (set_handle_height(row)) {
        return false;
      }
      if (row.is_set_row) {
        let ok = false;
        row.nom.get_spec(this, cache, true).each((sub_row) => {
          if (set_handle_height(sub_row)) {
            return !(ok = true);
          }
        });
        if (ok) {
          return false;
        }
      }
    });

    if(handle_height && !from_setter && _row.h_ruch != handle_height){
      _row.h_ruch = handle_height;
      project._dp._manager.emit('update', this, {h_ruch: true});
    }
    return handle_height;
  }

  get h_ruch() {
    const {layer, _row} = this;
    return layer ? _row.h_ruch : 0;
  }

  set h_ruch(v) {
    const {layer, _row, project} = this;

    if (layer) {
      const old_fix_ruch = _row.fix_ruch;
      if (old_fix_ruch == -3) {
        _row.fix_ruch = -1;
      }
      const h_ruch = this.update_handle_height(null, true);
      if(h_ruch && (old_fix_ruch != -3 || v == 0)){
        _row.h_ruch = h_ruch;
      }

      if (v != 0 && [0, -1, -3].indexOf(_row.fix_ruch) != -1) {
        _row.h_ruch = v;
        if (_row.fix_ruch == -1 && v != h_ruch) {
          _row.fix_ruch = -3;
        }
      }
      project.register_change();
    }
    else {
      _row.h_ruch = 0;
    }
    project._dp._manager.emit('update', this, {h_ruch: true});
  }

  get side_count() {
    return this.profiles.length;
  }

  get w() {
    const {is_rectangular, bounds} = this;
    const {left, right} = this.profiles_by_side();
    return bounds ? bounds.width - left.nom.sizefurn - right.nom.sizefurn : 0;
  }

  get h() {
    const {is_rectangular, bounds} = this;
    const {top, bottom} = this.profiles_by_side();
    return bounds ? bounds.height - top.nom.sizefurn - bottom.nom.sizefurn : 0;
  }

  get l_text() {
    const {_attr} = this;
    return _attr._txt || (_attr._txt = new paper.Group({parent: this}));
  }

  get l_visualization() {
    const {_attr} = this;
    if (!_attr._visl) {
      _attr._visl = new paper.Group({parent: this, guide: true});
      _attr._visl._by_insets = new paper.Group({parent: _attr._visl});
      _attr._visl._by_spec = new paper.Group({parent: _attr._visl});
    }
    return _attr._visl;
  }

  get opacity() {
    return this.children.length ? this.children[0].opacity : 1;
  }

  set opacity(v) {
    this.children.forEach((elm) => {
      if (elm instanceof BuilderElement)
        elm.opacity = v;
    });
  }

  on_remove_elm(elm) {
    if (this.parent) {
      this.parent.on_remove_elm(elm);
    }
    if (elm instanceof Profile && !this.project._attr._loading) {
      this.l_dimensions.clear();
    }
  }

  on_insert_elm(elm) {
    if (this.parent) {
      this.parent.on_remove_elm(elm);
    }
    if (elm instanceof Profile && !this.project._attr._loading) {
      this.l_dimensions.clear();
    }
  }

  on_sys_changed() {
    this.profiles.forEach((elm) => elm.default_inset(true));

    this.glasses().forEach((elm) => {
      if (elm instanceof Contour) {
        elm.on_sys_changed();
      }
      else {
        if (elm.thickness < elm.project._dp.sys.tmin || elm.thickness > elm.project._dp.sys.tmax)
          elm._row.inset = elm.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
        elm.profiles.forEach((curr) => {
          if (!curr.cnn || !curr.cnn.check_nom2(curr.profile))
            curr.cnn = $p.cat.cnns.elm_cnn(elm, curr.profile, $p.enm.cnn_types.acn.ii);
        });
      }
    });
  }

}

Editor.Contour = Contour;



class DimensionGroup {

  clear() {
    for (let key in this) {
      this[key].removeChildren();
      this[key].remove();
      delete this[key];
    }
  }

  has_size(size) {
    for (let key in this) {
      const {path} = this[key];
      if(path && Math.abs(path.length - size) < 1) {
        return true;
      }
    }
  }

}

class DimensionLayer extends paper.Layer {

  get bounds() {
    return this.project.bounds;
  }

  get owner_bounds() {
    return this.bounds;
  }

  get dimension_bounds() {
    return this.project.dimension_bounds;
  }

}

class DimensionDrawer extends paper.Group {

  constructor(attr) {
    super(attr);
    this.bringToFront();
  }

  clear() {

    this.ihor && this.ihor.clear();
    this.ivert && this.ivert.clear();

    for (let pos of ['bottom', 'top', 'right', 'left']) {
      if(this[pos]) {
        this[pos].removeChildren();
        this[pos].remove();
        this[pos] = null;
      }
    }

    this.layer && this.layer.parent && this.layer.parent.l_dimensions.clear();
  }

  redraw(forse) {

    const {parent} = this;
    const {contours, bounds} = parent;

    if(forse) {
      this.clear();
    }

    for (let chld of parent.contours) {
      chld.l_dimensions.redraw();
    }

    if(!parent.parent || forse) {

      const by_side = parent.profiles_by_side();
      if(!Object.keys(by_side).length) {
        return this.clear();
      }


      const ihor = [
        {
          point: bounds.top.round(0),
          elm: by_side.top,
          p: by_side.top.b.y < by_side.top.e.y ? 'b' : 'e'
        },
        {
          point: bounds.bottom.round(0),
          elm: by_side.bottom,
          p: by_side.bottom.b.y < by_side.bottom.e.y ? 'b' : 'e'
        }];
      const ivert = [
        {
          point: bounds.left.round(0),
          elm: by_side.left,
          p: by_side.left.b.x > by_side.left.e.x ? 'b' : 'e'
        },
        {
          point: bounds.right.round(0),
          elm: by_side.right,
          p: by_side.right.b.x > by_side.right.e.x ? 'b' : 'e'
        }];

      const profiles = new Set(parent.profiles);
      parent.imposts.forEach((elm) => elm.visible && profiles.add(elm));

      for (let elm of profiles) {

        const our = !elm.parent || elm.parent === parent;
        const eb = our ? (elm instanceof GlassSegment ? elm._sub.b : elm.b) : elm.rays.b.npoint;
        const ee = our ? (elm instanceof GlassSegment ? elm._sub.e : elm.e) : elm.rays.e.npoint;

        if(ihor.every((v) => v.point != eb.y.round(0))) {
          ihor.push({
            point: eb.y.round(0),
            elm: elm,
            p: 'b'
          });
        }
        if(ihor.every((v) => v.point != ee.y.round(0))) {
          ihor.push({
            point: ee.y.round(0),
            elm: elm,
            p: 'e'
          });
        }
        if(ivert.every((v) => v.point != eb.x.round(0))) {
          ivert.push({
            point: eb.x.round(0),
            elm: elm,
            p: 'b'
          });
        }
        if(ivert.every((v) => v.point != ee.x.round(0))) {
          ivert.push({
            point: ee.x.round(0),
            elm: elm,
            p: 'e'
          });
        }
      }

      if(ihor.length > 2) {
        ihor.sort((a, b) => b.point - a.point);
        if(parent.is_pos('right')) {
          this.by_imposts(ihor, this.ihor, 'right');
        }
        else if(parent.is_pos('left')) {
          this.by_imposts(ihor, this.ihor, 'left');
        }
      }
      else {
        ihor.length = 0;
      }

      if(ivert.length > 2) {
        ivert.sort((a, b) => a.point - b.point);
        if(parent.is_pos('bottom')) {
          this.by_imposts(ivert, this.ivert, 'bottom');
        }
        else if(parent.is_pos('top')) {
          this.by_imposts(ivert, this.ivert, 'top');
        }
      }
      else {
        ivert.length = 0;
      }

      this.by_contour(ihor, ivert, forse);

    }

    for (let dl of this.children) {
      dl.redraw && dl.redraw();
    }

  }

  by_imposts(arr, collection, pos) {
    const offset = (pos == 'right' || pos == 'bottom') ? -130 : 90;
    for (let i = 0; i < arr.length - 1; i++) {
      if(!collection[i]) {
        collection[i] = new DimensionLine({
          pos: pos,
          elm1: arr[i].elm instanceof GlassSegment ? arr[i].elm._sub : arr[i].elm,
          p1: arr[i].p,
          elm2: arr[i + 1].elm instanceof GlassSegment ? arr[i + 1].elm._sub : arr[i + 1].elm,
          p2: arr[i + 1].p,
          parent: this,
          offset: offset,
          impost: true
        });
      }
    }
  }

  by_contour(ihor, ivert, forse) {

    const {project, parent} = this;
    const {bounds} = parent;


    if(project.contours.length > 1 || forse) {

      if(parent.is_pos('left') && !parent.is_pos('right') && project.bounds.height != bounds.height) {
        if(!this.ihor.has_size(bounds.height)) {
          if(!this.left) {
            this.left = new DimensionLine({
              pos: 'left',
              parent: this,
              offset: ihor.length > 2 ? 220 : 90,
              contour: true
            });
          }
          else {
            this.left.offset = ihor.length > 2 ? 220 : 90;
          }
        }
      }
      else {
        if(this.left) {
          this.left.remove();
          this.left = null;
        }
      }

      if(parent.is_pos('right') && (project.bounds.height != bounds.height || forse)) {
        if(!this.ihor.has_size(bounds.height)) {
          if(!this.right) {
            this.right = new DimensionLine({
              pos: 'right',
              parent: this,
              offset: ihor.length > 2 ? -260 : -130,
              contour: true
            });
          }
          else {
            this.right.offset = ihor.length > 2 ? -260 : -130;
          }
        }
      }
      else {
        if(this.right) {
          this.right.remove();
          this.right = null;
        }
      }

      if(parent.is_pos('top') && !parent.is_pos('bottom') && project.bounds.width != bounds.width) {
        if(!this.ivert.has_size(bounds.width)) {
          if(!this.top) {
            this.top = new DimensionLine({
              pos: 'top',
              parent: this,
              offset: ivert.length > 2 ? 220 : 90,
              contour: true
            });
          }
          else {
            this.top.offset = ivert.length > 2 ? 220 : 90;
          }
        }
      }
      else {
        if(this.top) {
          this.top.remove();
          this.top = null;
        }
      }

      if(parent.is_pos('bottom') && (project.bounds.width != bounds.width || forse)) {
        if(!this.ivert.has_size(bounds.width)) {
          if(!this.bottom) {
            this.bottom = new DimensionLine({
              pos: 'bottom',
              parent: this,
              offset: ivert.length > 2 ? -260 : -130,
              contour: true
            });
          }
          else {
            this.bottom.offset = ivert.length > 2 ? -260 : -130;
          }
        }
      }
      else {
        if(this.bottom) {
          this.bottom.remove();
          this.bottom = null;
        }
      }

    }
  }

  get owner_bounds() {
    return this.parent.bounds;
  }

  get dimension_bounds() {
    return this.parent.dimension_bounds;
  }

  get ihor() {
    return this._ihor || (this._ihor = new DimensionGroup());
  }

  get ivert() {
    return this._ivert || (this._ivert = new DimensionGroup());
  }
}



class DimensionLine extends paper.Group {

  constructor(attr) {

    super({parent: attr.parent});

    const _attr = this._attr = {};

    this._row = attr.row;

    if(this._row && this._row.path_data){
      attr._mixin(JSON.parse(this._row.path_data));
      if(attr.elm1){
        attr.elm1 = this.project.getItem({elm: attr.elm1});
      }
      if(attr.elm2){
        attr.elm2 = this.project.getItem({elm: attr.elm2});
      }
    }

    _attr.pos = attr.pos;
    _attr.elm1 = attr.elm1;
    _attr.elm2 = attr.elm2 || _attr.elm1;
    _attr.p1 = attr.p1 || "b";
    _attr.p2 = attr.p2 || "e";
    _attr.offset = attr.offset;

    if(attr.impost){
      _attr.impost = true;
    }

    if(attr.contour){
      _attr.contour = true;
    }

    if(!_attr.pos && (!_attr.elm1 || !_attr.elm2)){
      this.remove();
      return null;
    }

    new paper.Path({parent: this, name: 'callout1', strokeColor: 'black', guide: true});
    new paper.Path({parent: this, name: 'callout2', strokeColor: 'black', guide: true});
    new paper.Path({parent: this, name: 'scale', strokeColor: 'black', guide: true});
    new paper.PointText({
      parent: this,
      name: 'text',
      justification: 'center',
      fillColor: 'black',
      fontSize: 72});

    this.on({
      mouseenter: this._mouseenter,
      mouseleave: this._mouseleave,
      click: this._click
    });

    this._sizes_wnd = this._sizes_wnd.bind(this);
    this.eve.on("sizes_wnd", this._sizes_wnd);

  }

  _metadata() {
    return $p.dp.builder_text.metadata();
  }

  get _manager() {
    return $p.dp.builder_text;
  }

  _mouseenter() {
    paper.canvas_cursor('cursor-arrow-ruler');
  }

  _mouseleave() {
  }

  _click(event) {
    event.stop();
    this.wnd = new RulerWnd(null, this);
    this.wnd.size = this.size;
  }

  _move_points(event, xy) {

    let _bounds, delta;

    const {_attr} = this;

    if(_attr.elm1){

      _bounds = {};

      const p1 = (_attr.elm1._sub || _attr.elm1)[_attr.p1];
      const p2 = (_attr.elm2._sub || _attr.elm2)[_attr.p2];

      if(this.pos == "top" || this.pos == "bottom"){
        const size = Math.abs(p1.x - p2.x);
        if(event.name == "right"){
          delta = new paper.Point(event.size - size, 0);
          _bounds[event.name] = Math.max(p1.x, p2.x);
        }
        else{
          delta = new paper.Point(size - event.size, 0);
          _bounds[event.name] = Math.min(p1.x, p2.x);
        }
      }
      else{
        const size = Math.abs(p1.y - p2.y);
        if(event.name == "bottom"){
          delta = new paper.Point(0, event.size - size);
          _bounds[event.name] = Math.max(p1.y, p2.y);
        }
        else{
          delta = new paper.Point(0, size - event.size);
          _bounds[event.name] = Math.min(p1.y, p2.y);
        }
      }
    }
    else {
      _bounds = this.layer.bounds;
      if(this.pos == "top" || this.pos == "bottom")
        if(event.name == "right")
          delta = new paper.Point(event.size - _bounds.width, 0);
        else
          delta = new paper.Point(_bounds.width - event.size, 0);
      else{
        if(event.name == "bottom")
          delta = new paper.Point(0, event.size - _bounds.height);
        else
          delta = new paper.Point(0, _bounds.height - event.size);
      }
    }

    if(delta.length){
      const {project} = this;
      project.deselect_all_points();
      project.getItems({class: ProfileItem})
        .forEach(({b, e, generatrix, width}) => {
          width /= 2;
          if(Math.abs(b[xy] - _bounds[event.name]) < width && Math.abs(e[xy] - _bounds[event.name]) < width){
            generatrix.segments.forEach((segm) => segm.selected = true)
          }
          else if(Math.abs(b[xy] - _bounds[event.name]) < width){
            generatrix.firstSegment.selected = true;
          }
          else if(Math.abs(e[xy] - _bounds[event.name]) < width){
            generatrix.lastSegment.selected = true;
          }
      });
      project.move_points(delta, false);
      setTimeout(function () {
        this.deselect_all_points(true);
        this.register_update();
      }.bind(project), 200);
    }

  }

  _sizes_wnd(event) {

    if(this.wnd && event.wnd == this.wnd.wnd){

      switch(event.name) {
        case 'close':
          if(this.children.text){
            this.children.text.selected = false;
          }
          this.wnd = null;
          break;

        case 'left':
        case 'right':
          if(this.pos == "top" || this.pos == "bottom"){
            this._move_points(event, "x");
          }
          break;

        case 'top':
        case 'bottom':
          if(this.pos == "left" || this.pos == "right"){
            this._move_points(event, "y");
          }
          break;
      }
    }

  }

  redraw() {

    const {children} = this;
    if(!children.length){
      return;
    }

    const {path} = this;
    if(!path){
      this.visible = false;
      return;
    }

    const length = path.length;
    if(length < consts.sticking_l){
      this.visible = false;
      return;
    }
    this.visible = true;

    const b = path.firstSegment.point;
    const e = path.lastSegment.point;
    const normal = path.getNormalAt(0).multiply(this.offset + path.offset);
    const bs = b.add(normal.multiply(0.8));
    const es = e.add(normal.multiply(0.8));

    if(children.callout1.segments.length){
      children.callout1.firstSegment.point = b;
      children.callout1.lastSegment.point = b.add(normal);
    }
    else{
      children.callout1.addSegments([b, b.add(normal)]);
    }

    if(children.callout2.segments.length){
      children.callout2.firstSegment.point = e;
      children.callout2.lastSegment.point = e.add(normal);
    }
    else{
      children.callout2.addSegments([e, e.add(normal)]);
    }

    if(children.scale.segments.length){
      children.scale.firstSegment.point = bs;
      children.scale.lastSegment.point = es;
    }
    else{
      children.scale.addSegments([bs, es]);
    }

    children.text.content = length.toFixed(0);
    children.text.rotation = e.subtract(b).angle;
    children.text.point = bs.add(es).divide(2);
  }

  get path() {

    const {parent, project, children, _attr, pos} = this;
    if(!children.length){
      return;
    }
    const {owner_bounds, dimension_bounds} = parent;
    let offset = 0, b, e;

    if(!pos){
      b = typeof _attr.p1 == "number" ? _attr.elm1.corns(_attr.p1) : _attr.elm1[_attr.p1];
      e = typeof _attr.p2 == "number" ? _attr.elm2.corns(_attr.p2) : _attr.elm2[_attr.p2];
    }
    else if(pos == "top"){
      b = owner_bounds.topLeft;
      e = owner_bounds.topRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "left"){
      b = owner_bounds.bottomLeft;
      e = owner_bounds.topLeft;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "bottom"){
      b = owner_bounds.bottomLeft;
      e = owner_bounds.bottomRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "right"){
      b = owner_bounds.bottomRight;
      e = owner_bounds.topRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }

    if(!b || !e){
      return;
    }

    const path = new paper.Path({ insert: false, segments: [b, e] });

    if(_attr.elm1 && pos){
      b = path.getNearestPoint(_attr.elm1[_attr.p1]);
      e = path.getNearestPoint(_attr.elm2[_attr.p2]);
      if(path.getOffsetOf(b) > path.getOffsetOf(e)){
        [b, e] = [e, b]
      }
      path.firstSegment.point = b;
      path.lastSegment.point = e;
    }
    path.offset = offset;

    return path;
  }

  get eve() {
    return this.project._scope.eve;
  }

  get size() {
    return parseFloat(this.children.text.content) || 0;
  }
  set size(v) {
    this.children.text.content = parseFloat(v).round(1);
  }

  get angle() {
    return 0;
  }
  set angle(v) {

  }

  get pos() {
    return this._attr.pos || "";
  }
  set pos(v) {
    this._attr.pos = v;
    this.redraw();
  }

  get offset() {
    return this._attr.offset || 90;
  }
  set offset(v) {
    const offset = (parseInt(v) || 90).round(0);
    if(this._attr.offset != offset){
      this._attr.offset = offset;
      this.project.register_change(true);
    }
  }

  remove() {
    this.eve.off("sizes_wnd", this._sizes_wnd);
    if(this._row){
      this._row._owner.del(this._row);
      this._row = null;
      this.project.register_change();
    }
    super.remove();
  }
}


class DimensionLineCustom extends DimensionLine {

  constructor(attr) {

    if(!attr.row){
      attr.row = attr.parent.project.ox.coordinates.add();
    }

    if(!attr.row.cnstr){
      attr.row.cnstr = attr.parent.layer.cnstr;
    }

    if(!attr.row.elm){
      attr.row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    super(attr);

  }

  get elm_type() {
    return $p.enm.elm_types.Размер;
  }

  save_coordinates() {
    const {_row, _attr, elm_type, pos, offset, size} = this;

    _row.len = size;

    _row.elm_type = elm_type;

    _row.path_data = JSON.stringify({
      pos: pos,
      elm1: _attr.elm1.elm,
      elm2: _attr.elm2.elm,
      p1: _attr.p1,
      p2: _attr.p2,
      offset: offset
    });
  }

  _click(event) {
    event.stop();
    if(paper.tool instanceof ToolRuler){
      this.selected = true;
    }
  }

  _mouseenter() {
    if(paper.tool instanceof ToolRuler){
      paper.canvas_cursor('cursor-arrow-ruler');
    }
    else{
      paper.canvas_cursor('cursor-arrow-ruler-dis');
    }
  }


}




class BuilderElement extends paper.Group {

  constructor(attr) {

    super(attr);

    if(!attr.row){
      attr.row = this.project.ox.coordinates.add();
    }

    this._row = attr.row;

    this._attr = {};

    if(attr.proto){

      if(attr.proto.inset){
        this.inset = attr.proto.inset;
      }

      if(attr.parent){
        this.parent = attr.parent;
      }
      else if(attr.proto.parent){
        this.parent = attr.proto.parent;
      }

      if(attr.proto instanceof Profile){
        this.insertBelow(attr.proto);
      }

      this.clr = attr.proto.clr;

    }
    else if(attr.parent){
      this.parent = attr.parent;
    }

    if(!this._row.cnstr && this.layer.cnstr){
      this._row.cnstr = this.layer.cnstr;
    }

    if(!this._row.elm){
      this._row.elm = this.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    if(this._row.elm_type.empty() && !this.inset.empty()){
      this._row.elm_type = this.inset.nom().elm_type;
    }

    this.project.register_change();

  }

  get owner() {
    return this._attr.owner;
  }
  set owner(v) {
    this._attr.owner = v;
  }

  get generatrix() {
    return this._attr.generatrix;
  }
  set generatrix(attr) {

    const {_attr} = this;
    _attr.generatrix.removeSegments();

    if(this.hasOwnProperty('rays')){
      this.rays.clear();
    }

    if(Array.isArray(attr)){
      _attr.generatrix.addSegments(attr);
    }
    else if(attr.proto &&  attr.p1 &&  attr.p2){

      let tpath = attr.proto;
      if(tpath.getDirectedAngle(attr.ipoint) < 0){
        tpath.reverse();
      }

      let d1 = tpath.getOffsetOf(attr.p1);
      let d2 = tpath.getOffsetOf(attr.p2), d3;
      if(d1 > d2){
        d3 = d2;
        d2 = d1;
        d1 = d3;
      }
      if(d1 > 0){
        tpath = tpath.split(d1);
        d2 = tpath.getOffsetOf(attr.p2);
      }
      if(d2 < tpath.length){
        tpath.split(d2);
      }

      _attr.generatrix.remove();
      _attr.generatrix = tpath;
      _attr.generatrix.parent = this;

      if(this.layer.parent){
        _attr.generatrix.guide = true;
      }
    }
  }

  get path() {
    return this._attr.path;
  }
  set path(attr) {
    if(attr instanceof paper.Path){
      const {_attr} = this;
      _attr.path.removeSegments();
      _attr.path.addSegments(attr.segments);
      if(!_attr.path.closed){
        _attr.path.closePath(true);
      }
    }
  }

  get _metadata() {
    const {fields, tabular_sections} = this.project.ox._metadata();
    const t = this,
      _xfields = tabular_sections.coordinates.fields, 
      inset = Object.assign({}, _xfields.inset),
      arc_h = Object.assign({}, _xfields.r, {synonym: "Высота дуги"}),
      info = Object.assign({}, fields.note, {synonym: "Элемент"}),
      cnn1 = Object.assign({}, tabular_sections.cnn_elmnts.fields.cnn),
      cnn2 = Object.assign({}, cnn1),
      cnn3 = Object.assign({}, cnn1);

    function cnn_choice_links(o, cnn_point){

      const nom_cnns = $p.cat.cnns.nom_cnn(t, cnn_point.profile, cnn_point.cnn_types);

      if($p.utils.is_data_obj(o)){
        return nom_cnns.some((cnn) => o == cnn);
      }
      else{
        let refs = "";
        nom_cnns.forEach((cnn) => {
          if(refs){
            refs += ", ";
          }
          refs += "'" + cnn.ref + "'";
        });
        return "_t_.ref in (" + refs + ")";
      }
    }


    const {_inserts_types_filling} = $p.cat.inserts;
    inset.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => {
        const {sys} = this.project._dp;

          let selection;

          if(this instanceof Filling){
            if($p.utils.is_data_obj(o)){
              const {thickness, insert_type, insert_glass_type} = o;
              return _inserts_types_filling.indexOf(insert_type) != -1 &&
                thickness >= sys.tmin && thickness <= sys.tmax &&
                (insert_glass_type.empty() || insert_glass_type == $p.enm.inserts_glass_types.Заполнение);
            }
            else{
              let refs = "";
              $p.cat.inserts.by_thickness(sys.tmin, sys.tmax).forEach((o) => {
                if(o.insert_glass_type.empty() || o.insert_glass_type == $p.enm.inserts_glass_types.Заполнение){
                  if(refs){
                    refs += ", ";
                  }
                  refs += "'" + o.ref + "'";
                }
              });
              return "_t_.ref in (" + refs + ")";
            }
          }
          else if(this instanceof Profile){
            if(this.nearest()){
              selection = {elm_type: {in: [$p.enm.elm_types.Створка, $p.enm.elm_types.Добор]}};
            }
            else{
              selection = {elm_type: {in: [$p.enm.elm_types.Рама, $p.enm.elm_types.Импост, $p.enm.elm_types.Добор]}};
            }
          }
          else{
            selection = {elm_type: this.nom.elm_type};
          }

          if($p.utils.is_data_obj(o)){
            let ok = false;
            selection.nom = o;
            sys.elmnts.find_rows(selection, (row) => {
              ok = true;
              return false;
            });
            return ok;
          }
          else{
            let refs = "";
            sys.elmnts.find_rows(selection, (row) => {
              if(refs){
                refs += ", ";
              }
              refs += "'" + row.nom.ref + "'";
            });
            return "_t_.ref in (" + refs + ")";
          }
        }]}
    ];

    cnn1.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => cnn_choice_links(o, this.rays.b)]
    }];

    cnn2.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => cnn_choice_links(o, this.rays.e)]
    }];

    cnn3.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o) => {
        const cnn_ii = this.selected_cnn_ii();
        let nom_cnns = [$p.utils.blank.guid];

        if(cnn_ii){
          if (cnn_ii.elm instanceof Filling) {
            nom_cnns = $p.cat.cnns.nom_cnn(cnn_ii.elm, this, $p.enm.cnn_types.acn.ii);
          }
          else if (cnn_ii.elm_type == $p.enm.elm_types.Створка && this.elm_type != $p.enm.elm_types.Створка) {
            nom_cnns = $p.cat.cnns.nom_cnn(cnn_ii.elm, this, $p.enm.cnn_types.acn.ii);
          }
          else {
            nom_cnns = $p.cat.cnns.nom_cnn(this, cnn_ii.elm, $p.enm.cnn_types.acn.ii);
          }
        }

        if ($p.utils.is_data_obj(o)) {
          return nom_cnns.some((cnn) => o == cnn);
        }
        else {
          var refs = "";
          nom_cnns.forEach((cnn) => {
            if (refs) {
              refs += ", ";
            }
            refs += "'" + cnn.ref + "'";
          });
          return "_t_.ref in (" + refs + ")";
        }
      }]
    }];

    $p.cat.clrs.selection_exclude_service(_xfields.clr, this);

    return {
      fields: {
        info: info,
        inset: inset,
        clr: _xfields.clr,
        x1: _xfields.x1,
        x2: _xfields.x2,
        y1: _xfields.y1,
        y2: _xfields.y2,
        cnn1: cnn1,
        cnn2: cnn2,
        cnn3: cnn3,
        arc_h: arc_h,
        r: _xfields.r,
        arc_ccw: _xfields.arc_ccw,
        a1: Object.assign({}, _xfields.x1, {synonym: "Угол1"}),
        a2: Object.assign({}, _xfields.x1, {synonym: "Угол2"}),
      }
    };
  }

  get _manager() {
    return this.project._dp._manager;
  }

  get nom() {
    return this.inset.nom(this);
  }

  get elm() {
    return this._row ? this._row.elm : 0;
  }

  get info() {
    return "№" + this.elm;
  }

  get ref() {
    const {inset} = this;
    const nom = inset.nom(this);
    return nom && !nom.empty() ? nom.ref : inset.ref;
  }

  get width() {
    return this.nom.width || 80;
  }

  get thickness() {
    return this.inset.thickness;
  }

  get sizeb() {
    return this.inset.sizeb || 0;
  }

  get sizefurn() {
    return this.nom.sizefurn || 20;
  }

  get cnn3(){
    const cnn_ii = this.selected_cnn_ii();
    return cnn_ii ? cnn_ii.row.cnn : $p.cat.cnns.get();
  }
  set cnn3(v) {
    const cnn_ii = this.selected_cnn_ii();
    if(cnn_ii && cnn_ii.row.cnn != v){
      cnn_ii.row.cnn = v;
      if(this._attr._nearest_cnn){
        this._attr._nearest_cnn = cnn_ii.row.cnn;
      }
      if(this.rays){
        this.rays.clear();
      }
      this.project.register_change();
    }
  }

  get inset() {
    return (this._row ? this._row.inset : null) || $p.cat.inserts.get();
  }
  set inset(v) {
    this.set_inset(v);
  }

  get clr() {
    return this._row.clr;
  }
  set clr(v) {
    this.set_clr(v);
  }

  set_inset(v, ignore_select) {
    const {_row, _attr, project} = this;
    if(_row.inset != v){
      _row.inset = v;
      if(_attr && _attr._rays){
        _attr._rays.clear(true);
      }
      project.register_change();
    }
  }

  set_clr(v, ignore_select) {
    this._row.clr = v;
    if(this.path instanceof paper.Path){
      this.path.fillColor = BuilderElement.clr_by_clr.call(this, this._row.clr, false);
    }
    this.project.register_change();
  }

  t_parent(be) {
    return this;
  }

  attache_wnd(cell) {
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

  detache_wnd() {
    const {_grid} = this._attr;
    if(_grid && _grid.destructor && _grid._owner_cell){
      _grid._owner_cell.detachObject(true);
      delete this._attr._grid;
    }
  }

  selected_cnn_ii() {
    const {project, elm} = this;
    const sel = project.getSelectedItems();
    const {cnns} = project.connections;
    const items = [];
    let res;

    sel.forEach((item) => {
      if(item.parent instanceof ProfileItem || item.parent instanceof Filling)
        items.push(item.parent);
      else if(item instanceof Filling)
        items.push(item);
    });

    if(items.length > 1 &&
      items.some((item) => item == this) &&
      items.some((item) => {
        if(item != this){
          cnns.forEach((row) => {
            if(!row.node1 && !row.node2 &&
              ((row.elm1 == elm && row.elm2 == item.elm) || (row.elm1 == item.elm && row.elm2 == elm))){
              res = {elm: item, row: row};
              return false;
            }
          });
          if(res){
            return true;
          }
        }
      })){
      return res;
    }
  }

  remove() {
    this.detache_wnd();
    const {parent, project, observer, _row} = this;

    parent && parent.on_remove_elm && parent.on_remove_elm(this);

    if (observer){
      project._scope.eve.off(consts.move_points, observer);
      delete this.observer;
    }

    if(_row && _row._owner && project.ox === _row._owner._owner){
      _row._owner.del(_row);
    }

    project.register_change();

    super.remove();
  }

  err_spec_row(nom, text) {
    if(!nom){
      nom = $p.job_prm.nom.info_error;
    }
    const {ox} = this.project;
    if(!ox.specification.find_rows({elm: this.elm, nom}).length){
      $p.ProductsBuilding.new_spec_row({
        elm: this,
        row_base: {clr: $p.cat.clrs.get(), nom},
        spec: ox.specification,
        ox,
      });
    };
    if(text){

    }
  }


  static clr_by_clr(clr, view_out) {
    let {clr_str, clr_in, clr_out} = clr;

    if(!view_out){
      if(!clr_in.empty() && clr_in.clr_str)
        clr_str = clr_in.clr_str;
    }else{
      if(!clr_out.empty() && clr_out.clr_str)
        clr_str = clr_out.clr_str;
    }

    if(!clr_str){
      clr_str = this.default_clr_str ? this.default_clr_str : "fff";
    }

    if(clr_str){
      clr = clr_str.split(",");
      if(clr.length == 1){
        if(clr_str[0] != "#")
          clr_str = "#" + clr_str;
        clr = new paper.Color(clr_str);
        clr.alpha = 0.96;
      }
      else if(clr.length == 4){
        clr = new paper.Color(clr[0], clr[1], clr[2], clr[3]);
      }
      else if(clr.length == 3){
        if(this.path && this.path.bounds)
          clr = new paper.Color({
            stops: [clr[0], clr[1], clr[2]],
            origin: this.path.bounds.bottomLeft,
            destination: this.path.bounds.topRight
          });
        else
          clr = new paper.Color(clr[0]);
      }
      return clr;
    }
  }
}


Editor.BuilderElement = BuilderElement;





class Filling extends AbstractFilling(BuilderElement) {

  constructor(attr) {

    const {path} = attr;
    if(path){
      delete attr.path;
    }

    super(attr);

    if(path){
      attr.path = path;
    }

    this.initialize(attr);

  }

  initialize(attr) {

    const _row = attr.row;
    const {_attr, project} = this;
    const h = project.bounds.height + project.bounds.y;

    if(_row.path_data){
      _attr.path = new paper.Path(_row.path_data);
    }

    else if(attr.path){
      _attr.path = new paper.Path();
      this.path = attr.path;
    }
    else{
      _attr.path = new paper.Path([
        [_row.x1, h - _row.y1],
        [_row.x1, h - _row.y2],
        [_row.x2, h - _row.y2],
        [_row.x2, h - _row.y1]
      ]);
    }

    _attr.path.closePath(true);
    _attr.path.reduce();
    _attr.path.strokeWidth = 0;

    if(_row.inset.empty()){
      _row.inset = project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
    }

    if(_row.clr.empty()){
      project._dp.sys.elmnts.find_rows({nom: _row.inset}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    if(_row.clr.empty()){
      project._dp.sys.elmnts.find_rows({elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    this.clr = _row.clr;

    if(_row.elm_type.empty()){
      _row.elm_type = $p.enm.elm_types.Стекло;
    }

    _attr.path.visible = false;

    this.addChild(_attr.path);

    project.ox.coordinates.find_rows({
      cnstr: this.layer.cnstr,
      parent: this.elm,
      elm_type: $p.enm.elm_types.Раскладка
    }, (row) => new Onlay({row: row, parent: this}));

  }

  save_coordinates() {

    const {_row, project, profiles, bounds, imposts, nom} = this;
    const h = project.bounds.height + project.bounds.y;
    const cnns = project.connections.cnns;
    const length = profiles.length;

    project.ox.glasses.add({
      elm: _row.elm,
      nom: nom,
      formula: this.formula(),
      width: bounds.width,
      height: bounds.height,
      s: this.s,
      is_rectangular: this.is_rectangular,
      is_sandwich: nom.elm_type == $p.enm.elm_types.Заполнение,
      thickness: this.thickness,
    });

    let curr, prev,	next

    _row.x1 = (bounds.bottomLeft.x - project.bounds.x).round(3);
    _row.y1 = (h - bounds.bottomLeft.y).round(3);
    _row.x2 = (bounds.topRight.x - project.bounds.x).round(3);
    _row.y2 = (h - bounds.topRight.y).round(3);
    _row.path_data = this.path.pathData;

    for(let i=0; i<length; i++ ){

      curr = profiles[i];

      if(!curr.profile || !curr.profile._row || !curr.cnn){
        if($p.job_prm.debug)
          throw new ReferenceError("Не найдено ребро заполнения");
        else
          return;
      }

      curr.aperture_path = curr.profile.generatrix.get_subpath(curr.b, curr.e)._reversed ?
        curr.profile.rays.outer : curr.profile.rays.inner;
    }

    for(let i=0; i<length; i++ ){

      prev = i === 0 ? profiles[length-1] : profiles[i-1];
      curr = profiles[i];
      next = i === length-1 ? profiles[0] : profiles[i+1];

      const pb = curr.aperture_path.intersect_point(prev.aperture_path, curr.b, true);
      const pe = curr.aperture_path.intersect_point(next.aperture_path, curr.e, true);

      if(!pb || !pe){
        if($p.job_prm.debug)
          throw "Filling:path";
        else
          return;
      }

      cnns.add({
        elm1: _row.elm,
        elm2: curr.profile._row.elm,
        node1: "",
        node2: "",
        cnn: curr.cnn.ref,
        aperture_len: curr.aperture_path.get_subpath(pb, pe).length.round(1)
      });

    }

    for(let i=0; i<length; i++ ){
      delete profiles[i].aperture_path;
    }

    imposts.forEach((curr) => curr.save_coordinates());
  }

  create_leaf() {

    const {project} = this;

    project.connections.cnns.clear({elm1: this.elm});

    const contour = new Contour( {parent: this.parent});

    contour.path = this.profiles;

    this.parent = contour;
    this._row.cnstr = contour.cnstr;

    contour.furn = project.default_furn;

    project.notify(contour, 'rows', {constructions: true});

    contour.activate();
  }

  cnn_side() {
    return $p.enm.cnn_sides.Изнутри;
  }

  nearest() {
    return null;
  }

  select_node(v) {
    let point, segm, delta = Infinity;
    if(v === "b"){
      point = this.bounds.bottomLeft;
    }else{
      point = this.bounds.topRight;
    }
    this._attr.path.segments.forEach((curr) => {
      curr.selected = false;
      if(point.getDistance(curr.point) < delta){
        delta = point.getDistance(curr.point);
        segm = curr;
      }
    });
    if(segm){
      segm.selected = true;
      this.view.update();
    }
  }

  setSelection(selection) {
    super.setSelection(selection);
    if(selection){
      const {path} = this;
      for(let elm of this.children){
        if(elm != path){
          elm.selected = false;
        }
      }
    }
  }

  redraw() {

    this.sendToBack();

    const {path, imposts, _attr, is_rectangular} = this;
    const {elm_font_size} = consts;

    path.visible = true;
    imposts.forEach((elm) => elm.redraw());

    this.purge_path();

    if(!_attr._text){
      _attr._text = new paper.PointText({
        parent: this,
        fillColor: 'black',
        fontSize: elm_font_size,
        guide: true,
      });
    }
    _attr._text.visible = is_rectangular;

    if(is_rectangular){
      const {bounds} = path;
      _attr._text.content = this.formula();
      _attr._text.point = bounds.bottomLeft.add([elm_font_size * 0.6, -elm_font_size]);
      if(_attr._text.bounds.width > (bounds.width - 2 * elm_font_size)){
        const atext = _attr._text.content.split(' ');
        if(atext.length > 1){
          _attr._text.content = '';
          atext.forEach((text, index) => {
            if(!_attr._text.content){
              _attr._text.content = text;
            }
            else{
              _attr._text.content += ((index === atext.length - 1) ? '\n' : ' ') + text;
            }
          })
          _attr._text.point.y -= elm_font_size;
        }
      }
    }
    else{

    }
  }

  draw_fragment() {
    const {l_dimensions, layer, path} = this;
    this.visible = true;
    path.set({
      strokeColor: 'black',
      strokeWidth: 1,
      strokeScaling: false,
      opacity: 0.6,
    });
    l_dimensions.redraw(true);
    layer.zoom_fit();
  }

  set_inset(v, ignore_select) {

    const inset = $p.cat.inserts.get(v);

    if(!ignore_select){
      const {project, elm, clr} = this;
      const {glass_specification} = project.ox;
      const proto = glass_specification.find_rows({elm});

      if(!inset.clr_group.empty() && inset.clr_group.clr_conformity.count() && !inset.clr_group.clr_conformity._obj.some((row) => row.clr1 == clr)) {
        this.clr = inset.clr_group.clr_conformity.get(0).clr1;
      }

      if(proto.length) {
        glass_specification.clear({elm});
        proto.length = 0;
        inset.specification.forEach((row) => {
          if(row.nom instanceof $p.CatInserts){
            proto.push(glass_specification.add({
              elm,
              inset: row.nom,
              clr: row.clr,
            }))
          }
        });
      }

      project.selected_glasses().forEach((selm) => {
        if(selm !== this){
          selm.set_inset(inset, true);
          glass_specification.clear({elm: selm.elm});
          proto.forEach((row) => glass_specification.add({
            elm: selm.elm,
            inset: row.inset,
            clr: row.clr,
          }));
        }
      });
    }
    super.set_inset(inset);
  }

  set_clr(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1){
      this.project.selected_glasses().forEach((elm) => {
        if(elm !== this){
          elm.set_clr(v, true);
        }
      });
    }
    super.set_clr(v);
  }

  purge_path() {
    const paths = this.children.filter((child) => child instanceof paper.Path);
    const {path} = this;
    paths.forEach((p) => p != path && p.remove());
  }

  fill_error() {
    const {path} = this;
    path.fillColor = new paper.Color({
      stops: ["#fee", "#fcc", "#fdd"],
      origin: path.bounds.bottomLeft,
      destination: path.bounds.topRight
    });
  }

  get profiles() {
    return this._attr._profiles || [];
  }

  get imposts() {
    return this.getItems({class: Onlay});
  }

  remove_onlays() {
    for(let onlay of this.imposts){
      onlay.remove();
    }
  }

  get s() {
    return this.bounds.width * this.bounds.height / 1000000;
  }

  interiorPoint() {
    return this.path.interiorPoint;
  }

  get is_rectangular() {
    const {profiles, path} = this;
    return profiles.length === 4 && !path.hasHandles() && !profiles.some(({profile}) => !(Math.abs(profile.angle_hor % 90) < 0.2));
  }

  get generatrix() {
    return this.path;
  }

  get path() {
    return this._attr.path;
  }
  set path(attr) {
    let {_attr, path} = this;

    if(path){
      path.removeSegments();
    }
    else{
      path = _attr.path = new paper.Path({parent: this});
    }

    if(Array.isArray(_attr._profiles)){
      _attr._profiles.length = 0;
    }
    else{
      _attr._profiles = [];
    }

    let needPurge;

    if(attr instanceof paper.Path){
      path.addSegments(attr.segments);
    }
    else if(Array.isArray(attr)){
      const {length} = attr;
      const {connections} = this.project;
      let prev, curr, next, sub_path;
      for(let i=0; i<length; i++ ){
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        sub_path = curr.profile.generatrix.get_subpath(curr.b, curr.e);

        curr.cnn = $p.cat.cnns.elm_cnn(this, curr.profile, $p.enm.cnn_types.acn.ii,
          curr.cnn || connections.elm_cnn(this, curr.profile), false, curr.outer);

        curr.sub_path = sub_path.equidistant(
          (sub_path._reversed ? -curr.profile.d1 : curr.profile.d2) + (curr.cnn ? curr.cnn.sz : 20), consts.sticking);

      }
      for(let i=0; i<length; i++ ){
        prev = i === 0 ? attr[length-1] : attr[i-1];
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        if(!curr.pb)
          curr.pb = prev.pe = curr.sub_path.intersect_point(prev.sub_path, curr.b, true);
        if(!curr.pe)
          curr.pe = next.pb = curr.sub_path.intersect_point(next.sub_path, curr.e, true);
        if(!curr.pb || !curr.pe){
          if($p.job_prm.debug)
            throw "Filling:path";
          else
            continue;
        }
        curr.sub_path = curr.sub_path.get_subpath(curr.pb, curr.pe);
      }
      for(let i=0; i<length; i++ ){
        curr = attr[i];
        path.addSegments(curr.sub_path.segments);
        ["anext","pb","pe"].forEach((prop) => { delete curr[prop] });
        _attr._profiles.push(curr);

        if(!needPurge){
          needPurge = Math.abs(curr.angle_hor % 90) < 0.2
        }
      }
    }

    if(needPurge || path.hasHandles()) {
      const delta = 2;
      const toRemove = [];
      let prev;
    }

    if(path.segments.length && !path.closed){
      path.closePath(true);
    }

    path.reduce();
  }

  get nodes() {
    let res = this.profiles.map((curr) => curr.b);
    if(!res.length){
      const {path, parent} = this;
      if(path){
        res = parent.glass_nodes(path);
      }
    }
    return res;
  }

  get outer_profiles() {
    return this.profiles;
  }

  get perimeter() {
    const res = [];
    this.profiles.forEach((curr) => {
      const tmp = {
        len: curr.sub_path.length,
        angle: curr.e.subtract(curr.b).angle,
        profile: curr.profile
      }
      res.push(tmp);
      if(tmp.angle < 0){
        tmp.angle += 360;
      }
    });
    return res;
  }

  get bounds() {
    const {path} = this;
    return path ? path.bounds : new paper.Rectangle();
  }

  get x1() {
    return (this.bounds.left - this.project.bounds.x).round(1);
  }

  get x2() {
    return (this.bounds.right - this.project.bounds.x).round(1);
  }

  get y1() {
    return (this.project.bounds.height + this.project.bounds.y - this.bounds.bottom).round(1);
  }

  get y2() {
    return (this.project.bounds.height + this.project.bounds.y - this.bounds.top).round(1);
  }

  get info() {
    const {elm, bounds, thickness} = this;
    return "№" + elm + " w:" + bounds.width.toFixed(0) + " h:" + bounds.height.toFixed(0) + " z:" + thickness.toFixed(0);
  }

  get oxml() {
    const oxml = {
      " ": [
        {id: "info", path: "o.info", type: "ro"},
        "inset",
        "clr"
      ],
      "Начало": [
        {id: "x1", path: "o.x1", synonym: "X1", type: "ro"},
        {id: "y1", path: "o.y1", synonym: "Y1", type: "ro"}
      ],
      "Конец": [
        {id: "x2", path: "o.x2", synonym: "X2", type: "ro"},
        {id: "y2", path: "o.y2", synonym: "Y2", type: "ro"}
      ]
    };
    if(this.selected_cnn_ii()){
      oxml["Примыкание"] = ["cnn3"];
    }
    return oxml;
  }

  get default_clr_str() {
    return "#def,#d0ddff,#eff";
  }

  formula(by_art) {
    let res;
    this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
      let {name, article} = row.inset;
      const aname = row.inset.name.split(' ');
      if(by_art && article){
        name = article;
      }
      else if(aname.length){
        name = aname[0];
      }
      if(!res){
        res = name;
      }
      else{
        res += (by_art ? '*' : 'x') + name;
      }
    });
    return res || (by_art ? this.inset.article || this.inset.name : this.inset.name);
  }

  get ref() {
    return this.thickness.toFixed();
  }

  get inset() {
    const {_attr, _row} = this;
    if(!_attr._ins_proxy || _attr._ins_proxy.ref != _row.inset){
      _attr._ins_proxy = new Proxy(_row.inset, {
        get: (target, prop) => {
          switch (prop){
            case 'presentation':
              return this.formula();

            case 'thickness':
              let res = 0;
              this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
                res += row.inset.thickness;
              });
              return res || _row.inset.thickness;

            default:
              return target[prop];
          }
        }
      });
    }
    return _attr._ins_proxy;
  }
  set inset(v) {
    this.set_inset(v);
  }

}

Editor.Filling = Filling;


class FreeText extends paper.PointText {

  constructor(attr) {

    if(!attr.fontSize){
      attr.fontSize = consts.font_size;
    }

    super(attr);

    if(attr.row){
      this._row = attr.row;
    }
    else{
      this._row = attr.row = this.project.ox.coordinates.add();
    }

    const {_row} = this;

    if(!_row.cnstr){
      _row.cnstr = attr.parent.layer.cnstr;
    }

    if(!_row.elm){
      _row.elm = this.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    if(attr.point){
      if(attr.point instanceof paper.Point)
        this.point = attr.point;
      else
        this.point = new paper.Point(attr.point);
    }
    else{

      this.clr = _row.clr;
      this.angle = _row.angle_hor;

      if(_row.path_data){
        var path_data = JSON.parse(_row.path_data);
        this.x = _row.x1 + path_data.bounds_x || 0;
        this.y = _row.y1 - path_data.bounds_y || 0;
        this._mixin(path_data, null, ["bounds_x","bounds_y"]);
      }else{
        this.x = _row.x1;
        this.y = _row.y1;
      }
    }

    this.bringToFront();

  }

  remove() {
    this._row._owner.del(this._row);
    this._row = null;
    paper.PointText.prototype.remove.call(this);
  }

  save_coordinates() {
    const {_row} = this;

    _row.x1 = this.x;
    _row.y1 = this.y;
    _row.angle_hor = this.angle;

    _row.elm_type = this.elm_type;

    _row.path_data = JSON.stringify({
      text: this.text,
      font_family: this.font_family,
      font_size: this.font_size,
      bold: this.bold,
      align: this.align.ref,
      bounds_x: this.project.bounds.x,
      bounds_y: this.project.bounds.y
    });
  }

  move_points(point) {
    this.point = point;
    this.project.notify(this, 'update', {x: true, y: true});
  }

  get elm_type() {
    return $p.enm.elm_types.Текст;
  }

  _metadata() {
    return $p.dp.builder_text.metadata();
  }

  get _manager() {
    return $p.dp.builder_text;
  }

  get clr() {
    return this._row ? this._row.clr : $p.cat.clrs.get();
  }
  set clr(v) {
    this._row.clr = v;
    if(this._row.clr.clr_str.length == 6)
      this.fillColor = "#" + this._row.clr.clr_str;
    this.project.register_update();
  }

  get font_family() {
    return this.fontFamily || "";
  }
  set font_family(v) {
    this.fontFamily = v;
    this.project.register_update();
  }

  get font_size() {
    return this.fontSize || consts.font_size;
  }
  set font_size(v) {
    this.fontSize = v;
    this.project.register_update();
  }

  get bold() {
    return this.fontWeight != 'normal';
  }
  set bold(v) {
    this.fontWeight = v ? 'bold' : 'normal';
  }

  get x() {
    return (this.point.x - this.project.bounds.x).round(1);
  }
  set x(v) {
    this.point.x = parseFloat(v) + this.project.bounds.x;
    this.project.register_update();
  }

  get y() {
    const {bounds} = this.project;
    return (bounds.height + bounds.y - this.point.y).round(1);
  }
  set y(v) {
    const {bounds} = this.project;
    this.point.y = bounds.height + bounds.y - parseFloat(v);
  }

  get text() {
    return this.content;
  }
  set text(v) {
    const {project} = this;
    if(v){
      this.content = v;
      project.register_update();
    }
    else{
      project.notify(this, 'unload');
      setTimeout(this.remove.bind(this), 50);
    }
  }

  get angle() {
    return Math.round(this.rotation);
  }
  set angle(v) {
    this.rotation = v;
    this.project.register_update();
  }

  get align() {
    return $p.enm.text_aligns.get(this.justification);
  }
  set align(v) {
    this.justification = $p.utils.is_data_obj(v) ? v.ref : v;
    this.project.register_update();
  }

}


class GeneratrixElement extends BuilderElement {

  constructor(attr = {}) {
    const {generatrix} = attr;
    if (generatrix) {
      delete attr.generatrix;
    }
    super(attr);
    if (generatrix) {
      attr.generatrix = generatrix;
    }
    this.initialize(attr);
  }

  get b() {
    const {generatrix} = this._attr;
    return generatrix && generatrix.firstSegment.point;
  }
  set b(v) {
    const {_rays, generatrix} = this._attr;
    _rays.clear();
    if(generatrix) generatrix.firstSegment.point = v;
  }

  get e() {
    const {generatrix} = this._attr;
    return generatrix && generatrix.lastSegment.point;
  }
  set e(v) {
    const {_rays, generatrix} = this._attr;
    _rays.clear();
    if(generatrix) generatrix.lastSegment.point = v;
  }

  get x1() {
    const {bounds} = this.project;
    return bounds ? (this.b.x - bounds.x).round(1) : 0;
  }
  set x1(v) {
    const {bounds} = this.project;
    if(bounds && (v = parseFloat(v) + bounds.x - this.b.x)){
      this.select_node("b");
      this.move_points(new paper.Point(v, 0));
    }
  }

  get y1() {
    const {bounds} = this.project;
    return bounds ? (bounds.height + bounds.y - this.b.y).round(1) : 0;
  }
  set y1(v) {
    const {bounds} = this.project;
    if(bounds && (v = bounds.height + bounds.y - parseFloat(v) - this.b.y)){
      this.select_node("b");
      this.move_points(new paper.Point(0, v));
    }
  }

  get x2() {
    const {bounds} = this.project;
    return bounds ? (this.e.x - bounds.x).round(1) : 0;
  }
  set x2(v) {
    const {bounds} = this.project;
    if(bounds && (v = parseFloat(v) + bounds.x - this.e.x)){
      this.select_node("e");
      this.move_points(new paper.Point(v, 0));
    }
  }

  get y2() {
    const {bounds} = this.project;
    return bounds ? (bounds.height + bounds.y - this.e.y).round(1) : 0;
  }
  set y2(v) {
    const {bounds} = this.project;
    if(bounds && (v = bounds.height + bounds.y - parseFloat(v) - this.e.y)){
      this.select_node("e");
      this.move_points(new paper.Point(0, v));
    }
  }

  select_node(node) {
    const {generatrix, project, _attr, view} = this;
    project.deselect_all_points();
    if(_attr.path){
      _attr.path.selected = false;
    }
    if(node == "b"){
      generatrix.firstSegment.selected = true;
    }
    else{
      generatrix.lastSegment.selected = true;
    }
    view.update();
  }

  move_points(delta, all_points, start_point) {

    if(!delta.length){
      return;
    }

    const	other = [];
    const noti = {type: consts.move_points, profiles: [this], points: []};

    let changed;

    if(!all_points){
      all_points = !this.generatrix.segments.some((segm) => {
        if (segm.selected)
          return true;
      });
    }

    this.generatrix.segments.forEach((segm) => {

      let cnn_point;

      if (segm.selected || all_points){

        const noti_points = {old: segm.point.clone(), delta: delta};

        const free_point = segm.point.add(delta);

        if(segm.point == this.b){
          cnn_point = this.rays.b;
          if(!cnn_point.profile_point || paper.Key.isDown('control')){
            cnn_point = this.cnn_point("b", free_point);
          }
        }
        else if(segm.point == this.e){
          cnn_point = this.rays.e;
          if(!cnn_point.profile_point || paper.Key.isDown('control')){
            cnn_point = this.cnn_point("e", free_point);
          }
        }

        if(cnn_point && cnn_point.cnn_types == $p.enm.cnn_types.acn.t && (segm.point == this.b || segm.point == this.e)){
          if(cnn_point.point.is_nearest(free_point, 0)){
            segm.point = cnn_point.point;
          }
          else{
            const ppath = (cnn_point.profile.nearest(true) ? cnn_point.profile.rays.outer : cnn_point.profile.generatrix).clone({insert: false});
            const {bounds} = ppath;
            if(Math.abs(delta.y) < consts.epsilon){
              const ray = new paper.Path({
                insert: false,
                segments: [[free_point.x, bounds.top], [free_point.x, bounds.bottom]]
              });
              segm.point = ppath.intersect_point(ray, free_point, true) || free_point;
            }
            else if(Math.abs(delta.x) < consts.epsilon){
              const ray = new paper.Path({
                insert: false,
                segments: [[bounds.left, free_point.y], [bounds.right, free_point.y]]
              });
              segm.point = ppath.intersect_point(ray, free_point, true) || free_point;
            }
            else {
              segm.point = free_point;
            }
          }
        }
        else{
          segm.point = free_point;
          if(cnn_point && !paper.Key.isDown('control')){
            if(cnn_point.profile && cnn_point.profile_point && !cnn_point.profile[cnn_point.profile_point].is_nearest(free_point)){
              if(this instanceof Onlay){
                this.move_nodes(noti_points.old, free_point);
              }
              else{
                other.push(cnn_point.profile_point == "b" ? cnn_point.profile._attr.generatrix.firstSegment : cnn_point.profile._attr.generatrix.lastSegment );
                cnn_point.profile[cnn_point.profile_point] = free_point;
                noti.profiles.push(cnn_point.profile);
              }
            }
          }
        }

        noti_points.new = segm.point;
        if(start_point){
          noti_points.start = start_point;
        }
        noti.points.push(noti_points);

        changed = true;
      }

    });


    if(changed){
      const {_attr, layer, project} = this;
      _attr._rays.clear();
      layer && layer.notify && layer.notify(noti);
      project.notify(this, 'update', {x1: true, x2: true, y1: true, y2: true});
    }

    return other;
  }

  do_sub_bind(profile, node) {
    const ppath = (profile.nearest(true) ? profile.rays.outer : profile.generatrix).clone({insert: false});
    let mpoint = ppath.getNearestPoint(this[node]);
    if(!mpoint.is_nearest(this[node], 0)) {
      const gen = this.generatrix.clone({insert: false}).elongation(1000);
      mpoint = ppath.intersect_point(gen, mpoint, true);
      this[node] = mpoint;
      return true;
    }
  }

}


Object.defineProperties(paper.Path.prototype, {

  getDirectedAngle: {
      value: function (point) {
        var np = this.getNearestPoint(point),
          offset = this.getOffsetOf(np);
        return this.getTangentAt(offset).getDirectedAngle(point.add(np.negate()));
      }
    },

  angle_to: {
      value : function(other, point, interior, round){
        const p1 = this.getNearestPoint(point),
          p2 = other.getNearestPoint(point),
          t1 = this.getTangentAt(this.getOffsetOf(p1)),
          t2 = other.getTangentAt(other.getOffsetOf(p2));
        let res = t2.angle - t1.angle;
        if(res < 0){
          res += 360;
        }
        if(interior && res > 180){
          res = 180 - (res - 180);
        }
        return round ? res.round(round) : res.round(1);
      },
      enumerable : false
    },

  is_linear: {
      value: function () {
        if(this.curves.length == 1 && this.firstCurve.isLinear())
          return true;
        else if(this.hasHandles())
          return false;
        else{
          var curves = this.curves,
            da = curves[0].point1.getDirectedAngle(curves[0].point2), dc;
          for(var i = 1; i < curves.lenght; i++){
            dc = curves[i].point1.getDirectedAngle(curves[i].point2);
            if(Math.abs(dc - da) > consts.epsilon)
              return false;
          }
        }
        return true;
      }
    },

  get_subpath: {
      value: function (point1, point2) {
        let tmp;

        if(!this.length || (point1.is_nearest(this.firstSegment.point) && point2.is_nearest(this.lastSegment.point))){
          tmp = this.clone(false);
        }
        else if(point2.is_nearest(this.firstSegment.point) && point1.is_nearest(this.lastSegment.point)){
          tmp = this.clone(false);
          tmp.reverse();
          tmp._reversed = true;
        }
        else{
          const loc1 = this.getLocationOf(point1) || this.getNearestLocation(point1);
          const loc2 = this.getLocationOf(point2) || this.getNearestLocation(point2);
          const offset1 = loc1.offset;
          const offset2 = loc2.offset;

          if(this.is_linear()){
            tmp = new paper.Path({
              segments: [loc1.point, loc2.point],
              insert: false
            });
          }
          else{
            const step = (offset2 - offset1) * 0.02;

            tmp = new paper.Path({
              segments: [loc1.point],
              insert: false
            });

            if(step < 0){
              tmp._reversed = true;
              for(let i = offset1 + step; i > offset2; i+= step){
                tmp.add(this.getPointAt(i));
              }
            }
            else if(step > 0){
              for(let i = offset1 + step; i < offset2; i+= step){
                tmp.add(this.getPointAt(i));
              }
            }
            tmp.add(loc2.point);
            tmp.simplify(0.8);
          }

          if(offset1 > offset2){
            tmp._reversed = true;
          }
        }

        return tmp;
      }
    },

  equidistant: {
      value: function (delta, elong) {

        let normal = this.getNormalAt(0);
        const res = new paper.Path({
            segments: [this.firstSegment.point.add(normal.multiply(delta))],
            insert: false
          });

        if(this.is_linear()) {
          res.add(this.lastSegment.point.add(normal.multiply(delta)));
        }
        else{

          if(this.firstSegment.handleIn.length){
            res.firstSegment.handleIn = this.firstSegment.handleIn.clone();
          }
          if(this.firstSegment.handleOut.length){
            res.firstSegment.handleOut = this.firstSegment.handleOut.clone();
          }

          let len = this.length, step = len * 0.02, point;

          for(let i = step; i < len; i += step) {
            point = this.getPointAt(i);
            if(!point)
              continue;
            normal = this.getNormalAt(i);
            res.add(point.add(normal.multiply(delta)));
          }

          normal = this.getNormalAt(len);
          res.add(this.lastSegment.point.add(normal.multiply(delta)));

          if(this.lastSegment.handleIn.length){
            res.lastSegment.handleIn = this.lastSegment.handleIn.clone();
          }
          if(this.lastSegment.handleOut.length){
            res.lastSegment.handleOut = this.lastSegment.handleOut.clone();
          }

          res.simplify(0.8);
        }

        return res.elongation(elong);
      }
    },

  elongation: {
      value: function (delta) {

        if(delta){
          if(this.is_linear()) {
            let tangent = this.getTangentAt(0);
            this.firstSegment.point = this.firstSegment.point.add(tangent.multiply(-delta));
            this.lastSegment.point = this.lastSegment.point.add(tangent.multiply(delta));
          }else{
            const {length} = this;
            let tangent = this.getTangentAt(length * 0.01);
            this.insert(0, this.firstSegment.point.add(tangent.multiply(-delta)));
            tangent = this.getTangentAt(length * 0.99);
            this.add(this.lastSegment.point.add(tangent.multiply(delta)));
          }
        }
        return this;
      }
    },

  intersect_point: {
      value: function (path, point, elongate) {
        const intersections = this.getIntersections(path);
        let delta = Infinity, tdelta, tpoint;

        if(intersections.length == 1){
          return intersections[0].point;
        }
        else if(intersections.length > 1){

          if(!point){
            point = this.getPointAt(this.length /2);
          }

          intersections.forEach((o) => {
            tdelta = o.point.getDistance(point, true);
            if(tdelta < delta){
              delta = tdelta;
              tpoint = o.point;
            }
          });
          return tpoint;
        }
        else if(elongate == "nearest"){

          return this.getNearestPoint(path.getNearestPoint(point));

        }
        else if(elongate){

          let p1 = this.getNearestPoint(point),
            p2 = path.getNearestPoint(point),
            p1last = this.firstSegment.point.getDistance(p1, true) > this.lastSegment.point.getDistance(p1, true),
            p2last = path.firstSegment.point.getDistance(p2, true) > path.lastSegment.point.getDistance(p2, true),
            tg;

          tg = (p1last ? this.getTangentAt(this.length) : this.getTangentAt(0).negate()).multiply(100);
          if(this.is_linear){
            if(p1last)
              this.lastSegment.point = this.lastSegment.point.add(tg);
            else
              this.firstSegment.point = this.firstSegment.point.add(tg);
          }

          tg = (p2last ? path.getTangentAt(path.length) : path.getTangentAt(0).negate()).multiply(100);
          if(path.is_linear){
            if(p2last)
              path.lastSegment.point = path.lastSegment.point.add(tg);
            else
              path.firstSegment.point = path.firstSegment.point.add(tg);
          }

          return this.intersect_point(path, point);

        }
      }
    },

  rmin: {
    value: function() {
      if(!this.hasHandles()){
        return 0;
      }
      const {length} = this;
      let max = 0;
      for(let pos = 0; pos < length; pos += length / 8){
        const curv = Math.abs(this.getCurvatureAt(pos));
        if(curv > max){
          max = curv;
        }
      }
      return max === 0 ? 0 : 1 / max;
    }
  },

  rmax: {
    value: function() {
      if(!this.hasHandles()){
        return 0;
      }
      const {length} = this;
      let min = Infinity;
      for(let pos = 0; pos < length; pos += length / 8){
        const curv = Math.abs(this.getCurvatureAt(pos));
        if(curv < min){
          min = curv;
        }
      }
      return min === 0 ? 0 : 1 / min;
    }
  },

});


Object.defineProperties(paper.Point.prototype, {

	is_nearest: {
		value: function (point, sticking) {
		  if(sticking === 0){
        return Math.abs(this.x - point.x) < consts.epsilon && Math.abs(this.y - point.y) < consts.epsilon;
      }
			return this.getDistance(point, true) < (sticking ? consts.sticking2 : 16);
		}
	},

	point_pos: {
		value: function(x1,y1, x2,y2){
			if (Math.abs(x1-x2) < 0.2){
				return (this.x-x1)*(y1-y2);
			}
			if (Math.abs(y1-y2) < 0.2){
				return (this.y-y1)*(x2-x1);
			}
			return (this.y-y1)*(x2-x1)-(y2-y1)*(this.x-x1);
		}
	},

	arc_cntr: {
		value: function(x1,y1, x2,y2, r0, ccw){
			var a,b,p,r,q,yy1,xx1,yy2,xx2;
			if(ccw){
				var tmpx=x1, tmpy=y1;
				x1=x2; y1=y2; x2=tmpx; y2=tmpy;
			}
			if (x1!=x2){
				a=(x1*x1 - x2*x2 - y2*y2 + y1*y1)/(2*(x1-x2));
				b=((y2-y1)/(x1-x2));
				p=b*b+ 1;
				r=-2*((x1-a)*b+y1);
				q=(x1-a)*(x1-a) - r0*r0 + y1*y1;
				yy1=(-r + Math.sqrt(r*r - 4*p*q))/(2*p);
				xx1=a+b*yy1;
				yy2=(-r - Math.sqrt(r*r - 4*p*q))/(2*p);
				xx2=a+b*yy2;
			} else{
				a=(y1*y1 - y2*y2 - x2*x2 + x1*x1)/(2*(y1-y2));
				b=((x2-x1)/(y1-y2));
				p=b*b+ 1;
				r=-2*((y1-a)*b+x1);
				q=(y1-a)*(y1-a) - r0*r0 + x1*x1;
				xx1=(-r - Math.sqrt(r*r - 4*p*q))/(2*p);
				yy1=a+b*xx1;
				xx2=(-r + Math.sqrt(r*r - 4*p*q))/(2*p);
				yy2=a+b*xx2;
			}

			if (new paper.Point(xx1,yy1).point_pos(x1,y1, x2,y2)>0)
				return {x: xx1, y: yy1};
			else
				return {x: xx2, y: yy2}
		}
	},

	arc_point: {
		value: function(x1,y1, x2,y2, r, arc_ccw, more_180){
			const point = {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
			if (r>0){
				let dx = x1-x2, dy = y1-y2, dr = r*r-(dx*dx+dy*dy)/4, l, h, centr;
				if(dr >= 0){
					centr = this.arc_cntr(x1,y1, x2,y2, r, arc_ccw);
					dx = centr.x - point.x;
					dy = point.y - centr.y;	
					l = Math.sqrt(dx*dx + dy*dy);

					if(more_180)
						h = r+Math.sqrt(dr);
					else
						h = r-Math.sqrt(dr);

					point.x += dx*h/l;
					point.y += dy*h/l;
				}
			}
			return point;
		}
	},

  arc_r: {
	  value: function (x1,y1,x2,y2,h) {
      if (!h){
        return 0;
      }
	    const [dx, dy] = [(x1-x2), (y1-y2)];
      return (h/2 + (dx * dx + dy * dy) / (8 * h)).round(3);
    }
  },

	snap_to_angle: {
		value: function(snapAngle) {

			if(!snapAngle){
        snapAngle = Math.PI*2/8;
      }

			let angle = Math.atan2(this.y, this.x);
			angle = Math.round(angle/snapAngle) * snapAngle;

			const dirx = Math.cos(angle),
				diry = Math.sin(angle),
				d = dirx*this.x + diry*this.y;

			return new paper.Point(dirx*d, diry*d);
		}
	},

  bind_to_nodes: {
	  value: function (sticking) {
      return paper.project.activeLayer.nodes.some((point) => {
        if(point.is_nearest(this, sticking)){
          this.x = point.x;
          this.y = point.y;
          return true;
        }
      });
    }
  },

});







class CnnPoint {

  constructor(parent, node) {

    this._parent = parent;
    this._node = node;

    this.initialize();
  }

  get is_t() {
    if(!this.cnn || this.cnn.cnn_type == $p.enm.cnn_types.УгловоеДиагональное) {
      return false;
    }

    if(this.cnn.cnn_type == $p.enm.cnn_types.ТОбразное) {
      return true;
    }

    if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной && this.parent.orientation != $p.enm.orientations.vert) {
      return true;
    }

    if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной && this.parent.orientation != $p.enm.orientations.hor) {
      return true;
    }

    return false;
  }

  get is_tt() {
    return !(this.is_i || this.profile_point == 'b' || this.profile_point == 'e' || this.profile == this.parent);
  }

  get is_l() {
    return this.is_t ||
      !!(this.cnn && (this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной ||
        this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной));
  }

  get is_i() {
    return !this.profile && !this.is_cut;
  }

  get parent() {
    return this._parent;
  }

  get node() {
    return this._node;
  }

  clear() {
    if(this.profile_point) {
      delete this.profile_point;
    }
    if(this.is_cut) {
      delete this.is_cut;
    }
    this.profile = null;
    this.err = null;
    this.distance = Infinity;
    this.cnn_types = $p.enm.cnn_types.acn.i;
    if(this.cnn && this.cnn.cnn_type != $p.enm.cnn_types.i) {
      this.cnn = null;
    }
  }

  get err() {
    return this._err;
  }

  set err(v) {
    if(!v) {
      this._err.length = 0;
    }
    else if(this._err.indexOf(v) == -1) {
      this._err.push(v);
    }
  }

  check_err(style) {
    const {_node, _parent, cnn} = this;
    const {_corns, _rays} = _parent._attr;
    const len = _node == 'b' ? _corns[1].getDistance(_corns[4]) : _corns[2].getDistance(_corns[3]);
    if(!cnn || (cnn.lmin > 0 && cnn.lmin > len) || (cnn.lmax > 0 && cnn.lmax < len)) {
      if(style) {
        Object.assign(new paper.Path.Circle({
          center: _node == 'b' ? _corns[4].add(_corns[1]).divide(2) : _corns[2].add(_corns[3]).divide(2),
          radius: 80,
        }), style);
      }
      else {
        _parent.err_spec_row($p.job_prm.nom.critical_error, cnn ? $p.msg.err_seam_len : $p.msg.err_no_cnn);
      }
    }
  }

  get profile() {
    if(this._profile === undefined && this._row && this._row.elm2) {
      this._profile = this.parent.layer.getItem({elm: this._row.elm2});
      delete this._row;
    }
    return this._profile;
  }

  set profile(v) {
    this._profile = v;
  }

  get npoint() {
    const point = this.point || this.parent[this.node];
    if(!this.is_tt) {
      return point;
    }
    const {profile} = this;
    if(!profile || !profile.nearest(true)) {
      return point;
    }
    return profile.nearest(true).generatrix.getNearestPoint(point) || point;
  }

  initialize() {

    const {_parent, _node} = this;

    this._err = [];

    this._row = _parent.project.connections.cnns.find({elm1: _parent.elm, node1: _node});

    this._profile;

    if(this._row) {

      this.cnn = this._row.cnn;

      if($p.enm.cnn_types.acn.a.indexOf(this.cnn.cnn_type) != -1) {
        this.cnn_types = $p.enm.cnn_types.acn.a;
      }
      else if($p.enm.cnn_types.acn.t.indexOf(this.cnn.cnn_type) != -1) {
        this.cnn_types = $p.enm.cnn_types.acn.t;
      }
      else {
        this.cnn_types = $p.enm.cnn_types.acn.i;
      }
    }
    else {
      this.cnn = null;
      this.cnn_types = $p.enm.cnn_types.acn.i;
    }

    this.distance = Infinity;

    this.point = null;

    this.profile_point = '';

  }
}

class ProfileRays {

  constructor(parent) {
    this.parent = parent;
    this.b = new CnnPoint(this.parent, 'b');
    this.e = new CnnPoint(this.parent, 'e');
    this.inner = new paper.Path({insert: false});
    this.outer = new paper.Path({insert: false});
  }

  clear_segments() {
    if(this.inner.segments.length) {
      this.inner.removeSegments();
    }
    if(this.outer.segments.length) {
      this.outer.removeSegments();
    }
  }

  clear(with_cnn) {
    this.clear_segments();
    if(with_cnn) {
      this.b.clear();
      this.e.clear();
    }
  }

  recalc() {

    const {parent} = this;
    const path = parent.generatrix;
    const len = path.length;

    this.clear();

    if(!len) {
      return;
    }

    const {d1, d2, width} = parent;
    const ds = 3 * width;
    const step = len * 0.02;

    let point_b = path.firstSegment.point,
      tangent_b = path.getTangentAt(0),
      normal_b = path.getNormalAt(0),
      point_e = path.lastSegment.point,
      tangent_e, normal_e;

    this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
    this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_b.multiply(-ds)));

    if(path.is_linear()) {
      this.outer.add(point_e.add(normal_b.multiply(d1)).add(tangent_b.multiply(ds)));
      this.inner.add(point_e.add(normal_b.multiply(d2)).add(tangent_b.multiply(ds)));
    }
    else {

      this.outer.add(point_b.add(normal_b.multiply(d1)));
      this.inner.add(point_b.add(normal_b.multiply(d2)));

      for (let i = step; i <= len; i += step) {
        point_b = path.getPointAt(i);
        if(!point_b) {
          continue;
        }
        normal_b = path.getNormalAt(i);
        this.outer.add(point_b.add(normal_b.normalize(d1)));
        this.inner.add(point_b.add(normal_b.normalize(d2)));
      }

      normal_e = path.getNormalAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)));
      this.inner.add(point_e.add(normal_e.multiply(d2)));

      tangent_e = path.getTangentAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)).add(tangent_e.multiply(ds)));
      this.inner.add(point_e.add(normal_e.multiply(d2)).add(tangent_e.multiply(ds)));

      this.outer.simplify(0.8);
      this.inner.simplify(0.8);
    }

    this.inner.reverse();
  }

}


class ProfileItem extends GeneratrixElement {

  get d1() {
    return -(this.d0 - this.sizeb);
  }

  get d2() {
    return this.d1 - this.width;
  }

  hhpoint(side) {
    const {layer, rays} = this;
    const {h_ruch, furn} = layer;
    const {furn_set, handle_side} = furn;
    if(!h_ruch || !handle_side || furn_set.empty()) {
      return;
    }
    if(layer.profile_by_furn_side(handle_side) == this) {
      return rays[side].intersect_point(layer.handle_line(this));
    }
  }

  get hhi() {
    return this.hhpoint('inner');
  }

  get hho() {
    return this.hhpoint('outer');
  }

  get cnn1() {
    return this.cnn_point('b').cnn || $p.cat.cnns.get();
  }

  set cnn1(v) {
    const {rays, project} = this;
    const cnn = $p.cat.cnns.get(v);
    if(rays.b.cnn != cnn) {
      rays.b.cnn = cnn;
      project.register_change();
    }
  }

  get cnn2() {
    return this.cnn_point('e').cnn || $p.cat.cnns.get();
  }

  set cnn2(v) {
    const {rays, project} = this;
    const cnn = $p.cat.cnns.get(v);
    if(rays.e.cnn != cnn) {
      rays.e.cnn = cnn;
      project.register_change();
    }
  }

  angle_at(p) {
    const {profile, point} = this.cnn_point(p);
    if(!profile || !point) {
      return 90;
    }
    const g1 = this.generatrix;
    const g2 = profile.generatrix;
    let offset1 = g1.getOffsetOf(g1.getNearestPoint(point)),
      offset2 = g2.getOffsetOf(g2.getNearestPoint(point));
    if(offset1 < 10){
      offset1 = 10;
    }
    else if(Math.abs(offset1 - g1.length) < 10){
      offset1 = g1.length - 10;
    }
    if(offset2 < 10){
      offset2 = 10;
    }
    else if(Math.abs(offset2 - g2.length) < 10){
      offset2 = g2.length - 10;
    }
    const t1 = g1.getTangentAt(offset1);
    const t2 = g2.getTangentAt(offset2);
    const a = t2.negate().getDirectedAngle(t1).round(1);
    return a > 180 ? a - 180 : (a < 0 ? -a : a);
  }

  get a1() {
    return this.angle_at('b');
  }

  get a2() {
    return this.angle_at('e');
  }

  get info() {
    return '№' + this.elm + ' α:' + this.angle_hor.toFixed(0) + '° l:' + this.length.toFixed(0);
  }

  get r() {
    return this._row.r;
  }

  set r(v) {
    const {_row, _attr, project} = this;
    if(_row.r != v) {
      _attr._rays.clear();
      _row.r = v;
      this.set_generatrix_radius();
      project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  get rmin() {
    return this.generatrix.rmin();
  }

  get rmax() {
    return this.generatrix.rmax();
  }

  get arc_ccw() {
    return this._row.arc_ccw;
  }

  set arc_ccw(v) {
    const {_row, _attr, project} = this;
    if(_row.arc_ccw != v) {
      _attr._rays.clear();
      _row.arc_ccw = v;
      this.set_generatrix_radius();
      project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  get arc_h() {
    const {_row, b, e, generatrix} = this;
    if(_row.r) {
      const p = generatrix.getPointAt(generatrix.length / 2);
      return paper.Line.getSignedDistance(b.x, b.y, e.x, e.y, p.x, p.y).round(1);
    }
    return 0;
  }

  set arc_h(v) {
    const {_row, _attr, b, e, arc_h} = this;
    v = parseFloat(v);
    if(arc_h != v) {
      _attr._rays.clear();
      if(v < 0) {
        v = -v;
        _row.arc_ccw = true;
      }
      else {
        _row.arc_ccw = false;
      }
      _row.r = b.arc_r(b.x, b.y, e.x, e.y, v);
      this.set_generatrix_radius(v);
      project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  get angle_hor() {
    const {b, e} = this;
    const res = (new paper.Point(e.x - b.x, b.y - e.y)).angle.round(2);
    return res < 0 ? res + 360 : res;
  }

  get length() {
    const {b, e, outer} = this.rays;
    const gen = this.elm_type == $p.enm.elm_types.Импост ? this.generatrix : outer;
    const ppoints = {};

    for (let i = 1; i <= 4; i++) {
      ppoints[i] = gen.getNearestPoint(this.corns(i));
    }

    ppoints.b = gen.getOffsetOf(ppoints[1]) < gen.getOffsetOf(ppoints[4]) ? ppoints[1] : ppoints[4];
    ppoints.e = gen.getOffsetOf(ppoints[2]) > gen.getOffsetOf(ppoints[3]) ? ppoints[2] : ppoints[3];

    const sub_gen = gen.get_subpath(ppoints.b, ppoints.e);
    const res = sub_gen.length + (b.cnn ? b.cnn.sz : 0) + (e.cnn ? e.cnn.sz : 0);
    sub_gen.remove();

    return res;
  }

  get orientation() {
    let {angle_hor} = this;
    if(angle_hor > 180) {
      angle_hor -= 180;
    }
    if((angle_hor > -consts.orientation_delta && angle_hor < consts.orientation_delta) ||
      (angle_hor > 180 - consts.orientation_delta && angle_hor < 180 + consts.orientation_delta)) {
      return $p.enm.orientations.hor;
    }
    if((angle_hor > 90 - consts.orientation_delta && angle_hor < 90 + consts.orientation_delta) ||
      (angle_hor > 270 - consts.orientation_delta && angle_hor < 270 + consts.orientation_delta)) {
      return $p.enm.orientations.vert;
    }
    return $p.enm.orientations.incline;
  }

  get rays() {
    const {_rays} = this._attr;
    if(!_rays.inner.segments.length || !_rays.outer.segments.length) {
      _rays.recalc();
    }
    return _rays;
  }

  get addls() {
    return this.children.filter((elm) => elm instanceof ProfileAddl);
  }

  get oxml() {
    const oxml = {
      ' ': [
        {id: 'info', path: 'o.info', type: 'ro'},
        'inset',
        'clr'
      ],
      'Начало': ['x1','y1','a1','cnn1'],
      'Конец': ['x2','y2','a2','cnn2']
    };
    if(this.selected_cnn_ii()) {
      oxml['Примыкание'] = ['cnn3'];
    }
    return oxml;
  }

  get default_clr_str() {
    return 'FEFEFE';
  }

  get opacity() {
    return this.path ? this.path.opacity : 1;
  }

  set opacity(v) {
    this.path && (this.path.opacity = v);
  }

  get dx0() {
    const {cnn} = this.rays.b;
    const main_row = cnn && cnn.main_row(this);
    return main_row && main_row.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? -main_row.sz : 0;
  }

  setSelection(selection) {
    super.setSelection(selection);

    const {generatrix, path} = this._attr;

    generatrix.setSelection(selection);
    this.ruler_line_select(false);

    if(selection) {

      const {inner, outer} = this.rays;

      if(this._hatching) {
        this._hatching.removeChildren();
      }
      else {
        this._hatching = new paper.CompoundPath({
          parent: this,
          guide: true,
          strokeColor: 'grey',
          strokeScaling: false
        });
      }

      path.setSelection(0);

      for (let t = 0; t < inner.length; t += 50) {
        const ip = inner.getPointAt(t);
        const np = inner.getNormalAt(t).multiply(400).rotate(-35).negate();
        const fp = new paper.Path({
          insert: false,
          segments: [ip, ip.add(np)]
        });
        const op = fp.intersect_point(outer, ip);

        if(ip && op) {
          const cip = path.getNearestPoint(ip);
          const cop = path.getNearestPoint(op);
          const nip = cip.is_nearest(ip);
          const nop = cop.is_nearest(op);
          if(nip && nop) {
            this._hatching.moveTo(cip);
            this._hatching.lineTo(cop);
          }
          else if(nip && !nop) {
            const pp = fp.intersect_point(path, op);
            if(pp) {
              this._hatching.moveTo(cip);
              this._hatching.lineTo(pp);
            }
          }
          else if(!nip && nop) {
            const pp = fp.intersect_point(path, ip);
            if(pp) {
              this._hatching.moveTo(pp);
              this._hatching.lineTo(cop);
            }
          }
        }
      }

    }
    else {
      if(this._hatching) {
        this._hatching.remove();
        this._hatching = null;
      }
    }
  }

  ruler_line_select(mode) {

    const {_attr} = this;

    if(_attr.ruler_line_path) {
      _attr.ruler_line_path.remove();
      delete _attr.ruler_line_path;
    }

    if(mode) {
      switch (_attr.ruler_line = mode) {

      case 'inner':
        _attr.ruler_line_path = this.path.get_subpath(this.corns(3), this.corns(4));
        _attr.ruler_line_path.parent = this;
        _attr.ruler_line_path.selected = true;
        break;

      case 'outer':
        _attr.ruler_line_path = this.path.get_subpath(this.corns(1), this.corns(2));
        _attr.ruler_line_path.parent = this;
        _attr.ruler_line_path.selected = true;
        break;

      default:
        this.generatrix.selected = true;
        break;
      }
    }
    else if(_attr.ruler_line) {
      delete _attr.ruler_line;
    }
  }

  ruler_line_coordin(xy) {
    switch (this._attr.ruler_line) {
    case 'inner':
      return (this.corns(3)[xy] + this.corns(4)[xy]) / 2;
    case 'outer':
      return (this.corns(1)[xy] + this.corns(2)[xy]) / 2;
    default:
      return (this.b[xy] + this.e[xy]) / 2;
    }
  }

  save_coordinates() {

    const {_attr, _row, rays, generatrix, project} = this;

    if(!generatrix) {
      return;
    }

    const cnns = project.connections.cnns;
    const b = rays.b;
    const e = rays.e;
    const row_b = cnns.add({
      elm1: _row.elm,
      node1: 'b',
      cnn: b.cnn,
      aperture_len: this.corns(1).getDistance(this.corns(4)).round(1)
    });
    const row_e = cnns.add({
      elm1: _row.elm,
      node1: 'e',
      cnn: e.cnn,
      aperture_len: this.corns(2).getDistance(this.corns(3)).round(1)
    });

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;


    _row.len = this.length.round(1);

    if(b.profile) {
      row_b.elm2 = b.profile.elm;
      if(b.profile.e.is_nearest(b.point)) {
        row_b.node2 = 'e';
      }
      else if(b.profile.b.is_nearest(b.point)) {
        row_b.node2 = 'b';
      }
      else {
        row_b.node2 = 't';
      }
    }
    if(e.profile) {
      row_e.elm2 = e.profile.elm;
      if(e.profile.b.is_nearest(e.point)) {
        row_e.node2 = 'b';
      }
      else if(e.profile.e.is_nearest(e.point)) {
        row_e.node2 = 'b';
      }
      else {
        row_e.node2 = 't';
      }
    }

    const nrst = this.nearest();
    if(nrst) {
      cnns.add({
        elm1: _row.elm,
        elm2: nrst.elm,
        cnn: _attr._nearest_cnn,
        aperture_len: _row.len
      });
    }

    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0) {
      _row.alp1 = _row.alp1 + 360;
    }

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0) {
      _row.alp2 = _row.alp2 + 360;
    }

    _row.elm_type = this.elm_type;

    _row.orientation = this.orientation;
    _row.pos = this.pos;

    this.addls.forEach((addl) => addl.save_coordinates());
  }

  initialize(attr) {

    const {project, _attr, _row} = this;
    const h = project.bounds.height + project.bounds.y;

    if(attr.r) {
      _row.r = attr.r;
    }

    if(attr.generatrix) {
      _attr.generatrix = attr.generatrix;
      if(_attr.generatrix._reversed) {
        delete _attr.generatrix._reversed;
      }
    }
    else {
      if(_row.path_data) {
        _attr.generatrix = new paper.Path(_row.path_data);
      }
      else {
        const first_point = new paper.Point([_row.x1, h - _row.y1]);
        _attr.generatrix = new paper.Path(first_point);
        if(_row.r) {
          _attr.generatrix.arcTo(
            first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2, _row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
        }
        else {
          _attr.generatrix.lineTo([_row.x2, h - _row.y2]);
        }
      }
    }

    _attr._corns = [];

    _attr._rays = new ProfileRays(this);

    _attr.generatrix.strokeColor = 'gray';

    _attr.path = new paper.Path();
    _attr.path.strokeColor = 'black';
    _attr.path.strokeWidth = 1;
    _attr.path.strokeScaling = false;

    this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;

    this.addChild(_attr.path);
    this.addChild(_attr.generatrix);

  }

  observer(an) {
    const {profiles} = an;
    if(profiles) {
      if(profiles.indexOf(this) == -1) {
        profiles.forEach((p) => {
          this.do_bind(p, this.cnn_point('b'), this.cnn_point('e'), an);
        });
        profiles.push(this);
      }
    }
    else if(an instanceof Profile || an instanceof ProfileConnective) {
      this.do_bind(an, this.cnn_point('b'), this.cnn_point('e'));
    }
  }

  cnn_side(profile, interior, rays) {
    if(!interior) {
      interior = profile.interiorPoint();
    }
    if(!rays) {
      rays = this.rays;
    }
    if(!rays || !interior || !rays.inner.length || ! rays.outer.length) {
      return $p.enm.cnn_sides.Изнутри;
    }
    return rays.inner.getNearestPoint(interior).getDistance(interior, true) <
    rays.outer.getNearestPoint(interior).getDistance(interior, true) ? $p.enm.cnn_sides.Изнутри : $p.enm.cnn_sides.Снаружи;
  }

  set_generatrix_radius(height) {
    const {generatrix, _row, layer, project, selected} = this;
    const b = generatrix.firstSegment.point.clone();
    const e = generatrix.lastSegment.point.clone();
    const min_radius = b.getDistance(e) / 2;

    generatrix.removeSegments(1);
    generatrix.firstSegment.handleIn = null;
    generatrix.firstSegment.handleOut = null;

    let full;
    if(_row.r && _row.r <= min_radius) {
      _row.r = min_radius + 0.0001;
      full = true;
    }
    if(height && height > min_radius) {
      height = min_radius;
    }

    if(selected) {
      this.selected = false;
    }

    if(_row.r) {
      let p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, _row.arc_ccw, false));
      if(p.point_pos(b.x, b.y, e.x, e.y) > 0 && !_row.arc_ccw || p.point_pos(b.x, b.y, e.x, e.y) < 0 && _row.arc_ccw) {
        p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, !_row.arc_ccw, false));
      }
      if(full || height) {
        const start = b.add(e).divide(2);
        const vector = p.subtract(start);
        vector.normalize(height || min_radius);
        p = start.add(vector);
      }
      generatrix.arcTo(p, e);
    }
    else {
      generatrix.lineTo(e);
    }

    layer.notify({
      type: consts.move_points,
      profiles: [this],
      points: []
    });

    if(selected) {
      setTimeout(() => this.selected = selected, 100);
    }
  }

  set_inset(v, ignore_select) {

    const {_row, _attr, project} = this;

    if(!ignore_select && project.selectedItems.length > 1) {
      project.selected_profiles(true).forEach((elm) => {
        if(elm != this && elm.elm_type == this.elm_type) {
          elm.set_inset(v, true);
        }
      });
    }

    if(_row.inset != v) {

      _row.inset = v;

      if(_attr && _attr._rays) {

        _attr._rays.clear(true);

        const b = this.cnn_point('b');
        const e = this.cnn_point('e');
        const {cnns} = project.connections;

        if(b.profile && b.profile_point == 'e') {
          const {_rays} = b.profile._attr;
          if(_rays) {
            _rays.clear();
            _rays.e.cnn = null;
          }
        }
        if(e.profile && e.profile_point == 'b') {
          const {_rays} = e.profile._attr;
          if(_rays) {
            _rays.clear();
            _rays.b.cnn = null;
          }
        }

        const imposts = this.joined_imposts();
        const elm2 = this.elm;
        for (const {profile} of imposts.inner.concat(imposts.outer)) {
          const {b, e} = profile.rays;
          b.profile == this && b.clear(true);
          e.profile == this && e.clear(true);
        }

        for (const {_attr, elm} of this.joined_nearests()) {
          _attr._rays && _attr._rays.clear(true);
          _attr._nearest_cnn = null;
          cnns.clear({elm1: elm, elm2});
        }

        this.layer.glasses(false, true).forEach((glass) => {
          cnns.clear({elm1: glass.elm, elm2});
        });
      }

      project.register_change();
    }
  }

  set_clr(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1) {
      this.project.selected_profiles(true).forEach((elm) => {
        if(elm != this) {
          elm.set_clr(v, true);
        }
      });
    }
    BuilderElement.prototype.set_clr.call(this, v);
  }

  postcalc_cnn(node) {
    const cnn_point = this.cnn_point(node);

    cnn_point.cnn = $p.cat.cnns.elm_cnn(this, cnn_point.profile, cnn_point.cnn_types, cnn_point.cnn);

    if(!cnn_point.point) {
      cnn_point.point = this[node];
    }

    return cnn_point;
  }

  postcalc_inset() {
    this.set_inset(this.project.check_inset({elm: this}), true);
    return this;
  }

  default_inset(all) {
    const {orientation, project, _attr, elm_type} = this;
    const nearest = this.nearest(true);

    if(nearest || all) {
      let pos = nearest && project._dp.sys.flap_pos_by_impost && elm_type == $p.enm.elm_types.Створка ? nearest.pos : this.pos;
      if(pos == $p.enm.positions.Центр) {
        if(orientation == $p.enm.orientations.vert) {
          pos = [pos, $p.enm.positions.ЦентрВертикаль];
        }
        if(orientation == $p.enm.orientations.hor) {
          pos = [pos, $p.enm.positions.ЦентрГоризонталь];
        }
      }
      this.set_inset(this.project.default_inset({
        elm_type: elm_type,
        pos: pos,
        inset: this.inset
      }), true);
    }
    if(nearest) {
      _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, _attr._nearest, $p.enm.cnn_types.acn.ii, _attr._nearest_cnn);
    }
  }

  path_points(cnn_point, profile_point) {

    const {_attr, rays, generatrix} = this;
    if(!generatrix.curves.length) {
      return cnn_point;
    }
    const _profile = this;
    const {_corns} = _attr;

    let normal;

    function intersect_point(path1, path2, index) {
      const intersections = path1.getIntersections(path2);
      let delta = Infinity, tdelta, point, tpoint;

      if(intersections.length == 1) {
        if(index) {
          _corns[index] = intersections[0].point;
        }
        else {
          return intersections[0].point.getDistance(cnn_point.point, true);
        }
      }
      else if(intersections.length > 1) {
        intersections.forEach((o) => {
          tdelta = o.point.getDistance(cnn_point.point, true);
          if(tdelta < delta) {
            delta = tdelta;
            point = o.point;
          }
        });
        if(index) {
          _corns[index] = point;
        }
        else {
          return delta;
        }
      }
    }

    const prays = cnn_point.profile instanceof ProfileItem ?
      cnn_point.profile.rays :
      (cnn_point.profile instanceof Filling ? {inner: cnn_point.profile.path, outer: cnn_point.profile.path} : undefined);

    const {cnn_type} = cnn_point.cnn || {};
    const {cnn_types} = $p.enm;
    if(cnn_point.is_t || (cnn_type == cnn_types.xx && !cnn_point.profile_point)) {

      !cnn_point.profile.path.segments.length && cnn_point.profile.redraw();

      if(profile_point == 'b') {
        if(cnn_point.profile.cnn_side(this, null, prays) === $p.enm.cnn_sides.Снаружи) {
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else {
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
      }
      else if(profile_point == 'e') {
        if(cnn_point.profile.cnn_side(this, null, prays) === $p.enm.cnn_sides.Снаружи) {
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
        else {
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
    }
    else if(cnn_type == cnn_types.xx) {

      if(cnn_point.profile instanceof Onlay) {
        const width = this.width * 0.7;
        const l = profile_point == 'b' ? width : generatrix.length - width;
        const p = generatrix.getPointAt(l);
        const n = generatrix.getNormalAt(l).normalize(width);
        const np = new paper.Path({
          insert: false,
          segments: [p.subtract(n), p.add(n)],
        });
        if(profile_point == 'b') {
          intersect_point(np, rays.outer, 1);
          intersect_point(np, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(np, rays.outer, 2);
          intersect_point(np, rays.inner, 3);
        }
      }
      else {
        const cnn_point2 = cnn_point.profile.cnn_point(cnn_point.profile_point);
        const profile2 = cnn_point2 && cnn_point2.profile;
        if(profile2) {
          const prays2 = profile2 && profile2.rays;
          const pt1 = intersect_point(prays.inner, rays.outer);
          const pt2 = intersect_point(prays.inner, rays.inner);
          const pt3 = intersect_point(prays2.inner, rays.outer);
          const pt4 = intersect_point(prays2.inner, rays.inner);

          if(profile_point == 'b') {
            intersect_point(prays2.inner, prays.inner, 5);
            pt1 > pt3 ? intersect_point(prays.inner, rays.outer, 1) : intersect_point(prays2.inner, rays.outer, 1);
            pt2 > pt4 ? intersect_point(prays.inner, rays.inner, 4) : intersect_point(prays2.inner, rays.inner, 4);
          }
          else if(profile_point == 'e') {
            pt1 > pt3 ? intersect_point(prays.inner, rays.outer, 2) : intersect_point(prays2.inner, rays.outer, 2);
            pt2 > pt4 ? intersect_point(prays.inner, rays.inner, 3) : intersect_point(prays2.inner, rays.inner, 3);
            intersect_point(prays2.inner, prays.inner, 6);
          }
        }
        else{
          if(profile_point == 'b') {
            delete _corns[1];
            delete _corns[4];
          }
          else if(profile_point == 'e') {
            delete _corns[2];
            delete _corns[3];
          }
        }
      }

    }
    else if(!cnn_point.profile_point || !cnn_point.cnn || cnn_type == cnn_types.i) {
      if(profile_point == 'b') {
        delete _corns[1];
        delete _corns[4];
      }
      else if(profile_point == 'e') {
        delete _corns[2];
        delete _corns[3];
      }
    }
    else if(cnn_type == cnn_types.ad) {
      if(profile_point == 'b') {
        intersect_point(prays.outer, rays.outer, 1);
        intersect_point(prays.inner, rays.inner, 4);
      }
      else if(profile_point == 'e') {
        intersect_point(prays.outer, rays.outer, 2);
        intersect_point(prays.inner, rays.inner, 3);
      }

    }
    else if(cnn_type == cnn_types.av) {
      if(this.orientation == $p.enm.orientations.vert) {
        if(profile_point == 'b') {
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
      }
      else if(this.orientation == $p.enm.orientations.hor) {
        if(profile_point == 'b') {
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
      else {
        cnn_point.err = 'orientation';
      }
    }
    else if(cnn_type == cnn_types.ah) {
      if(this.orientation == $p.enm.orientations.vert) {
        if(profile_point == 'b') {
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
      else if(this.orientation == $p.enm.orientations.hor) {
        if(profile_point == 'b') {
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
      }
      else {
        cnn_point.err = 'orientation';
      }
    }

    if(profile_point == 'b') {
      if(!_corns[1]) {
        _corns[1] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
      }
      if(!_corns[4]) {
        _corns[4] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));
      }
    }
    else if(profile_point == 'e') {
      if(!_corns[2]) {
        _corns[2] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
      }
      if(!_corns[3]) {
        _corns[3] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
      }
    }

    return cnn_point;
  }

  interiorPoint() {
    const {generatrix, d1, d2} = this;
    const igen = generatrix.curves.length == 1 ? generatrix.firstCurve.getPointAt(0.5, true) : (
      generatrix.curves.length == 2 ? generatrix.firstCurve.point2 : generatrix.curves[1].point2
    );
    const normal = generatrix.getNormalAt(generatrix.getOffsetOf(igen));
    return igen.add(normal.multiply(d1).add(normal.multiply(d2)).divide(2));
  }


  select_corn(point) {

    const res = this.corns(point);

    this.path.segments.forEach((segm) => {
      if(segm.point.is_nearest(res.point)) {
        res.segm = segm;
      }
    });

    if(!res.segm && res.point == this.b) {
      res.segm = this.generatrix.firstSegment;
    }

    if(!res.segm && res.point == this.e) {
      res.segm = this.generatrix.lastSegment;
    }

    if(res.segm && res.dist < consts.sticking0) {
      this.project.deselectAll();
      res.segm.selected = true;
    }

    return res;
  }

  is_linear() {
    return this.generatrix.is_linear();
  }

  is_nearest(p) {
    return (this.b.is_nearest(p.b, true) || this.generatrix.getNearestPoint(p.b).is_nearest(p.b)) &&
      (this.e.is_nearest(p.e, true) || this.generatrix.getNearestPoint(p.e).is_nearest(p.e));
  }

  is_collinear(p) {
    let angl = p.e.subtract(p.b).getDirectedAngle(this.e.subtract(this.b));
    if(angl < -180) {
      angl += 180;
    }
    return Math.abs(angl) < consts.orientation_delta;
  }

  joined_nearests() {
    return [];
  }

  redraw() {
    const bcnn = this.postcalc_cnn('b');
    const ecnn = this.postcalc_cnn('e');
    const {path, generatrix, rays, project} = this;

    this.path_points(bcnn, 'b');
    this.path_points(ecnn, 'e');

    path.removeSegments();

    this.corns(5) && path.add(this.corns(5));
    path.add(this.corns(1));

    if(generatrix.is_linear()) {
      path.add(this.corns(2));
      this.corns(6) && path.add(this.corns(6));
      path.add(this.corns(3));
    }
    else {

      let tpath = new paper.Path({insert: false});
      let offset1 = rays.outer.getNearestLocation(this.corns(1)).offset;
      let offset2 = rays.outer.getNearestLocation(this.corns(2)).offset;
      let step = (offset2 - offset1) / 50;

      for (let i = offset1 + step; i < offset2; i += step) {
        tpath.add(rays.outer.getPointAt(i));
      }
      tpath.simplify(0.8);
      path.join(tpath);
      path.add(this.corns(2));
      this.corns(6) && path.add(this.corns(6));
      path.add(this.corns(3));

      tpath = new paper.Path({insert: false});
      offset1 = rays.inner.getNearestLocation(this.corns(3)).offset;
      offset2 = rays.inner.getNearestLocation(this.corns(4)).offset;
      step = (offset2 - offset1) / 50;
      for (let i = offset1 + step; i < offset2; i += step) {
        tpath.add(rays.inner.getPointAt(i));
      }
      tpath.simplify(0.8);
      path.join(tpath);

    }

    path.add(this.corns(4));
    path.closePath();
    path.reduce();

    this.children.forEach((elm) => {
      if(elm instanceof ProfileAddl) {
        elm.observer(elm.parent);
        elm.redraw();
      }
    });

    return this;
  }


  corns(corn) {
    const {_corns} = this._attr;
    if(typeof corn == 'number') {
      return _corns[corn];
    }
    else if(corn instanceof paper.Point) {

      const res = {dist: Infinity, profile: this};
      let dist;

      for (let i = 1; i < 5; i++) {
        dist = _corns[i].getDistance(corn);
        if(dist < res.dist) {
          res.dist = dist;
          res.point = _corns[i];
          res.point_name = i;
        }
      }

      const {hhi} = this;
      if(hhi) {
        dist = hhi.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = hhi.getDistance(corn);
          res.point = hhi;
          res.point_name = 'hhi';
        }
        const {hho} = this;
        dist = hho.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = hho.getDistance(corn);
          res.point = hho;
          res.point_name = 'hho';
        }
      }

      dist = this.b.getDistance(corn);
      if(dist <= res.dist) {
        res.dist = this.b.getDistance(corn);
        res.point = this.b;
        res.point_name = 'b';
      }
      else {
        dist = this.e.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = this.e.getDistance(corn);
          res.point = this.e;
          res.point_name = 'e';
        }
      }

      return res;
    }
    else {
      const index = corn.substr(corn.length - 1, 1);
      const axis = corn.substr(corn.length - 2, 1);
      return _corns[index][axis];
    }
  }

  has_cnn(profile, point) {

    let t = this;

    while (t.parent instanceof ProfileItem) {
      t = t.parent;
    }

    while (profile.parent instanceof ProfileItem) {
      profile = profile.parent;
    }

    if(
      (t.b.is_nearest(point, true) && t.cnn_point('b').profile == profile) ||
      (t.e.is_nearest(point, true) && t.cnn_point('e').profile == profile) ||
      (profile.b.is_nearest(point, true) && profile.cnn_point('b').profile == t) ||
      (profile.e.is_nearest(point, true) && profile.cnn_point('e').profile == t)
    ) {
      return true;
    }
    else {
      return false;
    }
  }

  check_distance(element, res, point, check_only) {
    return this.project.check_distance(element, this, res, point, check_only);
  }

  max_right_angle(ares) {
    const {generatrix} = this;
    let has_a = true;
    ares.forEach((res) => {
      res._angle = generatrix.angle_to(res.profile.generatrix, res.point);
      if(res._angle > 180) {
        res._angle = 360 - res._angle;
      }
    });
    ares.sort((a, b) => {
      const aa = Math.abs(a._angle - 90);
      const ab = Math.abs(b._angle - 90);
      return aa - ab;
    });
    return has_a;
  }

}


class Profile extends ProfileItem {

  constructor(attr) {

    const fromCoordinates = !!attr.row;

    super(attr);

    if(this.parent) {
      const {project, observer} = this;

      this.observer = observer.bind(this);
      project._scope.eve.on(consts.move_points, this.observer);

      this.layer.on_insert_elm(this);

      if(fromCoordinates){
        const {cnstr, elm} = attr.row;
        project.ox.coordinates.find_rows({cnstr, parent: {in: [elm, -elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => new ProfileAddl({row, parent: this}));
      }
    }

  }

  get d0() {
    const {_attr} = this;
    if(!_attr.hasOwnProperty('d0')) {
      _attr.d0 = 0;
      const nearest = this.nearest();
      if(nearest) {
        _attr.d0 -= nearest.d2 + (_attr._nearest_cnn ? _attr._nearest_cnn.sz : 20);
      }
    }
    return _attr.d0;
  }

  get elm_type() {
    const {_rays, _nearest} = this._attr;

    if(_rays && !_nearest && (_rays.b.is_tt || _rays.e.is_tt)) {
      return $p.enm.elm_types.Импост;
    }

    if(this.layer.parent instanceof Contour) {
      return $p.enm.elm_types.Створка;
    }

    return $p.enm.elm_types.Рама;
  }

  get pos() {
    const by_side = this.layer.profiles_by_side();
    if(by_side.top == this) {
      return $p.enm.positions.Верх;
    }
    if(by_side.bottom == this) {
      return $p.enm.positions.Низ;
    }
    if(by_side.left == this) {
      return $p.enm.positions.Лев;
    }
    if(by_side.right == this) {
      return $p.enm.positions.Прав;
    }
    return $p.enm.positions.Центр;
  }

  nearest(ign_cnn) {

    const {b, e, _attr, layer, project} = this;
    let {_nearest, _nearest_cnn} = _attr;

    if(!ign_cnn && this.inset.empty()) {
      ign_cnn = true;
    }

    const check_nearest = (elm) => {
      if(!(elm instanceof Profile || elm instanceof ProfileConnective) || !elm.isInserted()) {
        return;
      }
      const {generatrix} = elm;
      let is_nearest = [];
      if(generatrix.getNearestPoint(b).is_nearest(b)) {
        is_nearest.push(b);
      }
      if(generatrix.getNearestPoint(e).is_nearest(e)) {
        is_nearest.push(e);
      }
      if(is_nearest.length < 2 && elm instanceof ProfileConnective) {
        if(this.generatrix.getNearestPoint(elm.b).is_nearest(elm.b)) {
          if(is_nearest.every((point) => !point.is_nearest(elm.b))) {
            is_nearest.push(elm.b);
          }
        }
        if(this.generatrix.getNearestPoint(elm.e).is_nearest(elm.e)) {
          if(is_nearest.every((point) => !point.is_nearest(elm.e))) {
            is_nearest.push(elm.e);
          }
        }
      }

      if(is_nearest.length > 1) {
        if(!ign_cnn) {
          if(!_nearest_cnn) {
            _nearest_cnn = project.connections.elm_cnn(this, elm);
          }
          _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, elm, $p.enm.cnn_types.acn.ii, _nearest_cnn, false, Math.abs(elm.angle_hor - this.angle_hor) > 60);
        }
        _attr._nearest = elm;
        return true;
      }

      _attr._nearest = null;
      _attr._nearest_cnn = null;
    };

    const find_nearest = (children) => children.some((elm) => {
      if(_nearest == elm || !elm.generatrix) {
        return;
      }
      if(check_nearest(elm)) {
        return true;
      }
      else {
        _attr._nearest = null;
      }
    });

    if(layer && !check_nearest(_attr._nearest)) {
      if(layer.parent) {
        find_nearest(layer.parent.profiles);
      }
      else {
        find_nearest(project.l_connective.children);
      }
    }

    return _attr._nearest;
  }

  joined_imposts(check_only) {

    const {rays, generatrix, layer} = this;
    const tinner = [];
    const touter = [];

    const candidates = {b: [], e: []};

    const add_impost = (ip, curr, point) => {
      const res = {point: generatrix.getNearestPoint(point), profile: curr};
      if(this.cnn_side(curr, ip, rays) === $p.enm.cnn_sides.Снаружи) {
        touter.push(res);
      }
      else {
        tinner.push(res);
      }
    };

    if(layer.profiles.some((curr) => {
        if(curr != this) {
          for(const pn of ['b', 'e']) {
            const p = curr.cnn_point(pn);
            if(p.profile == this && p.cnn) {

              if(p.cnn.cnn_type == $p.enm.cnn_types.t) {
                if(check_only) {
                  return true;
                }
                add_impost(curr.corns(1), curr, p.point);
              }
              else {
                candidates[pn].push(curr.corns(1));
              }
            }
          }
        }
      })) {
      return true;
    }

    ['b', 'e'].forEach((node) => {
      if(candidates[node].length > 1) {
        candidates[node].some((ip) => {
          if(this.cnn_side(null, ip, rays) == $p.enm.cnn_sides.Снаружи) {
            this.cnn_point(node).is_cut = true;
            return true;
          }
        });
      }
    });

    return check_only ? false : {inner: tinner, outer: touter};

  }

  joined_nearests() {
    const res = [];

    this.layer.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) == this) {
          res.push(profile);
        }
      });
    });

    return res;
  }

  cnn_point(node, point) {
    const res = this.rays[node];
    const {cnn, profile, profile_point} = res;

    if(!point) {
      point = this[node];
    }

    if(profile && profile.children.length) {
      if(this.check_distance(profile, res, point, true) === false || res.distance < consts.epsilon) {
        return res;
      }
    }

    res.clear();
    if(this.parent) {
      const {allow_open_cnn} = this.project._dp.sys;
      const ares = [];

      for(const profile of this.parent.profiles) {
        if(this.check_distance(profile, res, point, false) === false || (res.distance < ((res.is_t || !res.is_l) ? consts.sticking : consts.sticking_l))) {
          ares.push({
            profile_point: res.profile_point,
            profile: profile,
            cnn_types: res.cnn_types,
            point: res.point
          });
          res.clear();
        }
      }

      if(ares.length === 1) {
        res._mixin(ares[0]);
      }
      else if(ares.length >= 2) {
        if(this.max_right_angle(ares)) {
          res._mixin(ares[0]);
          if(cnn && res.cnn_types && res.cnn_types.indexOf(cnn.cnn_type) != -1) {
            res.cnn = cnn;
          }
        }
        else {
          res.clear();
        }
        res.is_cut = true;
      }
    }

    return res;
  }

  do_bind(profile, bcnn, ecnn, moved) {

    let moved_fact;

    if(profile instanceof ProfileConnective) {
      const gen = profile.generatrix.clone({insert: false}).elongation(1000);
      this._attr._rays.clear();
      this.b = gen.getNearestPoint(this.b);
      this.e = gen.getNearestPoint(this.e);
      moved_fact = true;
    }
    else {
      if(bcnn.cnn && bcnn.profile == profile) {
        if($p.enm.cnn_types.acn.a.indexOf(bcnn.cnn.cnn_type) != -1) {
          if(!this.b.is_nearest(profile.e, 0)) {
            if(bcnn.is_t || bcnn.cnn.cnn_type == $p.enm.cnn_types.ad) {
              if(paper.Key.isDown('control')) {
                console.log('control');
              }
              else {
                if(this.b.getDistance(profile.e, true) < consts.sticking2) {
                  this.b = profile.e;
                }
                moved_fact = true;
              }
            }
            else {
              bcnn.clear();
              this._attr._rays.clear();
            }
          }
        }
        else if($p.enm.cnn_types.acn.t.indexOf(bcnn.cnn.cnn_type) != -1 && this.do_sub_bind(profile, 'b')) {
          moved_fact = true;
        }
      }

      if(ecnn.cnn && ecnn.profile == profile) {
        if($p.enm.cnn_types.acn.a.indexOf(ecnn.cnn.cnn_type) != -1) {
          if(!this.e.is_nearest(profile.b, 0)) {
            if(ecnn.is_t || ecnn.cnn.cnn_type == $p.enm.cnn_types.ad) {
              if(paper.Key.isDown('control')) {
                console.log('control');
              }
              else {
                if(this.e.getDistance(profile.b, true) < consts.sticking2) {
                  this.e = profile.b;
                }
                moved_fact = true;
              }
            }
            else {
              ecnn.clear();
              this._attr._rays.clear();
            }
          }
        }
        else if($p.enm.cnn_types.acn.t.indexOf(ecnn.cnn.cnn_type) != -1 && this.do_sub_bind(profile, 'e')) {
          moved_fact = true;
        }
      }
    }

    if(moved && moved_fact) {
      const imposts = this.joined_imposts();
      imposts.inner.concat(imposts.outer).forEach((impost) => {
        if(moved.profiles.indexOf(impost) == -1) {
          impost.profile.observer(this);
        }
      });
    }
  }

  t_parent(be) {
    if(this.elm_type != $p.enm.elm_types.Импост) {
      return this;
    }
    const {_rays} = this._attr;
    if(be === 'b') {
      return _rays && _rays.b.profile;
    }
    if(be === 'e') {
      return _rays && _rays.e.profile;
    }
    return _rays && (_rays.b.profile || _rays.e.profile);
  }
}

Editor.Profile = Profile;
Editor.ProfileItem = ProfileItem;



class ProfileAddl extends ProfileItem {

  constructor(attr) {

    const fromCoordinates = !!attr.row;

    super(attr);

    const {project, _attr, _row} = this;

    _attr.generatrix.strokeWidth = 0;

    if(!attr.side && _row.parent < 0){
      attr.side = "outer";
    }

    _attr.side = attr.side || "inner";

    if(!_row.parent){
      _row.parent = this.parent.elm;
      if(this.outer){
        _row.parent = -_row.parent;
      }
    }

    if(fromCoordinates){
      const {cnstr, elm} = attr.row;
      project.ox.coordinates.find_rows({cnstr, parent: {in: [elm, -elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => new ProfileAddl({row, parent: this}));
    }

  }

  get d0() {
    this.nearest();
    return this._attr._nearest_cnn ? -this._attr._nearest_cnn.sz : 0;
  }

  get outer() {
    return this._attr.side == "outer";
  }

  get elm_type() {
    return $p.enm.elm_types.Добор;
  }

  nearest() {
    const {_attr, parent, project} = this;
    const _nearest_cnn = _attr._nearest_cnn || project.connections.elm_cnn(this, parent);
    _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, parent, $p.enm.cnn_types.acn.ii, _nearest_cnn, true);
    return parent;
  }

  cnn_point(node, point) {

    const res = this.rays[node];

    const check_distance = (elm, with_addl) => {

        if(elm == this || elm == this.parent){
          return;
        }

        const gp = elm.generatrix.getNearestPoint(point);
        let distance;

        if(gp && (distance = gp.getDistance(point)) < consts.sticking){
          if(distance <= res.distance){
            res.point = gp;
            res.distance = distance;
            res.profile = elm;
          }
        }

        if(with_addl){
          elm.getItems({class: ProfileAddl, parent: elm}).forEach((addl) => {
            check_distance(addl, with_addl);
          });
        }

      };

    if(!point){
      point = this[node];
    }

    if(res.profile && res.profile.children.length){
      check_distance(res.profile);
      if(res.distance < consts.sticking){
        return res;
      }
    }

    res.clear();
    res.cnn_types = $p.enm.cnn_types.acn.t;

    this.layer.profiles.forEach((addl) => check_distance(addl, true));

    return res;
  }

  path_points(cnn_point, profile_point) {

    const {generatrix, rays} = this;
    const interior = generatrix.getPointAt(generatrix.length/2);

    const _profile = this;
    const _corns = this._attr._corns;

    if(!generatrix.curves.length){
      return cnn_point;
    }

    function intersect_point(path1, path2, index){
      var intersections = path1.getIntersections(path2),
        delta = Infinity, tdelta, point, tpoint;

      if(intersections.length == 1)
        if(index)
          _corns[index] = intersections[0].point;
        else
          return intersections[0].point.getDistance(cnn_point.point, true);

      else if(intersections.length > 1){
        intersections.forEach((o) => {
          tdelta = o.point.getDistance(cnn_point.point, true);
          if(tdelta < delta){
            delta = tdelta;
            point = o.point;
          }
        });
        if(index)
          _corns[index] = point;
        else
          return delta;
      }
    }

    const {profile} = cnn_point;
    if(profile){
      const prays = profile.rays;

      if(!profile.path.segments.length){
        profile.redraw();
      }

      if(profile_point == "b"){
        if(profile.cnn_side(this, interior, prays) == $p.enm.cnn_sides.Снаружи){
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else{
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
      }
      else if(profile_point == "e"){
        if(profile.cnn_side(this, interior, prays) == $p.enm.cnn_sides.Снаружи){
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
        else{
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
    }

    if(profile_point == "b"){
      if(!_corns[1]){
        _corns[1] = this.b.add(generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
      }
      if(!_corns[4]){
        _corns[4] = this.b.add(generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));
      }
    }
    else if(profile_point == "e"){
      if(!_corns[2]){
        _corns[2] = this.e.add(generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
      }
      if(!_corns[3]){
        _corns[3] = this.e.add(generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
      }
    }
    return cnn_point;
  }

  do_bind(p, bcnn, ecnn, moved) {

    let imposts, moved_fact;

    const bind_node = (node, cnn) => {

        if(!cnn.profile){
          return;
        }

        const gen = this.outer ? this.parent.rays.outer : this.parent.rays.inner;
        const mpoint = cnn.profile.generatrix.intersect_point(gen, cnn.point, "nearest");
        if(!mpoint.is_nearest(this[node])){
          this[node] = mpoint;
          moved_fact = true;
        }

      };

    if(this.parent == p){
      bind_node("b", bcnn);
      bind_node("e", ecnn);
    }

    if(bcnn.cnn && bcnn.profile == p){

      bind_node("b", bcnn);

    }
    if(ecnn.cnn && ecnn.profile == p){

      bind_node("e", ecnn);

    }

    if(moved && moved_fact){
    }
  }

  glass_segment() {

  }

}



class ProfileConnective extends ProfileItem {

  constructor(attr) {
    super(attr);
    this.parent = this.project.l_connective;
  }

  get d0() {
    return 0;
  }

  get elm_type() {
    return $p.enm.elm_types.Соединитель;
  }

  cnn_point(node) {
    return this.rays[node];
  }

  move_points(delta, all_points, start_point) {

    const nearests = this.joined_nearests();
    const moved = {profiles: []};

    super.move_points(delta, all_points, start_point);

    if(all_points !== false && !paper.Key.isDown('control')){
      nearests.forEach((np) => {
        np.do_bind(this, null, null, moved);
        ['b', 'e'].forEach((node) => {
          const cp = np.cnn_point(node);
          if(cp.profile){
            cp.profile.do_bind(np, cp.profile.cnn_point("b"), cp.profile.cnn_point("e"), moved);
          }
        });
      });
    }

    this.project.register_change();
  }

  joined_nearests() {

    const res = [];

    this.project.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) === this){
          res.push(profile);
        }
      });
    });

    return res;

  }

  nearest() {
    return null;
  }

  save_coordinates() {

    if(!this._attr.generatrix){
      return;
    }

    const {_row, generatrix} = this;

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.nom = this.nom;
    _row.path_data = generatrix.pathData;
    _row.parent = 0;

    _row.len = this.length;

    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0){
      _row.alp1 = _row.alp1 + 360;
    }

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0){
      _row.alp2 = _row.alp2 + 360;
    }

    _row.elm_type = this.elm_type;

  }

  remove() {
    this.joined_nearests().forEach((np) => {
      const {_attr} = np;
      if(_attr._rays){
        _attr._rays.clear();
      }
      if(_attr._nearest){
        _attr._nearest = null;
      }
      if(_attr._nearest_cnn){
        _attr._nearest_cnn = null;
      }
    });
    super.remove();
  }

}


class ConnectiveLayer extends paper.Layer {

  redraw() {
    this.children.forEach((elm) => elm.redraw());
  }

  save_coordinates() {
    this.children.forEach((elm) => elm.save_coordinates && elm.save_coordinates());
  }

  glasses() {
    return [];
  }

  notify(obj, type = 'update') {
  }
}

Editor.ProfileConnective = ProfileConnective;


class BaseLine extends ProfileItem {

  constructor(attr) {
    super(attr);
    this.parent = this.project.l_connective;
    Object.assign(this.generatrix, {
      strokeColor: 'brown',
      fillColor: new paper.Color(1, 0.1),
      strokeScaling: false,
      strokeWidth: 2,
      dashOffset: 4,
      dashArray: [4, 4],
    })
  }

  get d0() {
    return 0;
  }

  get d1() {
    return 0;
  }

  get d2() {
    return 0;
  }

  get path() {
    return this.generatrix;
  }
  set path(v) {
  }

  setSelection(selection) {
    paper.Item.prototype.setSelection.call(this, selection);
  }

  get oxml() {
    return BaseLine.oxml;
  }

  get elm_type() {
    return $p.enm.elm_types.Линия;
  }

  get length() {
    return this.generatrix.length;
  }

  nearest() {
    return null;
  }

  joined_nearests() {

    const res = [];

    this.project.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) === this){
          res.push(profile);
        }
      });
    });

    return res;

  }

  joined_imposts(check_only) {
    const tinner = [];
    const touter = [];
    return check_only ? false : {inner: tinner, outer: touter};
  }

  save_coordinates() {

    if(!this._attr.generatrix){
      return;
    }

    const {_row} = this;

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = this.generatrix.pathData;
    _row.parent = this.parent.elm;
    _row.len = this.length;
    _row.angle_hor = this.angle_hor;
    _row.elm_type = this.elm_type;
  }

  cnn_point(node) {
    return this.rays[node];
  }

  redraw() {

  }

}

BaseLine.oxml = {
  ' ': [
    {id: 'info', path: 'o.info', type: 'ro'},
  ],
  'Начало': ['x1', 'y1'],
  'Конец': ['x2', 'y2']
};



class Onlay extends ProfileItem {

  get d0() {
    return 0;
  }

  get elm_type() {
    return $p.enm.elm_types.Раскладка;
  }

  nearest() {

  }

  joined_imposts(check_only) {

    const {rays, generatrix, parent} = this;
    const tinner = [];
    const touter = [];

    const candidates = {b: [], e: []};

    const add_impost = (ip, curr, point) => {
      const res = {point: generatrix.getNearestPoint(point), profile: curr};
      if(this.cnn_side(curr, ip, rays) === $p.enm.cnn_sides.Снаружи) {
        touter.push(res);
      }
      else {
        tinner.push(res);
      }
    };

    if(parent.imposts.some((curr) => {
        if(curr != this) {
          for(const pn of ['b', 'e']) {
            const p = curr.cnn_point(pn);
            if(p.profile == this && p.cnn) {

              if(p.cnn.cnn_type == $p.enm.cnn_types.t) {
                if(check_only) {
                  return true;
                }
                add_impost(curr.corns(1), curr, p.point);
              }
              else {
                candidates[pn].push(curr.corns(1));
              }
            }
          }
        }
      })) {
      return true;
    }

    ['b', 'e'].forEach((node) => {
      if(candidates[node].length > 1) {
        candidates[node].some((ip) => {
          if(this.cnn_side(null, ip, rays) == $p.enm.cnn_sides.Снаружи) {
            this.cnn_point(node).is_cut = true;
            return true;
          }
        });
      }
    });

    return check_only ? false : {inner: tinner, outer: touter};

  }

  save_coordinates() {

    if(!this._attr.generatrix){
      return;
    }

    const {_row, project, rays, generatrix} = this;
    const {cnns} = project.connections;
    const {b, e} = rays;
    const row_b = cnns.add({
      elm1: _row.elm,
      node1: "b",
      cnn: b.cnn ? b.cnn.ref : "",
      aperture_len: this.corns(1).getDistance(this.corns(4))
    });
    const row_e = cnns.add({
      elm1: _row.elm,
      node1: "e",
      cnn: e.cnn ? e.cnn.ref : "",
      aperture_len: this.corns(2).getDistance(this.corns(3))
    });

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;
    _row.parent = this.parent.elm;


    _row.len = this.length;

    if(b.profile){
      row_b.elm2 = b.profile.elm;
      if(b.profile instanceof Filling)
        row_b.node2 = "t";
      else if(b.profile.e.is_nearest(b.point))
        row_b.node2 = "e";
      else if(b.profile.b.is_nearest(b.point))
        row_b.node2 = "b";
      else
        row_b.node2 = "t";
    }
    if(e.profile){
      row_e.elm2 = e.profile.elm;
      if(e.profile instanceof Filling)
        row_e.node2 = "t";
      else if(e.profile.b.is_nearest(e.point))
        row_e.node2 = "b";
      else if(e.profile.e.is_nearest(e.point))
        row_e.node2 = "b";
      else
        row_e.node2 = "t";
    }

    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0)
      _row.alp1 = _row.alp1 + 360;

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0)
      _row.alp2 = _row.alp2 + 360;

    _row.elm_type = this.elm_type;
  }

  cnn_point(node, point) {

    const res = this.rays[node];

    if(!point){
      point = this[node];
    }

    if(res.profile && res.profile.children.length){

      if(res.profile instanceof Filling){
        const np = res.profile.path.getNearestPoint(point);
        if(np.getDistance(point) < consts.sticking_l){
          res.point = np;
          return res;
        }
      }
      else{
        if(this.check_distance(res.profile, res, point, true) === false || res.distance < consts.epsilon){
          return res;
        }
      }
    }

    res.clear();
    if(this.parent){
      const res_bind = this.bind_node(point);
      if(res_bind.binded){
        res._mixin(res_bind, ["point","profile","cnn_types","profile_point"]);
      }
    }
    return res;
  }

  bind_node(point, glasses) {

    if(!glasses){
      glasses = [this.parent];
    }

    let res = {distance: Infinity, is_l: true};

    glasses.some((glass) => {
      const np = glass.path.getNearestPoint(point);
      let distance = np.getDistance(point);

      if(distance < res.distance){
        res.distance = distance;
        res.point = np;
        res.profile = glass;
        res.cnn_types = $p.enm.cnn_types.acn.t;
      }

      if(distance < consts.sticking_l){
        res.binded = true;
        return true;
      }

      res.cnn_types = $p.enm.cnn_types.acn.t;
      const ares = [];
      for(let elm of glass.imposts){
        if (elm !== this && elm.project.check_distance(elm, null, res, point, "node_generatrix") === false ){
          ares.push({
            profile_point: res.profile_point,
            profile: res.profile,
            cnn_types: res.cnn_types,
            point: res.point});
        }
      }

      if(ares.length == 1){
        res._mixin(ares[0]);
      }
      else if(ares.length >= 2){
        if(this.max_right_angle(ares)){
          res._mixin(ares[0]);
        }
        res.is_cut = true;
      }

    });

    if(!res.binded && res.point && res.distance < consts.sticking){
      res.binded = true;
    }

    return res;
  }

  move_nodes(from, to) {
    for(let elm of this.parent.imposts){
      if(elm == this){
        continue;
      }
      if(elm.b.is_nearest(from)){
        elm.b = to;
      }
      if(elm.e.is_nearest(from)){
        elm.e = to;
      }
    }
  }

}




class Scheme extends paper.Project {

  constructor(_canvas, _editor, _silent) {

    super(_canvas);

    const _scheme = _editor.project = this;

    const _attr = this._attr = {
      _silent,
      _bounds: null,
      _calc_order_row: null,
      _update_timer: 0
    };

    const _changes = this._ch = [];

    this._dp_listener = (obj, fields) => {

      if(_attr._loading || _attr._snapshot || obj != this._dp) {
        return;
      }

      const scheme_changed_names = ['clr', 'sys'];
      const row_changed_names = ['quantity', 'discount_percent', 'discount_percent_internal'];

      if(fields.hasOwnProperty('clr') || fields.hasOwnProperty('sys')) {
        _scheme.notify(_scheme, 'scheme_changed');
      }

      if(fields.hasOwnProperty('clr')) {
        _scheme.ox.clr = obj.clr;
        _scheme.getItems({class: ProfileItem}).forEach((p) => {
          if(!(p instanceof Onlay)) {
            p.clr = obj.clr;
          }
        });
      }

      if(fields.hasOwnProperty('sys') && !obj.sys.empty()) {

        obj.sys.refill_prm(_scheme.ox);

        _editor.eve.emit_async('rows', _scheme.ox, {extra_fields: true, params: true});

        for (const contour of _scheme.contours) {
          contour.on_sys_changed();
        }

        if(obj.sys != $p.wsql.get_user_param('editor_last_sys')) {
          $p.wsql.set_user_param('editor_last_sys', obj.sys.ref);
        }

        if(_scheme.ox.clr.empty()) {
          _scheme.ox.clr = obj.sys.default_clr;
        }

        _scheme.register_change(true);
      }

      for (const name of row_changed_names) {
        if(_attr._calc_order_row && fields.hasOwnProperty(name)) {
          _attr._calc_order_row[name] = obj[name];
          _scheme.register_change(true);
        }
      }

    };

    this._dp = $p.dp.buyers_order.create();

    this._papam_listener = (obj, fields) => {
      if(_attr._loading || _attr._snapshot) {
        return;
      }
      const {characteristic} = this._dp;
      if(obj._owner === characteristic.params || (obj === characteristic && fields.hasOwnProperty('params'))) {
        _scheme.register_change();
      }
    };


    this.connections = {

      get cnns() {
        return _scheme.ox.cnn_elmnts;
      },

      elm_cnn(elm1, elm2) {
        let res;
        this.cnns.find_rows({
          elm1: elm1.elm,
          elm2: elm2.elm
        }, (row) => {
          res = row.cnn;
          return false;
        });
        return res;
      }

    };


    this.redraw = () => {

      _attr._opened && typeof requestAnimationFrame == 'function' && requestAnimationFrame(_scheme.redraw);

      if(!_attr._opened || _attr._saving || !_changes.length) {
        return;
      }

      _changes.length = 0;

      if(_scheme.contours.length) {

        _scheme.l_connective.redraw();

        for (let contour of _scheme.contours) {
          contour.redraw();
          if(_changes.length && typeof requestAnimationFrame == 'function') {
            return;
          }
        }

        _attr._bounds = null;
        _scheme.contours.forEach((l) => {
          l.contours.forEach((l) => {
            l.save_coordinates(true);
            l.refresh_prm_links();
          });
          l.l_dimensions.redraw();
        });

        _scheme.draw_sizes();

        _scheme.view.update();

      }
      else {
        _scheme.draw_sizes();
      }

    };

    if(!_attr._silent) {
      this._dp._manager.on('update', this._dp_listener);
    }
  }

  get ox() {
    return this._dp.characteristic;
  }

  set ox(v) {
    const {_dp, _attr, _papam_listener} = this;
    let setted;

    !_attr._silent && _dp.characteristic._manager.off('update', _papam_listener);
    !_attr._silent && _dp.characteristic._manager.off('rows', _papam_listener);

    _dp.characteristic = v;

    const ox = _dp.characteristic;

    _dp.len = ox.x;
    _dp.height = ox.y;
    _dp.s = ox.s;

    _attr._calc_order_row = ox.calc_order_row;

    if(_attr._calc_order_row) {
      'quantity,price_internal,discount_percent_internal,discount_percent,price,amount,note'.split(',').forEach((fld) => _dp[fld] = _attr._calc_order_row[fld]);
    }
    else {
    }


    if(ox.empty()) {
      _dp.sys = '';
    }
    else if(ox.owner.empty()) {
      _dp.sys = $p.wsql.get_user_param('editor_last_sys');
      setted = !_dp.sys.empty();
    }
    else if(_dp.sys.empty()) {
      $p.cat.production_params.find_rows({is_folder: false}, (o) => {
        if(setted) {
          return false;
        }
        o.production.find_rows({nom: ox.owner}, () => {
          _dp.sys = o;
          setted = true;
          return false;
        });
      });
    }

    if(setted) {
      _dp.sys.refill_prm(ox);
    }

    if(_dp.clr.empty()) {
      _dp.clr = _dp.sys.default_clr;
    }

    if(!_attr._silent) {
      this._scope.eve.emit_async('rows', ox, {constructions: true});
      _dp._manager.emit_async('rows', _dp, {extra_fields: true});

      _dp.characteristic._manager.on({
        update: _papam_listener,
        rows: _papam_listener,
      });
    }

  }

  load(id, from_service) {
    const {_attr} = this;
    const _scheme = this;

    function load_contour(parent) {
      _scheme.ox.constructions.find_rows({parent: parent ? parent.cnstr : 0}, (row) => {
        load_contour(new Contour({parent: parent, row: row}));
      });
    }

    function load_dimension_lines() {
      _scheme.ox.coordinates.find_rows({elm_type: $p.enm.elm_types.Размер}, (row) => {
        const layer = _scheme.getItem({cnstr: row.cnstr});
        layer && new DimensionLineCustom({
          parent: layer.l_dimensions,
          row: row
        });
      });
    }

    function load_object(o) {

      _scheme.ox = o;

      _attr._opened = true;
      _attr._bounds = new paper.Rectangle({
        point: [0, 0],
        size: [o.x, o.y]
      });

      o.coordinates.forEach((row) => {
        if(row.elm_type === $p.enm.elm_types.Соединитель) {
          new ProfileConnective({row});
        }
        else if(row.elm_type === $p.enm.elm_types.Линия) {
          new BaseLine({row});
        }
      })
      o = null;

      load_contour(null);

      _scheme.redraw();

      return new Promise((resolve, reject) => {

        _attr._bounds = null;

        load_dimension_lines();

        setTimeout(() => {

          _attr._bounds = null;
          _scheme.zoom_fit();

          if(!_attr._snapshot) {
            _scheme._scope._undo.clear();
            _scheme._scope._undo.save_snapshot(_scheme);
            _scheme._scope.set_text();
          }

          _scheme.register_change(true);

          if(_scheme.contours.length) {
            _scheme.notify(_scheme.contours[0], 'layer_activated', true);
          }

          delete _attr._loading;

          ((_scheme.ox.base_block.empty() || !_scheme.ox.base_block.is_new()) ? Promise.resolve() : _scheme.ox.base_block.load())
            .then(() => {
              if(_scheme.ox.coordinates.count()) {
                if(_scheme.ox.specification.count() || from_service) {
                  if(from_service){
                    Promise.resolve().then(() => {
                      _scheme.draw_visualization();
                      _scheme.zoom_fit();
                      resolve();
                    })
                  }
                  else{
                    setTimeout(() => _scheme.draw_visualization(), 100);
                  }
                }
                else {
                  $p.products_building.recalc(_scheme, {});
                }
              }
              else {
                if(from_service){
                  resolve();
                }
                else{
                  paper.load_stamp && paper.load_stamp();
                }
              }
              delete _attr._snapshot;

              (!from_service || !_scheme.ox.specification.count()) && resolve();
            });
        });
      });
    }

    _attr._loading = true;
    if(id != this.ox) {
      this.ox = null;
    }
    this.clear();

    if($p.utils.is_data_obj(id) && id.calc_order && !id.calc_order.is_new()) {
      return load_object(id);
    }
    else if($p.utils.is_guid(id) || $p.utils.is_data_obj(id)) {
      return $p.cat.characteristics.get(id, true, true)
        .then((ox) =>
          $p.doc.calc_order.get(ox.calc_order, true, true)
            .then(() => load_object(ox))
        );
    }
  }

  draw_fragment(attr) {

    const {l_dimensions, l_connective} = this;

    const contours = this.getItems({class: Contour});
    contours.forEach((l) => l.hidden = true);
    l_dimensions.visible = false;
    l_connective.visible = false;

    let elm;
    if(attr.elm > 0) {
      elm = this.getItem({class: BuilderElement, elm: attr.elm});
      elm.draw_fragment && elm.draw_fragment();
    }
    else if(attr.elm < 0) {
      const cnstr = -attr.elm;
      contours.some((l) => {
        if(l.cnstr == cnstr) {
          l.hidden = false;
          l.hide_generatrix();
          l.l_dimensions.redraw(true);
          l.zoom_fit();
          return true;
        }
      });
    }
    this.view.update();
    return elm;
  }

  has_changes() {
    return this._ch.length > 0;
  }

  register_update() {
    const {_attr} = this;
    if(_attr._update_timer) {
      clearTimeout(_attr._update_timer);
    }
    _attr._update_timer = setTimeout(() => {
      this.view && this.view.update();
      _attr._update_timer = 0;
    }, 100);
  }

  register_change(with_update) {

    const {_attr, _ch} = this;

    if(!_attr._loading) {

      _attr._bounds = null;

      this.getItems({class: Profile}).forEach((p) => {
        delete p._attr.d0;
      });

      this.ox._data._modified = true;
      this.notify(this, 'scheme_changed');
    }
    _ch.push(Date.now());

    if(with_update) {
      this.register_update();
    }
  }

  get bounds() {
    const {_attr} = this;
    if(!_attr._bounds) {
      this.contours.forEach((l) => {
        if(!_attr._bounds) {
          _attr._bounds = l.bounds;
        }
        else {
          _attr._bounds = _attr._bounds.unite(l.bounds);
        }
      });
    }
    return _attr._bounds;
  }

  get dimension_bounds() {
    let {bounds} = this;
    this.getItems({class: DimensionLine}).forEach((dl) => {
      if(dl instanceof DimensionLineCustom || dl._attr.impost || dl._attr.contour) {
        bounds = bounds.unite(dl.bounds);
      }
    });
    this.contours.forEach(({l_visualization}) => {
      const ib = l_visualization._by_insets.bounds;
      if(ib.height && ib.bottom > bounds.bottom) {
        const delta = ib.bottom - bounds.bottom + 10;
        bounds = bounds.unite(
          new paper.Rectangle(bounds.bottomLeft, bounds.bottomRight.add([0, delta < 250 ? delta * 1.1 : delta * 1.2]))
        );
      }
    });
    return bounds;
  }

  get strokeBounds() {
    let bounds = new paper.Rectangle();
    this.contours.forEach((l) => bounds = bounds.unite(l.strokeBounds));
    return bounds;
  }

  get _calc_order_row() {
    const {_attr, ox} = this;
    if(!_attr._calc_order_row && !ox.empty()) {
      _attr._calc_order_row = ox.calc_order_row;
    }
    return _attr._calc_order_row;
  }

  notify(obj, type = 'update', fields) {
    if(obj.type) {
      type = obj.type;
    }
    this._scope.eve.emit_async(type, obj, fields);
  }

  clear() {
    const {_attr} = this;
    const pnames = '_bounds,_update_timer,_loading,_snapshot';
    for (let fld in _attr) {
      if(!pnames.match(fld)) {
        delete _attr[fld];
      }
    }

    super.clear();
  }

  unload() {
    const {_dp, _attr, _papam_listener, _dp_listener, _calc_order_row} = this;
    const pnames = '_loading,_saving';
    for (let fld in _attr) {
      if(pnames.match(fld)) {
        _attr[fld] = true;
      }
      else {
        delete _attr[fld];
      }
    }

    _dp._manager.off('update', _dp_listener);

    const ox = _dp.characteristic;
    ox._manager.off('update', _papam_listener);
    ox._manager.off('rows', _papam_listener);
    if(ox && ox._modified) {
      if(ox.is_new()) {
        if(_calc_order_row) {
          ox.calc_order.production.del(_calc_order_row);
        }
        ox.unload();
      }
      else {
        setTimeout(ox.load.bind(ox), 100);
      }
    }

    this.remove();
    for (let fld in _attr) {
      delete _attr[fld];
    }
  }

  move_points(delta, all_points) {

    const other = [];
    const layers = [];
    const profiles = new Set;

    const {auto_align, _dp} = this;

    for (const item of this.selectedItems) {
      const {parent, layer} = item;

      if(item instanceof paper.Path && parent instanceof GeneratrixElement && !profiles.has(parent)) {

        profiles.add(parent);

        if(parent._hatching) {
          parent._hatching.remove();
          parent._hatching = null;
        }

        if(layer instanceof ConnectiveLayer) {
          other.push.apply(other, parent.move_points(delta, all_points));
        }
        else if(!parent.nearest || !parent.nearest()) {

          if(auto_align && parent.elm_type == $p.enm.elm_types.Импост) {
            continue;
          }

          let check_selected;
          item.segments.forEach((segm) => {
            if(segm.selected && other.indexOf(segm) != -1) {
              check_selected = !(segm.selected = false);
            }
          });

          if(check_selected && !item.segments.some((segm) => segm.selected)) {
            continue;
          }

          other.push.apply(other, parent.move_points(delta, all_points));

          if(layers.indexOf(layer) == -1) {
            layers.push(layer);
            layer.l_dimensions.clear();
          }
        }
      }
      else if(item instanceof Filling) {
        item.purge_path();
      }
    }

    other.length && this.do_align(auto_align, profiles);

    _dp._manager.emit_async('update', {}, {x1: true, x2: true, y1: true, y2: true, a1: true, a2: true, cnn1: true, cnn2: true, info: true});

  }

  save_coordinates(attr) {

    const {_attr, bounds, ox} = this;

    if(!bounds) {
      return;
    }

    _attr._saving = true;
    ox._data._loading = true;

    ox.x = bounds.width.round(1);
    ox.y = bounds.height.round(1);
    ox.s = this.area;

    ox.cnn_elmnts.clear();
    ox.glasses.clear();

    this.contours.forEach((contour) => contour.save_coordinates());

    this.l_connective.save_coordinates();

    $p.products_building.recalc(this, attr);

  }

  zoom_fit(bounds) {

    if(!bounds) {
      bounds = this.strokeBounds;
    }

    const height = (bounds.height < 1000 ? 1000 : bounds.height) + 320;
    const width = (bounds.width < 1000 ? 1000 : bounds.width) + 320;
    let shift;

    if(bounds) {
      const {view} = this;
      view.zoom = Math.min((view.viewSize.height - 40) / height, (view.viewSize.width - 40) / width);
      shift = (view.viewSize.width - bounds.width * view.zoom) / 2;
      if(shift < 180) {
        shift = 0;
      }
      view.center = bounds.center.add([shift, 60]);
    }
  }

  get_svg(attr) {
    this.deselectAll();

    const svg = this.exportSVG();
    const bounds = this.strokeBounds.unite(this.l_dimensions.strokeBounds);

    svg.setAttribute('x', bounds.x);
    svg.setAttribute('y', bounds.y);
    svg.setAttribute('width', bounds.width);
    svg.setAttribute('height', bounds.height);
    svg.querySelector('g').removeAttribute('transform');

    return svg.outerHTML;
  }

  load_stamp(obx, is_snapshot) {

    const do_load = (obx) => {

      const {ox} = this;

      this.clear();

      ox._mixin(is_snapshot ? obx :
        obx._obj, null, ['ref', 'name', 'calc_order', 'product', 'leading_product', 'leading_elm', 'origin', 'base_block', 'note', 'partner'], true);

      if(!is_snapshot) {
        ox.base_block = obx.base_block.empty() ? obx : obx.base_block;
      }

      this.load(ox);
      ox._data._modified = true;

    };

    this._attr._loading = true;

    if(is_snapshot) {
      this._attr._snapshot = true;
      do_load(obx);
    }
    else {
      $p.cat.characteristics.get(obx, true, true).then(do_load);
    }
  }

  get auto_align() {
    const {calc_order, base_block} = this.ox;
    const {Шаблон} = $p.enm.obj_delivery_states;
    if(base_block.empty() || calc_order.obj_delivery_state == Шаблон || base_block.calc_order.obj_delivery_state != Шаблон) {
      return false;
    }
    const {auto_align} = $p.job_prm.properties;
    let align;
    if(auto_align) {
      base_block.params.find_rows({param: auto_align}, (row) => {
        align = row.value;
        return false;
      });
      return align && align != '_' && align;
    }
  }

  do_align(auto_align, profiles) {

    if(!auto_align || !profiles.size) {
      return;
    }

    const layers = new Set();
    for (const profile of profiles) {
      layers.add(profile.layer);
    }

    if(this._attr._align_timer) {
      clearTimeout(this._attr._align_timer);
    }

    this._attr._align_timer = setTimeout(() => {

      this._attr._align_timer = 0;

      const glasses = [];
      for (const layer of layers) {
        for(const filling of layer.fillings){
          glasses.indexOf(filling) == -1 && glasses.push(filling);
        }
      }
      this._scope.do_glass_align('width', glasses);

      if(auto_align == $p.enm.align_types.ПоЗаполнениям) {

      }
    }, 100);

  }

  resize_canvas(w, h) {
    const {viewSize} = this.view;
    viewSize.width = w;
    viewSize.height = h;
  }

  get contours() {
    return this.layers.filter((l) => l instanceof Contour);
  }

  get area() {
    return (this.bounds.width * this.bounds.height / 1000000).round(3);
  }

  get clr() {
    return this.ox.clr;
  }

  set clr(v) {
    this.ox.clr = v;
  }

  get l_dimensions() {
    const {activeLayer, _attr} = this;

    if(!_attr.l_dimensions) {
      _attr.l_dimensions = new DimensionLayer();
    }
    if(!_attr.l_dimensions.isInserted()) {
      this.addLayer(_attr.l_dimensions);
    }
    if(activeLayer) {
      this._activeLayer = activeLayer;
    }

    return _attr.l_dimensions;
  }

  get l_connective() {
    const {activeLayer, _attr} = this;

    if(!_attr.l_connective) {
      _attr.l_connective = new ConnectiveLayer();
    }
    if(!_attr.l_connective.isInserted()) {
      this.addLayer(_attr.l_connective);
    }
    if(activeLayer) {
      this._activeLayer = activeLayer;
    }

    return _attr.l_connective;
  }

  draw_sizes() {

    const {bounds, l_dimensions} = this;

    if(bounds) {

      if(!l_dimensions.bottom) {
        l_dimensions.bottom = new DimensionLine({
          pos: 'bottom',
          parent: l_dimensions,
          offset: -120
        });
      }
      else {
        l_dimensions.bottom.offset = -120;
      }

      if(!l_dimensions.right) {
        l_dimensions.right = new DimensionLine({
          pos: 'right',
          parent: l_dimensions,
          offset: -120
        });
      }
      else {
        l_dimensions.right.offset = -120;
      }



      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == 'right' && Math.abs(dl.size - bounds.height) < consts.sticking_l))) {
        l_dimensions.right.visible = false;
      }
      else {
        l_dimensions.right.redraw();
      }

      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == 'bottom' && Math.abs(dl.size - bounds.width) < consts.sticking_l))) {
        l_dimensions.bottom.visible = false;
      }
      else {
        l_dimensions.bottom.redraw();
      }
    }
    else {
      if(l_dimensions.bottom) {
        l_dimensions.bottom.visible = false;
      }
      if(l_dimensions.right) {
        l_dimensions.right.visible = false;
      }
    }
  }

  draw_visualization() {
    if(this.view){
      for (let contour of this.contours) {
        contour.draw_visualization();
      }
      this.view.update();
    }
  }

  default_inset(attr) {

    let rows;

    if(!attr.pos) {
      rows = this._dp.sys.inserts(attr.elm_type, true);
      if(attr.inset && rows.some((row) => attr.inset == row)) {
        return attr.inset;
      }
      return rows[0];
    }

    rows = this._dp.sys.inserts(attr.elm_type, 'rows');

    if(rows.length == 1) {
      return rows[0].nom;
    }

    const pos_array = Array.isArray(attr.pos);

    function check_pos(pos) {
      if(pos_array) {
        return attr.pos.some((v) => v == pos);
      }
      return attr.pos == pos;
    }

    if(attr.inset && rows.some((row) => attr.inset == row.nom && (check_pos(row.pos) || row.pos == $p.enm.positions.Любое))) {
      return attr.inset;
    }

    let inset;
    rows.some((row) => {
      if(check_pos(row.pos) && row.by_default) {
        return inset = row.nom;
      }
    });
    if(!inset) {
      rows.some((row) => {
        if(check_pos(row.pos)) {
          return inset = row.nom;
        }
      });
    }
    if(!inset) {
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое && row.by_default) {
          return inset = row.nom;
        }
      });
    }
    if(!inset) {
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое) {
          return inset = row.nom;
        }
      });
    }

    return inset;
  }

  check_inset(attr) {
    const inset = attr.inset ? attr.inset : attr.elm.inset;
    const elm_type = attr.elm ? attr.elm.elm_type : attr.elm_type;
    const nom = inset.nom();
    const rows = [];

    if(!nom || nom.empty()) {
      return inset;
    }

    this._dp.sys.elmnts.each(function (row) {
      if((elm_type ? row.elm_type == elm_type : true) && row.nom.nom() == nom) {
        rows.push(row);
      }
    });


    for (var i = 0; i < rows.length; i++) {
      if(rows[i].nom == inset) {
        return inset;
      }
    }

    if(rows.length) {
      return rows[0].nom;
    }
  }

  check_distance(element, profile, res, point, check_only) {
    const {allow_open_cnn} = this._dp.sys;
    const {acn} = $p.enm.cnn_types;

    let distance, gp, cnns, addls,
      bind_node = typeof check_only == 'string' && check_only.indexOf('node') != -1,
      bind_generatrix = typeof check_only == 'string' ? check_only.indexOf('generatrix') != -1 : check_only,
      node_distance;

    function check_node_distance(node) {

      if((distance = element[node].getDistance(point)) < (allow_open_cnn ? parseFloat(consts.sticking_l) : consts.sticking)) {

        if(typeof res.distance == 'number' && res.distance < distance) {
          res.profile = element;
          res.profile_point = node;
          return 1;
        }

        if(profile && !res.cnn) {

          cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
          if(!cnns.length) {
            if(!element.is_collinear(profile)) {
              cnns = $p.cat.cnns.nom_cnn(profile, element, acn.t);
            }
            if(!cnns.length) {
              return 1;
            }
          }



        }
        else if(res.cnn && acn.a.indexOf(res.cnn.cnn_type) == -1) {
          return 1;
        }

        res.point = bind_node ? element[node] : point;
        res.distance = distance;
        res.profile = element;
        if(cnns && cnns.length && acn.t.indexOf(cnns[0].cnn_type) != -1) {
          res.profile_point = '';
          res.cnn_types = acn.t;
          if(!res.cnn) {
            res.cnn = cnns[0];
          }
        }
        else {
          res.profile_point = node;
          res.cnn_types = acn.a;
        }

        return 2;
      }

    }

    const b = res.profile_point === 'b' ? 'b' : 'e';
    const e = b === 'b' ? 'e' : 'b';

    if(element === profile) {
      if(profile.is_linear()) {
        return;
      }
      else {

      }
      return;
    }
    else if((node_distance = check_node_distance(b)) || (node_distance = check_node_distance(e))) {
      if(res.cnn_types !== acn.a && res.profile_point){
        res.cnn_types = acn.a;
        res.distance = distance;
      }
      return node_distance == 2 ? false : void(0);
    }

    res.profile_point = '';


    gp = element.generatrix.getNearestPoint(point);
    distance = gp.getDistance(point);

    if(distance < ((res.is_t || !res.is_l) ? consts.sticking : consts.sticking_l)) {

      if(distance < res.distance || bind_generatrix) {
        if(element.d0 != 0 && element.rays.outer) {
          res.point = element.rays.outer.getNearestPoint(point);
          res.distance = 0;
        }
        else {
          res.point = gp;
          res.distance = distance;
        }
        res.profile = element;
        res.cnn_types = acn.t;
      }
      if(bind_generatrix) {
        return false;
      }
    }
  }

  default_clr(attr) {
    return this.ox.clr;
  }

  get default_furn() {
    var sys = this._dp.sys,
      res;
    while (true) {
      if(res = $p.job_prm.builder.base_furn[sys.ref]) {
        break;
      }
      if(sys.empty()) {
        break;
      }
      sys = sys.parent;
    }
    if(!res) {
      res = $p.job_prm.builder.base_furn.null;
    }
    if(!res) {
      $p.cat.furns.find_rows({is_folder: false, is_set: false, id: {not: ''}}, (row) => {
        res = row;
        return false;
      });
    }
    return res;
  }

  selected_profiles(all) {
    const res = [];
    const count = this.selectedItems.length;

    this.selectedItems.forEach((item) => {

      const p = item.parent;

      if(p instanceof ProfileItem) {
        if(all || !item.layer.parent || !p.nearest || !p.nearest()) {

          if(res.indexOf(p) != -1) {
            return;
          }

          if(count < 2 || !(p._attr.generatrix.firstSegment.selected ^ p._attr.generatrix.lastSegment.selected)) {
            res.push(p);
          }

        }
      }
    });

    return res;
  }

  selected_glasses() {
    const res = [];

    this.selectedItems.forEach((item) => {

      if(item instanceof Filling && res.indexOf(item) == -1) {
        res.push(item);
      }
      else if(item.parent instanceof Filling && res.indexOf(item.parent) == -1) {
        res.push(item.parent);
      }
    });

    return res;
  }

  get selected_elm() {
    let res;
    this.selectedItems.some((item) => {
      if(item instanceof BuilderElement) {
        return res = item;

      }
      else if(item.parent instanceof BuilderElement) {
        return res = item.parent;
      }
    });
    return res;
  }

  hitPoints(point, tolerance, selected_first) {
    let item, hit;
    let dist = Infinity;

    function check_corns(elm) {
      const corn = elm.corns(point);
      if(corn.dist < dist) {
        dist = corn.dist;
        if(corn.dist < consts.sticking) {
          hit = {
            item: elm.generatrix,
            point: corn.point
          };
        }
      }
    }

    if(selected_first) {
      this.selectedItems.some((item) => hit = item.hitTest(point, {segments: true, tolerance: tolerance || 8}));
      if(!hit) {
        hit = this.hitTest(point, {segments: true, tolerance: tolerance || 6});
      }
    }
    else {
      for (let elm of this.activeLayer.profiles) {
        check_corns(elm);
        for (let addl of elm.addls) {
          check_corns(addl);
        }
      }
      ;
    }

    return hit;
  }

  rootLayer(layer) {
    if(!layer) {
      layer = this.activeLayer;
    }
    while (layer.parent) {
      layer = layer.parent;
    }
    return layer;
  }

  deselect_all_points(with_items) {
    this.getItems({class: paper.Path}).forEach(function (item) {
      item.segments.forEach(function (s) {
        if(s.selected) {
          s.selected = false;
        }
      });
      if(with_items && item.selected) {
        item.selected = false;
      }
    });
  }

  get perimeter() {
    let res = [],
      contours = this.contours,
      tmp;

    if(contours.length == 1) {
      return contours[0].perimeter;
    }



    return res;
  }

  get glasses() {
    return this.getItems({class: Filling});
  }

}


class EditableText extends paper.PointText {

  constructor(props) {
    props.justification = 'center';
    super(props);
    this._edit = null;
    this._owner = props._owner;

    this.on({
      mouseenter: this.mouseenter,
      mouseleave: this.mouseleave,
      click: this.click,
    })
  }

  mouseenter(event) {
    paper.canvas_cursor('cursor-arrow-ruler-light');
  }

  mouseleave(event) {
    paper.canvas_cursor('cursor-arrow-white');
  }

  click(event) {
    if(!this._edit) {
      const {view, bounds} = this;
      const point = view.projectToView(bounds.topLeft);
      const edit = this._edit = document.createElement('INPUT');
      view.element.parentNode.appendChild(edit);
      edit.style = `left: ${(point.x - 4).toFixed()}px; top: ${(point.y).toFixed()}px; width: 60px; border: none; position: absolute;`;
      edit.onblur = () => setTimeout(() => this.edit_remove());
      edit.onkeydown = this.edit_keydown.bind(this);
      edit.value = this.content.replace(/\D$/, '');
      setTimeout(() => {
        edit.focus();
        edit.select();
      });
    }
  }

  edit_keydown(event) {
    switch (event.code) {
    case 'Escape':
    case 'Tab':
      return this.edit_remove();
    case 'Enter':
    case 'NumpadEnter':
      this.apply(parseFloat(this._edit.value));
      return this.edit_remove();
    case 'Digit0':
    case 'Digit1':
    case 'Digit2':
    case 'Digit3':
    case 'Digit4':
    case 'Digit5':
    case 'Digit6':
    case 'Digit7':
    case 'Digit8':
    case 'Digit9':
    case 'Numpad0':
    case 'Numpad1':
    case 'Numpad2':
    case 'Numpad3':
    case 'Numpad4':
    case 'Numpad5':
    case 'Numpad6':
    case 'Numpad7':
    case 'Numpad8':
    case 'Numpad9':
    case '.':
    case 'Period':
    case 'NumpadDecimal':
    case 'ArrowRight':
    case 'ArrowLeft':
    case 'Delete':
    case 'Backspace':
      break;
    case 'Comma':
    case ',':
      event.code = '.';
      break;
    default:
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }

  edit_remove() {
    if(this._edit){
      this._edit.parentNode && this._edit.parentNode.removeChild(this._edit);
      this._edit = null;
    }
  }

  remove() {
    this.edit_remove();
    super.remove();
  }
}

class AngleText extends EditableText {

  constructor(props) {
    props.fillColor = 'blue';
    super(props);
    this._ind = props._ind;
  }

  apply(value) {

    const {project, generatrix, _attr} = this._owner;
    const {zoom} = _attr;
    const {curves, segments} = generatrix;
    const c1 = curves[this._ind - 1];
    const c2 = curves[this._ind];
    const loc1 = c1.getLocationAtTime(0.9);
    const loc2 = c2.getLocationAtTime(0.1);
    const center = c1.point2;
    let angle = loc2.tangent.angle - loc1.tangent.negate().angle;
    if(angle < 0){
      angle += 360;
    }
    const invert = angle > 180;
    if(invert){
      angle = 360 - angle;
    }
    const ray0 = new paper.Point([c2.point2.x - c2.point1.x, c2.point2.y - c2.point1.y]);
    const ray1 = ray0.clone();
    ray1.angle += invert ? angle - value : value - angle;
    const delta = ray1.subtract(ray0);

    let start;
    for(const segment of segments) {
      if(segment.point.equals(c2.point2)) {
        start = true;
      }
      if(start) {
        segment.point = segment.point.add(delta);
      }
    }
    project.register_change(true);

  }
}

class LenText extends EditableText {

  constructor(props) {
    props.fillColor = 'black';
    super(props);
  }

  apply(value) {
    const {path, segment1, segment2, length} = this._owner;
    const {parent: {_attr, project}, segments} = path;
    const {zoom} = _attr;
    const delta = segment1.curve.getTangentAtTime(1).multiply(value * zoom - length);
    let start;
    for(const segment of segments) {
      if(segment === segment2) {
        start = true;
      }
      if(start) {
        segment.point = segment.point.add(delta);
      }
    }
    project.register_change(true);
  }
}

class Sectional extends GeneratrixElement {

  initialize(attr) {

    const {project, _attr, _row} = this;
    const h = project.bounds.height + project.bounds.y;

    _attr._rays = {
      b: {},
      e: {},
      clear() {},
    };

    _attr.children = [];

    _attr.zoom = 5;
    _attr.radius = 40;

    if(attr.generatrix) {
      _attr.generatrix = attr.generatrix;
    }
    else {
      if(_row.path_data) {
        _attr.generatrix = new paper.Path(_row.path_data);
      }
      else{
        const first_point = new paper.Point([_row.x1, h - _row.y1]);
        _attr.generatrix = new paper.Path(first_point);
        if(_row.r){
          _attr.generatrix.arcTo(
            first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2,
              _row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
        }
        else{
          _attr.generatrix.lineTo([_row.x2, h - _row.y2]);
        }
      }
    }

    _attr.generatrix.strokeColor = 'black';
    _attr.generatrix.strokeWidth = 1;
    _attr.generatrix.strokeScaling = false;

    this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;

    this.addChild(_attr.generatrix);

  }

  redraw() {
    const {layer, generatrix, _attr} = this;
    const {children, zoom, radius} = _attr;
    const {segments, curves} = generatrix;

    for(let child of children){
      child.remove();
    }

    for(let i = 1; i < segments.length - 1; i++){
      this.draw_angle(i);
    }

    for(let curve of curves){
      const loc = curve.getLocationAtTime(0.5);
      const normal = loc.normal.normalize(radius);
      children.push(new LenText({
        point: loc.point.add(normal).add([0, normal.y < 0 ? 0 : normal.y / 2]),
        content: (curve.length / zoom).toFixed(0),
        fontSize: radius,
        parent: layer,
        _owner: curve
      }));
    }


    return this;
  }

  draw_angle(ind) {
    const {layer, generatrix, _attr} = this;
    const {children, zoom, radius} = _attr;
    const {curves} = generatrix;
    const c1 = curves[ind - 1];
    const c2 = curves[ind];
    const loc1 = c1.getLocationAtTime(0.9);
    const loc2 = c2.getLocationAtTime(0.1);
    const center = c1.point2;
    let angle = loc2.tangent.angle - loc1.tangent.negate().angle;
    if(angle < 0){
      angle += 360;
    }
    if(angle > 180){
      angle = 360 - angle;
    }

    if (c1.length < radius || c2.length < radius || 180 - angle < 1){
      return;
    }

    const from = c1.getLocationAt(c1.length - radius).point;
    const to = c2.getLocationAt(radius).point;
    const end = center.subtract(from.add(to).divide(2)).normalize(radius).negate();
    children.push(new paper.Path.Arc({
      from,
      through: center.add(end),
      to,
      strokeColor: 'grey',
      guide: true,
      parent: layer,
    }));

    children.push(new AngleText({
      point: center.add(end.multiply(-2.2)), 
      content: angle.toFixed(0) + '°',
      fontSize: radius,
      parent: layer,
      _owner: this,
      _ind: ind,
    }));

  }

  save_coordinates() {

    const {_row, generatrix} = this;

    if(!generatrix){
      return;
    }

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;


    _row.len = this.length.round(1);

    _row.elm_type = this.elm_type;

  }

  cnn_point() {

  }

  get length() {
    const {generatrix, zoom} = this._attr;
    return generatrix.length / zoom;
  }

  get rays() {
    return this._attr._rays;
  }

  get elm_type() {
    return $p.enm.elm_types.Водоотлив;
  }
}

Editor.Sectional = Sectional;


const consts = new function Settings(){

	this.tune_paper = function (settings) {

	  const builder = $p.job_prm.builder || {};

		settings.handleSize = builder.handle_size;

		this.sticking = builder.sticking || 90;
		this.sticking_l = builder.sticking_l || 9;
		this.sticking0 = this.sticking / 2;
		this.sticking2 = this.sticking * this.sticking;
		this.font_size = builder.font_size || 60;
    this.elm_font_size = builder.elm_font_size || 40;

		this.orientation_delta = builder.orientation_delta || 30;


	}.bind(this);


  this.epsilon = 0.01;
	this.move_points = 'move_points';
	this.move_handle = 'move_handle';
	this.move_shapes = 'move-shapes';

};


class ToolElement extends paper.Tool {

  resetHot(type, event, mode) {

  }

  testHot(type, event, mode) {
    return this.hitTest(event)
  }

  detache_wnd() {
    if (this.wnd) {

      if (this._grid && this._grid.destructor) {
        if (this.wnd.detachObject)
          this.wnd.detachObject(true);
        delete this._grid;
      }

      if (this.wnd.wnd_options) {
        this.wnd.wnd_options(this.options.wnd);
        $p.wsql.save_options("editor", this.options);
        this.wnd.close();
      }

      delete this.wnd;
    }
    this.profile = null;
  }

  check_layer() {
    const {_scope} = this;
    if (!_scope.project.contours.length) {
      new Contour({parent: undefined});
      _scope.eve.emit_async('rows', _scope.project.ox, {constructions: true});
    }
  }

  on_activate(cursor) {

    this._scope.tb_left.select(this.options.name);

    this._scope.canvas_cursor(cursor);

    if (this.options.name != "select_node") {

      this.check_layer();

      if (this._scope.project._dp.sys.empty()) {
        $p.msg.show_msg({
          type: "alert-warning",
          text: $p.msg.bld_not_sys,
          title: $p.msg.bld_title
        });
      }
    }
  }

  on_close(wnd) {
    wnd && wnd.cell && setTimeout(() => paper.tools[1].activate());
    return true;
  }

  get eve() {
    return this._scope.eve;
  }
}



class ToolArc extends ToolElement{

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'arc'},
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false,
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-arc-arrow');
      },

      deactivate: function() {
        paper.hide_selection_bounds();
      },

      mousedown: function(event) {

        var b, e, r;

        this.mode = null;
        this.changed = false;

        if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
          && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

          this.mode = this.hitItem.item.parent.generatrix;

          if (event.modifiers.control || event.modifiers.option){

            b = this.mode.firstSegment.point;
            e = this.mode.lastSegment.point;
            r = (b.getDistance(e) / 2) + 0.001;

            this.do_arc(this.mode, event.point.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

            r = this.mode;
            this.mode = null;


          }else if(event.modifiers.space){

            e = this.mode.lastSegment.point;
            r = this.mode;
            this.mode = null;

            r.removeSegments(1);
            r.firstSegment.handleIn = null;
            r.firstSegment.handleOut = null;
            r.lineTo(e);
            r.parent.rays.clear();
            r.parent._row.r = 0;
            r.selected = true;
            r.layer.notify({profiles: [r.parent], points: []}, consts.move_points);

          } else {
            paper.project.deselectAll();

            r = this.mode;
            r.selected = true;
            paper.project.deselect_all_points();
            this.mouseStartPos = event.point.clone();
            this.originalContent = paper.capture_selection_state();

          }

          setTimeout(() => {
            r.layer.redraw();
            r.parent.attache_wnd(paper._acc.elm);
            this.eve.emit("layer_activated", r.layer);
          }, 10);

        }else{
          paper.project.deselectAll();
        }
      },

      mouseup: function(event) {

        var item = this.hitItem ? this.hitItem.item : null;

        if(item instanceof Filling && item.visible){
          item.attache_wnd(paper._acc.elm);
          item.selected = true;

          if(item.selected && item.layer){
            this.eve.emit("layer_activated", item.layer);
          }
        }

        if (this.mode && this.changed) {
        }

        paper.canvas_cursor('cursor-arc-arrow');

      },

      mousedrag: function(event) {
        if (this.mode) {

          this.changed = true;

          paper.canvas_cursor('cursor-arrow-small');

          this.do_arc(this.mode, event.point);


        }
      },

      mousemove: function(event) {
        this.hitTest(event);
      }

    })

  }

  do_arc(element, point){
    var end = element.lastSegment.point.clone();
    element.removeSegments(1);

    try{
      element.arcTo(point, end);
    }catch (e){	}

    if(!element.curves.length)
      element.lineTo(end);

    element.parent.rays.clear();
    element.selected = true;

    element.layer.notify({profiles: [element.parent], points: []}, consts.move_points);
  }

  hitTest(event) {

    var hitSize = 6;
    this.hitItem = null;

    if (event.point)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
    if(!this.hitItem)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: hitSize });

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      paper.canvas_cursor('cursor-arc');
    } else {
      paper.canvas_cursor('cursor-arc-arrow');
    }

    return true;
  }

}



class ToolCut extends ToolElement{

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'cut'},
      mouseStartPos: new paper.Point(),
      mode: null,
      hitItem: null,
      originalContent: null,
      changed: false,
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-arrow-cut');
      },

      deactivate: function() {
        paper.hide_selection_bounds();
      },

      mouseup: function(event) {

        var item = this.hitItem ? this.hitItem.item : null;

        if(item instanceof Filling && item.visible){
          item.attache_wnd(paper._acc.elm);
          item.selected = true;

          item.selected && item.layer && this.eve.emit("layer_activated", item.layer);
        }

        if (this.mode && this.changed) {
        }

        paper.canvas_cursor('cursor-arrow-cut');

      },

      mousemove: function(event) {
        this.hitTest(event);
      }

    })

  }

  do_cut(element, point){

  }

  do_uncut(element, point){

  }

  hitTest(event) {

    const hitSize = 6;
    this.hitItem = null;

    if (event.point)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
    if(!this.hitItem)
      this.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: hitSize });

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      paper.canvas_cursor('cursor-arrow-do-cut');
    }
    else {
      paper.canvas_cursor('cursor-arrow-cut');
    }

    return true;
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
        },
      },
      mode: null,
      hitItem: null,
      paths: [],
      changed: false,
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
        profile.clr = paper.project.clr;
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


      tool.wnd = $p.iface.dat_blank(paper._dxw, tool.options.wnd);
      tool._grid = tool.wnd.attachHeadFields({
        obj: profile,
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

      var wnd_options = tool.wnd.wnd_options;
      tool.wnd.wnd_options = function (opt) {
        wnd_options.call(tool.wnd, opt);

        for (var prop in profile._metadata().fields) {
          if (prop.indexOf('step') === -1 && prop.indexOf('inset') === -1 && prop != 'clr' && prop != 'w' && prop != 'h') {
            var val = profile[prop];
            opt[prop] = $p.utils.is_data_obj(val) ? val.ref : val;
          }
        }
      };

    }

    this.on({

      activate: function () {
        this.on_activate('cursor-arrow-lay');
        tool_wnd();
      },

      deactivate: function () {

        paper.clear_selection_bounds();

        this.paths.forEach(function (p) {
          p.remove();
        });
        this.paths.length = 0;

        this.detache_wnd();
      },

      mouseup: function (event) {

        paper.canvas_cursor('cursor-arrow-lay');

        const {profile} = this;

        if (profile.inset_by_y.empty() && profile.inset_by_x.empty()) {
          return;
        }

        if (!this.hitItem && (profile.elm_type == $p.enm.elm_types.Раскладка || !profile.w || !profile.h)) {
          return;
        }

        this.check_layer();

        const layer = this.hitItem ? this.hitItem.layer : paper.project.activeLayer;
        const lgeneratics = layer.profiles.map((p) => p.nearest() ? p.rays.outer : p.generatrix);
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

          paper.project._dp.sys.elmnts.each((row) => {
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

                let angle = n2(p.profile).subtract(n1(p.profile)).angle.round(0);

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

          tool.paths.forEach((p) => {
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
          rectification();
        }

        tool.paths.forEach((p) => {

          let iter = 0, angle, proto = {clr: profile.clr};

          function do_bind() {

            let correctedp1 = false,
              correctedp2 = false;

            for (let gen of lgeneratics) {
              let np = gen.getNearestPoint(p.b);
              if (!correctedp1 && np.getDistance(p.b) < consts.sticking) {
                correctedp1 = true;
                p.b = np;
              }
              np = gen.getNearestPoint(p.e);
              if (!correctedp2 && np.getDistance(p.e) < consts.sticking) {
                correctedp2 = true;
                p.e = np;
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

              nprofiles.push(new Onlay({
                generatrix: new paper.Path({
                  segments: [p.b, p.e],
                }),
                parent: tool.hitItem,
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
                nprofiles.push(new Profile({
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
        tool.paths.length = 0;

        nprofiles.forEach((p) => {
          p.cnn_point('b');
          p.cnn_point('e');
        });

        if (!this.hitItem)
          setTimeout(() => {
            paper.tools[1].activate();
          }, 100);

      },

      mousemove: function (event) {

        this.hitTest(event);

        this.paths.forEach((p) => {
          p.removeSegments();
        });

        const {profile} = this;
        if (profile.inset_by_y.empty() && profile.inset_by_x.empty()) {
          return;
        }

        var bounds, gen, hit = !!this.hitItem;

        if (hit) {
          bounds = this.hitItem.bounds;
          gen = this.hitItem.path;
        }
        else if (profile.w && profile.h) {
          gen = new paper.Path({
            insert: false,
            segments: [[0, 0], [0, -profile.h], [profile.w, -profile.h], [profile.w, 0]],
            closed: true,
          });
          bounds = gen.bounds;
          paper.project.zoom_fit(paper.project.strokeBounds.unite(bounds));

        }
        else
          return;

        var stepy = profile.step_by_y || (profile.elm_by_y && bounds.height / (profile.elm_by_y + ((hit || profile.elm_by_y < 2) ? 1 : -1))),
          county = profile.elm_by_y > 0 ? profile.elm_by_y.round(0) : Math.round(bounds.height / stepy) - 1,
          stepx = profile.step_by_x || (profile.elm_by_x && bounds.width / (profile.elm_by_x + ((hit || profile.elm_by_x < 2) ? 1 : -1))),
          countx = profile.elm_by_x > 0 ? profile.elm_by_x.round(0) : Math.round(bounds.width / stepx) - 1,
          w2x = profile.inset_by_x.nom().width / 2,
          w2y = profile.inset_by_y.nom().width / 2,
          clr = BuilderElement.clr_by_clr(profile.clr, false),
          by_x = [], by_y = [], base, pos, path, i, j, pts;

        function get_path(segments, b, e) {
          base++;
          if (base < tool.paths.length) {
            path = tool.paths[base];
            path.fillColor = clr;
            if (!path.isInserted())
              path.parent = tool.hitItem ? tool.hitItem.layer : paper.project.activeLayer;
          }
          else {
            path = new paper.Path({
              strokeColor: 'black',
              fillColor: clr,
              strokeScaling: false,
              guide: true,
              closed: true,
            });
            tool.paths.push(path);
          }
          path.addSegments(segments);
          path.b = b.clone();
          path.e = e.clone();
          return path;
        }

        function get_points(p1, p2) {

          var res = {
              p1: new paper.Point(p1),
              p2: new paper.Point(p2),
            },
            c1 = gen.contains(res.p1),
            c2 = gen.contains(res.p2);

          if (c1 && c2)
            return res;

          var intersect = gen.getIntersections(new paper.Path({insert: false, segments: [res.p1, res.p2]}));

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
                get_path([[pts.p1.x - w2x, pts.p1.y], [pts.p2.x - w2x, pts.p2.y], [pts.p2.x + w2x, pts.p2.y], [pts.p1.x + w2x, pts.p1.y]], pts.p1, pts.p2);
            }
            else {
              by_y.sort((a, b) => b - a);
              for (j = 0; j < by_y.length; j++) {
                if (j === 0) {
                  if (hit && (pts = get_points([by_x[i], bounds.bottom], [by_x[i], by_y[j]])))
                    get_path([[pts.p1.x - w2x, pts.p1.y], [pts.p2.x - w2x, pts.p2.y + w2x], [pts.p2.x + w2x, pts.p2.y + w2x], [pts.p1.x + w2x, pts.p1.y]], pts.p1, pts.p2);
                }
                else {
                  if (pts = get_points([by_x[i], by_y[j - 1]], [by_x[i], by_y[j]]))
                    get_path([[pts.p1.x - w2x, pts.p1.y - w2x], [pts.p2.x - w2x, pts.p2.y + w2x], [pts.p2.x + w2x, pts.p2.y + w2x], [pts.p1.x + w2x, pts.p1.y - w2x]], pts.p1, pts.p2);
                }
                if (j === by_y.length - 1) {
                  if (hit && (pts = get_points([by_x[i], by_y[j]], [by_x[i], bounds.top])))
                    get_path([[pts.p1.x - w2x, pts.p1.y - w2x], [pts.p2.x - w2x, pts.p2.y], [pts.p2.x + w2x, pts.p2.y], [pts.p1.x + w2x, pts.p1.y - w2x]], pts.p1, pts.p2);
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
                get_path([[pts.p1.x, pts.p1.y - w2y], [pts.p2.x, pts.p2.y - w2y], [pts.p2.x, pts.p2.y + w2y], [pts.p1.x, pts.p1.y + w2y]], pts.p1, pts.p2);
            }
            else {
              by_x.sort((a, b) => a - b);
              for (j = 0; j < by_x.length; j++) {
                if (j === 0) {
                  if (hit && (pts = get_points([bounds.left, by_y[i]], [by_x[j], by_y[i]])))
                    get_path([[pts.p1.x, pts.p1.y - w2y], [pts.p2.x - w2y, pts.p2.y - w2y], [pts.p2.x - w2y, pts.p2.y + w2y], [pts.p1.x, pts.p1.y + w2y]], pts.p1, pts.p2);
                }
                else {
                  if (pts = get_points([by_x[j - 1], by_y[i]], [by_x[j], by_y[i]]))
                    get_path([[pts.p1.x + w2y, pts.p1.y - w2y], [pts.p2.x - w2y, pts.p2.y - w2y], [pts.p2.x - w2y, pts.p2.y + w2y], [pts.p1.x + w2y, pts.p1.y + w2y]], pts.p1, pts.p2);
                }
                if (j === by_x.length - 1) {
                  if (hit && (pts = get_points([by_x[j], by_y[i]], [bounds.right, by_y[i]])))
                    get_path([[pts.p1.x + w2y, pts.p1.y - w2y], [pts.p2.x, pts.p2.y - w2y], [pts.p2.x, pts.p2.y + w2y], [pts.p1.x + w2y, pts.p1.y + w2y]], pts.p1, pts.p2);
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

      },
    });

  }

  hitTest(event) {

    this.hitItem = null;

    if (event.point)
      this.hitItem = paper.project.hitTest(event.point, {fill: true, class: paper.Path});

    if (this.hitItem && this.hitItem.item.parent instanceof Filling) {
      paper.canvas_cursor('cursor-lay-impost');
      this.hitItem = this.hitItem.item.parent;

    } else {
      paper.canvas_cursor('cursor-arrow-lay');
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
    if (!profile._elm_type_clrs) {
      const {inset_by_x, inset_by_y} = profile;
      profile._elm_type_clrs = [];

      let clr_group, elm;

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
      const {profile, sys} = this;
      delete profile._elm_type_clrs;
      this.elm_type_clrs(profile, sys);
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

}



class ToolPan extends ToolElement {

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'pan'},
      distanceThreshold: 10,
      minDistance: 10,
      mouseStartPos: new paper.Point(),
      mode: 'pan',
      zoomFactor: 1.1,
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-hand');
      },

      deactivate: function() {
      },

      mousedown: function(event) {
        if (event.modifiers.shift) {
          this.mouseStartPos = event.point;
        }
        else{
          this.mouseStartPos = event.point.subtract(paper.view.center);
        }
        this.mode = '';
        if (event.modifiers.control || event.modifiers.option) {
          this.mode = 'zoom';
        }
        else {
          paper.canvas_cursor('cursor-hand-grab');
          this.mode = 'pan';
        }
      },

      mouseup: function(event) {
        const {view} = this._scope;
        if (this.mode == 'zoom') {
          const zoomCenter = event.point.subtract(view.center);
          const moveFactor = this.zoomFactor - 1.0;
          if (event.modifiers.control) {
            view.zoom *= this.zoomFactor;
            view.center = view.center.add(zoomCenter.multiply(moveFactor / this.zoomFactor));
          } else if (event.modifiers.option) {
            view.zoom /= this.zoomFactor;
            view.center = view.center.subtract(zoomCenter.multiply(moveFactor));
          }
        } else if (this.mode == 'zoom-rect') {
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

      mousedrag: function(event) {
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

      mousemove: function(event) {
        this.hitTest(event);
      },

      keydown: function(event) {
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

      keyup: function(event) {
        this.hitTest(event);
      }
    })

  }

  testHot(type, event, mode) {
    var spacePressed = event && event.modifiers.space;
    if (mode != 'tool-zoompan' && !spacePressed)
      return false;
    return this.hitTest(event);
  }

  hitTest(event) {

    if (event.modifiers.control) {
      paper.canvas_cursor('cursor-zoom-in');
    } else if (event.modifiers.option) {
      paper.canvas_cursor('cursor-zoom-out');
    } else {
      paper.canvas_cursor('cursor-hand');
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

    paper._wrapper.appendChild(_cont);
    _cont.className = "pen_cont";

    paper.project.view.on('mousemove', this.mousemove);

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
    const bounds = paper.project.bounds,
      x = parseFloat(this._x.value || 0) + (bounds ? bounds.x : 0),
      y = (bounds ? (bounds.height + bounds.y) : 0) - parseFloat(this._y.value || 0);
    return new paper.Point([x, y]);
  }

  blur(){
    var focused = document.activeElement;
    if(focused == this._x)
      this._x.blur();
    else if(focused == this._y)
      this._y.blur();
    else if(focused == this._l)
      this._l.blur();
    else if(focused == this._a)
      this._a.blur();
  }

  mousemove(event, ignore_pos) {

    const {_scope, profile} = this._tool;

    if(!profile){
      return;
    }

    const {bounds, view} = _scope.project;
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
      this._tool.emit("mousedown", {
        modifiers: {}
      });
      setTimeout(() => {
        this._tool.emit("mouseup", {
          point: this.point,
          modifiers: {}
        });
      });
    });
  }

  unload() {
    paper.project.view.off('mousemove', this.mousemove);
    paper._wrapper.removeChild(this._cont);
    this._cont = null;
  }

}


class ToolPen extends ToolElement {

  constructor() {

    super()

    Object.assign(this, {
      options: {
        name: 'pen',
        wnd: {
          caption: "Новый сегмент профиля",
          width: 320,
          height: 240,
          allow_close: true,
          bind_generatrix: true,
          bind_node: false,
          inset: "",
          clr: ""
        }
      },
      point1: new paper.Point(),
      last_profile: null,
      mode: null,
      hitItem: null,
      originalContent: null,
      start_binded: false,
    })

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

    this.sys = paper.project._dp.sys;

    this.profile = $p.dp.builder_pen.create();

    $p.wsql.restore_options("editor", this.options);
    this.options.wnd.on_close = this.on_close;

    ["elm_type","inset","bind_generatrix","bind_node"].forEach((prop) => {
      if(prop == "bind_generatrix" || prop == "bind_node" || this.options.wnd[prop]){
        this.profile[prop] = this.options.wnd[prop];
      }
    });

    if((this.profile.elm_type.empty() || this.profile.elm_type == $p.enm.elm_types.Рама) &&
      paper.project.activeLayer instanceof Contour && paper.project.activeLayer.profiles.length) {
      this.profile.elm_type = $p.enm.elm_types.Импост;
    }
    else if((this.profile.elm_type.empty() || this.profile.elm_type == $p.enm.elm_types.Импост) &&
      paper.project.activeLayer instanceof Contour && !paper.project.activeLayer.profiles.length) {
      this.profile.elm_type = $p.enm.elm_types.Рама;
    }

    $p.dp.builder_pen.emit("value_change", {field: "elm_type"}, this.profile);

    this.profile.clr = paper.project.clr;

    this.profile._metadata('inset').choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => {
          if($p.utils.is_data_obj(o)){
            return this.profile.rama_impost.indexOf(o) != -1;
          }
          else{
            let refs = "";
            this.profile.rama_impost.forEach((o) => {
              if(refs){
                refs += ", ";
              }
              refs += "'" + o.ref + "'";
            });
            return "_t_.ref in (" + refs + ")";
          }
        }]
    }];

    $p.cat.clrs.selection_exclude_service(this.profile._metadata('clr'), this.sys);

    this.wnd = $p.iface.dat_blank(paper._dxw, this.options.wnd);
    this._grid = this.wnd.attachHeadFields({
      obj: this.profile
    });

    this.wnd.tb_mode = new $p.iface.OTooolBar({
      wrapper: this.wnd.cell,
      width: '100%',
      height: '28px',
      class_name: "",
      name: 'tb_mode',
      buttons: [
        {name: 'standard_form', text: '<i class="fa fa-file-image-o fa-fw"></i>', tooltip: 'Добавить типовую форму', float: 'left',
          sub: {
            width: '62px',
            height:'206px',
            buttons: [
              {name: 'square', img: 'square.png', float: 'left'},
              {name: 'triangle1', img: 'triangle1.png', float: 'right'},
              {name: 'triangle2', img: 'triangle2.png', float: 'left'},
              {name: 'triangle3', img: 'triangle3.png', float: 'right'},
              {name: 'semicircle1', img: 'semicircle1.png', float: 'left'},
              {name: 'semicircle2', img: 'semicircle2.png', float: 'right'},
              {name: 'circle',    img: 'circle.png', float: 'left'},
              {name: 'arc1',      img: 'arc1.png', float: 'right'},
              {name: 'trapeze1',  img: 'trapeze1.png', float: 'left'},
              {name: 'trapeze2',  img: 'trapeze2.png', float: 'right'},
              {name: 'trapeze3',  img: 'trapeze3.png', float: 'left'},
              {name: 'trapeze4',  img: 'trapeze4.png', float: 'right'},
              {name: 'trapeze5',  img: 'trapeze5.png', float: 'left'},
              {name: 'trapeze6',  img: 'trapeze6.png', float: 'right'}]}
        },
      ],
      image_path: "/imgs/",
      onclick: (name) => this.standard_form(name)
    });
    this.wnd.tb_mode.cell.style.backgroundColor = "#f5f5f5";
    this.wnd.cell.firstChild.style.marginTop = "22px";

    const wnd_options = this.wnd.wnd_options;
    this.wnd.wnd_options = (opt) => {
      wnd_options.call(this.wnd, opt);
      opt.bind_generatrix = this.profile.bind_generatrix;
      opt.bind_node = this.profile.bind_node;
    }
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
    const {_attr} = this._scope.project;
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
    paper.clear_selection_bounds();

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

      if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
        return;

      paper.project.selectedItems.forEach((path) => {
        if(path.parent instanceof ProfileItem){
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
    paper.project.deselectAll();

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

    paper.canvas_cursor('cursor-pen-freehand');

    if(event.event && event.event.which && event.event.which > 1){
      return this.on_keydown({key: 'escape'});
    }

    this.check_layer();

    let whas_select;

    if(this.addl_hit){

      if(this.addl_hit.glass && this.profile.elm_type == $p.enm.elm_types.Добор && !this.profile.inset.empty()){
        new ProfileAddl({
          generatrix: this.addl_hit.generatrix,
          proto: this.profile,
          parent: this.addl_hit.profile,
          side: this.addl_hit.side
        });
      }
      else if(this.profile.elm_type == $p.enm.elm_types.Соединитель && !this.profile.inset.empty()){
        const connective = new ProfileConnective({
          generatrix: this.addl_hit.generatrix,
          proto: this.profile,
          parent: this.addl_hit.profile,
        });
        connective.joined_nearests().forEach((p) => p.rays.clear());
      }
    }
    else if(this.mode == 'create' && this.path) {

      if (this.path.length < consts.sticking){
        return;
      }

      switch (this.profile.elm_type) {
      case $p.enm.elm_types.Раскладка:
        paper.project.activeLayer.glasses(false, true).some((glass) => {
          if(glass.contains(this.path.firstSegment.point) && glass.contains(this.path.lastSegment.point)){
            new Onlay({
              generatrix: this.path,
              proto: this.profile,
              parent: glass
            });
            this.path = null;
            return true;
          }
        });
        break;

      case $p.enm.elm_types.Водоотлив:
        this.last_profile = new Sectional({generatrix: this.path, proto: this.profile});
        break;

      case $p.enm.elm_types.Линия:
        this.last_profile = new BaseLine({generatrix: this.path, proto: this.profile});
        break;

      default:
        this.last_profile = new Profile({generatrix: this.path, proto: this.profile});
      }

      this.path = null;

      if(this.profile.elm_type == $p.enm.elm_types.Рама){
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
      if (event.modifiers.space && item.nearest && item.nearest()) {
        item = item.nearest();
      }

      if (event.modifiers.shift) {
        item.selected = !item.selected;
      } else {
        paper.project.deselectAll();
        item.selected = true;
      }

      if(item instanceof ProfileItem && item.isInserted()){
        item.attache_wnd(paper._acc.elm);
        whas_select = true;
        this._controls.blur();

      }else if(item instanceof Filling && item.visible){
        item.attache_wnd(paper._acc.elm);
        whas_select = true;
        this._controls.blur();
      }

      if(item.selected && item.layer){
        item.layer.activate(true);
      }

    }

    if(!whas_select && !this.mode && !this.addl_hit) {

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
        this.draw_addl()
      }
      else{
        this.draw_connective()
      }
    }
    else if(this.path){

      if(this.mode){

        let delta = event.point.subtract(this.point1),
          dragIn = false,
          dragOut = false,
          invert = false,
          handlePos;

        if (delta.length < consts.sticking){
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
          var i, res, element, bind = this.profile.bind_node ? "node_" : "";

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
              if(!bpoint.bind_to_nodes(true)){
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

                res = Onlay.prototype.bind_node(this.path.firstSegment.point, paper.project.activeLayer.glasses(false, true));
                if(res.binded){
                  this.path.firstSegment.point = this.point1 = res.point;
                }

              }
              else if(this.profile.elm_type == $p.enm.elm_types.Импост){

                res = {distance: Infinity};
                paper.project.activeLayer.profiles.some((element) => {

                  if(element.children.some((addl) => {
                      if(addl instanceof ProfileAddl && paper.project.check_distance(addl, null, res, this.path.firstSegment.point, bind) === false){
                        this.path.firstSegment.point = this.point1 = res.point;
                        return true;
                      }
                    })){
                    return true;

                  }else if (paper.project.check_distance(element, null, res, this.path.firstSegment.point, bind) === false ){
                    this.path.firstSegment.point = this.point1 = res.point;
                    return true;
                  }
                })

                this.start_binded = true;
              }
            }

            if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

              res = Onlay.prototype.bind_node(this.path.lastSegment.point, paper.project.activeLayer.glasses(false, true));
              if(res.binded)
                this.path.lastSegment.point = res.point;

            }
            else if(this.profile.elm_type == $p.enm.elm_types.Импост){

              res = {distance: Infinity};
              paper.project.activeLayer.profiles.some((element) => {

                if(element.children.some((addl) => {
                    if(addl instanceof ProfileAddl && paper.project.check_distance(addl, null, res, this.path.lastSegment.point, bind) === false){
                      this.path.lastSegment.point = res.point;
                      return true;
                    }
                  })){
                  return true;

                }else if (paper.project.check_distance(element, null, res, this.path.lastSegment.point, bind) === false ){
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

      if(event.className != "ToolEvent"){
        paper.project.register_update();
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

    if (event.point){
      this.hitItem = paper.project.hitTest(event.point, { stroke:true, curves:true, tolerance: hitSize });
    }

    if (this.hitItem) {

      if(this.hitItem.item.layer == paper.project.activeLayer &&  this.hitItem.item.parent instanceof ProfileItem && !(this.hitItem.item.parent instanceof Onlay)){

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
          })

        });

        if(hit.glass){
          this.addl_hit = hit;
          paper.canvas_cursor('cursor-pen-adjust');
        }

      }
      else if(this.hitItem.item.parent instanceof Filling){


      }else{
        paper.canvas_cursor('cursor-pen-freehand');
      }

    } else {

      this.hitItem = paper.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
      paper.canvas_cursor('cursor-pen-freehand');
    }

  }

  hitTest_connective(event) {

    const hitSize = 16;
    const {project} = this._scope;
    const rootLayer = project.rootLayer();

    if (event.point){
      this.hitItem = rootLayer.hitTest(event.point, { stroke:true, curves:true, tolerance: hitSize });
    }

    if (this.hitItem) {

      if(this.hitItem.item.parent instanceof ProfileItem && !(this.hitItem.item.parent instanceof Onlay)){

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
          paper.canvas_cursor('cursor-pen-adjust');
        }

      }
      else{
        paper.canvas_cursor('cursor-pen-freehand');
      }

    }
    else {
      this.hitItem = paper.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
      paper.canvas_cursor('cursor-pen-freehand');
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
        this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
      }

      if(!this.hitItem){
        this.hitItem = paper.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
      }

      if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem
        && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
        paper.canvas_cursor('cursor-pen-adjust');
      }
      else {
        paper.canvas_cursor('cursor-pen-freehand');
      }
    }

    return true;
  }



  standard_form(name) {

    if(name == 'standard_form'){
      name = 'square'
    }

    if(this['add_' + name]){
      this['add_' + name](paper.project.bounds);
      paper.project.zoom_fit();
    }
    else{
      $p.msg.show_not_implemented();
    }

  }

  add_sequence(points) {
    points.forEach((segments) => {
      new Profile({generatrix: new paper.Path({
        strokeColor: 'black',
        segments: segments
      }), proto: this.profile});
    })
  }

  add_square(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0,-1000])],
      [point.add([0,-1000]), point.add([1000,-1000])],
      [point.add([1000,-1000]), point.add([1000,0])],
      [point.add([1000,0]), point]
    ])
  }

  add_triangle1(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0,-1000])],
      [point.add([0,-1000]), point.add([1000,0])],
      [point.add([1000,0]), point]
    ])
  }

  add_triangle2(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([1000,-1000])],
      [point.add([1000,-1000]), point.add([1000,0])],
      [point.add([1000,0]), point]
    ])
  }

  add_triangle3(bounds) {
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([1000,-1000])],
      [point.add([1000,-1000]), point.add([2000,0])],
      [point.add([2000,0]), point]
    ])
  }

  decorate_layers(reset){

    const active = paper.project.activeLayer;

    paper.project.getItems({class: Contour}).forEach((l) => {
      l.opacity = (l == active || reset) ? 1 : 0.5;
    })

  }

}




class RulerWnd {

  constructor(options, tool) {

    if (!options) {
      options = {
        name: 'sizes',
        wnd: {
          caption: 'Размеры и сдвиг',
          height: 200,
          modal: true,
        },
      };
    }
    options.wnd.allow_close = true;
    $p.wsql.restore_options('editor', options);
    if (options.mode > 2) {
      options.mode = 2;
    }
    options.wnd.on_close = this.on_close.bind(this);
    this.options = options;

    this.tool = tool;
    const wnd = this.wnd = $p.iface.dat_blank(paper._dxw, options.wnd);

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

    wnd.attachObject(div);

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

          {name: 'sep_0', text: '', float: 'left'},
          {name: 'base', img: 'ruler_base.png', tooltip: $p.msg.ruler_base, float: 'left'},
          {name: 'inner', img: 'ruler_inner.png', tooltip: $p.msg.ruler_inner, float: 'left'},
          {name: 'outer', img: 'ruler_outer.png', tooltip: $p.msg.ruler_outer, float: 'left'},
        ],
        image_path: '/imgs/',
        onclick: (name) => {

          if (['0', '1', '2'].indexOf(name) != -1) {

            ['0', '1', '2'].forEach((btn) => {
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
    }

    this.input = this.table[1].childNodes[1];
    this.input.grid = {
      editStop: (v) => {
        tool.eve.emit('sizes_wnd', {
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
    this.input.firstChild.onfocus = function () {
      wnd.elmnts.calck = new eXcell_calck(this);
      wnd.elmnts.calck.edit();
    };

    setTimeout(() => {
      this.input && this.input.firstChild.focus();
    }, 100);

  }

  on_button_click(ev) {

    const {wnd, tool, size} = this;

    if (!paper.project.selectedItems.some((path) => {
        if (path.parent instanceof DimensionLineCustom) {

          switch (ev.currentTarget.name) {

            case 'left':
            case 'bottom':
              path.parent.offset -= 20;
              break;

            case 'top':
            case 'right':
              path.parent.offset += 20;
              break;

          }

          return true;
        }
      })) {

      tool.eve.emit('sizes_wnd', {
        wnd: wnd,
        name: ev.currentTarget.name,
        size: size,
        tool: tool,
      });
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

          paper.project.selectedItems.some((path) => {
            if (path.parent instanceof DimensionLineCustom) {
              path.parent.remove();
              return true;
            }
          });

          return $p.iface.cancel_bubble(ev);

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

    tool.eve.emit('sizes_wnd', {
      wnd: wnd,
      name: 'close',
      size: size,
      tool: tool,
    });

    if (this.options) {
      if (tool instanceof DimensionLine) {
        delete this.options.wnd.on_close;
        wnd.wnd_options(this.options.wnd);
        $p.wsql.save_options('editor', this.options);
      }
      else {
        setTimeout(() => paper.tools[1].activate());
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
}


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

      activate: function () {

        this.selected.a.length = 0;
        this.selected.b.length = 0;

        this.on_activate('cursor-arrow-ruler-light');

        paper.project.deselectAll();
        this.wnd = new RulerWnd(this.options, this);
      },

      deactivate: function () {

        this.remove_path();

        this.detache_wnd();

      },

      mousedown: function (event) {

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

                new DimensionLineCustom({
                  elm1: this.selected.a[0].profile,
                  elm2: this.hitPoint.profile,
                  p1: this.selected.a[0].point_name,
                  p2: this.hitPoint.point_name,
                  parent: this.hitPoint.profile.layer.l_dimensions,
                });

                this.hitPoint.profile.project.register_change(true);
                this.reset_selected();

              }
            }
          }

        }
        else {
          this.reset_selected();
        }

      },

      mouseup: function (event) {


      },

      mousedrag: function (event) {

      },

      mousemove: function (event) {

        this.hitTest(event);

        const {mode, path} = this;

        if (mode == 3 && path) {

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

      },

      keydown: function (event) {

        if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

          if (event.event && event.event.target && ['textarea', 'input'].indexOf(event.event.target.tagName.toLowerCase()) != -1)
            return;

          paper.project.selectedItems.some((path) => {
            if (path.parent instanceof DimensionLineCustom) {
              path.parent.remove();
              return true;
            }
          });

          event.stop();
          return false;

        }
      },
    });

    this._sizes_wnd = this._sizes_wnd.bind(this);
    this.eve.on('sizes_wnd', this._sizes_wnd);
  }

  hitTest(event) {

    this.hitItem = null;
    this.hitPoint = null;

    if (event.point) {

      if (!this.mode) {
        this.hitItem = paper.project.hitTest(event.point, {fill: true, tolerance: 10});
      }
      else {
        const hit = paper.project.hitPoints(event.point, 16);
        if (hit && hit.item.parent instanceof ProfileItem) {
          this.hitItem = hit;
        }
      }
    }

    if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem) {
      if (this.mode) {
        paper.canvas_cursor('cursor-arrow-white-point');
        this.hitPoint = this.hitItem.item.parent.select_corn(event.point);
      }
    }
    else {
      if (this.mode) {
        paper.canvas_cursor('cursor-text-select');
      }
      else {
        paper.canvas_cursor('cursor-arrow-ruler-light');
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
    paper.project.deselectAll();
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
      paper.project.deselectAll();
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
    paper.project.deselectAll();
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

    if (xy == 'x') {
      if (event.name == 'right')
        delta = new paper.Point(event.size - delta, 0);
      else
        delta = new paper.Point(delta - event.size, 0);

    } else {
      if (event.name == 'bottom')
        delta = new paper.Point(0, event.size - delta);
      else
        delta = new paper.Point(0, delta - event.size);
    }

    if (delta.length) {

      let to_move;


      paper.project.deselectAll();

      if (event.name == 'right' || event.name == 'bottom') {
        to_move = pos1 < pos2 ? this.selected.b : this.selected.a;
      } else {
        to_move = pos1 < pos2 ? this.selected.a : this.selected.b;
      }

      to_move.forEach((p) => {
        p.generatrix.segments.forEach((segm) => segm.selected = true);
      });

      paper.project.move_points(delta);

      setTimeout(() => {
        paper.project.deselectAll();
        paper.project.register_update();
      }, 200);
    }

  }

  _sizes_wnd(event) {

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
      mode: null,
      hitItem: null,
      originalContent: null,
      originalHandleIn: null,
      originalHandleOut: null,
      changed: false,
      minDistance: 10
    });

    this.on({

      activate: function() {
        this.on_activate('cursor-arrow-white');
      },

      deactivate: function() {
        paper.clear_selection_bounds();
        if(this.profile){
          this.profile.detache_wnd();
          delete this.profile;
        }
      },

      mousedown: function(event) {

        const {project} = this._scope;

        this.mode = null;
        this.changed = false;

        if(event.event && event.event.which && event.event.which > 1){
        }

        if (this.hitItem && !event.modifiers.alt) {

          if(this.hitItem.item instanceof paper.PointText) {
            return
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
              this.originalContent = paper.capture_selection_state();

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
              this.originalContent = paper.capture_selection_state();
            }
          }
          else if (this.hitItem.type == 'handle-in' || this.hitItem.type == 'handle-out') {
            this.mode = consts.move_handle;
            this.mouseStartPos = event.point.clone();
            this.originalHandleIn = this.hitItem.segment.handleIn.clone();
            this.originalHandleOut = this.hitItem.segment.handleOut.clone();

          }

          if(item instanceof ProfileItem || item instanceof Filling){
            item.attache_wnd(this._scope._acc.elm);
            this.profile = item;
          }

          paper.clear_selection_bounds();

        } else {
          this.mouseStartPos = event.point.clone();
          this.mode = 'box-select';

          if(!event.modifiers.shift && this.profile){
            this.profile.detache_wnd();
            delete this.profile;
          }

        }
      },

      mouseup: function(event) {

        const {project} = this._scope;

        if (this.mode == consts.move_shapes) {
          if (this.changed) {
            paper.clear_selection_bounds();
          }
        }
        else if (this.mode == consts.move_points) {
          if (this.changed) {
            paper.clear_selection_bounds();
          }
        }
        else if (this.mode == consts.move_handle) {
          if (this.changed) {
            paper.clear_selection_bounds();
          }
        }
        else if (this.mode == 'box-select') {

          var box = new paper.Rectangle(this.mouseStartPos, event.point);

          if (!event.modifiers.shift){
            project.deselectAll();
          }

          if (event.modifiers.control) {

            const profiles = [];
            paper.paths_intersecting_rect(box).forEach((path) => {
              if(path.parent instanceof ProfileItem){
                if(profiles.indexOf(path.parent) == -1){
                  profiles.push(path.parent);
                  path.parent.selected = !path.parent.selected;
                }
              }
              else{
                path.selected = !path.selected;
              }
            })

          }
          else {

            const selectedSegments = paper.segments_in_rect(box);
            if (selectedSegments.length > 0) {
              for (let i = 0; i < selectedSegments.length; i++) {
                selectedSegments[i].selected = !selectedSegments[i].selected;
              }
            }
            else {
              const profiles = [];
              paper.paths_intersecting_rect(box).forEach((path) => {
                if(path.parent instanceof ProfileItem){
                  if(profiles.indexOf(path.parent) == -1){
                    profiles.push(path.parent);
                    path.parent.selected = !path.parent.selected;
                  }
                }
                else{
                  path.selected = !path.selected;
                }
              })
            }
          }
        }

        paper.clear_selection_bounds();

        if (this.hitItem) {
          if (this.hitItem.item.selected || (this.hitItem.item.parent && this.hitItem.item.parent.selected)) {
            paper.canvas_cursor('cursor-arrow-small');
          }
          else {
            paper.canvas_cursor('cursor-arrow-white-shape');
          }
        }
      },

      mousedrag: function(event) {

        const {project} = this._scope;

        this.changed = true;

        if (this.mode == consts.move_shapes) {
          paper.canvas_cursor('cursor-arrow-small');

          let delta = event.point.subtract(this.mouseStartPos);
          if (!event.modifiers.shift){
            delta = delta.snap_to_angle(Math.PI*2/4);
          }
          paper.restore_selection_state(this.originalContent);
          project.move_points(delta, true);
          paper.clear_selection_bounds();
        }
        else if (this.mode == consts.move_points) {
          paper.canvas_cursor('cursor-arrow-small');

          let delta = event.point.subtract(this.mouseStartPos);
          if(!event.modifiers.shift) {
            delta = delta.snap_to_angle(Math.PI*2/4);
          }
          paper.restore_selection_state(this.originalContent);
          project.move_points(delta);
          paper.purge_selection();
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

          paper.purge_selection();
        }
        else if (this.mode == 'box-select') {
          paper.drag_rect(this.mouseStartPos, event.point);
        }
      },

      mousemove: function(event) {
        this.hitTest(event);
      },

      keydown: function(event) {

        const {project} = this._scope;
        const {key, modifiers} = event;

        let j, path, segment, index, point, handle;

        const step = modifiers.shift ? 1 : 10;

        if (key == '+' || key == 'insert') {


          for(let path of project.selectedItems){
            if (modifiers.space) {
              if(path.parent instanceof Profile){

                const cnn_point = path.parent.cnn_point("e");
                if(cnn_point && cnn_point.profile){
                  cnn_point.profile.rays.clear();
                }
                path.parent.rays.clear();

                point = path.getPointAt(path.length * 0.5);
                const newpath = path.split(path.length * 0.5);
                path.lastSegment.point = path.lastSegment.point.add(paper.Point.random());
                newpath.firstSegment.point = path.lastSegment.point;
                new Profile({generatrix: newpath, proto: path.parent});
              }
            }
            else{
              let do_select = false;
              if(path.parent instanceof GeneratrixElement && !(path instanceof ProfileAddl)){
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
                if(path.parent instanceof Sectional){
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

            if(path.parent instanceof DimensionLineCustom){
              path.parent.remove();
              return true;
            }
            else if(path.parent instanceof GeneratrixElement){
              if(path instanceof ProfileAddl){
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
            else if(path instanceof Filling){
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
    });

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
        if (hit.item.parent instanceof ProfileItem) {
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

        if (hitItem.item.parent instanceof DimensionLine) {
        }
        else if (hitItem.item instanceof paper.PointText) {
          !(hitItem.item instanceof EditableText) && paper.canvas_cursor('cursor-text');     
        }
        else if (hitItem.item.selected) {
          paper.canvas_cursor('cursor-arrow-small');
        }
        else {
          paper.canvas_cursor('cursor-arrow-white-shape');
        }
      }
      else if (hitItem.type == 'segment' || hitItem.type == 'handle-in' || hitItem.type == 'handle-out') {
        if (hitItem.segment.selected) {
          paper.canvas_cursor('cursor-arrow-small-point');
        }
        else {
          paper.canvas_cursor('cursor-arrow-white-point');
        }
      }
    }
    else {
      const hit = project.hitTest(point, {stroke: true, visible: true, tolerance: 16});
      if (hit && hit.item.parent instanceof Sectional){
        this.hitItem = hit;
        paper.canvas_cursor('cursor-arrow-white-shape');
      }
      else{
        paper.canvas_cursor('cursor-arrow-white');
      }
    }

    return true;
  }

}


class ToolText extends ToolElement {

  constructor() {

    super()

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
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-text-select');
      },

      deactivate: function() {
        paper.hide_selection_bounds();
        this.detache_wnd();
      },

      mousedown: function(event) {
        this.text = null;
        this.changed = false;

        paper.project.deselectAll();
        this.mouseStartPos = event.point.clone();

        if (this.hitItem) {

          if(this.hitItem.item instanceof paper.PointText){
            this.text = this.hitItem.item;
            this.text.selected = true;

          }else {
            this.text = new FreeText({
              parent: this.hitItem.item.layer.l_text,
              point: this.mouseStartPos,
              content: '...',
              selected: true
            });
          }

          this.textStartPos = this.text.point;

          if(!this.wnd || !this.wnd.elmnts){
            $p.wsql.restore_options("editor", this.options);
            this.wnd = $p.iface.dat_blank(paper._dxw, this.options.wnd);
            this._grid = this.wnd.attachHeadFields({
              obj: this.text
            });
          }else{
            this._grid.attach({obj: this.text})
          }

        }else
          this.detache_wnd();

      },

      mouseup: function(event) {

        if (this.mode && this.changed) {
        }

        paper.canvas_cursor('cursor-arrow-lay');

      },

      mousedrag: function(event) {

        if (this.text) {
          var delta = event.point.subtract(this.mouseStartPos);
          if (event.modifiers.shift)
            delta = delta.snap_to_angle();

          this.text.move_points(this.textStartPos.add(delta));

        }

      },

      mousemove: function(event) {
        this.hitTest(event);
      },

      keydown: function(event) {
        var selected, i, text;
        if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

          if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
            return;

          selected = paper.project.selectedItems;
          for (i = 0; i < selected.length; i++) {
            text = selected[i];
            if(text instanceof FreeText){
              text.text = "";
              setTimeout(function () {
                paper.view.update();
              }, 100);
            }
          }

          event.preventDefault();
          return false;
        }
      }
    })

  }

  hitTest(event) {
    const hitSize = 6;

    this.hitItem = paper.project.hitTest(event.point, { class: paper.TextItem, bounds: true, fill: true, stroke: true, tolerance: hitSize });
    if(!this.hitItem){
      this.hitItem = paper.project.hitTest(event.point, { fill: true, stroke: false, tolerance: hitSize });
    }
    if(!this.hitItem){
      const hit = paper.project.hitTest(event.point, { fill: false, stroke: true, tolerance: hitSize });
      if(hit && hit.item.parent instanceof Sectional){
        this.hitItem = hit;
      }
    }

    if (this.hitItem){
      if(this.hitItem.item instanceof paper.PointText)
        paper.canvas_cursor('cursor-text');     
      else
        paper.canvas_cursor('cursor-text-add'); 
    } else
      paper.canvas_cursor('cursor-text-select');  

    return true;
  }

}


$p.injected_data._mixin({"tip_select_node.html":"<div class=\"otooltip\">\r\n    <p class=\"otooltip\">Инструмент <b>Элемент и узел</b> позволяет:</p>\r\n    <ul class=\"otooltip\">\r\n        <li>Выделить элемент<br />для изменения его свойств или перемещения</li>\r\n        <li>Выделить отдельные узлы и рычаги узлов<br />для изменения геометрии</li>\r\n        <li>Добавить новый узел (изгиб)<br />(кнопка {+} на цифровой клавиатуре)</li>\r\n        <li>Удалить выделенный узел (изгиб)<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n        <li>Добавить новый элемент, делением текущего<br />(кнопка {+} при нажатой кнопке {пробел})</li>\r\n        <li>Удалить выделенный элемент<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n    </ul>\r\n    <hr />\r\n    <a title=\"Видеоролик, иллюстрирующий работу инструмента\" href=\"https://www.youtube.com/embed/UcBGQGqwUro?list=PLiVLBB_TTj5njgxk5E_EjwxzCGM4XyKlQ\" target=\"_blank\">\r\n        <i class=\"fa fa-video-camera fa-lg\"></i> Обучающее видео</a>\r\n    <a title=\"Справка по инструменту в WIKI\" href=\"http://www.oknosoft.ru/upzp/apidocs/classes/OTooolBar.html\" target=\"_blank\" style=\"margin-left: 9px;\">\r\n        <i class='fa fa-question-circle fa-lg'></i> Справка в wiki</a>\r\n</div>"});
return Editor;
}));
