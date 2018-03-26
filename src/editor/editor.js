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
class Editor extends paper.PaperScope {

  constructor(pwnd, handlers){

    super();

    const _editor = this;

    this.activate();

    consts.tune_paper(this.settings);

    /**
     * ### Ячейка родительского окна, в которой размещен редактор
     *
     * @property _pwnd
     * @type dhtmlXCellObject
     * @final
     * @private
     */
    this.__define('_pwnd', {
      get: function () {
        return pwnd;
      }
    });

    /**
     * Собственный излучатель событий для уменьшения утечек памяти
     */
    this.eve = new (Object.getPrototypeOf($p.md.constructor))();

    /**
     * ### Разбивка на канвас и аккордион
     *
     * @property _layout
     * @type dhtmlXLayoutObject
     * @final
     * @private
     */
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
    this.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '14px', left: '2px', name: 'left', height: '294px',
      image_path: '/imgs/',
      buttons: [
        {name: 'select_node', css: 'tb_icon-arrow-white', title: $p.injected_data['tip_select_node.html']},
        {name: 'pan', css: 'tb_icon-hand', tooltip: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
        {name: 'zoom_fit', css: 'tb_cursor-zoom', tooltip: 'Вписать в окно'},
        {name: 'pen', css: 'tb_cursor-pen-freehand', tooltip: 'Добавить профиль'},
        {name: 'lay_impost', css: 'tb_cursor-lay-impost', tooltip: 'Вставить раскладку или импосты'},
        {name: 'arc', css: 'tb_cursor-arc-r', tooltip: 'Арка {Crtl}, {Alt}, {Пробел}'},
        {name: 'fx', text: '<i class="fa fa-magic fa-fw"></i>', tooltip: 'Действия', sub:
            {
              width: '120px',
              height:'28px',
              align: 'hor',
              buttons: [
                {name: 'cut', float: 'left', css: 'tb_cursor-cut', tooltip: 'Разрыв T-соединения'},
                {name: 'm1', float: 'left', text: '<small><i class="fa fa-magnet"></i><sub>1</sub></small>', tooltip: 'Импост по 0-штапику'}
                ],
            }},
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
        {name: 'copy', text: '<i class="fa fa-clone fa-fw"></i>', tooltip: 'Скопировать выделенное', float: 'left'},
        {name: 'paste', text: '<i class="fa fa-clipboard fa-fw"></i>', tooltip: 'Вставить', float: 'left'},
        {name: 'paste_prop', text: '<i class="fa fa-paint-brush fa-fw"></i>', tooltip: 'Применить скопированные свойства', float: 'left'},

        //{name: 'sep_2', text: '', float: 'left'},
        {name: 'back', text: '<i class="fa fa-undo fa-fw"></i>', tooltip: 'Шаг назад', float: 'left'},
        {name: 'rewind', text: '<i class="fa fa-repeat fa-fw"></i>', tooltip: 'Шаг вперед', float: 'left'},

        //{name: 'sep_3', text: '', float: 'left'},
        {name: 'open_spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию изделия', float: 'left'},
        //{name: 'sep_4', text: '', float: 'left'},
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
          //_editor._clipbrd.copy();
          break;

        case 'paste':
          //_editor._clipbrd.paste();
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
    //_editor._layout.base.parentNode.parentNode.style.top = "0px";
    this.tb_top.cell.style.background = "transparent";
    this.tb_top.cell.style.boxShadow = "none";

    /**
     * слушаем события клавиатуры
     */
    this.on_keydown = this.on_keydown.bind(this);
    document.body.addEventListener('keydown', this.on_keydown, false);

    // Обработчик события после записи характеристики. Если в параметрах укзано закрыть - закрываем форму
    this.eve.on("characteristic_saved", (scheme, attr) => {
      if(attr.close){
        this.close();
      }
      else{
        this.set_text();
      }
    });

    // При изменениях изделия обновляем текст заголовка окна
    this.eve.on("coordinates_calculated", this.set_text.bind(this));

    // Обработчик события при удалении строки некой табчасти продукции
    this.on_del_row = this.on_del_row.bind(this);
    $p.cat.characteristics.on("del_row", this.on_del_row);

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

    this.tools[1].activate();


    // Создаём экземпляр проекта Scheme
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

    const _scheme = new Scheme(_canvas, _editor);
    const pwnd_resize_finish = () => {
      _editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
    };

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
    _mousepos.className = "mousepos";
    _scheme.view.on('mousemove', (event) => {
      const {bounds} = _scheme;
      if(bounds){
        _mousepos.innerHTML = "x:" + (event.point.x - bounds.x).toFixed(0) +
          " y:" + (bounds.height + bounds.y - event.point.y).toFixed(0);
      }
    });

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

  /**
   * ### Устанавливает икону курсора
   * Действие выполняется для всех канвасов редактора
   *
   * @method canvas_cursor
   * @for Editor
   * @param name {String} - имя css класса курсора
   */
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
    default:
      this.tools.some((tool) => {
        if(tool.options.name == name){
          tool.activate();
          return true;
        }
      })
    }
  }

  /**
   * ### Открывает изделие для редактирования
   * MDI пока не реализовано. Изделие загружается в текущий проект
   * @method open
   * @for Editor
   * @param [ox] {String|DataObj} - ссылка или объект продукции
   */
  open(ox) {
    ox && this.project.load(ox);
  }

  /**
   * ### (Пере)заполняет изделие данными типового блока
   * - Вызывает диалог выбора типового блока и перезаполняет продукцию данными выбора
   * - Если текущее изделие не пустое, задаёт вопрос о перезаписи данными типового блока
   * - В обработчик выбора типового блока передаёт метод {{#crossLink "Scheme/load_stamp:method"}}Scheme.load_stamp(){{/crossLink}} текущего изделия
   *
   * @for Editor
   * @method load_stamp
   * @param confirmed {Boolean} - подавляет показ диалога подтверждения перезаполнения
   */
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

  /**
   * Returns path points which are contained in the rect
   * @method segments_in_rect
   * @for Editor
   * @param rect
   * @returns {Array}
   */
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

  /**
   * Возвращает элемент по номеру
   * @param num
   */
  elm(num) {
    return this.project.getItem({class: BuilderElement, elm: num});
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
    })
  }

  /**
   * Returns all items intersecting the rect.
   * Note: only the item outlines are tested
   */
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

  /**
   * Create pixel perfect dotted rectable for drag selections
   * @param p1
   * @param p2
   * @return {paper.CompoundPath}
   */
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

  /**
   * ### Диалог составного пакета
   *
   * @param [cnstr] {Number} - номер элемента или контура
   */
  glass_inserts(glasses){
    if(!Array.isArray(glasses)){
      glasses = this.project.selected_glasses();
    }
    return new GlassInserts(glasses);
  }

  /**
   * ### Диалог дополнительных вставок
   *
   * @param [cnstr] {Number} - номер элемента или контура
   */
  additional_inserts(cnstr, cell){
    new AdditionalInserts(cnstr, this.project, cell)
  }

  /**
   * ### Диалог радиуса выделенного элемента
   */
  profile_radius(){

    const elm = this.project.selected_elm;

    if(elm instanceof ProfileItem){

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

    // если "все", получаем все профили активного или родительского контура
    if(name == "all"){

      if(this.glass_align()){
        return
      }

      // получаем текущий внешний контур
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

      // прочищаем размерные линии
      if(changed || profiles.length > 1){
        profiles.forEach(({layer}) => contours.indexOf(layer) == -1 && contours.push(layer));
        contours.forEach(({l_dimensions}) => l_dimensions && l_dimensions.clear());
      }

      // если выделено несколько, запланируем групповое выравнивание
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

  /**
   * Двигает импосты, чтобы получить одинаковые размеры заполнений
   * @param name
   * @param glasses
   * @return {Array}
   */
  do_glass_align(name = 'auto', glasses) {

    const {project, Point, Key} = this;

    if(!glasses){
      glasses = project.selected_glasses();
    }
    if(glasses.length < 2){
      return
    }

    // получаем текущий внешний контур
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

    // выясняем направление, в котром уравнивать
    if(name == 'auto'){
      name = 'width'
    }

    // собираем в массиве shift все импосты подходящего направления
    const orientation = name == 'width' ? $p.enm.orientations.vert : $p.enm.orientations.hor;
    const shift = layer.profiles.filter((impost) => {
      const {b, e} = impost.rays;
      // отрезаем плохую ориентацию и неимпосты
      return impost.orientation == orientation && (b.is_tt || e.is_tt || b.is_i || e.is_i);
    });

    // признак уравнивания геометрически, а не по заполнению
    const galign = Key.modifiers.control || Key.modifiers.shift || project.auto_align == $p.enm.align_types.Геометрически;
    let medium = 0;

    // модифицируем коллекцию заполнений - подклеиваем в неё импосты, одновременно, вычиляем средний размер
    const glmap = new Map();
    glasses = glasses.map((glass) => {
      const {bounds, profiles} = glass;
      const res = {
        glass,
        width: bounds.width,
        height: bounds.height,
      }
      if(galign){
        // находим левый-правый-верхний-нижний профили
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

    // дополняем в glmap структуры подходящих заполнений
    shift.forEach((impost) => {
      // если примыкают с двух сторон или вторая сторона рамная - импост проходит
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

    // рассчитываем, на сколько и в какую сторону двигать
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

  /**
   * Уравнивание по ширинам заполнений
   */
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

  /**
   * Обработчик события при удалении строки
   * @param obj
   * @param prm
   */
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

  /**
   * Обработчик события проверки заполненности реквизитов
   */
  on_alert(ev) {
    if(ev.obj === this.project.ox) {
      if(ev.row) {
        const {inset} = ev.row;
        if(inset && !inset.empty()) {
          ev.text += `<br/>вставка "${inset.name}"`;
        }
      }
      $p.msg.show_msg(ev);
    }
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

  /**
   * проверка, можно ли покидать страницу
   * @param loc
   * @return {*}
   */
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

  /**
   * ### Деструктор
   * @method unload
   * @for Editor
   */
  unload() {
    const {tool, tools, tb_left, tb_top, _acc, _undo, _pwnd, eve, project} = this;

    eve.removeAllListeners();
    $p.cat.characteristics.off('del_row', this.on_del_row);
    $p.off('alert', this.on_alert);
    document.body.removeEventListener('keydown', this.on_keydown);

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


/**
 * Экспортируем конструктор Editor, чтобы экземпляры построителя можно было создать снаружи
 * @property Editor
 * @for MetaEngine
 * @type function
 */
$p.Editor = Editor;
