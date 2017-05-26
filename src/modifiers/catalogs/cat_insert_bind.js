/**
 * Дополнительные методы справочника Привязки вставок
 *
 * Created 21.04.2017
 */

$p.cat.insert_bind.__define({

  /**
   * Возвращает массив допвставок с привязками к изделию или слою
   */
  insets: {
    value: function (ox) {
      const {sys, owner} = ox;
      const res = [];
      this.forEach((o) => {
        o.production.forEach((row) => {
          const {nom} = row;
          if(sys.in_hierarchy(nom) || owner.in_hierarchy(nom)){
            o.inserts.forEach(({inset, elm_type}) => {
              if(!res.some((irow) => irow.inset == inset &&  irow.elm_type == elm_type)){
                res.push({inset, elm_type});
              }
            });
          }
        })
      })
      return res;
    }
  }

});

