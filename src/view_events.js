/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_events
 */

$p.iface.view_events = function (cell) {

	function OViewEvents(){

		var t = this;

		function create_scheduler(){
			//scheduler.config.xml_date="%Y-%m-%d %H:%i";
			scheduler.config.first_hour = 8;
			scheduler.config.last_hour = 22;

			var sTabs = '<div class="dhx_cal_tab" name="day_tab" style="right:204px;"></div>'+
				'<div class="dhx_cal_tab" name="week_tab" style="right:140px;"></div>'+
				'<div class="dhx_cal_tab" name="month_tab" style="right:280px;"></div>'+
				'<div class="dhx_cal_date"></div><div class="dhx_minical_icon">&nbsp;</div>';
			//'<div class="dhx_cal_tab" name="timeline_tab" style="right:76px;"></div>';

			t._scheduler = cell.attachScheduler(null, "week", sTabs);

			t._scheduler.attachEvent("onBeforeViewChange", function(old_mode, old_date, mode, date){
				//if(mode == "timeline"){
				//	$p.msg.show_not_implemented();
				//	return false;
				//}
				return true;
			});
		}

		function show_doc(){

		}
		function show_list(){

		}

		function hash_route(hprm) {

			if(hprm.view == "events"){

				if(hprm.obj != "doc.planning_event")
					setTimeout(function () {
						$p.iface.set_hash("doc.planning_event");
					});
				else{

					if(!$p.utils.is_empty_guid(hprm.ref)){

						//if(hprm.frm != "doc")
						//	setTimeout(function () {
						//		$p.iface.set_hash(undefined, undefined, "doc");
						//	});
						//else
						//	show_doc(hprm.ref);


					} else if($p.utils.is_empty_guid(hprm.ref) || hprm.frm == "list"){

						show_list();
					}
				}

				return false;
			}

			return true;
		}

		if(!window.dhtmlXScheduler){
			$p.load_script("//oknosoft.github.io/metadata.js/lib/dhtmlxscheduler/dhtmlxscheduler.min.js", "script", create_scheduler);
			$p.load_script("//oknosoft.github.io/metadata.js/lib/dhtmlxscheduler/dhtmlxscheduler.css", "link");
		}else
			create_scheduler();

		// Рисуем дополнительные элементы навигации
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.on("hash_route", hash_route);

	}

	if(!$p.iface._events)
		$p.iface._events = new OViewEvents();

	return $p.iface._events;

};
