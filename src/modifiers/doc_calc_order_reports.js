/**
 * Отчеты по документу Расчет
 * @module doc_calc_order_reports
 * Created 23.06.2016
 */

$p.modifiers.push(
	function($p) {

		$p.doc.calc_order.rep_invoice_execution = function (rep) {

			var query_options = {
				reduce: true,
				limit: 10000,
				group: true,
				group_level: 3
			},
				res = {
					data: [],
					readOnly: true,
					colWidths: [180, 180, 200, 100, 100, 100, 100, 100],
					colHeaders: ['Контрагент', 'Организация', 'Заказ', 'Сумма', 'Оплачено', 'Долг', 'Отгружено', 'Отгрузить'],
					columns: [
						{type: 'text'},
						{type: 'text'},
						{type: 'text'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'}
					],
					wordWrap: false
					//minSpareRows: 1
				};

			if(!$p.current_acl.role_available("СогласованиеРасчетовЗаказов")){
				//query_options.group_level = 3;
				query_options.startkey = [$p.current_acl.partners_uids[0],""];
				query_options.endkey = [$p.current_acl.partners_uids[0],"\uffff"];
			}

			return $p.wsql.pouch.remote.doc.query("server/invoice_execution", query_options)

				.then(function (data) {

					var total = {
						invoice: 0,
						pay: 0,
						total_pay: 0,
						shipment:0,
						total_shipment:0
					};

					if(data.rows){

						data.rows.forEach(function (row) {

							if(!row.value.total_pay && !row.value.total_shipment)
								return;

							res.data.push([
								$p.cat.partners.get(row.key[0]).presentation,
								$p.cat.organizations.get(row.key[1]).presentation,
								row.key[2],
								row.value.invoice,
								row.value.pay,
								row.value.total_pay,
								row.value.shipment,
								row.value.total_shipment]);

							total.invoice+= row.value.invoice;
							total.pay+=row.value.pay;
							total.total_pay+=row.value.total_pay;
							total.shipment+=row.value.shipment;
							total.total_shipment+=row.value.total_shipment;
						});

						res.data.push([
							"",
							"",
							"Итого:",
							total.invoice,
							total.pay,
							total.total_pay,
							total.shipment,
							total.total_shipment]);

						res.mergeCells= [
							{row: res.data.length, col: 1, rowspan: 1, colspan: 3}
						]
					};

					rep.requery(res);
					
					return res;
				});
		};
	}
);