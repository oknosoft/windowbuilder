
/**
 * Методы менеджера цветов
 */

Object.defineProperties($p.cat.clrs, {

  /**
   * Форма выбора с фильтром по двум цветам, создающая при необходимости составной цвет
   */
  form_selection: {
    value(pwnd, attr) {

      const eclr = this.get();

      attr.hide_filter = true;

      attr.toolbar_click = (btn_id, wnd) => {
        // если указаны оба цвета
        if(btn_id == 'btn_select' && !eclr.clr_in.empty() && !eclr.clr_out.empty()) {

          const clr = eclr.clr_in == eclr.clr_out ? eclr.clr_in : this.get(`${eclr.clr_in.valueOf()}${eclr.clr_out.valueOf()}`);
          pwnd.on_select(clr);

          wnd.close();
          return false;
        }
      };

      const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

      function get_option_list(selection, val) {

        selection.clr_in = $p.utils.blank.guid;
        selection.clr_out = $p.utils.blank.guid;

        if(attr.selection) {
          attr.selection.some((sel) => {
            for (const key in sel) {
              if(key == 'ref') {
                selection.ref = sel.ref;
                return true;
              }
            }
          });
        }

        return this.constructor.prototype.get_option_list.call(this, selection, val);
      }

      return (wnd instanceof Promise ? wnd : Promise.resolve(wnd))
        .then((wnd) => {

          const tb_filter = wnd.elmnts.filter;

          tb_filter.__define({
            get_filter: {
              value() {
                const res = {
                  selection: []
                };
                if(clr_in.getSelectedValue()) {
                  res.selection.push({clr_in: clr_in.getSelectedValue()});
                }
                if(clr_out.getSelectedValue()) {
                  res.selection.push({clr_out: clr_out.getSelectedValue()});
                }
                if(res.selection.length) {
                  res.hide_tree = true;
                }
                return res;
              }
            }
          });

          wnd.attachEvent('onClose', () => {
            clr_in.unload();
            clr_out.unload();
            eclr.clr_in = $p.utils.blank.guid;
            eclr.clr_out = $p.utils.blank.guid;
            return true;
          });


          eclr.clr_in = $p.utils.blank.guid;
          eclr.clr_out = $p.utils.blank.guid;

          // Создаём элементы управления
          const clr_in = new $p.iface.OCombo({
            parent: tb_filter.div.obj,
            obj: eclr,
            field: 'clr_in',
            width: 160,
            hide_frm: true,
            get_option_list: get_option_list
          });
          const clr_out = new $p.iface.OCombo({
            parent: tb_filter.div.obj,
            obj: eclr,
            field: 'clr_out',
            width: 160,
            hide_frm: true,
            get_option_list: get_option_list
          });

          clr_in.DOMelem.style.float = 'left';
          clr_in.DOMelem_input.placeholder = 'Цвет изнутри';
          clr_out.DOMelem_input.placeholder = 'Цвет снаружи';

          clr_in.attachEvent('onChange', tb_filter.call_event);
          clr_out.attachEvent('onChange', tb_filter.call_event);
          clr_in.attachEvent('onClose', tb_filter.call_event);
          clr_out.attachEvent('onClose', tb_filter.call_event);

          // гасим кнопки управления
          wnd.elmnts.toolbar.hideItem('btn_new');
          wnd.elmnts.toolbar.hideItem('btn_edit');
          wnd.elmnts.toolbar.hideItem('btn_delete');

          wnd.elmnts.toolbar.setItemText('btn_select', '<b>Выбрать или создать</b>');

          return wnd;

        });
    },
    configurable: true,
    writable: true,
  },

  /**
   * Изменяем алгоритм построения формы списка. Игнорируем иерархию, если указаны цвета изнутри или снаружи
   */
  sync_grid: {
    value(attr, grid) {

      if(attr.action == "get_selection" && attr.selection && attr.selection.some(function (v) {
        return v.hasOwnProperty("clr_in") || v.hasOwnProperty("clr_out");
      })){
        delete attr.parent;
        delete attr.initial_value;
      }

      return $p.classes.DataManager.prototype.sync_grid.call(this, attr, grid);
    }
  },
});
