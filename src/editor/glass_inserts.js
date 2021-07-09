
class GlassInserts {

  constructor(glasses) {

    const elm = glasses.length && glasses[0];

    const {EditorInvisible, msg, ui, enm, iface, injected_data} = $p;

    if(!(elm instanceof EditorInvisible.Filling)) {

      return ui.dialogs.alert({title: msg.glass_spec, text: msg.glass_invalid_elm});
    }

    if(elm.nom.elm_type === enm.elm_types.Заполнение) {
      return ui.dialogs.alert({title: msg.glass_spec, text: msg.glass_invalid_type});
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
      ts: 'glass_specification',
      selection: {elm: elm.elm},
      toolbar_struct: injected_data['toolbar_glass_inserts.xml'],
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
    this.wnd.attachEvent('onClose', this.onclose.bind(this));
    this.wnd.getAttachedToolbar().attachEvent('onclick', this.btn_click.bind(this));
  }

  onclose() {
    const {msg, ui, job_prm} = $p;
    const {grids} = this.wnd.elmnts;
    const {elm, glasses} = this;
    const {glass_specification} = elm.project.ox;
    grids.inserts && grids.inserts.editStop();

    // проверяем состав
    const chain = glass_specification.find_rows({elm: elm.elm}).map(({_row}) => _row);
    const {glass_chains} = job_prm.builder;
    if(glass_chains && glass_chains.length) {
      let ok;
      for(const chains of glass_chains) {
        if(chains.length === chain.length && chain.every(({inset}, index) => {
          return inset.insert_glass_type === chains[index];
        })) {
          ok = true;
          break;
        }
      }
      if(!ok) {
        ui.dialogs.alert({title: msg.glass_invalid_chain, text: chain.map(({inset}) => inset.insert_glass_type.synonym).join('-')});
      }
    }

    // очищаем незаполненные строки табличной части
    glass_specification.clear({elm: elm.elm, inset: $p.utils.blank.guid});

    // распространим изменения на все выделенные заполнения
    for(let i = 1; i < glasses.length; i++) {
      const selm = glasses[i];
      glass_specification.clear({elm: selm.elm});
      chain.forEach((row) => {
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
