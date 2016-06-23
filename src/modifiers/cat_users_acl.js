/**
 * Дополнительные методы справочника Цвета
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_cnns
 */


$p.modifiers.push(
	function($p) {

		$p.cat.users_acl._obj_constructor.prototype.__define({

			role_available: {
				value: function (name) {
					return this.acl_objs._obj.some(function (row) {
						return row.type == name;
					});
				}
			},

			partners_uids: {
				get: function () {
					var res = [];
					this.acl_objs.each(function (row) {
						if(row.acl_obj instanceof $p.cat.partners._obj_constructor)
							res.push(row.acl_obj.ref)
					});
					return res;
				}
			}
		});

	}
);
