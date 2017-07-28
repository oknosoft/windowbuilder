
class GlassInserts {

  constructor(elm) {

    this.elm = elm;

    if(!(elm instanceof Filling)){
      return $p.msg.show_msg({
        type: "alert-info",
        text: $p.msg.glass_invalid_elm,
        title: $p.msg.glass_spec
      });
    }

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
    const {elm} = this;
    grids.inserts && grids.inserts.editStop();
    elm.project.register_change(true);
    elm && Object.getNotifier(elm).notify({
      type: 'update',
      name: 'inset'
    });
    return true;
  }

  btn_click(id) {
    if(id == "btn_inset"){
      const {project, inset, elm} = this.elm;
      project.ox.glass_specification.clear({elm: elm});
      inset.specification.forEach((row) => {
        project.ox.glass_specification.add({
          elm: elm,
          inset: row.nom,
          clr: row.clr
        })
      });
    }
  }
}
