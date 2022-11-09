;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Windowbuilder = factory();
  }
}(this, function() {

/**
 * Элементы управления в аккордеоне редактора
 * Created 16.02.2016
 * @author Evgeniy Malyarov
 * @module editor
 * @submodule editor_accordion
 */


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

    // гасим-включаем слой по чекбоксу
    this.tree.attachEvent('onCheck', (key, state) => {
      const {project} = editor;
      const contour = project.getItem({class: Editor.Contour, key});
      if(contour) {
        contour.hidden = !state;
      }
      else {
        project.ox.builder_props = {[key]: state};
        project.register_change(true);
      }
      project.register_update();
    });

    // делаем выделенный слой активным
    this.tree.attachEvent('onSelect', (key, mode) => {
      if(!mode){
        return;
      }
      const {project} = editor;
      const contour = project.getItem({class: Editor.Contour, key});
      if(contour){
        if(project.activeLayer != contour){
          contour.activate(true);
        }
        set_text(contour.presentation());
      }
    });

    // начинаем следить за изменениями размеров при перерисовке контуров
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
    if(contour && contour.key && tree && tree.getSelectedId && contour.key != tree.getSelectedId()){
      // если выделено несколько створок, переносим выделение на раму
      const layers = [];
      const {project} = this.editor;
      for(const elm of project.getSelectedItems()) {
        elm.layer instanceof Editor.Contour && layers.indexOf(elm.layer) === -1 && layers.push(elm.layer);
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

      if(tree.items[contour.key]){
        tree.selectItem(contour.key);
        this._set_text(contour.presentation());
      }
    }
  }

  contour_redrawed(contour, bounds) {
    if(contour instanceof Editor.ContourNestedContent) {
      return;
    }
    const {tree} = this;
    if(tree && tree.setItemText){
      const text = contour.presentation(bounds);
      tree.setItemText(contour.key, text);
      if(contour.project.activeLayer == contour){
        this._set_text(text);
      }
    }
  }

  load_layer(layer) {
    this.tree.addItem(layer.key, layer.presentation(), layer.parent ? layer.parent.key : 0);
    this.tree.checkItem(layer.key);
    layer.contours.forEach((l) => this.load_layer(l));
  }

  listener(obj, fields) {
    const {tree, editor: {project}} = this;

    if(tree && tree.clearAll && fields.constructions) {

      // добавляем слои изделия
      tree.clearAll();
      project.contours.forEach((layer) => {
        this.load_layer(layer);
        tree.openItem(layer.key);
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
    let key = tree.getSelectedId(), l;
    if(key){
      l = project.getItem({class: Editor.Contour, key});
    }
    else if(l = project.activeLayer){
      key = l.key;
    }
    if(key && l){
      tree.deleteItem(key);
      key = l.parent && l.parent.key;
      l.remove();
      setTimeout(() => {
        project.zoom_fit();
        if(key){
          tree.selectItem(key);
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

    // пробегаем в цикле по параметрам, чтобы спрятать скрытые строки
    obj.refresh_prm_links();

    const attr = {
      obj,
      oxml: {
        Фурнитура: ['furn'],
        Параметры: []
      },
      ts: 'params',
      ts_title: 'Параметры',
      selection: {
        cnstr: obj.cnstr || -9999,
        inset: $p.utils.blank.guid,
        hide: {not: true}
      }
    };

    if(obj.layer) {
      attr.oxml.Фурнитура.push('direction', 'h_ruch');
    }
    if(obj.project._dp.sys.show_flipped) {
      attr.oxml.Фурнитура.push('flipped');
    }

    // создаём или переподключаем грид
    if(!this._grid){
      this._grid = this.layout.attachHeadFields(attr);
      this._grid.attachEvent("onPropertyChanged", (pname, new_value) => {
        pname = this._grid && this._grid.getSelectedRowId();
        setTimeout(() => this.on_prm_change(pname, new_value, true));
      });
    }else{
      this._grid.attach(attr);
    }

    // прячем параметры фурнитуры во внешних слоях
    if(!obj.parent && this._grid.getAllRowIds){
      const rids = this._grid.getAllRowIds();
      if(rids){
        this._grid.closeItem(rids.split(",")[0]);
      }
    }

    this.on_prm_change('0|0');
    this._grid.setSizes();

    const ro = obj instanceof Editor.ContourNestedContent || obj instanceof Editor.ContourNested;
    this._grid.setEditable(!ro);
    const {buttons} = this.layout._otoolbar;
    for(const btn in buttons) {
      if(btn === 'spec') {
        continue;
      }
      if(ro) {
        buttons[btn].classList.add('disabledbutton');
      }
      else {
        buttons[btn].classList.remove('disabledbutton');
      }
    }
  }

  on_refresh_prm_links(contour) {
    const {_grid} = this;
    if(_grid && contour === _grid._obj){
      this.reload();
    }
  }

  /**
   * Обработчик при изменении параметра фурнитуры
   * @param field
   * @param value
   * @param realy_changed
   */
  on_prm_change(field, value, realy_changed) {

    const pnames = field && field.split('|');
    const {_grid, editor} = this;

    if(!field || !_grid || pnames.length < 2){
      return;
    }

    const {_obj} = _grid;
    let need_set_sizes;

    // пробегаем по всем строкам
    _obj.params.find_rows({
      cnstr: _obj.cnstr || -9999,
      inset: $p.utils.blank.guid,
      hide: {not: true}
    }, (prow) => {
      const {param} = prow;
      if(param == value){
        return;
      }
      const links = param.params_links({grid: _grid, obj: prow, layer: _obj});
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

      // проверим вхождение значения в доступные и при необходимости изменим
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
      // начинаем следить за изменениями размеров при перерисовке контуров
      contour_redrawed: this.contour_redrawed,
      // при готовности снапшота, обновляем суммы и цены
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
    if(_obj && scheme === project && !attr.clipboard && _calc_order_row) {
      ['price_internal', 'amount_internal', 'price', 'amount'].forEach((fld) => _obj[fld] = _calc_order_row[fld]);
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

    // корректируем метаданные поля выбора цвета
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
        id: 'stv',
        text: '<i class="fa fa-object-ungroup fa-fw"></i>',
        title: 'Свойства створки',
      },
      {
        id: 'prod',
        text: '<i class="fa fa-picture-o fa-fw"></i>',
        title: 'Свойства изделия',
      },
      {
        id: 'tool',
        text: '<i class="fa fa-wrench fa-fw"></i>',
        title: 'Свойства инструмента',
      },
    ];
    this.tabbar = cell_acc.attachTabbar({
      arrows_mode: 'auto',
      tabs: tabs
    });

    const titles = this.tabbar.tabsArea.children[1].firstChild.children;
    tabs.forEach((tab, index) => {
      titles[index+1].title = tab.title;
    });

    const {iface, msg, ui} = $p;

    /**
     * ячейка для размещения свойств элемента
     */
    this.elm = this.tabbar.cells('elm');
    this.elm._toolbar = this.elm.attachToolbar();
    this.elm._otoolbar = new iface.OTooolBar({
      wrapper: this.elm.cell,
      width: '100%',
      height: '28px',
      top: '6px',
      left: '4px',
      class_name: '',
      name: 'aling_bottom',
      buttons: [
        {name: 'left', css: 'tb_align_left', tooltip: msg.align_node_left, float: 'left'},
        {name: 'bottom', css: 'tb_align_bottom', tooltip: msg.align_node_bottom, float: 'left'},
        {name: 'top', css: 'tb_align_top', tooltip: msg.align_node_top, float: 'left'},
        {name: 'right', css: 'tb_align_right', tooltip: msg.align_node_right, float: 'left'},
        {name: 'all', text: '<i class="fa fa-arrows-alt fa-fw"></i>', tooltip: msg.align_all, float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'additional_inserts', text: '<i class="fa fa-tag fa-fw"></i>', tooltip: msg.additional_inserts + ' ' + msg.to_elm, float: 'left'},
        {name: 'sep_1', text: '', float: 'left'},
        {name: 'arc', css: 'tb_cursor-arc-r', tooltip: msg.bld_arc, float: 'left'},

        {name: 'delete', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: msg.del_elm, float: 'right', paddingRight: '18px'},
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

          case 'delete':
            _editor.project.selectedItems.forEach((path) => {
              const {parent} = path;
              if(parent instanceof Editor.ProfileItem){
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
    _editor.eve.on('set_inset', this.on_set_inset.bind(this));

    /**
     * слои в аккордионе
     */
    this._layers = this.tabbar.cells('lay');
    this._layers._toolbar = this._layers.attachToolbar();
    this._layers._otoolbar = new iface.OTooolBar({
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
        {name: 'new_stv', text: '<i class="fa fa-file-code-o fa-fw"></i>', tooltip: msg.bld_new_stv, float: 'left'},
        {name: 'nested_layer', text: '<i class="fa fa-file-image-o fa-fw"></i>', tooltip: 'Добавить вложенное изделие', float: 'left'},
        {name: 'virtual_layer', text: '<i class="fa fa-file-excel-o fa-fw"></i>', tooltip: 'Вставить виртуальный слой', float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'inserts_to_product', text: '<i class="fa fa-tags fa-fw"></i>', tooltip: msg.additional_inserts + ' ' + msg.to_product, float: 'left'},

        {name: 'drop_layer', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить слой', float: 'right', paddingRight: '20px'},

      ], onclick: (name) => {

        switch (name) {

        case 'new_stv':
        case 'nested_layer':
        case 'virtual_layer':
          const fillings = _editor.project.getItems({class: Editor.Filling, selected: true});
          if(fillings.length) {
            if(name === 'nested_layer') {
               // _editor.project.save_coordinates({save: true})
               //   .then(() => ui.dialogs.templates_nested())
             ui.dialogs.templates_nested()
                .then((selected) => {
                  if(selected === true) {
                    const {cat: {templates}, job_prm} = $p;
                    const _obj = templates._select_template;
                    const {templates_nested} = job_prm.builder;
                    if(templates_nested && templates_nested.includes(_obj.calc_order)) {
                      let {layer} = fillings[0];
                      // если текущий слой уже является вложенным - перезаполняем содержимое из шаблона
                      if(layer instanceof Editor.ContourNestedContent) {
                        while (layer) {
                          layer = layer.layer;
                          if(layer instanceof Editor.ContourNested) {
                            break;
                          }
                        }
                        layer.load_stamp();
                      }
                      else {
                        // создаём новое вложенное изделие
                        fillings[0].create_leaf(name);
                      }
                    }
                  }
                })
                .catch((err) => null);
            }
            else {
              fillings[0].create_leaf(name);
            }
          }
          else {
            msg.show_msg({
              type: 'alert-warning',
              text: msg.bld_new_stv_no_filling,
              title: msg.bld_new_stv
            });
          }
          break;

        case 'drop_layer':
          this.tree_layers.drop_layer();
          break;

        case 'new_layer':

          // создаём пустой новый слой
          Editor.Contour.create({project: _editor.project});
          break;

        case 'inserts_to_product':
          // дополнительные вставки в изделие
          _editor.additional_inserts();
          break;

        case 'inserts_to_contour':
          // дополнительные вставки в контур
          _editor.additional_inserts('contour');
          break;

        default:
          msg.show_msg(name);
          break;
        }

        return false;
      }
    });

    this.tree_layers = new SchemeLayers(this._layers, (text) => {
      this._stv._toolbar.setItemText("info", text);
      _editor.additional_inserts('contour', this.tree_layers.layout.cells('b'));
    }, _editor);

    /**
     * свойства створки
     */
    this._stv = this.tabbar.cells('stv');
    this._stv._toolbar = this._stv.attachToolbar({
      items:[
        {id: "info", type: "text", text: ""},
      ],
    });
    this._stv._otoolbar = new iface.OTooolBar({
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
        {name: 'down', text: '<i class="fa fa-arrow-down fa-fw"></i>', tooltip: 'Сдвинуть по Z ниже', float: 'right'},
        {name: 'up', text: '<i class="fa fa-arrow-up fa-fw"></i>', tooltip: 'Сдвинуть по Z выше', float: 'right'},
      ], onclick: (name) => {

        switch (name) {

        case 'refill':
          const {_obj} = this.stv._grid;
          if(_editor.project._dp.sys.furn_level > _obj.level) {
            _obj.furn = '';
          }
          _obj.furn.refill_prm(_obj);
          this.stv.reload();
          break;

        case 'spec':
          _editor.layer_spec();
          break;

        case 'up':
        case 'down':
          const {activeLayer} = _editor.project;
          if(activeLayer && activeLayer.bring) {
            activeLayer.bring(name);
            activeLayer.activate(true);
          }

          break;

        default:
          msg.show_msg(name);
          break;
        }

        return false;
      }
    });
    this.stv = new StvProps(this._stv, _editor);

    /**
     * свойства изделия
     */
    this._prod = this.tabbar.cells('prod');
    this._prod._toolbar = this._prod.attachToolbar();
    this._prod._otoolbar = new iface.OTooolBar({
      wrapper: this._prod.cell,
      width: '100%',
      height: '28px',
      top: '6px',
      left: '4px',
      class_name: "",
      name: 'bottom',
      image_path: '/imgs/',
      buttons: [
        {name: 'inserts_to_product', text: '<i class="fa fa-tags fa-fw"></i>', tooltip: msg.additional_inserts + ' ' + msg.to_product, float: 'left'},
        {name: 'refill', text: '<i class="fa fa-retweet fa-fw"></i>', tooltip: 'Обновить параметры', float: 'right', paddingRight: '20px'}

      ], onclick: (name) => {

        switch(name) {

          case 'refill':
            _editor.project._dp.sys.refill_prm(_editor.project.ox, 0, false, _editor.project);
            this.props.reload();
            break;

          case 'inserts_to_product':
            // дополнительные вставки в изделие
            _editor.additional_inserts();
            break;

          default:
            msg.show_msg(name);
            break;
        }

        return false;
      }
    });
    this.props = new SchemeProps(this._prod, _editor);

    this._tool = this.tabbar.cells('tool');
    _editor.eve.on('tool_activated', this.tool_activated.bind(this));


  }

  tool_activated(tool) {
    if(!(tool instanceof ToolSelectNode) && tool.constructor.ToolWnd) {
      this._tool.setActive();
    }
  }

  on_set_inset(elm) {
    const {_grid} = elm._attr;
    if(_grid && _grid._obj === elm) {
      _grid.attach({
        obj: elm,
        oxml: elm.oxml
      });
    }
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
        // добавляем параметры вставки
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

    // фильтруем параметры при выборе вставки
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


/**
 * Работа с буфером обмена
 * @author Evgeniy Malyarov
 * @module clipboard
 */

/**
 * ### Буфер обмена
 * Объект для прослушивания и обработки событий буфера обмена
 *
 * @class Clipbrd
 * @param _editor
 * @constructor
 */
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

      // получаем выделенные элементы
      var sitems = [];
      _scheme.selectedItems.forEach(function (el) {
        if(el.parent instanceof $p.EditorInvisible.Profile) {
          el = el.parent;
        }
        if(el instanceof $p.EditorInvisible.BuilderElement && sitems.indexOf(el) == -1) {
          sitems.push(el);
        }
      });

      // сериализуем
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
      //e.clipboardData.setData('text/html', '<b>Hello, world!</b>');
      e.preventDefault();
    }
  }

  this.copy = function () {
    document.execCommand('copy');
  };

  this.paste = function () {
    onpaste();
  };

  // при готовности снапшота, помещаем результат в буфер обмена
  _editor.eve.on('scheme_snapshot', function (scheme, attr) {
    if(attr.clipboard) {
      attr.callback(scheme);
    }
  });

  document.addEventListener('copy', oncopy);

  document.addEventListener('paste', onpaste);
}



/**
 * ### Графический редактор
 *
 * Created by Evgeniy Malyarov 24.07.2015
 *
 * @module  editor
 */

/**
 * ### Графический редактор
 * - Унаследован от [paper.PaperScope](http://paperjs.org/reference/paperscope/)
 * - У редактора есть коллекция проектов ({{#crossLink "Scheme"}}изделий{{/crossLink}}). В настоящий момент, поддержано единственное активное изделие, но потенциально, имеется возможность одновременного редактирования нескольких изделий
 * - У `редактора` есть коллекция инструментов ([tools](http://paperjs.org/reference/tool/)). Часть инструментов встроена в редактор, но у конечного пользователя, есть возможность как переопределить поведение встроенных инструментов, так и подключить собственные специализированные инструменты
 *
 *
 * - **Редактор** можно рассматривать, как четрёжный стол (кульман)
 * - **Изделие** подобно листу ватмана, прикрепленному к кульману в текущий момент
 * - **Инструменты** - это карандаши и рейсшины, которые инженер использует для редактирования изделия
 *
 * @example
 *
 *     // создаём экземпляр графического редактора
 *     // передаём в конструктор указатель на ячейку _cell и дополнительные реквизиты
 *
 * @class Editor
 * @constructor
 * @extends paper.PaperScope
 * @param pwnd {dhtmlXCellObject} - [ячейка dhtmlx](http://docs.dhtmlx.com/cell__index.html), в которой будет размещен редактор
 * @param [attr] {Object} - дополнительные параметры инициализации редактора
 * @menuorder 10
 * @tooltip Графический редактор
 */
class Editor extends $p.EditorInvisible {

  constructor(pwnd, handlers){

    super();

    const _editor = window.paper = this;

    this.activate();

    /**
     * ### Ячейка родительского окна, в которой размещен редактор
     *
     * @property _pwnd
     * @type dhtmlXCellObject
     * @final
     * @private
     */
    this.__define('_pwnd', {
      get() {
        return pwnd;
      }
    });

    /**
     * ### Разбивка на канвас и аккордион
     *
     * @property _layout
     * @type dhtmlXLayoutObject
     * @final
     * @private
     */
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

    /**
     * ### Контейнер канваса
     *
     * @property _wrapper
     * @type HTMLDivElement
     * @final
     * @private
     */
    this._wrapper = document.createElement('div');

    this._layout.cells("a").attachObject(_editor._wrapper);
    this._dxw.attachViewportTo(_editor._wrapper);

    this._wrapper.oncontextmenu = (event) => $p.iface.cancel_bubble(event, true);

    this._drawSelectionBounds = 0;

    /**
     * ### Буфер обмена
     * Объект для прослушивания и обработки событий буфера обмена
     *
     * @property clipbrd
     * @for Editor
     * @type Clipbrd
     * @final
     * @private
     */
    //this._clipbrd = new Clipbrd(this);

    /**
     * ### Клавиатура
     * Объект для управления редактором с клавиатуры
     *
     * @property keybrd
     * @for Editor
     * @type Keybrd
     * @final
     * @private
     */
    this._keybrd = new Keybrd(this);

    /**
     * ### История редактирования
     * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
     *
     * @property undo
     * @for Editor
     * @type UndoRedo
     * @final
     * @private
     */
    this._undo = new UndoRedo(this);

    /**
     * ### Aккордион со свойствами
     *
     * @property _acc
     * @type EditorAccordion
     * @private
     */
    this._acc = new EditorAccordion(_editor, _editor._layout.cells("b"));

    /**
     * ### Панель выбора инструментов рисовалки
     *
     * @property tb_left
     * @type OTooolBar
     * @private
     */
    this.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '14px', left: '8px', name: 'left', height: '408px',
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
              width: '124px',
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
        {name: 'stulp_flap', css: 'tb_stulp_flap', tooltip: 'Штульповые створки'},
        {name: 'vitrazh', text: '<i class="fa fa-film"></i>', tooltip: 'Витраж'},
        {name: 'text', css: 'tb_text', tooltip: 'Произвольный текст'},
        {name: 'grid', css: 'tb_grid', tooltip: 'Таблица координат'},
      ],
      onclick: (name) => _editor.select_tool(name),
      on_popup: (popup, bdiv) => {
        popup.show(dhx4.absLeft(bdiv), 0, bdiv.offsetWidth, _editor._wrapper.offsetHeight);
        popup.p.style.top = (dhx4.absTop(bdiv) - 20) + 'px';
        popup.p.querySelector('.dhx_popup_arrow').style.top = '20px';
      }
    });

    /**
     * ### Верхняя панель инструментов
     *
     * @property tb_top
     * @type OTooolBar
     * @private
     */
    this.tb_top = new $p.iface.OTooolBar({wrapper: _editor._layout.base, width: '100%', height: '28px', top: '0px', left: '0px', name: 'top',
      image_path: '/imgs/',
      buttons: [

        {name: 'save_close', text: '&nbsp;<i class="fa fa-floppy-o fa-fw"></i>', tooltip: 'Рассчитать, записать и закрыть', float: 'left', width: '34px'},
        {name: 'calck', text: '<i class="fa fa-calculator fa-fw"></i>', tooltip: 'Рассчитать и записать данные', float: 'left'},

        //{name: 'sep_0', text: '', float: 'left'},
        {name: 'stamp',  css: 'tb_stamp', tooltip: 'Загрузить из типового блока или заказа', float: 'left'},

        //{name: 'sep_1', text: '', float: 'left'},
        //{name: 'copy', text: '<i class="fa fa-clone fa-fw"></i>', tooltip: 'Скопировать выделенное', float: 'left'},
        //{name: 'paste', text: '<i class="fa fa-clipboard fa-fw"></i>', tooltip: 'Вставить', float: 'left'},
        //{name: 'paste_prop', text: '<i class="fa fa-paint-brush fa-fw"></i>', tooltip: 'Применить скопированные свойства', float: 'left'},

        {name: 'sep_2', text: '', float: 'left'},
        {name: 'back', text: '<i class="fa fa-undo fa-fw"></i>', tooltip: 'Шаг назад', float: 'left'},
        {name: 'rewind', text: '<i class="fa fa-repeat fa-fw"></i>', tooltip: 'Шаг вперед', float: 'left'},

        {name: 'sep_3', text: '', float: 'left'},
        {name: 'open_spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию изделия', float: 'left'},
        {name: 'dxf', text: 'DXF', tooltip: 'Экспорт в DXF', float: 'left', width: '30px'},
        {name: 'd3d', text: '<i class="fa fa-video-camera"></i>', tooltip: 'Открыть 3D', float: 'left', width: '30px'},
        {name: 'fragment', text: 'F', tooltip: 'Фрагмент', float: 'left', width: '20px'},
        {name: 'mirror', text: '<i class="fa fa-exchange fa-fw"></i>', tooltip: 'Отразить', float: 'left', width: '20px'},

        {name: 'close', text: '<i class="fa fa-times fa-fw"></i>', tooltip: 'Закрыть без сохранения', float: 'right'},
        {name: 'history', text: '<i class="fa fa-history fa-fw"></i>', tooltip: 'История', float: 'right'}


      ], onclick: function (name) {
        switch (name) {

        case 'save_close':
          if(_editor.project) {
            Promise.resolve(pwnd.progressOn())
              .then(() => _editor.project.save_coordinates({save: true, close: true}))
              .catch(() => pwnd.progressOff && pwnd.progressOff());
          }
          break;

        case 'close':
          _editor.close();
          break;

        case 'calck':
          if(_editor.project) {
            pwnd.progressOn();
            Promise.resolve()
              .then(() => _editor.project.save_coordinates({save: true}))
              .then(() => {
                pwnd.progressOff && setTimeout(() => {
                  _editor.activate();
                   pwnd.progressOff();
                }, 700);
              })
              .catch(() => pwnd.progressOff && pwnd.progressOff());
          }
          break;

        case 'stamp':
          _editor.open_templates();
          break;

        case 'back':
          _editor._undo.back();
          break;

        case 'rewind':
          _editor._undo.rewind();
          break;

        case 'open_spec':
          _editor.project.deselectAll();
          _editor.project.ox.form_obj();
          break;

        case 'dxf':
        case 'd3d':
        case 'copy':
        case 'paste':
        case 'paste_prop':
          $p.md.emit(name, _editor.project);
          break;

        case 'history':
          const {ox} = _editor.project;
          const tmp = {ref: ox.ref, _mgr: ox._manager, cmd: {hfields: null, db: null, area: 'Builder'}};
          $p.dp.buyers_order.open_component(pwnd, tmp, handlers, 'ObjHistory', tmp.cmd.area);
          break;

        case 'fragment':
          if(_editor.project._attr.elm_fragment) {
            _editor.project.reset_fragment();
          }
          else {
            _editor.project.draw_fragment();
          }
          break;

        case 'mirror':
          const mirror = !_editor.project._attr._reflected;
          _editor.project.mirror(mirror, true)
            .catch(() => null)
            .then(() => {
              const {classList} = this.buttons.mirror;
              if(mirror) {
                classList.add('selected');
              }
              else {
                classList.remove('selected');
              }
              _editor.project.zoom_fit();
            });
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

    this.tb_top.buttons.d3d.classList.add('disabledbutton');

    this._layout.base.style.backgroundColor = '#f5f5f5';
    this.tb_top.cell.style.background = '#fff';
    this.tb_top.cell.style.boxShadow = 'none';

    /**
     * слушаем события клавиатуры
     */
    this.on_keydown = this.on_keydown.bind(this);
    document.body.addEventListener('keydown', this.on_keydown, false);

    // Обработчик события после записи характеристики. Если в параметрах укзано закрыть - закрываем форму
    this.eve.on('characteristic_saved', (scheme, attr) => {
      if(attr.close) {
        this.close();
      }
      else {
        this.set_text();
      }
    });

    // При изменениях изделия обновляем текст заголовка окна
    this.eve.on('coordinates_calculated', this.set_text.bind(this));

    // Обработчик события при удалении строки некой табчасти продукции
    this.on_del_row = this.on_del_row.bind(this);
    $p.cat.characteristics.on('del_row', this.on_del_row);

    // Обработчик события проверки заполненности реквизитов
    this.on_alert = this.on_alert.bind(this);
    $p.on('alert', this.on_alert);

    // Создаём инструменты

    /**
     * ### Вписать в окно
     * Это не настоящий инструмент, а команда вписывания в окно
     *
     * @class ZoomFit
     * @constructor
     * @menuorder 53
     * @tooltip Масштаб в экран
     */
    new ZoomFit();

    /**
     * Свойства и перемещение узлов элемента
     */
    new ToolSelectNode();

    /**
     * Панорама и масштабирование с колёсиком и без колёсика
     */
    new ToolPan();

    /**
     * Манипуляции с арками (дуги правильных окружностей)
     */
    new ToolArc();

    /**
     * Разрыв импостов
     */
    new ToolCut();

    /**
     * T в углу
     */
    new ToolM2();

    /**
     * Добавление (рисование) профилей
     */
    new ToolPen();

    /**
     * Вставка раскладок и импостов
     */
    new ToolLayImpost();

    /**
     * Инструмент произвольного текста
     */
    new ToolText();

    /**
     * Относительное позиционирование и сдвиг
     */
    new ToolRuler();

    /**
     * Вставка штульповых створок
     */
    new Editor.ToolStulpFlap();

    /**
     * Рисование витража
     */
    new Editor.ToolVitrazh();

    /**
     * Таблица координат
     */
    new ToolCoordinates();

    this.tools[1].activate();


    // Создаём экземпляр проекта Scheme
    this.create_scheme();

    if(handlers){
      this.handlers = handlers;
      const {params} = handlers.props.match;
      const {project} = this;
      if(params.ref) {
        const {utils, doc} = $p;
        const {order, action, skip} = utils.prm();
        Promise.resolve()
          .then(() => project.load(params.ref, false, order))
          .then(() => {
            const {_dp, ox} = project;
            let row = ox.calc_order.production.find(ox.ref, 'characteristic');
            if(!row) {
              row = ox.calc_order.production.add({characteristic: ox});
              ox.product = row.row;
            }
            if(isNaN(row.quantity)) {
              row.quantity = 1;
            }

            if(skip) {
              const {refill, sys, clr, params} = $p.cat.templates._select_template;
              ox.base_block = '';
              if(!sys.empty()) {
                project.set_sys(sys, params, refill);
              }
              if(!clr.empty()) {
                ox.clr = clr;
              }
            }
            else if(action === 'refill' || action === 'new') {
              const {EditorInvisible: {BuilderElement, Onlay, Filling}, cat: {templates}, utils: {blank}} = $p;
              const {base_block, refill, sys, clr, params} = templates._select_template;
              if(!base_block.empty()) {
                if(refill) {
                  _dp._data._loading = true;
                }
                return project.load_stamp(base_block, false, true)
                  .then(() => {
                    if(refill) {
                      !sys.empty() && project.set_sys(sys, params, refill);
                      _dp._data._loading = false;
                      if(!clr.empty()){
                        ox.clr = clr;
                        project.getItems({class: BuilderElement}).forEach((elm) => {
                          if(!(elm instanceof Onlay) && !(elm instanceof Filling)) {
                            elm.clr = clr;
                          }
                        });
                      }
                      this._acc.props.reload();
                    }
                  })
                  .catch(() => _dp._data._loading = false);
              }
            }
          })
          .catch((err) => {
            console.log(err);
            $p.ui.dialogs.snack({message: err.message, timeout: 10});
          });
      }
    }

    // излучаем событие при создании экземпляра рисовалки
    $p.md.emit('drawer_created', this);

  }

  set_text() {
    const {handlers, project} = this;
    const {props, handleIfaceState} = handlers;
    if(project._calc_order_row){
      const {ox} = project;
      const title = ox.prod_name(true) + (ox._modified ? " *" : "");
      props.title != title && handleIfaceState({
        component: '',
        name: 'title',
        value: title,
      });

      // проверяем ортогональность
      if(project.getItems({class: $p.EditorInvisible.Profile}).some((p) => {
        return (p.angle_hor % 90) > 0.02;
      })){
        this._ortpos.style.display = '';
      }
      else {
        this._ortpos.style.display = 'none';
      }

      // проверяем ошибки в спецификации
      const {ОшибкаКритическая, ОшибкаИнфо} = $p.enm.elm_types;
      let has_errors;
      const prods = [ox];
      ox.calc_order.production.find_rows({ordn: ox}, ({characteristic}) => {
        prods.push(characteristic);
      });
      for(const cx of prods) {
        cx.specification.forEach(({nom}) => {
          if([ОшибкаКритическая, ОшибкаИнфо].includes(nom.elm_type)) {
            has_errors = true;
            return false;
          }
        });
      }
      this._errpos.style.display = has_errors ? '' : 'none';
    }
  }

  show_ortpos(hide) {
    for (const elm of this.project.getItems({class: $p.EditorInvisible.Profile})) {
      if((elm.angle_hor % 90) > 0.02) {
        if(hide) {
          elm.path.fillColor = $p.EditorInvisible.BuilderElement.clr_by_clr.call(elm, elm._row.clr);
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
    //grid.attachEvent("onRowDblClicked", do_select);
    grid.init();

    const {ОшибкаКритическая, ОшибкаИнфо} = $p.enm.elm_types;
    const {ox} = this.project;
    const prods = [ox];
    ox.calc_order.production.find_rows({ordn: ox}, ({characteristic}) => {
      prods.push(characteristic);
    });
    for(const cx of prods) {
      cx.specification.forEach(({elm, nom}) => {
        if([ОшибкаКритическая, ОшибкаИнфо].includes(nom.elm_type)) {
          grid.addRow(1, [elm, nom.name]);
        }
      });
    }
  }

  /**
   * ### Локальный dhtmlXWindows
   * Нужен для привязки окон инструментов к области редактирования
   *
   * @property _dxw
   * @type dhtmlXWindows
   * @final
   * @private
   */
  get _dxw() {
    return this._layout.dhxWins;
  }

  create_scheme() {

    if(this.project){
      this.project.unload ? this.project.unload() : this.project.remove();
    }

    const _editor = this;
    const _canvas = document.createElement('canvas'); // собственно, канвас
    _editor._wrapper.appendChild(_canvas);
    _canvas.style.backgroundColor = "#f9fbfa";

    const _scheme = new $p.EditorInvisible.Scheme(_canvas, _editor);
    const pwnd_resize_finish = () => {
      _editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
    };

    /**
     * Magnetism дополнительных инструментов
     */
    _scheme.magnetism = new Magnetism(_scheme);

    /**
     * Подписываемся на события изменения размеров
     */
    _editor._layout.attachEvent("onResizeFinish", pwnd_resize_finish);
    _editor._layout.attachEvent("onPanelResizeFinish", pwnd_resize_finish);
    _editor._layout.attachEvent("onCollapse", pwnd_resize_finish);
    _editor._layout.attachEvent("onExpand", pwnd_resize_finish);

    if(_editor._pwnd instanceof  dhtmlXWindowsCell){
      _editor._pwnd.attachEvent("onResizeFinish", pwnd_resize_finish);
    }

    pwnd_resize_finish();

    /**
     * Подписываемся на событие смещения мыши, чтобы показать текущие координаты
     */
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

    /**
     * Подписываемся на событие окончания расчета, чтобы нарисовать индикатор трапеции
     */
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

    /**
     * Объект для реализации функций масштабирования
     * @type StableZoom
     */
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

        const {view} = _editor;

        if(_editor.tool instanceof ToolSelectNode && (_editor.Key.isDown('r') || _editor.Key.isDown('к'))) {
          return _editor.tool.mousewheel(evt);
        }
        else if (evt.shiftKey || evt.altKey) {
          if(evt.shiftKey && !evt.deltaX){
            view.center = this.changeCenter(view.center, evt.deltaY, 0, 1);
          }
          else{
            view.center = this.changeCenter(view.center, evt.deltaX, evt.deltaY, 1);
          }
          return evt.preventDefault();
        }
        else if (evt.ctrlKey) {
          const mousePosition = new paper.Point(evt.offsetX, evt.offsetY);
          const viewPosition = view.viewToProject(mousePosition);
          const {scaling} = view._decompose();
          const [zoom, delta] = this.changeZoom(Math.abs(scaling.x), evt.deltaY, view.center, viewPosition);
          view.scaling = [Math.sign(scaling.x) * zoom, Math.sign(scaling.y) * zoom];
          view.center = view.center.add(delta);
          evt.preventDefault();
          return view.draw();
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

  /**
   * ### Активизирует инструмент
   * Находит инструмент по имени в коллекции tools и выполняет его метод [Tool.activate()](http://paperjs.org/reference/tool/#activate)
   *
   * @method select_tool
   * @for Editor
   * @param name {String} - имя инструмента
   */
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


  /**
   * ### (Пере)заполняет изделие данными типового блока
   * - Вызывает диалог выбора типового блока и перезаполняет продукцию данными выбора
   * - Если текущее изделие не пустое, задаёт вопрос о перезаписи данными типового блока
   * - В обработчик выбора типового блока передаёт метод {{#crossLink "Scheme/load_stamp:method"}}Scheme.load_stamp(){{/crossLink}} текущего изделия
   *
   * @method open_templates
   * @param confirmed {Boolean} - подавляет показ диалога подтверждения перезаполнения
   */
  open_templates(confirmed) {
    const {project: {ox}, handlers} = this;
    handlers.handleNavigate(`/templates/?order=${ox.calc_order.ref}&ref=${ox.ref}`);
  }

  purge_selection(){
    let selected = this.project.selectedItems;
    const deselect = selected.filter((path) => path.parent instanceof $p.EditorInvisible.ProfileItem && path != path.parent.generatrix);
    while(selected = deselect.pop()){
      selected.selected = false;
    }
  }

  // Returns serialized contents of selected items.
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

  // Restore the state of selected items.
  restore_selection_state(originalContent) {

    originalContent.forEach((orig) => {
      const item = this.project.getItem({id: orig.id});
      if (item){
        // HACK: paper does not retain item IDs after importJSON,
        // store the ID here, and restore after deserialization.
        const id = item.id;
        item.importJSON(orig.json);
        item._id = id;
      }
    });
  }

  /**
   * Create pixel perfect dotted rectable for drag selections
   * @param p1
   * @param p2
   * @return {paper.CompoundPath}
   */
  drag_rect(p1, p2) {
    const zoom = Math.abs(this.view.scaling.x);
    const half = new paper.Point(0.5 / zoom, 0.5 / zoom);
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
    rect.strokeWidth = 1.0 / zoom;
    rect.dashOffset = 0.5 / zoom;
    rect.dashArray = [1.0 / zoom, 1.0 / zoom];
    rect.removeOn({
      drag: true,
      up: true
    });
    rect.guide = true;
    return rect;
  }

  fragment_spec({elm, ox, name}) {
    const {ui: {dialogs}, cat: {characteristics}} = $p;
    if(!ox) {
      ox = this.project.ox;
    }
    if(elm) {
      return dialogs.alert({
        timeout: 0,
        title: `Спецификация ${elm >= 0 ? 'элемента' : 'слоя'} №${Math.abs(elm)} (${name})`,
        Component: characteristics.SpecFragment,
        props: {_obj: ox, elm},
        initFullScreen: true,
        hide_btn: true,
        noSpace: true,
      });
    }

  }

  elm_spec(elm) {
    const {ui: {dialogs}, msg} = $p;
    if(!elm) {
      elm = this.project.selected_elm;
    }
    if(elm) {
      return this.fragment_spec({
        elm: elm.elm,
        ox: elm.layer.prod_ox,
        name: elm.inset.toString(),
      });
    }
    dialogs.alert({text: 'Элемент не выбран', title: msg.main_title});
  }

  layer_spec(layer) {
    const {ui: {dialogs}, msg} = $p;
    if(!layer) {
      layer = this.project.activeLayer;
    }
    if(layer) {
      return this.fragment_spec({
        elm: -layer.cnstr,
        ox: layer.prod_ox,
        name: layer.furn.toString(),
      });
    }
    dialogs.alert({text: 'Слой не выбран', title: msg.main_title});
  }

  /**
   * ### Диалог дополнительных вставок
   *
   * @param [cnstr] {Number} - номер элемента или контура
   */
  additional_inserts(cnstr, cell){
    new AdditionalInserts(cnstr, this.project, cell);
  }

  /**
   * ### Диалог радиуса выделенного элемента
   */
  profile_radius(){

    const elm = this.project.selected_elm;

    if(elm instanceof $p.EditorInvisible.ProfileItem){

      // модальный диалог
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

  /**
   * ### Поворот кратно 90° и выравнивание
   *
   * @method profile_align
   * @for Editor
   * @param name {String} - ('left', 'right', 'top', 'bottom', 'all', 'delete')
   */
  profile_align(name){

    const {project, consts} = this;

    // если "все", получаем все профили активного или родительского контура
    if(name == "all"){

      if(this.glass_align()) {
        return;
      }

      if(this.lay_impost_align()) {
        return;
      }

      // получаем текущий внешний контур
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

      // прочищаем размерные линии
      if(changed || profiles.length > 1){
        profiles.forEach(({layer}) => contours.indexOf(layer) == -1 && contours.push(layer));
        contours.forEach(({l_dimensions}) => l_dimensions && l_dimensions.clear());
      }

      // если выделено несколько, запланируем групповое выравнивание
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

  /**
   * Обработчик события при удалении строки
   * @param obj
   * @param prm
   */
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

  /**
   * Обработчик события проверки заполненности реквизитов
   */
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

  /**
   * ### Деструктор
   * @method unload
   * @for Editor
   */
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


/**
 * Экспортируем конструктор Editor, чтобы экземпляры построителя можно было создать снаружи
 * @property Editor
 * @for MetaEngine
 * @type function
 */
$p.Editor = Editor;


/**
 *
 *
 * @module element
 *
 * Created by Evgeniy Malyarov on 20.04.2020.
 */

/**
 * Подключает окно редактор свойств текущего элемента, выбранного инструментом
 */
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
  const ro = this.layer instanceof Editor.ContourNestedContent || this.layer instanceof Editor.ContourNested;
  const {buttons} = this.project._scope._acc.elm._otoolbar;
  this._attr._grid.setEditable(!ro);
  for(const btn in buttons) {
    if(btn === 'spec') {
      continue;
    }
    if(ro) {
      buttons[btn].classList.add('disabledbutton');
    }
    else {
      buttons[btn].classList.remove('disabledbutton');
    }
  }

}

/**
 * Отключает и выгружает из памяти окно свойств элемента
 */
Editor.BuilderElement.prototype.detache_wnd = function detache_wnd() {
  const {_grid} = this._attr;
  if(_grid && _grid.destructor && _grid._owner_cell){
    _grid._owner_cell.detachObject(true);
    delete this._attr._grid;
  }
}


/**
 * Обработчик сочетаний клавишь
 * @author Evgeniy Malyarov
 * @module keyboard
 */

/**
 * ### Клавиатура
 * Управление редактором с клавиатуры
 *
 * @class Keybrd
 * @param _editor
 * @constructor
 */
class Keybrd {

  constructor(_editor){

  }

}


/**
 * Варианты притягивания узлов
 * @module magnetism
 *
 * Created by Evgeniy Malyarov on 04.02.2018.
 */

class Magnetism {

  constructor(scheme) {
    this.scheme = scheme;
    this.on_impost_selected = this.on_impost_selected.bind(this);
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

  /**
   * Двигает узел наклонного импоста для получения 0-штапика
   */
  m1() {
    const {dialogs} = $p.ui;
    const {tb_left} = this.scheme._scope;
    const previous = tb_left && tb_left.get_selected();

    Promise.resolve().then(() => {

      // получаем выделенные узлы
      const {selected} = this;

      if(selected.break) {
        dialogs.alert({text: `Выделено более одного узла`, title: 'Магнит 0-штапик'});
      }
      else if(!selected.profile) {
        dialogs.alert({text: `Не выделено ни одного узла профиля`, title: 'Магнит 0-штапик'});
      }
      else {
        const spoint = selected.profile[selected.point];
        const res = this.short_glass(spoint);
        if(res) {
          // находим штапик, связанный с этим ребром
          const {segm, prev, next, glass} = res;

          let cl;
          this.scheme.cnns.find_rows({elm1: glass.elm, elm2: segm.profile.elm}, (row) => {
            cl = row.aperture_len;
          });

          if(!cl) {
            return dialogs.alert({text: `Не найдена строка соединения короткого ребра заполнения с профилем`, title: 'Магнит 0-штапик'});
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
            return dialogs.alert({text: `Выделен неподходящий сегмент профиля`, title: 'Магнит 0-штапик'});
          }

          if(!pNext.profile.nom.sizefaltz || !segm.profile.nom.sizefaltz || !pOur.profile.nom.sizefaltz) {
            return dialogs.alert({text: `Не задан размер фальца примыкающих профилей`, title: 'Магнит 0-штапик'});
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
          for(const node of ['b', 'e']) {
            try {
              selected.profile.do_sub_bind(selected.profile.rays[node].profile, node);
            }
            catch (e) {}
          }
        }
        else {
          dialogs.alert({text: `Не найдено коротких сегментов заполнений<br />в окрестности выделенной точки`, title: 'Магнит 0-штапик'});
        }
      }
    });

    if(previous) {
      return this.scheme._scope.select_tool(previous.replace('left_', ''));
    }
  }

  /**
   * Используется для отложенного выравнивания
   */
  on_impost_selected() {
    const {scheme, on_impost_selected} = this;
    scheme.view.off('click', on_impost_selected);
    const profiles = scheme.selected_profiles();
    if(profiles.length === 1 && profiles[0].elm_type === $p.enm.elm_types.Импост) {
      this.m3();
    }
  }

  /**
   * Уравнивает профиль в балконном блоке
   */
  m3() {
    const {enm: {elm_types, orientations}, ui: {dialogs}} = $p;
    const {scheme, on_impost_selected} = this;
    const profiles = scheme.selected_profiles();
    const {contours} = scheme;
    const title = 'Импост в балконном блоке';
    if(profiles.length !== 1 || profiles[0].elm_type !== elm_types.Импост) {
      scheme.view.on('click', on_impost_selected);
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
    // центр профиля
    const {_corns} = profile._attr;
    const corns = _corns[3].y > _corns[2].y ? [_corns[1], _corns[2]] : [_corns[3], _corns[3]];
    // рамный слой
    let root = layer;
    while (root.layer) {
      root = layer.layer;
    }
    // ишем профиль, по которому будем уравнивать
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

    // узнаем, насколько двигать и в какую сторону
    const delta = nearest._attr._corns[corns.d[1]].y - corns[corns.d[0]].y;
    if(delta) {
      scheme.move_points(new paper.Point(0, delta));
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


/**
 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
 * @author Evgeniy Malyarov
 * @module undo
 */

/**
 * ### История редактирования
 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
 * Из публичных интерфейсов имеет только методы back() и rewind()
 * Основную работу делает прослушивая широковещательные события
 *
 * @class UndoRedo
 * @constructor
 * @param _editor {Editor} - указатель на экземпляр редактора
 */
class UndoRedo {

  constructor(_editor) {

    this._editor = _editor;
    this._pos = -1;

    this._diff = [];
    this.run_snapshot = this.run_snapshot.bind(this);
    this.scheme_changed = this.scheme_changed.bind(this);
    this.scheme_snapshot = this.scheme_snapshot.bind(this);
    this.clear = this.clear.bind(this);

    // При изменениях изделия, запускаем таймер снапшота
    _editor.eve.on('scheme_changed', this.scheme_changed);

    // При готовности снапшота, добавляем его в историю
    _editor.eve.on('scheme_snapshot', this.scheme_snapshot);

  }

  /**
   * Инициализирует создание снапшота - запускает пересчет изделия
   */
  run_snapshot() {
    const {project} = this._editor;
    if(project._ch.length){
      this._snap_timer = setTimeout(this.run_snapshot, 600);
    }
    else{
      this._pos >= 0 && project.save_coordinates({snapshot: true, clipboard: false});
    }
  }

  /**
   * Обрабатывает событие scheme_snapshot после пересчета спецификации
   * @param scheme
   * @param attr
   */
  scheme_snapshot(scheme, attr) {
    scheme === this._editor.project && !attr.clipboard && this.save_snapshot(scheme);
  }

  /**
   * При изменениях изделия, запускает таймер снапшота
   * @param scheme
   * @param attr
   */
  scheme_changed(scheme, attr) {
    const snapshot = scheme._attr._snapshot || (attr && attr.snapshot);
    this._snap_timer && clearTimeout(this._snap_timer);
    this._snap_timer = 0;
    if(scheme._scope.tool.mouseDown) {
      return;
    }
    if (!snapshot && scheme == this._editor.project) {
      // при открытии изделия чистим историю
      if (scheme._attr._loading) {
        this._snap_timer = setTimeout(() => {
          this.clear();
          this.save_snapshot(scheme);
        }, 600);
      }
      else {
        // при обычных изменениях, запускаем таймер снапшота
        this._snap_timer = setTimeout(this.run_snapshot, 600);
      }
    }
  }

  /**
   * Вычисляет состояние через diff
   * @param pos
   * @return {*}
   */
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
        // если pos < конца истории, отрезаем хвост истории
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




/**
 * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 12.03.2016
 *
 * @module tools
 * @submodule tool_element
 */

/**
 * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 *
 * @class ToolElement
 * @extends paper.Tool
 * @constructor
 */
class ToolElement extends Editor.ToolElement {

  constructor() {
    super();
    this.on_close = this.on_close.bind(this);
  }

  on_activate(cursor) {
    super.on_activate(cursor);
    this._scope.tb_left.select(this.options.name);
  }

  /**
   * ### Отключает и выгружает из памяти окно свойств инструмента
   *
   * @method detache_wnd
   * @for ToolElement
   * @param tool
   */
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
        $p.wsql.save_options('editor', this.options);
        this.wnd.close();
      }

      delete this.wnd;
    }
    this.profile = null;
  }

  on_close(wnd) {
    wnd && wnd.cell && setTimeout(() => this._scope && this._scope.tools[1].activate());
    return true;
  }

}



/**
 * ### Манипуляции с арками (дуги правильных окружностей)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018<br />
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_arc
 */

/**
 * ### Манипуляции с арками (дуги правильных окружностей)
 *
 * @class ToolArc
 * @extends ToolElement
 * @constructor
 * @menuorder 56
 * @tooltip Арка
 */
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

  mousedown({modifiers, point}) {

    let b, e, r;

    this.mode = null;
    this.changed = false;

    if (this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

      this.mode = this.hitItem.item.parent.generatrix;

      if (modifiers.control || modifiers.option){
        // при зажатом ctrl или alt строим правильную дугу

        b = this.mode.firstSegment.point;
        e = this.mode.lastSegment.point;
        r = (b.getDistance(e) / 2) + 0.00001;

        this.do_arc(this.mode, point.arc_point(b.x, b.y, e.x, e.y, r, modifiers.option, false));

        //undo.snapshot("Move Shapes");
        r = this.mode;
        this.mode = null;

      }
      // при зажатом space удаляем кривизну
      else if(modifiers.space) {
        this.reset_arc(r = this.mode);
      }
      else {
        this.project.deselectAll();
        r = this.mode;
        r.selected = true;
        this.project.deselect_all_points();
        this.mouseStartPos = point.clone();
        this.originalContent = this._scope.capture_selection_state();
      }

      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        //r.layer.redraw();
        r.parent.attache_wnd(this._scope._acc.elm);
        this.eve.emit("layer_activated", r.layer);
      }, 10);

    }
    else{
      //tool.detache_wnd();
      this.project.deselectAll();
    }
  }

  mouseup() {

    let item = this.hitItem ? this.hitItem.item : null;

    if(item instanceof Editor.Filling && item.visible) {
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

  mousedrag({point}) {
    if (this.mode) {
      this.changed = true;
      this._scope.canvas_cursor('cursor-arrow-small');
      this.do_arc(this.mode, point);
    }
  }

  keydown({modifiers, event: {code}}) {

    const {project} = this._scope;
    if(project.selectedItems.length === 1) {
      const step = modifiers.shift ? 1 : 10;
      const {parent} = project.selectedItems[0];

      if(parent instanceof Editor.Profile && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) {
        const {generatrix} = parent;

        if(modifiers.space){
          return this.reset_arc(generatrix);
        }

        const point = generatrix.getPointAt(generatrix.length / 2);
        if('ArrowLeft' === code) {
          this.do_arc(generatrix, point.add(-step, 0));
        }
        else if('ArrowRight' === code) {
          this.do_arc(generatrix, point.add(step, 0));
        }
        else if('ArrowUp' === code) {
          this.do_arc(generatrix, point.add(0, -step));
        }
        else if('ArrowDown' === code) {
          this.do_arc(generatrix, point.add(0, step));
        }

        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          parent.attache_wnd(this._scope._acc.elm);
          this.eve.emit('layer_activated', parent.layer);
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

  hitTest({point}) {

    const hitSize = 6;
    this.hitItem = null;

    if(point) {
      this.hitItem = this.project.hitTest(point, {fill: true, stroke: true, selected: true, tolerance: hitSize});
    }
    if(!this.hitItem) {
      this.hitItem = this.project.hitTest(point, {fill: true, tolerance: hitSize});
    }

    if(this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem
      && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
      this._scope.canvas_cursor('cursor-arc');
    }
    else {
      this._scope.canvas_cursor('cursor-arc-arrow');
    }

    return true;
  }

}

Editor.ToolArc = ToolArc;


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

    if(this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem
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

        // включить диалог свойств текстового элемента
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
      this.grid = new Editor.GridCoordinates({
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

  // получает путь, с точками которого будем работать
  select_path() {
    const {path_kind} = $p.enm;
    this.profile.selected = false;

    // заготовка пути
    let path = (this.dp.path === path_kind.generatrix ? this.profile.generatrix : this.profile.rays[this.dp.path.valueOf()])
      .clone({insert: false});
    // находим проекции точек профиля на путь, ищем наиболее удаленные
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

  // смещает (добавляет) точки пути
  move_points(id) {

    const {profile, grid, dp, project} = this;
    const {generatrix} = profile;

    // строим таблицу новых точек образующей через дельты от текущего пути
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

    // движемся массиву координат и создаём точки
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

    // начальную и конечную точки двигаем особо
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

  // обработчик события при изменении полей обработки
  dp_update(dp, fields) {
    //if(this.dp !== dp) return;

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
      // отменяем редактирование
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

Editor.ToolCoordinates = ToolCoordinates;


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

  keydown({event}) {
    if(event.code === 'Escape') {
      this.remove_cont();
      this._scope.canvas_cursor('cursor-arrow-cut');
    }
  }

  /**
   * по mouseup, выделяем/снимаем выделение профилей
   * @param event
   */
  mouseup({point, modifiers}) {
    const hitItem = this.project.hitTest(point, {fill: true, stroke: false, segments: false});
    if(hitItem && hitItem.item.parent instanceof Editor.Profile) {
      let item = hitItem.item.parent;
      if(modifiers.shift) {
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
          for(const tcnn of cnns) {
            types.add(tcnn.cnn_type);
          }
        }
      }
      for(const btn of buttons) {
        if(!btn.css.includes('tb_disable')) {
          if(btn.name === 'uncut' && !types.has(cnn_types.t) ||
            btn.name === 'vh' && !types.has(cnn_types.ah) && !types.has(cnn_types.short) ||
            btn.name === 'hv' && !types.has(cnn_types.av) && !types.has(cnn_types.long) ||
            btn.name === 'diagonal' && !types.has(cnn_types.ad)
          ){
            btn.css += ' tb_disable';
          }
          else if(['diagonal', 'vh', 'hv'].includes(btn.name) && nodes.every(({profile, point}) => {
            const {cnn} = profile.rays[point];
            if(cnn) {
              if(btn.name === 'diagonal') {
                return cnn.cnn_type === cnn_types.ad;
              }
              else if(btn.name === 'vh') {
                return cnn.cnn_type === cnn_types.ah || cnn.cnn_type === cnn_types.short;
              }
              else {
                return cnn.cnn_type === cnn_types.av || cnn.cnn_type === cnn_types.long;
              }
            }
          })){
            btn.css += ' tb_disable';
          }
        }
      }

      const pt = this.project.view.projectToView(point);
      this.cont = new $p.iface.OTooolBar({
        wrapper: this._scope._wrapper,
        top: `${pt.y + 10}px`,
        left: `${pt.x - 20}px`,
        name: 'tb_cut',
        height: '30px',
        width: `${32 * buttons.length + 1}px`,
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
    const {cat, enm: {cnn_types, orientations}} = $p;
    if(['diagonal', 'vh', 'hv'].includes(name)) {

      const type = name === 'diagonal' ? cnn_types.ad : (name === 'vh' ? cnn_types.ah : cnn_types.av);

      for(const {profile, point} of nodes) {
        if(point === 'b' || point === 'e') {
          const cnn = profile.rays[point];
          const types = [];
          if(name === 'diagonal') {
            types.push(cnn_types.ad);
          }
          else if(name === 'vh') {
            types.push(cnn_types.ah);
            if(profile.orientation === orientations.vert) {
              types.push(cnn_types.short);
            }
            else {
              types.push(cnn_types.long);
            }
          }
          else {
            types.push(cnn_types.av);
            if(profile.orientation === orientations.hor) {
              types.push(cnn_types.short);
            }
            else {
              types.push(cnn_types.long);
            }
          }
          const cnns = cat.cnns.nom_cnn(profile, cnn.profile, types);
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
  do_cut() {
    let impost, rack;
    for (const node of this.nodes) {
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

    const {enm: {cnn_types, orientations}, cat} = $p;
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
      if(!cnn.cnn || cnn.cnn.cnn_type !== base.cnn_type) {
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
    const atypes = [cnn_types.short, cnn_types.t];
    if(rack2.orientation === orientations.vert) {
      atypes.push(cnn_types.ah);
    }
    else if(rack2.orientation === orientations.hor) {
      atypes.push(cnn_types.av);
    }

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
    // соединения разрыва
    atypes.length = 0;
    atypes.push(cnn_types.long);
    if(impost.profile.orientation === orientations.vert) {
      atypes.push(cnn_types.av);
    }
    else if(impost.profile.orientation === orientations.hor) {
      atypes.push(cnn_types.ah);
    }
    cnn = impost.profile.cnn_point(impost.point);
    if(cnn) {
      const cnns = cat.cnns.nom_cnn(impost.profile, rack.profile, atypes);
      if(cnns.length) {
        cnn.cnn = cnns[0];
        cnn.set_cnno(cnns[0]);
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
    for (const n1 of nodes) {
      let ok;
      for (const n2 of nn) {
        if(n1.profile === n2.profile && n1.point === n2.point) {
          ok = true;
          break;
        }
      }
      if(!ok) {
        return true;
      }
    }
  }

  hitTest({point}) {

    const hitSize = 30;
    this.hitItem = null;


    if (point) {
      const {activeLayer, magnetism} = this.project;
      this.hitItem = activeLayer.hitTestAll(point, { ends: true, tolerance: hitSize })
        .find(({item}) => item.layer === activeLayer);

      if (this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem) {
        const profile = this.hitItem.item.parent;
        const {profiles} = activeLayer;
        const {b, e} = profile;
        const selected = {profiles, profile, point: b.getDistance(point) < e.getDistance(point) ? 'b' : 'e'};
        const nodes = magnetism.filter(selected);
        if(this.nodes_different(nodes)) {
          this.remove_cont();
          this.nodes = nodes;
          this.create_cont();
          return true;
        }
      }
    }

    this._scope.canvas_cursor('cursor-arrow-cut');

    return true;
  }

}

Editor.ToolCut = ToolCut;


/**
 * ### Вписать в окно
 * Это не настоящий инструмент, а команда вписывания в окно
 *
 * @module fit
 *
 * Created by Evgeniy Malyarov on 18.01.2018.
 */

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


/**
 * ### Вставка раскладок и импостов
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_lay_impost
 */

/**
 * ### Вставка раскладок и импостов
 *
 * @class ToolLayImpost
 * @extends ToolElement
 * @constructor
 * @menuorder 55
 * @tooltip Импосты и раскладки
 */
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

    // подключает окно редактора
    function tool_wnd() {

      tool.sys = tool._scope.project._dp.sys;

      // создаём экземпляр обработки
      const profile = tool.profile = $p.dp.builder_lay_impost.create();


      profile.elm_type_change = tool.elm_type_change.bind(tool);
      profile._manager.on('update', profile.elm_type_change);

      // восстанавливаем сохранённые параметры
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

      // если в текущем слое есть профили, выбираем импост
      if (profile.elm_type.empty()) {
        profile.elm_type = $p.enm.elm_types.Импост;
      }

      // вставку по умолчанию получаем эмулируя событие изменения типа элемента
      $p.dp.builder_lay_impost.emit('value_change', {field: 'elm_type'}, profile);

      // выравнивание по умолчанию
      if (profile.align_by_y.empty()) {
        profile.align_by_y = $p.enm.positions.Центр;
      }
      if (profile.align_by_x.empty()) {
        profile.align_by_x = $p.enm.positions.Центр;
      }

      // цвет по умолчанию
      if (profile.clr.empty()) {
        profile.clr = tool.project.clr;
      }

      // параметры отбора для выбора цвета
      tool.choice_links_clr();

      // параметры отбора типа деления
      tool.choice_params_split();

      // параметры отбора для выбора вставок
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

      //
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
    const {_manager, elm_type, inset_by_x, inset_by_y} = this.profile;
    const {form} = _manager.metadata();
    const oxml = form && form.obj && form.obj.head && $p.utils._clone(form.obj.head);
    if(oxml && elm_type === $p.enm.elm_types.Раскладка) {
      if(oxml[' '] && !oxml[' '].includes('region')) {
        oxml[' '].push('region');
      }
    }
    const index = oxml && oxml[' '].indexOf('split');
    if(index && (inset_by_x.lay_split_types || inset_by_y.lay_split_types)) {
      oxml[' '][index] = {id: 'split', path: 'o.split', synonym: 'Тип деления', type: 'ro'};
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

    // проверяем существование раскладки
    if(this.profile.elm_type == $p.enm.elm_types.Раскладка && this.hitItem instanceof Editor.Filling && this.hitItem.imposts.length) {
      // если существует, выводим подтверждающее сообщение на добавление
      this.confirmed = false;
      dhtmlx.confirm({
        type: 'confirm',
        text: 'Раскладка уже существует, добавить к имеющейся?',
        title: $p.msg.glass_spec,
        callback: result => {
          // добавляем раскладку, в случае положительного результата
          result && this.add_profiles();
          this.confirmed = true;
        }
      });
    }
    else {
      // в остальных случаях, добавляем профили
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
      clr = Editor.BuilderElement.clr_by_clr.call(this, profile.clr),
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

    const {lay_split_types, positions} = $p.enm;

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

        // в зависимости от типа деления, рисуем прямые или разорванные отрезки
        if (!by_y.length || profile.split.empty() ||
          profile.split == lay_split_types.ДелениеГоризонтальных ||
          profile.split == lay_split_types.КрестПересечение) {

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

        // в зависимости от типа деления, рисуем прямые или разорванные отрезки
        if (!by_x.length || profile.split.empty() ||
          profile.split == lay_split_types.ДелениеВертикальных ||
          profile.split == lay_split_types.КрестПересечение) {

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
      if (profile.align_by_y == positions.Центр) {

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

      } else if (profile.align_by_y == positions.Верх) {

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

      } else if (profile.align_by_y == positions.Низ) {

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
      if (profile.align_by_x == positions.Центр) {

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

      } else if (profile.align_by_x == positions.Лев) {

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


      } else if (profile.align_by_x == positions.Прав) {

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
    if (profile.split == lay_split_types.ДелениеВертикальных) {
      do_y();
      do_x();
    } else {
      do_x();
      do_y();
    }

  }

  hitTest(event) {

    this.hitItem = null;

    // Hit test items.
    if(event.point) {
      this.hitItem = this.project.hitTest(event.point, {fill: true, class: paper.Path});
    }

    if(this.hitItem && this.hitItem.item.parent instanceof Editor.Filling) {
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

  // возвращает конкатенацию ограничений цвета всех вставок текущего типа
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

      // цвет по умолчанию
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

  // при изменении типа элемента, чистим отбор по цвету
  elm_type_change(obj, fields) {
    let reattach, touchx = true;
    const {profile, sys, _grid} = this;
    if ('inset_by_x' in fields || 'inset_by_y' in fields || 'elm_type' in fields) {
      delete profile._elm_type_clrs;
      this.elm_type_clrs(profile, sys);
      reattach = true;
    }
    if('inset_by_y' in fields) {
      const {pair, split_type} = obj.inset_by_y;
      if(split_type.length) {
        obj.split = split_type[0];
      }
      if(!pair.empty()) {
        obj.inset_by_x = pair;
        touchx = false;
      }
    }
    if(touchx && 'inset_by_x' in fields) {
      const {pair, split_type} = obj.inset_by_x;
      if(split_type.length) {
        obj.split = split_type[0];
      }
      if(!pair.empty()) {
        obj.inset_by_y = pair;
      }
    }
    reattach && _grid && _grid.attach({
      obj: profile,
      oxml: this.oxml(),
    });
  }

  choice_links_clr() {

    const {profile, sys, elm_type_clrs} = this;

    // дополняем свойства поля цвет отбором по служебным цветам
    $p.cat.clrs.selection_exclude_service(profile._metadata('clr'));

    profile._metadata('clr').choice_params.push({
      name: 'ref',
      get path() {
        const res = elm_type_clrs(profile, sys);
        return res.length ? {in: res} : {not: ''};
      },
    });

  }

  // параметры отбора типа деления
  choice_params_split() {
    const {profile} = this;
    const {choice_params} = profile._metadata('split');
    const def = ['ДелениеГоризонтальных', 'ДелениеВертикальных', 'КрестВСтык', 'КрестПересечение'];
    choice_params.length = 0;
    choice_params.push({
      name: 'ref',
      get path() {
        const res = [];
        for(const fld of ['inset_by_y', 'inset_by_y']) {
          for(const v of profile[fld].split_type) {
            if(!res.includes(v)) {
              res.push(v);
            }
          }
        }
        return res.length ? res : def;
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
      // получаем таблицу расстояний профилей от рёбер габаритов
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

    // уточним направления путей для витража
    if (!this.hitItem) {
      rectification.call(this);
    }

    this.paths.forEach((p) => {

      let iter = 0, angle, proto = {clr: profile.clr};

      function do_bind() {

        let correctedp1 = false,
          correctedp2 = false;

        // пытаемся вязать к профилям контура
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

        // если не привязалось - ищем точки на вновь добавленных профилях
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

        // в зависимости от наклона разные вставки
        angle = p.e.subtract(p.b).angle;
        if ((angle > -40 && angle < 40) || (angle > 180 - 40 && angle < 180 + 40)) {
          proto.inset = p._inset || profile.inset_by_y;
        } else {
          proto.inset = p._inset || profile.inset_by_x;
        }

        if (profile.elm_type == $p.enm.elm_types.Раскладка) {
          nprofiles.push(new Editor.Onlay({
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

          // создаём новые профили
          if (p.e.getDistance(p.b) > proto.inset.nom().width) {
            nprofiles.push(new Editor.Profile({
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

    // пытаемся выполнить привязку
    nprofiles.forEach((p) => {
      p.cnn_point('b');
      p.cnn_point('e');
    });
    // и еще раз пересчитываем соединения, т.к. на предыдущем шаге могла измениться геометрия соседей
    nprofiles.forEach((p) => {
      p.cnn_point('b');
      p.cnn_point('e');
    });

    if (!this.hitItem)
      setTimeout(() => this._scope && this._scope.tools[1].activate(), 100);
  }
}

Editor.ToolLayImpost = ToolLayImpost;



/**
 * ### Разрыв и слияние узла Т
 *
 * @module tools
 * @submodule tool_cut
 */

/**
 * ### Манипуляции с соединением T в углу
 *
 * @class ToolM2
 * @extends ToolElement
 * @constructor
 * @menuorder 56
 * @tooltip Разрыв
 */
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

      // получаем выделенные узлы
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

          // находим профили импоста и углов
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

  // объединяет в Т-крест профили углового соединения
  merge_angle(impost, nodes) {

    // получаем координаты узла
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

    // а есть ли вообще подходящее соединение
    if(cnn && !cnn.empty()) {

      // приводим координаты трёх профилей к одной точке
      for (const elm of nodes) {
        if((elm.profile === impost || !elm.profile.nearest(true)) && elm.point !== 't' && !point.equals(elm.profile[elm.point])) {
          elm.profile[elm.point] = point;
        }
      }

      // изменяем тип соединения
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

  // превращает Т-крест углового соединения в обычный угол и Т
  split_angle(impost, nodes) {

    // получаем координаты узла
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

    // а есть ли вообще подходящее соединение
    if(cnn && !cnn.empty()) {

      // отодвигаем импост от угла
      impost.profile[impost.point] = point === profile.b ? profile.generatrix.getPointAt(100) : profile.generatrix.getPointAt(profile.generatrix.length - 100);

      // изменяем тип соединения
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

Editor.ToolM2 = ToolM2;


/**
 * ### Панорама и масштабирование с колёсиком и без колёсика
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_pan
 */

/**
 * ### Панорама и масштабирование с колёсиком и без колёсика
 *
 * @class ToolPan
 * @extends ToolElement
 * @constructor
 * @menuorder 52
 * @tooltip Панорама и масштаб
 */
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
          // If dragging mouse while in zoom mode, switch to zoom-rect instead.
          this.mode = 'zoom-rect';
        }
        else if (this.mode == 'zoom-rect') {
          // While dragging the zoom rectangle, paint the selected area.
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
            // Handle panning by moving the view center.
            const pt = event.point.subtract(view.center);
            const delta = this.mouseStartPos.subtract(pt);
            this.mouseStartPos = pt;
            view.scrollBy(delta);
          }
        }
      },

      mousemove: this.hitTest,

      keydown(event) {
        const {project} = this;
        const rootLayer = project.rootLayer();
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
        case 'v':
            project.zoom_fit();
            project.view.update();
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


/**
 * ### Добавление (рисование) профилей
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_pen
 */

/**
 * ### Элементы управления рядом с указателем мыши инструмента `ToolPen`
 *
 * @class PenControls
 * @constructor
 */
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

    const {elm_types} = $p.enm;
    //, elm_types.Примыкание
    if([elm_types.Добор, elm_types.Соединитель].includes(profile.elm_type)) {
      this._cont.style.display = 'none';
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


/**
 * ### Добавление (рисование) профилей
 *
 * @class ToolPen
 * @extends ToolElement
 * @constructor
 * @menuorder 54
 * @tooltip Рисование
 */
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
          bind_sys: false,
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

  // подключает окно редактора
  tool_wnd() {

    // создаём экземпляр обработки
    this.profile = $p.dp.builder_pen.create();

    const {project, profile} = this;
    this.sys = project._dp.sys;

    // восстанавливаем сохранённые параметры
    $p.wsql.restore_options('editor', this.options);
    this.options.wnd.on_close = this.on_close;

    ['elm_type', 'inset', 'bind_generatrix', 'bind_node'].forEach((prop) => {
      if(prop == 'bind_generatrix' || prop == 'bind_node' || this.options.wnd[prop]) {
        profile[prop] = this.options.wnd[prop];
      }
    });

    // если в текущем слое есть профили, выбираем импост
    if((profile.elm_type.empty() || profile.elm_type == $p.enm.elm_types.Рама) &&
      project.activeLayer instanceof Editor.Contour && project.activeLayer.profiles.length) {
      profile.elm_type = $p.enm.elm_types.Импост;
    }
    else if((profile.elm_type.empty() || profile.elm_type == $p.enm.elm_types.Импост) &&
      project.activeLayer instanceof Editor.Contour && !project.activeLayer.profiles.length) {
      profile.elm_type = $p.enm.elm_types.Рама;
    }

    // вставку по умолчанию получаем эмулируя событие изменения типа элемента
    $p.dp.builder_pen.emit('value_change', {field: 'elm_type'}, profile);

    // цвет по умолчанию
    profile.clr = project.clr;

    // параметры отбора для выбора вставок
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

    // дополняем свойства поля цвет отбором по служебным цветам
    $p.cat.clrs.selection_exclude_service(profile._metadata('clr'), this);

    this.wnd = $p.iface.dat_blank(this._scope._dxw, this.options.wnd);
    this._grid = this.wnd.attachHeadFields({
      obj: profile
    });

    // панелька с командой типовых форм
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
            {name: 'arc1',      img: 'arc1.png', float: 'left'},
            {name: 'circle',    img: 'circle.png', float: 'left'},
            {name: 'circle1',   img: 'circle1.png', float: 'right'},
            {name: 'trapeze1',  img: 'trapeze1.png', float: 'left'},
            {name: 'trapeze2',  img: 'trapeze2.png', float: 'left'},
            {name: 'trapeze3',  img: 'trapeze3.png', float: 'right'},
            {name: 'trapeze4',  img: 'trapeze4.png', float: 'left'},
            {name: 'trapeze5',  img: 'trapeze5.png', float: 'left'},
            {name: 'trapeze6',  img: 'trapeze6.png', float: 'right'},
            {name: 'trapeze7',  img: 'trapeze7.png', float: 'left'},
            {name: 'trapeze8',  img: 'trapeze8.png', float: 'left'},
            {name: 'trapeze9',  img: 'trapeze9.png', float: 'right'},
            {name: 'trapeze10', img: 'trapeze10.png', float: 'left'},
          ]},
      }],
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

    // подмешиваем в метод wnd_options() установку доппараметров
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

    // при активации слоя выделяем его в дереве
    this.eve.on("layer_activated", this.layer_activated);

    // при изменении системы, переоткрываем окно доступных вставок
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
    if(this.group){
      this.group.removeChildren();
      this.group.remove();
    }
    this.path = null;
    this.last_profile = null;
    this.mode = null;

    this._controls.unload();
  }

  on_keydown(event) {
    const {event: {code, target}} = event;
    // удаление сегмента или элемента
    if(['Delete', 'NumpadSubtract', 'Backspace'].includes(code)) {

      if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
        return;
      }

      this.project.selectedItems.forEach((path) => {
        if(path.parent instanceof Editor.ProfileItem){
          path = path.parent;
          path.removeChildren();
          path.remove();
        }
      });

      this.mode = null;
      this.path = null;

      event.stop();
      return false;

    }
    else if(code == 'Escape'){
      if(this.path){
        this.path.remove();
        this.path = null;
      }
      this.mode = null;
      this._controls.blur();
    }
  }

  on_mousedown({event}) {
    this.project.deselectAll();

    if(event && event.which && event.which > 1){
      return this.on_keydown({event: {code: 'Escape'}});
    }

    this.last_profile = null;
    const {elm_types} = $p.enm;

    if([elm_types.Добор, elm_types.Соединитель, elm_types.Примыкание].includes(this.profile.elm_type)) {
      // для доборов и соединителей, создаём элемент, если есть addl_hit
      if(this.addl_hit) {
      }
    }
    else {
      if(this.mode == 'continue') {
        // для профилей и раскладок, начинаем рисовать
        this.mode = 'create';
        this.start_binded = false;
      }
    }
  }

  on_mouseup({event, modifiers}) {

    const {_scope, addl_hit, profile, project, group} = this;
    const {
      enm: {elm_types},
      EditorInvisible: {Sectional, ProfileAddl, ProfileConnective, Onlay, BaseLine, ProfileCut, ProfileAdjoining, Profile, ProfileItem, Filling}
    } = $p;

    group && group.removeChildren();

    _scope.canvas_cursor('cursor-pen-freehand');

    if(event && event.which && event.which > 1){
      return this.on_keydown({event: {code: 'Escape'}});
    }

    this.check_layer();

    let whas_select;

    if(addl_hit){

      // рисуем доборный профиль
      if(addl_hit.glass && profile.elm_type == elm_types.Добор && !profile.inset.empty()){
        new ProfileAddl({
          generatrix: addl_hit.generatrix,
          proto: profile,
          parent: addl_hit.profile,
          side: addl_hit.side
        });
      }
      // рисуем соединительный профиль
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
      else if(profile.elm_type == elm_types.Примыкание) {
        const adjoining = new ProfileAdjoining({
          b: addl_hit.b,
          e: addl_hit.e,
          proto: profile,
          parent: addl_hit.profile,
          side: addl_hit.side
        });
      }
    }
    else if(this.mode == 'create' && this.path) {

      if (this.path.length < _scope.consts.sticking){
        return;
      }

      switch (profile.elm_type) {
      case elm_types.Раскладка:
        // находим заполнение под линией
        const {length} = this.path;
        const pt1 = this.path.getPointAt(length * 0.1);
        const pt2 = this.path.getPointAt(length * 0.9);
        project.activeLayer.glasses(false, true).some((glass) => {
          if(glass.contains(pt1) && glass.contains(pt2)){
            new Onlay({generatrix: this.path, proto: profile, parent: glass});
            this.path = null;
            return true;
          }
        });
        if(this.path) {
          this.path.remove();
          this.path = null;
        }
        break;

      case elm_types.Водоотлив:
        // рисуем разрез
        this.last_profile = new Sectional({generatrix: this.path, proto: profile});
        break;

      case elm_types.Линия:
        // рисуем линию
        this.last_profile = new BaseLine({generatrix: this.path, proto: profile});
        break;

      case elm_types.Сечение:
        // рисуем линию
        this.last_profile = new ProfileCut({generatrix: this.path, proto: profile});
        break;

      default:
        // рисуем профиль
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
    else if (this.hitItem && this.hitItem.item && (modifiers.shift || modifiers.control || modifiers.option)) {

      let item = this.hitItem.item.parent;
      if(modifiers.space && item.nearest && item.nearest()) {
        item = item.nearest();
      }

      if(modifiers.shift) {
        item.selected = !item.selected;
      }
      else {
        project.deselectAll();
        item.selected = true;
      }

      // TODO: Выделяем элемент, если он подходящего типа
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

    this.hitTest(event);

    const {project, addl_hit} = this;

    // елси есть addl_hit - рисуем прототип элемента
    if(addl_hit){

      if (!this.path){
        this.path = new paper.Path({
          strokeColor: 'black',
          fillColor: 'white',
          strokeScaling: false,
          guide: true
        });
        this.group = new paper.Group();
      }

      this.path.removeSegments();
      this.group && this.group.removeChildren();

      if(addl_hit.glass){
        this.draw_addl();
      }
      else if(addl_hit.b && addl_hit.e){
        this.draw_adj();
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

        if(this.mode == 'create') {
          dragOut = true;
          dragIn = this.currentSegment.index > 0;
        }
        else if(this.mode == 'close') {
          dragIn = true;
          invert = true;
        }
        else if(this.mode == 'continue') {
          dragOut = true;
        }
        else if(this.mode == 'adjust') {
          dragOut = true;
        }
        else if(this.mode == 'join') {
          dragIn = true;
          invert = true;
        }
        else if(this.mode == 'convert') {
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

            const {elm_types} = $p.enm;

            // при отжатом shift пытаемся привязать точку к узлам или кратно 45
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

            // попытаемся привязать начало пути к профилям (и или заполнениям - для раскладок) контура
            if(!this.start_binded){

              if(this.profile.elm_type == elm_types.Раскладка){

                res = Editor.Onlay.prototype.bind_node(this.path.firstSegment.point, project.activeLayer.glasses(false, true));
                if(res.binded){
                  this.path.firstSegment.point = this.point1 = res.point;
                }

              }
              // привязка к узлам для рамы уже случилась - вяжем для импоста
              else if([elm_types.Импост, elm_types.Примыкание].includes(this.profile.elm_type)){

                res = {distance: Infinity};
                project.activeLayer.profiles.some((element) => {

                  // сначала смотрим на доборы, затем - на сам профиль
                  if(element.children.some((addl) => {
                    if(addl instanceof Editor.ProfileAddl &&
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

            // попытаемся привязать конец пути к профилям (и или заполнениям - для раскладок) контура
            if(this.profile.elm_type == elm_types.Раскладка){

              res = Editor.Onlay.prototype.bind_node(this.path.lastSegment.point, project.activeLayer.glasses(false, true));
              if(res.binded)
                this.path.lastSegment.point = res.point;

            }
            else if(this.profile.elm_type == elm_types.Импост){

              res = {distance: Infinity};
              project.activeLayer.profiles.some((element) => {

                // сначала смотрим на доборы, затем - на сам профиль
                if(element.children.some((addl) => {
                    if(addl instanceof Editor.ProfileAddl &&
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

            //this.currentSegment.handleOut = handlePos;
            //this.currentSegment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
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
        this.path && this.path.removeSegments();
        this.path && this.path.remove();
        this.path = null;
        this.group && this.group.removeChildren();
        this.group && this.group.remove();
        this.group = null;
      }

      if(event.className != 'ToolEvent') {
        project.register_update();
      }
    }
  }

  draw_adj() {
    const {path, group, addl_hit: {b, e, profile, side}} = this;

    // рисуем внутреннюю часть прототипа пути доборного профиля
    const generatrix = profile.rays[side].get_subpath(e.elm[e.point], b.elm[b.point]);
    path.addSegments(generatrix.segments);
    // const sub_path = generatrix.equidistant(-8);
    // sub_path.reverse();
    // path.addSegments(sub_path.segments);
    // sub_path.removeSegments();
    // sub_path.remove();
    path.closePath();

    group.generatrix = generatrix;
    Editor.ProfileAdjoining.prototype.redraw.call(group, 'compact');
  }

  draw_addl() {

    // находим 2 точки на примыкающем профиле и 2 точки на предыдущем и последующем сегментах
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

    // рисуем внешнюю часть прототипа пути доборного профиля
    this.path.addSegments(sub_path.segments);

    // завершим рисование прототипа пути доборного профиля
    sub_path = sub_path.equidistant(-(this.profile.inset.nom().width || 20));
    sub_path.reverse();
    this.path.addSegments(sub_path.segments);
    sub_path.removeSegments();
    sub_path.remove();
    this.path.closePath();

    // получаем generatrix
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

    // получаем generatrix
    if(!this.addl_hit.generatrix){
      this.addl_hit.generatrix = new paper.Path({insert: false});
    }
    this.addl_hit.generatrix.removeSegments();
    this.addl_hit.generatrix.addSegments(sub_path.segments);

    // рисуем внутреннюю часть прототипа пути доборного профиля
    this.path.addSegments(sub_path.equidistant(this.profile.inset.nom().width / 2 || 10).segments);

    // завершим рисование прототипа пути доборного профиля
    sub_path = sub_path.equidistant(-(this.profile.inset.nom().width || 10));
    sub_path.reverse();
    this.path.addSegments(sub_path.segments);
    sub_path.removeSegments();
    sub_path.remove();
    this.path.closePath();

  }

  hitTest_addl({point}) {

    const hitSize = 16;
    const {project, _scope} = this;

    if (point){
      this.hitItem = project.hitTest(point, { stroke:true, curves:true, tolerance: hitSize });
    }

    if (this.hitItem) {

      if(this.hitItem.item.layer == project.activeLayer &&
        this.hitItem.item.parent instanceof Editor.ProfileItem && !(this.hitItem.item.parent instanceof Editor.Onlay)){
        // для профиля, определяем внешнюю или внутреннюю сторону и ближайшее примыкание

        const hit = {
          point: this.hitItem.point,
          profile: this.hitItem.item.parent
        };

        // выясним, с какой стороны примыкает профиль
        if(hit.profile.rays.inner.getNearestPoint(point).getDistance(point, true) <
          hit.profile.rays.outer.getNearestPoint(point).getDistance(point, true)){
          hit.side = "inner";
        }
        else{
          hit.side = "outer";
        }

        // бежим по всем заполнениям и находим ребро
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
      else if(this.hitItem.item.parent instanceof Editor.Filling){
        // для заполнения, ищем ребро и примыкающий профиль

        // this.addl_hit = this.hitItem;
        // _scope.canvas_cursor('cursor-pen-adjust');

      }else{
        _scope.canvas_cursor('cursor-pen-freehand');
      }

    } else {

      this.hitItem = project.hitTest(point, { fill:true, visible: true, tolerance: hitSize  });
      _scope.canvas_cursor('cursor-pen-freehand');
    }

  }

  hitTest_connective({point}) {

    const {project, _scope} = this;
    const rootLayer = project.rootLayer();

    if (point){
      this.hitItem = rootLayer.hitTest(point, ToolPen.root_match(rootLayer));
    }

    if(this.hitItem){
      // для профиля, определяем внешнюю или внутреннюю сторону и ближайшее примыкание

      const hit = {
        point: this.hitItem.point,
        profile: this.hitItem.item.parent
      };

      // выясним, с какой стороны примыкает профиль
      if(hit.profile.rays.inner.getNearestPoint(point).getDistance(point, true) <
        hit.profile.rays.outer.getNearestPoint(point).getDistance(point, true)){
        hit.side = "inner";
      }
      else{
        hit.side = "outer";
      }

      // для соединителей, нас интересуют только внешние рёбра
      if(hit.side == "outer"){
        this.addl_hit = hit;
        _scope.canvas_cursor('cursor-pen-adjust');
      }

    }
    else{
      _scope.canvas_cursor('cursor-pen-freehand');
    }
  }

  hitTest_adj({point}) {

    const tolerance = 30;
    const {project, _scope} = this;
    const rootLayer = project.rootLayer();

    if(point) {
      this.hitItem = rootLayer.hitTest(point, {stroke: true, curves: true, tolerance});
    }

    if (this.hitItem) {

      if(this.hitItem.item.parent instanceof Editor.Profile){
        // для профиля, определяем внешнюю или внутреннюю сторону и ближайшее примыкание

        const hit = {
          point: this.hitItem.point,
          profile: this.hitItem.item.parent
        };

        // выясним, с какой стороны примыкает профиль
        const {inner, outer} = hit.profile.rays;
        if(inner.getNearestPoint(point).getDistance(point, true) < outer.getNearestPoint(point).getDistance(point, true)) {
          hit.side = 'inner';
        }
        else {
          hit.side = 'outer';
        }

        // бежим по всем заполнениям и находим ребро
        hit.profile.layer.glasses(false, true).some((glass) => {
          return glass.profiles.some((rib, index) => {
            if(rib.profile == hit.profile && rib.sub_path && rib.sub_path.getNearestPoint(hit.point).is_nearest(hit.point, true)) {
              if(hit.side == 'outer' && rib.outer || hit.side == 'inner' && !rib.outer) {
                hit.glass = glass;
                return true;
              }
            }
          });
        });

        if(!hit.glass){
          const imposts = hit.profile.joined_imposts()[hit.side];
          const {generatrix} = hit.profile;
          const offset = generatrix.getOffsetOf(generatrix.getNearestPoint(hit.point));
          const fin = imposts.length - 1;
          if(fin < 0) {
            hit.b = {elm: hit.profile, point: hit.side === 'inner' ? 'b' : 'e'};
            hit.e = {elm: hit.profile, point: hit.side === 'inner' ? 'e' : 'b'};
          }
          else if(fin === 0) {
            const impost = imposts[0];
            const ioffset = generatrix.getOffsetOf(impost.point);
            if(hit.side === 'inner' && ioffset > offset) {
              hit.b = {elm: hit.profile, point: 'b'};
              hit.e = {elm: impost.profile, point: impost.profile.b.is_nearest(impost.point) ? 'b' : 'e'};
            }
            else if(hit.side === 'outer' && ioffset > offset) {
              hit.b = {elm: impost.profile, point: impost.profile.b.is_nearest(impost.point) ? 'b' : 'e'};
              hit.e = {elm: hit.profile, point: 'b'};
            }
            else if(hit.side === 'inner' && ioffset < offset) {
              hit.b = {elm: impost.profile, point: impost.profile.b.is_nearest(impost.point) ? 'b' : 'e'};
              hit.e = {elm: hit.profile, point: 'e'};
            }
            else if(hit.side === 'outer' && ioffset < offset) {
              hit.b = {elm: hit.profile, point: 'e'};
              hit.e = {elm: impost.profile, point: impost.profile.b.is_nearest(impost.point) ? 'b' : 'e'};
            }
          }
          else {
            let i0 = imposts[0];
            let ifin = imposts[fin];
            let offset0 = generatrix.getOffsetOf(i0.point);
            let offsetfin = generatrix.getOffsetOf(ifin.point);
            if(offset0 > offsetfin) {
              [i0, ifin] = [ifin, i0];
              [offset0, offsetfin] = [offset0, offsetfin];
            }
            if(hit.side === 'inner' && offset0 > offset) {
              hit.b = {elm: hit.profile, point: 'b'};
              hit.e = {elm: i0.profile, point: i0.profile.b.is_nearest(i0.point) ? 'b' : 'e'};
            }
            else if(hit.side === 'outer' && offset0 > offset) {
              hit.b = {elm: i0.profile, point: i0.profile.b.is_nearest(i0.point) ? 'b' : 'e'};
              hit.e = {elm: hit.profile, point: 'b'};
            }
            else if(hit.side === 'inner' && offsetfin < offset) {
              hit.b = {elm: ifin.profile, point: ifin.profile.b.is_nearest(ifin.point) ? 'b' : 'e'};
              hit.e = {elm: hit.profile, point: 'e'};
            }
            else if(hit.side === 'outer' && offsetfin < offset) {
              hit.b = {elm: hit.profile, point: 'e'};
              hit.e = {elm: ifin.profile, point: ifin.profile.b.is_nearest(ifin.point) ? 'b' : 'e'};
            }
          }

          this.addl_hit = hit;
          _scope.canvas_cursor('cursor-pen-adjust');
        }

      }
      else{
        _scope.canvas_cursor('cursor-pen-freehand');
      }

    }
    else {
      this.hitItem = project.hitTest(point, { fill:true, visible: true, tolerance  });
      _scope.canvas_cursor('cursor-pen-freehand');
    }
  }

  hitTest(event) {

    this.addl_hit = null;
    this.hitItem = null;

    const {elm_types} = $p.enm;

    switch (this.profile.elm_type) {
    case elm_types.Добор:
      this.hitTest_addl(event);
      break;
    case elm_types.Соединитель:
      this.hitTest_connective(event);
      break;
    case elm_types.Примыкание:
      this.hitTest_adj(event);
      break;
    default:
      const hitSize = 6;

      if (event.point){
        this.hitItem = this.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
      }

      if(!this.hitItem){
        this.hitItem = this.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
      }

      if (this.hitItem && this.hitItem.item.parent instanceof Editor.ProfileItem
        && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
        this._scope.canvas_cursor('cursor-pen-adjust');
      }
      else {
        this._scope.canvas_cursor('cursor-pen-freehand');
      }
    }

    return true;
  }



  /**
   * ### Добавление типовой формы
   *
   * @param [name] {String} - имя типовой формы
   */
  standard_form(name) {
    if(this['add_' + name]) {
      this['add_' + name](this.project.bounds);
      this.project.zoom_fit();
    }
    else {
      name !== 'standard_form' && $p.msg.show_not_implemented();
    }
  }

  /**
   * ### Добавляет последовательность профилей
   * @param points {Array}
   */
  add_sequence(points) {
    const profiles = [];
    const {profile, project} = this;
    points.forEach((segments) => {
      profiles.push(new Editor.Profile({
        generatrix: new paper.Path({
          strokeColor: 'black',
          segments: segments
        }), proto: profile
      }));
    });
    profile.bind_sys && project.activeLayer.on_sys_changed(true);
    return profiles;
  }

  /**
   * Рисует квадрат
   * @param bounds
   */
  add_square(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует triangle1
   * @param bounds
   */
  add_triangle1(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует triangle2
   * @param bounds
   */
  add_triangle2(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует triangle3
   * @param bounds
   */
  add_triangle3(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([500, -500])],
      [point.add([500, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует semicircle1
   * @param bounds
   */
  add_semicircle1(bounds) {
    $p.ui.dialogs.input_value({
      title: 'Полугкуг сверху',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        // находим правую нижнюю точку
        const point = bounds.bottomRight;
        const d = 2 * r;
        const profiles = this.add_sequence([
          [point, point.add([d, 0])],
          [point.add([d, 0]), point]
        ]);
        profiles[0].arc_h = r;
      });
  }

  /**
   * Рисует semicircle2
   * @param bounds
   */
  add_semicircle2(bounds) {
    $p.ui.dialogs.input_value({
      title: 'Полугкуг снизу',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        // находим правую нижнюю точку
        const point = bounds.bottomRight;
        const d = 2 * r;
        const profiles = this.add_sequence([
          [point, point.add([d, 0])],
          [point.add([d, 0]), point]
        ]);
        profiles[1].arc_h = r;
      });
  }

  /**
   * Рисует circle
   * @param bounds
   */
  add_circle(bounds) {
    $p.ui.dialogs.input_value({
      title: 'Круг из двух сегментов',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        // находим правую нижнюю точку
        const point = bounds.bottomRight;
        const d = 2 * r;
        const profiles = this.add_sequence([
          [point, point.add([d, 0])],
          [point.add([d, 0]), point]
        ]);
        profiles[0].arc_h = r;
        profiles[1].arc_h = r;
      });
  }

    /**
     * Рисует circle1
     * @param bounds
     */
    add_circle1(bounds) {
      const {ui, enm, dp} = $p;
      ui.dialogs.input_value({
        title: 'Круг из двух сегментов',
        text: 'Уточните радиус',
        type: 'number',
        initialValue: 500,
      })
        .then((r) => {
          const d = 2 * r;
          const dy = 10;
          // находим укорочение
          const vertor = new paper.Point([r, dy]);
          vertor.length = r;
          const h = r - vertor.x;
          // находим правую нижнюю точку
          const base = bounds.bottomRight;
          const point = base.add([0, h]);
          const profiles = this.add_sequence([
            [point, point.add([d, 0])],
            [point.add([d, 0]), point]
          ]);
          profiles[0].arc_h = r + dy;
          profiles[1].arc_h = r - dy;

          const {profile, project, _scope} = this;
          profile.elm_type = enm.elm_types.impost;
          dp.builder_pen.emit('value_change', {field: 'elm_type'}, profile);

          project.register_change(true, () => {
            const impost = new Editor.Profile({
              generatrix: new paper.Path({
                strokeColor: 'black',
                segments: [base.add([0, -dy]), base.add([d, -dy])],
              }),
              proto: profile,
            });
            project.deselectAll();
            project.zoom_fit();
            _scope.select_tool('select_node');
            setTimeout(() => {
              project.register_change(true, () => {
                impost.selected = true;
                project.move_points(new paper.Point(0, -1));
                project.move_points(new paper.Point(0, 1));
              });
            }, 50);
          });
        });
    }

  /**
   * Рисует arc1
   * @param bounds
   */
  add_arc1(bounds) {
    $p.ui.dialogs.input_value({
      title: 'Квадрат и полугкуг сверху',
      text: 'Уточните радиус',
      type: 'number',
      initialValue: 500,
    })
      .then((r) => {
        // находим правую нижнюю точку
        const point = bounds.bottomRight;
        const d = 2 * r;
        const profiles = this.add_sequence([
          [point, point.add([0, -r])],
          [point.add([0, -r]), point.add([d, -r])],
          [point.add([d, -r]), point.add([d, 0])],
          [point.add([d, 0]), point]
        ]);
        profiles[1].arc_h = r;
      });
  }

  /**
   * Рисует trapeze1
   * @param bounds
   */
  add_trapeze1(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze2
   * @param bounds
   */
  add_trapeze2(bounds) {
    // находим правую нижнюю точку
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

  /**
   * Рисует trapeze3
   * @param bounds
   */
  add_trapeze3(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze4
   * @param bounds
   */
  add_trapeze4(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze5
   * @param bounds
   */
  add_trapeze5(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze6
   * @param bounds
   */
  add_trapeze6(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze7
   * @param bounds
   */
  add_trapeze7(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -500])],
      [point.add([0, -500]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze8
   * @param bounds
   */
  add_trapeze8(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([500, -1000])],
      [point.add([500, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([1000, 0])],
      [point.add([1000, 0]), point]
    ]);
  }

  /**
   * Рисует trapeze9
   * @param bounds
   */
  add_trapeze9(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point.add([0, -500]), point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, 0])],
      [point.add([1000, 0]), point.add([500, 0])],
      [point.add([500, 0]), point.add([0, -500])]
    ]);
  }

  /**
   * Рисует trapeze10
   * @param bounds
   */
  add_trapeze10(bounds) {
    // находим правую нижнюю точку
    const point = bounds.bottomRight;
    this.add_sequence([
      [point, point.add([0, -1000])],
      [point.add([0, -1000]), point.add([1000, -1000])],
      [point.add([1000, -1000]), point.add([1000, -500])],
      [point.add([1000, -500]), point.add([500, 0])],
      [point.add([500, 0]), point]
    ]);
  }

  /**
   * Делает полупрозрачными элементы неактивных контуров
   * @param reset
   */
  decorate_layers(reset) {
    const {activeLayer} = this.project;
    this.project.getItems({class: Editor.Contour}).forEach((l) => {
      l.opacity = (l == activeLayer || reset) ? 1 : 0.5;
    });
  }

  static root_match(layer) {
    return {
      stroke:true,
      curves:true,
      tolerance: 20,
      match(item) {
        const {parent} = item.item;
        if(parent instanceof Editor.ProfileItem && !(parent instanceof Editor.Onlay)){
          return parent.layer === layer;
        }
      },
    }
  }

}

Editor.ToolPen = ToolPen;


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
        while (v = v.offsetParent) { /* eslint-disable-line */
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
    const {keyCode, code, target, event} = ev;
    const {wnd, tool} = this;

    if (wnd) {
      switch (keyCode) {
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
          if (target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
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
      return !['Control','ControlLeft','ControlRight','Alt','AltLeft','AltRight','Shist','ShistLeft','ShistRight']
        .includes(code) && $p.iface.cancel_bubble(ev);
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

      keydown(event) {
        const {code, target} = event.event;
        // удаление размерной линии
        if(['Delete', 'NumpadSubtract', 'Backspace'].includes(code)) {

          if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
            return;
          }

          this.project.selectedItems.some((path) => {
            if(path.parent instanceof Editor.DimensionLineCustom) {
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

  hitTest({point, modifiers}) {

    this.hitItem = null;
    this.hitPoint = null;

    if (point) {

      // если режим - расстояние между элементами, ловим профили, а точнее - заливку путей
      if (!this.mode) {
        this.hitItem = this.project.hitTest(point, {fill: true, tolerance: 10});
      }
      if (this.mode === 4) {
        this.hitItem = this.project.hitTest(point, {stroke: true, tolerance: 20});
      }
      else {
        // Hit test points
        const shift = (modifiers.control || modifiers.shift) ? 1 : false;
        let hit = this.project.hitPoints(point, 16, shift, true);
        if (hit) {
          if(hit.item.parent instanceof Editor.ProfileItem) {
            this.hitItem = hit;
          }
        }
        else if (this.mode === 2) {
          hit = this.project.hitTest(point, {fill: true, stroke: true, tolerance: 20});
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
          this.hitPoint = this.hitItem.item.getNearestPoint(point);
        }
        else {
          this.hitPoint = this.hitItem.item.parent.select_corn(point);
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

  add_hit_item({modifiers}) {

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
      modifiers.shift || (this.selected.a.length && !this.selected.b.length)) {

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


/**
 * ### Свойства и перемещение узлов элемента
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_select_node
 */

/**
 * ### Свойства и перемещение узлов элемента
 *
 * @class ToolSelectNode
 * @extends ToolElement
 * @constructor
 * @menuorder 51
 * @tooltip Узлы и элементы
 */
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
      minDistance: 10,
      wheel: {
        end: this.wheelEnd.bind(this),
        listen: false,
        angle: 0,
      },
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

  mousedown({event, modifiers, point}) {

    const {project, consts, eve} = this._scope;

    this.mode = null;
    this.changed = false;
    this.mouseDown = true;

    if(event && event.which && event.which > 1){
      //
    }

    if (this.hitItem && !modifiers.alt) {

      if(this.hitItem.item instanceof paper.PointText && !(this.hitItem.item instanceof Editor.PathUnselectable)) {
        return;
      }


      let item = this.hitItem.item.parent;
      if (modifiers.space) {
        const nearest = item?.nearest?.();
        if(nearest) {
          item = nearest;
        }
      }

      if (item && (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

        if(item instanceof Editor.Filling && project._attr.elm_fragment > 0) {
          item.selected = false;
        }
        else {
          if (modifiers.shift) {
            item.selected = !item.selected;
          }
          else {
            project.deselectAll();
            item.selected = true;
          }
          if (item.selected) {
            this.mode = consts.move_shapes;
            project.deselect_all_points();
            this.mouseStartPos = point.clone();
            this.originalContent = this._scope.capture_selection_state();

            if(item.layer){
              eve.emit("layer_activated", item.layer);
            }
          }
        }

      }
      else if (this.hitItem.type == 'segment') {
        if (modifiers.shift) {
          this.hitItem.segment.selected = !this.hitItem.segment.selected;
        }
        else {
          if (!this.hitItem.segment.selected){
            project.deselect_all_points();
            project.deselectAll();
          }
          this.hitItem.segment.selected = true;
        }
        if (this.hitItem.segment.selected) {
          this.mode = consts.move_points;
          this.mouseStartPos = point.clone();
          this.originalContent = this._scope.capture_selection_state();
        }
      }
      else if (this.hitItem.type == 'handle-in' || this.hitItem.type == 'handle-out') {
        this.mode = consts.move_handle;
        this.mouseStartPos = point.clone();
        this.originalHandleIn = this.hitItem.segment.handleIn.clone();
        this.originalHandleOut = this.hitItem.segment.handleOut.clone();

        /* if (this.hitItem.type == 'handle-out') {
         this.originalHandlePos = this.hitItem.segment.handleOut.clone();
         this.originalOppHandleLength = this.hitItem.segment.handleIn.length;
         } else {
         this.originalHandlePos = this.hitItem.segment.handleIn.clone();
         this.originalOppHandleLength = this.hitItem.segment.handleOut.length;
         }
         this.originalContent = capture_selection_state(); // For some reason this does not work!
         */
      }

      // подключаем диадог свойств элемента
      if(item instanceof Editor.ProfileItem || item instanceof Editor.Filling){
        item.attache_wnd(this._scope._acc.elm);
        eve.emit_async('elm_activated', item);
        this.profile = item;
      }

      this._scope.clear_selection_bounds();

    }
    else if (this.hitItem && modifiers.alt) {
      project.deselectAll();
      const {layer} = this.hitItem.item;
      layer.activate();
      eve.emit('elm_activated', layer);
    }
    else {
      // Clicked on and empty area, engage box select.
      this.mouseStartPos = point.clone();
      this.mode = 'box-select';

      if(!modifiers.shift && this.profile){
        this.profile.detache_wnd();
        eve.emit_async('elm_activated', null);
        delete this.profile;
      }

    }
  }

  mouseup({modifiers, point}) {

    const {project, consts} = this._scope;

    if (this.mode == consts.move_shapes) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
        //undo.snapshot("Move Shapes");
      }
    }
    else if (this.mode == consts.move_points) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
        //undo.snapshot("Move Points");
      }
    }
    else if (this.mode == consts.move_handle) {
      if (this.changed) {
        this._scope.clear_selection_bounds();
        //undo.snapshot("Move Handle");
      }
    }
    else if (this.mode == 'box-select') {

      const box = new paper.Rectangle(this.mouseStartPos, point);

      if (!modifiers.shift){
        project.deselectAll();
      }

      // при зажатом ctrl добавляем элемент иначе - узел
      if (modifiers.control) {

        const profiles = [];
        this._scope.paths_intersecting_rect(box).forEach((path) => {
          if(path.parent instanceof Editor.ProfileItem){
            if(!profiles.includes(path.parent) && !(path.parent instanceof Editor.ProfileParent)){
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
        if (selectedSegments.length) {
          for(const segm of selectedSegments) {
            if(segm.path.parent instanceof Editor.ProfileParent) {
              continue;
            }
            segm.selected = !segm.selected;
          }
        }
        else {
          const profiles = [];
          this._scope.paths_intersecting_rect(box).forEach((path) => {
            if(path.parent instanceof Editor.ProfileItem){
              if(!profiles.includes(path.parent) && !(path.parent instanceof Editor.ProfileParent)){
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

  mousedrag({modifiers, point}) {

    const {project, consts} = this._scope;

    this.changed = true;

    if (this.mode == consts.move_shapes) {
      // this._scope.canvas_cursor('cursor-arrow-small');
      //
      // let delta = point.subtract(this.mouseStartPos);
      // if (!modifiers.shift){
      //   delta = delta.snap_to_angle(Math.PI*2/4);
      // }
      // this._scope.restore_selection_state(this.originalContent);
      // project.move_points(delta, true);
      // this._scope.clear_selection_bounds();
    }
    else if (this.mode == consts.move_points) {
      this._scope.canvas_cursor('cursor-arrow-small');

      let delta = point.subtract(this.mouseStartPos);
      if(!modifiers.shift) {
        delta = delta.snap_to_angle(Math.PI*2/4);
      }
      this._scope.restore_selection_state(this.originalContent);
      project.move_points(delta);
      this._scope.purge_selection();
    }
    else if (this.mode == consts.move_handle) {

      const delta = point.subtract(this.mouseStartPos);
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
      this._scope.drag_rect(this.mouseStartPos, point);
    }
  }

  mousewheel(event) {
    const {wheel, wheelEnd, _scope: {project}} = this;
    if(project.rootLayer() instanceof Editor.ContourParent) {
      return;
    }
    const {wheelDelta, shiftKey} = event;
    const {center} = project.bounds;
    const angle = wheelDelta / (shiftKey ? 300 : 60);
    wheel.angle += angle;
    for(const root of project.contours) {
      root.rotate(angle, center);
    }
    project.l_dimensions.rotate(angle, center);
    event.preventDefault();
    if(!wheel.listen) {
      wheel.listen = true;
      this.on('keyup', wheel.end);
    }
  }

  wheelEnd({event}) {
    if(event.code !== 'KeyR') {
      return;
    }
    const {wheel, _scope: {project, _undo}} = this;
    this.off('keyup', wheel.end);
    const init_angle = wheel.angle;
    wheel.angle = 0;
    wheel.listen = false;
    const {center} = project.bounds;
    $p.ui.dialogs.input_value({
      title: 'Поворот изделия',
      text: 'Уточните угол поворота',
      type: 'number',
      initialValue: init_angle,
    })
      .then((angle) => {
        const delta = angle - init_angle;
        if(delta) {
          for (const root of project.contours) {
            root.rotate(delta, center);
          }
          //project.l_dimensions.rotate(delta, center);
        }
        project.save_coordinates({snapshot: true, clipboard: false})
          .then(() => {
            const obx = $p.utils._clone(project.ox._obj);
            project.load_stamp(obx, true);
          });
      })
      .catch(() => {
        for (const root of project.contours) {
          root.rotate(0, center);
        }
        _undo.back();
      });
  }

  keydown(event) {
    const {project} = this._scope;
    const {modifiers, event: {code, target}} = event;
    const step = modifiers.shift ? 1 : 10;
    let j, segment, index, point, handle;

    if ('NumpadAdd,Insert'.includes(code)) {

      for(let path of project.selectedItems){
        // при зажатом space добавляем элемент иначе - узел
        if (modifiers.space) {
          if(path.parent instanceof Editor.Profile &&
              !(path instanceof Editor.ProfileAddl || path instanceof Editor.ProfileAdjoining || path instanceof Editor.ProfileSegment)) {

            const cnn_point = path.parent.cnn_point('e');
            cnn_point && cnn_point.profile && cnn_point.profile.rays.clear(true);
            path.parent.rays.clear(true);
            if(path.hasOwnProperty('insert')) {
              delete path.insert;
            }

            point = path.getPointAt(path.length * 0.5);
            const newpath = path.split(path.length * 0.5);
            path.lastSegment.point = path.lastSegment.point.add(newpath.getNormalAt(0).divide(10));
            newpath.firstSegment.point = path.lastSegment.point;
            new Editor.Profile({generatrix: newpath, proto: path.parent});
          }
        }
        else if (modifiers.shift || path.parent instanceof Editor.Sectional) {
          let do_select = false, j;
          if(path.parent instanceof Editor.GeneratrixElement &&
              !(path instanceof Editor.ProfileAddl || path instanceof Editor.ProfileAdjoining || path instanceof Editor.ProfileSegment)){
            for (j = 0; j < path.segments.length; j++) {
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
            if(path.parent instanceof Editor.Sectional){
              path.insert(index, new paper.Segment(point));
            }
            else{
              handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
              paper.Path.prototype.insert.call(path, index, new paper.Segment(point, handle.negate(), handle));
            }
          }
        }
        else if(path.parent instanceof Editor.Profile && !path.parent.segms?.length &&
            !(path instanceof Editor.ProfileAddl || path instanceof Editor.ProfileAdjoining || path instanceof Editor.ProfileSegment)) {
          $p.ui.dialogs.input_value({
            title: 'Деление профиля (связка)',
            text: 'Укажите число сегментов',
            type: 'number',
            initialValue: 2,
          })
            .then((res) => {
              path.parent.split_by(res);
            })
            .catch(() => null);
        }
      }

      // Prevent the key event from bubbling
      event.stop();
      return false;


    }
    // удаление сегмента или элемента
    else if (['Delete','NumpadSubtract','Backspace'].includes(code)) {

      if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
        return;
      }

      if (modifiers.space) {
        const profiles = project.selected_profiles(true);
        if(profiles.length === 2) {
          const [p1, p2] = profiles;
          let pt, npp, save, remove, gen;
          if(p1.b.is_nearest(p2.e, 0)) {
            save = p2;
            remove = p1;
            gen = remove.generatrix.clone({insert: false});
            pt = remove.cnn_point('b');
            npp = 'b';
          }
          else if(p1.b.is_nearest(p2.b, 0)) {
            save = p2;
            remove = p1;
            gen = remove.generatrix.clone({insert: false}).reverse();
            pt = remove.cnn_point('e');
            npp = 'e';
          }
          else if(p1.e.is_nearest(p2.b, 0)) {
            save = p1;
            remove = p2;
            gen = remove.generatrix.clone({insert: false});
            pt = remove.cnn_point('e');
            npp = 'e';
          }
          else if(p1.e.is_nearest(p2.e, 0)) {
            save = p1;
            remove = p2;
            gen = remove.generatrix.clone({insert: false}).reverse();
            pt = remove.cnn_point('b');
            npp = 'b';
          }
          else {
            return;
          }
          remove.remove();
          save.generatrix.join(gen);
          const profile = pt.profile;
          const pp = pt.profile_point;
          if(profile && pp) {
            profile.rays.clear(true);
            const cnn = profile.cnn_point(pp);
            cnn.profile = save;
            cnn.profile_point = npp;
          }
          save.rays.clear(true);
          return;
        }
      }

      project.selectedItems.some((path) => {

        let do_select = false;

        if(path.parent instanceof Editor.DimensionLineCustom){
          path.parent.remove();
          return true;
        }
        else if(path.parent instanceof Editor.GeneratrixElement){
          if(path instanceof Editor.ProfileAddl || path instanceof Editor.ProfileAdjoining || path instanceof Editor.ProfileSegment){
            path.removeChildren();
            path.remove();
          }
          else{
            for (let j = 0; j < path.segments.length; j++) {
              segment = path.segments[j];
              do_select = do_select || segment.selected;
              if (segment.selected && segment != path.firstSegment && segment != path.lastSegment ){
                path.removeSegment(j);

                // пересчитываем
                  const x1 = path.parent.x1;
                  path.parent.x1 = x1;
                break;
              }
            }
            // если не было обработки узлов - удаляем элемент
            if(!do_select){
              path = path.parent;
              path.removeChildren();
              path.remove();
            }
          }
        }
        else if(path instanceof Editor.Filling){
          path.remove_onlays();
        }
      });

      // Prevent the key event from bubbling
      event.stop();
      return false;

    }
    else if (code === 'ArrowLeft') {
      project.move_points(new paper.Point(-step, 0));
    }
    else if (code === 'ArrowRight') {
      project.move_points(new paper.Point(step, 0));
    }
    else if (code === 'ArrowUp') {
      project.move_points(new paper.Point(0, -step));
    }
    else if (code === 'ArrowDown') {
      project.move_points(new paper.Point(0, step));
    }
    else if (code === 'KeyV') {
      project.zoom_fit();
      project.view.update();
    }
  }

  testHot(type, event, mode) {
    if (mode == 'tool-direct-select'){
      return this.hitTest(event);
    }
  }

  hitTest({point}) {

    const tolerance = 12;
    const {project} = this._scope;
    this.hitItem = null;

    if (point) {

      // отдаём предпочтение выделенным ранее элементам
      this.hitItem = project.hitTest(point, {selected: true, fill: true, stroke: true, tolerance});

      // во вторую очередь - тем элементам, которые не скрыты
      if (!this.hitItem){
        this.hitItem = project.hitTest(point, {visible: true, fill: true, stroke: true, tolerance});
      }

      // Hit test selected handles
      let hit = project.hitTest(point, {selected: true, handles: true, tolerance});
      if (hit){
        this.hitItem = hit;
      }

      // Hit test points
      hit = project.hitPoints(point, 18, true);

      if (hit) {
        if (hit.item.parent instanceof Editor.ProfileItem) {
          if (hit.item.parent.generatrix === hit.item){
            this.hitItem = hit;
          }
          else if(hit.item.parent instanceof Editor.ProfileCut) {
            this.hitItem = hit;
            hit.item = hit.item.parent.generatrix;
            hit.segment = hit.item.firstSegment.point.is_nearest(hit.point, true) ? hit.item.firstSegment : hit.item.lastSegment;
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

        if (hitItem.item.parent instanceof Editor.DimensionLine) {
          // размерные линии сами разберутся со своими курсорами
        }
        else if (hitItem.item instanceof Editor.TextUnselectable || hitItem.item.parent instanceof Editor.ProfileCut) {
          this._scope.canvas_cursor('cursor-profile-cut');     // сечение
        }
        else if (hitItem.item instanceof paper.PointText) {
          !(hitItem.item instanceof Editor.EditableText) && this._scope.canvas_cursor('cursor-text');     // указатель с черным Т
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
      // возможно, выделен разрез
      const hit = project.hitTest(point, {stroke: true, visible: true, tolerance: 16});
      if (hit && hit.item.parent instanceof Editor.Sectional){
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

Editor.ToolSelectNode = ToolSelectNode;


/**
 * Ввод и редактирование произвольного текста
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author    Evgeniy Malyarov
 * @module  tool_text
 */

/**
 * ### Произвольный текст
 *
 * @class ToolText
 * @extends ToolElement
 * @constructor
 * @menuorder 60
 * @tooltip Добавление текста
 */
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
      },

      mousedown({point}) {
        this.text = null;
        this.changed = false;

        this.project.deselectAll();
        this.mouseStartPos = point.clone();

        if(this.hitItem) {

          if(this.hitItem.item instanceof Editor.FreeText) {
            this.text = this.hitItem.item;
            this.text.selected = true;

          }
          else {
            this.text = new Editor.FreeText({
              parent: this.hitItem.item.layer.l_text,
              point: this.mouseStartPos,
              content: '...',
              selected: true
            });
          }
          this.textStartPos = this.text.point;
        }

        this.eve.emit_async('tool_activated', this);
      },

      mouseup() {

        if (this.mode && this.changed) {
          //undo.snapshot("Move Shapes");
        }

        this._scope.canvas_cursor('cursor-arrow-lay');

      },

      mousedrag({point, modifiers}) {

        if (this.text) {
          let delta = point.subtract(this.mouseStartPos);
          if(modifiers.shift) {
            delta = delta.snap_to_angle();
          }
          this.text.move_points(this.textStartPos.add(delta));
        }
      },

      mousemove: this.hitTest,

      keydown({event}) {
        const {code, target} = event;

        if (['Delete','NumpadSubtract','Backspace'].includes(code)) {

          if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
            return;
          }

          for (const text of  this.project.selectedItems) {
            if(text instanceof Editor.FreeText){
              text.remove();
              this.text = null;
              this.eve.emit_async('tool_activated', this);
            }
          }

          event.preventDefault();
          return false;
        }
      }
    });
  }

  hitTest({point}) {
    const hitSize = 6;
    const {project} = this;

    // хит над текстом обрабатываем особо
    this.hitItem = project.hitTest(point, {class: Editor.FreeText, bounds: true, fill: true, stroke: true, tolerance: hitSize});
    if(!this.hitItem) {
      this.hitItem = project.hitTest(point, {fill: true, stroke: false, tolerance: hitSize});
    }
    if(!this.hitItem) {
      const hit = project.hitTest(point, {fill: false, stroke: true, tolerance: hitSize});
      if(hit && hit.item.parent instanceof Editor.Sectional) {
        this.hitItem = hit;
      }
    }

    if(this.hitItem) {
      if(this.hitItem.item instanceof Editor.FreeText) {
        this._scope.canvas_cursor('cursor-text');     // указатель с черным Т
      }
      else if(this.hitItem.item instanceof paper.PointText) {
        this.hitItem = null;
        this._scope.canvas_cursor('cursor-text-select');  // указатель с вопросом
      }
      else {
        this._scope.canvas_cursor('cursor-text-add'); // указатель с серым Т
      }
    }
    else {
      this._scope.canvas_cursor('cursor-text-select');  // указатель с вопросом
    }

    return true;
  }

}

Editor.ToolText = ToolText;

$p.injected_data._mixin({"tip_select_node.html":"<div class=\"otooltip\">\n    <p class=\"otooltip\">Инструмент <b>Элемент и узел</b> позволяет:</p>\n    <ul class=\"otooltip\">\n        <li>Выделить элемент<br />для изменения его свойств или перемещения</li>\n        <li>Выделить отдельные узлы и рычаги узлов<br />для изменения геометрии</li>\n        <li>Добавить новый узел (изгиб)<br />(кнопка {+} на цифровой клавиатуре)</li>\n        <li>Удалить выделенный узел (изгиб)<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\n        <li>Добавить новый элемент, делением текущего<br />(кнопка {+} при нажатой кнопке {пробел})</li>\n        <li>Удалить выделенный элемент<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\n    </ul>\n    <hr />\n    <a title=\"Видеоролик, иллюстрирующий работу инструмента\" href=\"https://www.youtube.com/embed/UcBGQGqwUro?list=PLiVLBB_TTj5njgxk5E_EjwxzCGM4XyKlQ\" target=\"_blank\">\n        <i class=\"fa fa-video-camera fa-lg\"></i> Обучающее видео</a>\n    <a title=\"Справка по инструменту в WIKI\" href=\"http://www.oknosoft.ru/upzp/apidocs/classes/OTooolBar.html\" target=\"_blank\" style=\"margin-left: 9px;\">\n        <i class='fa fa-question-circle fa-lg'></i> Справка в wiki</a>\n</div>"});
return Editor;
}));
