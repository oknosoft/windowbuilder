/**
 * ### Модуль менеджера и документа Установка цен номенклатуры
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_nom_prices_setup
 * Created 28.07.2016
 */


// Переопределяем формирование списка выбора характеристики в табчасти документа установки цен
$p.doc.nom_prices_setup.metadata().tabular_sections.goods.fields.nom_characteristic._option_list_local = true;

/**
 * Обработчик при создании документа
 */
$p.DocNom_prices_setup.prototype.after_create = function () {
  //Номер документа
  return this.new_number_doc();
};

// установим валюту и тип цен по умолчению при добавлении строки
$p.DocNom_prices_setup.prototype.add_row = function (row) {
  if (row._owner.name === 'goods') {
    const {price_type} = row._owner._owner;
    row.price_type = price_type;
    row.currency = price_type.price_currency;
  }
};

// перед записью проверяем уникальность ключа
$p.DocNom_prices_setup.prototype.before_save = function () {
  let aggr = this.goods.aggregate(['nom', 'nom_characteristic', 'price_type'], ['price'], 'COUNT', true),
    err;
  if (aggr.some((row) => {
      if (row.price > 1) {
        err = row;
        return row.price > 1;
      }
    })) {
    $p.msg.show_msg({
      type: 'alert-warning',
      text: '<table style=\'text-align: left; width: 100%;\'><tr><td>Номенклатура</td><td>' + $p.cat.nom.get(err.nom).presentation + '</td></tr>' +
      '<tr><td>Характеристика</td><td>' + $p.cat.characteristics.get(err.nom_characteristic).presentation + '</td></tr>' +
      '<tr><td>Тип цен</td><td>' + $p.cat.nom_prices_types.get(err.price_type).presentation + '</td></tr></table>',
      title: 'Дубли строк',
    });

    return false;
  }
};

// Подписываемся на глобальное событие tabular_paste
$p.on('tabular_paste', (clip) => {

  if (clip.grid && clip.obj && clip.obj._manager == $p.doc.nom_prices_setup) {

    var rows = [];

    clip.data.split('\n').map(function (row) {
      return row.split('\t');
    }).forEach(function (row) {

      if (row.length != 3)
        return;

      var nom = $p.cat.nom.by_name(row[0]);
      if (nom.empty())
        nom = $p.cat.nom.by_id(row[0]);
      if (nom.empty())
        nom = $p.cat.nom.find({article: row[0]});
      if (!nom || nom.empty())
        return;

      var characteristic = '';
      if (row[1]) {
        characteristic = $p.cat.characteristics.find({owner: nom, name: row[1]});
        if (!characteristic || characteristic.empty())
          characteristic = $p.cat.characteristics.find({owner: nom, name: {like: row[1]}});
      }

      rows.push({
        nom: nom,
        nom_characteristic: characteristic,
        price: parseFloat(row[2].replace(',', '.')),
        price_type: clip.obj.price_type,
      });
    });

    if (rows.length) {

      clip.grid.editStop();

      var first = clip.obj.goods.get(parseInt(clip.grid.getSelectedRowId()) - 1);

      rows.forEach(function (row) {
        if (first) {
          first._mixin(row);
          first = null;
        } else
          clip.obj.goods.add(row);
      });

      clip.obj.goods.sync_grid(clip.grid);

      clip.e.preventDefault();
      return $p.iface.cancel_bubble(e);
    }
  }

});
