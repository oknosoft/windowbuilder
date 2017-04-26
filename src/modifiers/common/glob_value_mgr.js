/**
 * Составной тип в поле trans документов оплаты и отгрузки
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module glob_value_mgr
 *
 * Created 10.10.2016
 */

(function (md) {
	const value_mgr = md.value_mgr;
	md.value_mgr = (row, f, mf, array_enabled, v) => {
		const tmp = value_mgr(row, f, mf, array_enabled, v);
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
})($p.md);
