/**
 * Главное окно интерфейса
 *
 * Created 25.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module wnd_main
 */

class OrderDealerApp {

  constructor($p) {

    // разделы интерфейса
    this.sidebar_items = [
        {id: "orders", text: "Заказы", icon: "projects_48.png"},
        {id: "events", text: "Планирование", icon: "events_48.png"},
        {id: "settings", text: "Настройки", icon: "settings_48.png"},
        {id: "v2", text: "Версия 2.0", icon: "v2_48.png"},
        {id: "about", text: "О программе", icon: "about_48.png"}
      ];

    // наблюдатель за событиями авторизации и синхронизации
    this.btn_auth_sync = new $p.iface.OBtnAuthSync();

    // Подписываемся на событие окончания загрузки предопределённых элементов
    this.predefined_elmnts_inited = $p.eve.attachEvent("predefined_elmnts_inited", this.predefined_elmnts_inited.bind(this));

    // Назначаем обработчик ошибки загрузки локальных данных
    this.pouch_load_data_error = $p.eve.attachEvent("pouch_load_data_error", this.pouch_load_data_error.bind(this));

    // основной сайдбар
    this.sidebar = new dhtmlXSideBar({
        parent: document.body,
        icons_path: "dist/imgs/",
        width: 180,
        header: true,
        template: "tiles",
        autohide: true,
        items: this.sidebar_items,
        offsets: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      });

    // подписываемся на событие навигации по сайдбару
    this.sidebar.attachEvent("onSelect", this.sidebar_select);

    // включаем индикатор загрузки
    this.sidebar.progressOn();

    // запрещаем масштабировать колёсиком мыши, т.к. для масштабирования у канваса свой инструмент
    window.onmousewheel = (e) => {
      if(e.ctrlKey){
        e.preventDefault();
        return false;
      }
    };

    // активируем страницу
    const hprm = $p.job_prm.parse_url();
    if(!hprm.view || this.sidebar.getAllItems().indexOf(hprm.view) == -1){
      $p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, "orders");
    } else{
      setTimeout($p.iface.hash_route);
    }

  }

  btns_nav(wrapper) {

    return this.btn_auth_sync.bind(new $p.iface.OTooolBar({
      wrapper: wrapper,
      class_name: 'md_otbnav',
      width: '260px', height: '28px', top: '3px', right: '3px', name: 'right',
      buttons: [
        {name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', tooltip: 'О программе', float: 'right'},
        {name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', tooltip: 'Настройки', float: 'right'},
        {name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', tooltip: 'Планирование', float: 'right'},
        {name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', tooltip: 'Заказы', float: 'right'},
        {name: 'sep_0', text: '', float: 'right'},
        {name: 'sync', text: '', float: 'right'},
        {name: 'auth', text: '', width: '80px', float: 'right'}

      ], onclick: (name) => {
        this.sidebar.cells(name).setActive(true);
        return false;
      }
    }))

  }

  /**
   * патч параметров подключения
   */
  patch_cnn() {

    ["couch_path", "zone", "couch_suffix", "couch_direct"].forEach((prm) => {
      if($p.job_prm.url_prm[prm] && $p.wsql.get_user_param(prm) != $p.job_prm.url_prm[prm]){
        $p.wsql.set_user_param(prm, $p.job_prm.url_prm[prm]);
      }
    });

    if(location.host.match("aribaz")){
      $p.wsql.set_user_param("zone", 2);
    }
    else if(location.host.match("tmk")){
      $p.wsql.set_user_param("zone", 23);
    }
    else if(location.host.match("ecookna")){
      $p.wsql.set_user_param("zone", 21);
    }


  }

  predefined_elmnts_inited(err) {

    this.sidebar.progressOff();

    // если разрешено сохранение пароля - сразу пытаемся залогиниться
    if(!$p.wsql.pouch.authorized && navigator.onLine &&
      $p.wsql.get_user_param("enable_save_pwd") &&
      $p.wsql.get_user_param("user_name") &&
      $p.wsql.get_user_param("user_pwd")){

      setTimeout(function () {
        $p.iface.frm_auth({
          modal_dialog: true,
          try_auto: true
        });
      }, 100);
    }

    $p.eve.detachEvent(this.predefined_elmnts_inited);

  }

  pouch_load_data_error(err) {

    // если это первый запуск, показываем диалог авторизации
    if(err.db_name && err.hasOwnProperty("doc_count") && err.doc_count < 10 && navigator.onLine){

      // если это демо (zone === zone_demo), устанавливаем логин и пароль
      if($p.wsql.get_user_param("zone") == $p.job_prm.zone_demo && !$p.wsql.get_user_param("user_name")){
        $p.wsql.set_user_param("enable_save_pwd", true);
        $p.wsql.set_user_param("user_name", $p.job_prm.guests[0].username);
        $p.wsql.set_user_param("user_pwd", $p.job_prm.guests[0].password);

        setTimeout(function () {
          $p.iface.frm_auth({
            modal_dialog: true,
            try_auto: true
          });
        }, 100);

      }else{
        $p.iface.frm_auth({
          modal_dialog: true,
          try_auto: $p.wsql.get_user_param("zone") == $p.job_prm.zone_demo && $p.wsql.get_user_param("enable_save_pwd")
        });
      }

    }

    this.sidebar.progressOff();
    $p.eve.detachEvent(this.pouch_load_data_error);

  }

  sidebar_select(id) {

    if(id == "v2"){
      $p.eve.redirect = true;
      location.replace("/v2/");
    }

    const hprm = $p.job_prm.parse_url();
    if(hprm.view != id){
      $p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, id);
    }

    $p.iface["view_" + id](this.cells(id));

  }

  hash_route(hprm) {

    // view отвечает за переключение закладки в SideBar
    if(hprm.view && this.sidebar.getActiveItem() != hprm.view){
      this.sidebar.getAllItems().forEach((item) => {
        if(item == hprm.view){
          this.sidebar.cells(item).setActive(true);
        }
      });
    }

    return false;

  }
}

$p.on({

	/**
	 * ### При установке параметров сеанса
	 * Процедура устанавливает параметры работы программы, специфичные для текущей сборки
	 *
	 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
	 */
	settings: function (prm) {

		prm.__define({

			// разделитель для localStorage
			local_storage_prefix: {
				value: "wb_"
			},

			// скин по умолчанию
			skin: {
				value: "dhx_terrace"
			},

			// фильтр для репликации с CouchDB
			pouch_filter: {
				value: (function () {
					// filter.__define({
					// 	doc: {
					// 		value: "auth/by_partner",
					// 		writable: false
					// 	}
					// });
					return {};
				})(),
				writable: false
			},

			// гостевые пользователи для демо-режима
			guests: {
				value: [{
					username: "Дилер",
					password: "1gNjzYQKBlcD"
				}]
			},

			// если понадобится обратиться к 1С, будем использовать irest
			irest_enabled: {
				value: true
			},

			// расположение rest-сервиса 1c по умолчанию
			rest_path: {
				value: "/a/zd/%1/odata/standard.odata/"
			},

			// не шевелить hash url при открытии подчиненных форм
			keep_hash: {
				value: true
			},

			// используем геокодер
			use_ip_geo: {
				value: true
			}

		});

		// по умолчанию, обращаемся к зоне 1
		prm.zone = 1;

		// объявляем номер демо-зоны
		prm.zone_demo = 1;

		// расположение couchdb
		//prm.couch_path = "http://cou206:5984/wb_";
    //prm.couch_path = "https://kint.oknosoft.ru/couchdb2/wb_";
		prm.couch_path = "/couchdb/wb_";

		// разрешаем сохранение пароля
		prm.enable_save_pwd = true;

	},

	/**
	 * ### При инициализации интерфейса
	 * Вызывается после готовности DOM и установки параметров сеанса, до готовности метаданных
	 * рисуем интерфейс
	 *
	 */
	iface_init: function() {
    $p.iface.main = new OrderDealerApp($p);
	},

	/**
	 * ### Обработчик маршрутизации
	 */
	hash_route: function (hprm) {
	  return $p.iface.main.hash_route(hprm);
	}

});
