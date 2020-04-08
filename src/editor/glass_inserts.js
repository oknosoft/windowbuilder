
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

    // очищаем незаполненные строки табличной части
    glass_specification.clear({elm: elm.elm, inset: $p.utils.blank.guid});

    // распространим изменения на все выделенные заполнения
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
