/**
 * Составной тип в поле trans документов оплаты и отгрузки
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module glob_value_mgr
 *
 * Created 10.10.2016
 */

(function ({prototype}) {
  const {value_mgr} = prototype;
  prototype.value_mgr = function(row, f, mf, array_enabled, v) {
		const tmp = value_mgr.call(this, row, f, mf, array_enabled, v);
		if(tmp){
      return tmp;
    }
		if(f == 'trans'){
      return $p.doc.calc_order;
    }
		else if(f == 'partner'){
      return $p.cat.partners;
    }
	}
})($p.classes.DataManager);
