
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
      obj: obj,
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
        id: "stv",
        text: '<i class="fa fa-object-ungroup fa-fw"></i>',
        title: 'Свойства створки',
      },
      {
        id: "prod",
        text: '<i class="fa fa-picture-o fa-fw"></i>',
        title: 'Свойства изделия',
      },
      {
        id: "tool",
        text: '<i class="fa fa-wrench fa-fw"></i>',
        title: 'Свойства инструмента',
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
      class_name: "",
      name: 'aling_bottom',
      buttons: [
        {name: 'left', css: 'tb_align_left', tooltip: msg.align_node_left, float: 'left'},
        {name: 'bottom', css: 'tb_align_bottom', tooltip: msg.align_node_bottom, float: 'left'},
        {name: 'top', css: 'tb_align_top', tooltip: msg.align_node_top, float: 'left'},
        {name: 'right', css: 'tb_align_right', tooltip: msg.align_node_right, float: 'left'},
        {name: 'all', text: '<i class="fa fa-arrows-alt fa-fw"></i>', tooltip: msg.align_all, float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'additional_inserts', text: '<i class="fa fa-tag fa-fw"></i>', tooltip: msg.additional_inserts + ' ' + msg.to_elm, float: 'left'},
        {name: 'glass_spec', text: '<i class="fa fa-list-ul fa-fw"></i>', tooltip: msg.glass_spec + ' ' + msg.to_elm, float: 'left'},
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

          case 'glass_spec':
            _editor.glass_inserts();
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
    this._layers._otoolbar.buttons.virtual_layer.classList.add('disabledbutton');

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
            _editor.project._dp.sys.refill_prm(_editor.project.ox);
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
    if(tool.constructor.ToolWnd) {
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

