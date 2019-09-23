
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
        }
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
        const {inset, _owner} = row.obj;
        _owner._owner.add_inset_params(inset, params.selection.cnstr);
        $p.cat.clrs.selection_exclude_service(this._fields.clr, inset);
      }
    }
  }

}
