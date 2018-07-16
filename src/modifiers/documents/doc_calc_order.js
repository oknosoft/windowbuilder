/**
 * ### Модуль объекта документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_calc_order
 */

// свойства и методы объекта
$p.DocCalc_order = class DocCalc_order extends $p.DocCalc_order {

  // подписки на события

  // после создания надо заполнить реквизиты по умолчанию: контрагент, организация, договор
  after_create() {

    const {enm, cat, current_user, DocCalc_order} = $p;
    const {acl_objs} = current_user;

    //Организация
    acl_objs.find_rows({by_default: true, type: cat.organizations.class_name}, (row) => {
      this.organization = row.acl_obj;
      return false;
    });

    //Подразделение
    DocCalc_order.set_department.call(this);

    //Контрагент
    acl_objs.find_rows({by_default: true, type: cat.partners.class_name}, (row) => {
      this.partner = row.acl_obj;
      return false;
    });

    //Договор
    this.contract = cat.contracts.by_partner_and_org(this.partner, this.organization);

    //Менеджер
    this.manager = current_user;

    //СостояниеТранспорта
    this.obj_delivery_state = enm.obj_delivery_states.Черновик;

    //Номер документа
    return this.new_number_doc();

  }

  // перед записью надо присвоить номер для нового и рассчитать итоги
  before_save() {

    const {Отклонен, Отозван, Шаблон, Подтвержден, Отправлен} = $p.enm.obj_delivery_states;
    //Для шаблонов, отклоненных и отозванных проверки выполнять не будем, чтобы возвращалось всегда true
    //при этом, просто сразу вернуть true не можем, т.к. надо часть кода выполнить - например, сумму документа пересчитать
    const must_be_saved = [Подтвержден, Отправлен].indexOf(this.obj_delivery_state) == -1;

    let doc_amount = 0,
      amount_internal = 0;

    // если установлен признак проведения, проверим состояние транспорта
    if(this.posted) {
      if(this.obj_delivery_state == Отклонен || this.obj_delivery_state == Отозван || this.obj_delivery_state == Шаблон) {
        $p.msg.show_msg && $p.msg.show_msg({
          type: 'alert-warning',
          text: 'Нельзя провести заказ со статусом<br/>"Отклонён", "Отозван" или "Шаблон"',
          title: this.presentation
        });
        return false;
      }
      else if(this.obj_delivery_state != Подтвержден) {
        this.obj_delivery_state = Подтвержден;
      }
    }
    else if(this.obj_delivery_state == Подтвержден) {
      this.obj_delivery_state = Отправлен;
    }

    // проверим заполненность подразделения
    if(this.obj_delivery_state == Шаблон) {
      this.department = $p.utils.blank.guid;
      this.partner = $p.utils.blank.guid;
    }
    else {
      if(this.department.empty()) {
        $p.msg.show_msg && $p.msg.show_msg({
          type: 'alert-warning',
          text: 'Не заполнен реквизит "офис продаж" (подразделение)',
          title: this.presentation
        });
        return false || must_be_saved;
      }
      if(this.partner.empty()) {
        $p.msg.show_msg && $p.msg.show_msg({
          type: 'alert-warning',
          text: 'Не указан контрагент (дилер)',
          title: this.presentation
        });
        return false || must_be_saved;
      }
    }

    this.production.forEach((row) => {

      doc_amount += row.amount;
      amount_internal += row.amount_internal;

      // if(!row.characteristic.calc_order.empty()) {
      //   const name = row.nom.article || row.nom.nom_group.name || row.nom.id.substr(0, 3);
      //   if(sys_profile.indexOf(name) == -1) {
      //     if(sys_profile) {
      //       sys_profile += ' ';
      //     }
      //     sys_profile += name;
      //   }
      //
      //   row.characteristic.constructions.forEach((row) => {
      //   	if(row.parent && !row.furn.empty()){
      //   		const name = row.furn.name_short || row.furn.name;
      //   		if(sys_furn.indexOf(name) == -1){
      //   			if(sys_furn)
      //   				sys_furn += " ";
      //   			sys_furn += name;
      //   		}
      //   	}
      //   });
      // }
    });

    const {rounding} = this;

    this.doc_amount = doc_amount.round(rounding);
    this.amount_internal = amount_internal.round(rounding);
    //this.sys_profile = sys_profile;
    //this.sys_furn = sys_furn;
    this.amount_operation = $p.pricing.from_currency_to_currency(doc_amount, this.date, this.doc_currency).round(rounding);

    const {_obj, obj_delivery_state, category} = this;

    // фильтр по статусу
    if(obj_delivery_state == 'Шаблон') {
      _obj.state = 'template';
    }
    else if(category == 'service') {
      _obj.state = 'service';
    }
    else if(category == 'complaints') {
      _obj.state = 'complaints';
    }
    else if(obj_delivery_state == 'Отправлен') {
      _obj.state = 'sent';
    }
    else if(obj_delivery_state == 'Отклонен') {
      _obj.state = 'declined';
    }
    else if(obj_delivery_state == 'Подтвержден') {
      _obj.state = 'confirmed';
    }
    else if(obj_delivery_state == 'Архив') {
      _obj.state = 'zarchive';
    }
    else {
      _obj.state = 'draft';
    }

    // номера изделий в характеристиках
    const rows_saver = this.product_rows(true);

    // пометим на удаление неиспользуемые характеристики
    // этот кусок не влияет на возвращаемое before_save значение и выполняется асинхронно
    const res = this._manager.pouch_db.query('linked', {startkey: [this.ref, 'cat.characteristics'], endkey: [this.ref, 'cat.characteristics\u0fff']})
      .then(({rows}) => {
        const deleted = [];
        for (const {id} of rows) {
          const ref = id.substr(20);
          if(this.production.find_rows({characteristic: ref}).length) {
            continue;
          }
          deleted.push($p.cat.characteristics.get(ref, 'promise')
            .then((ox) => !ox._deleted && ox.mark_deleted(true)));
        }
        return Promise.all(deleted);
      })
      .then((res) => {
        res.length && this._manager.emit_async('svgs', this);
      })
      .catch((err) => null);

    if(this._data.before_save_sync) {
      return res
        .then(() => rows_saver)
        .then(() => this);
    }

  }

  // при изменении реквизита
  value_change(field, type, value) {
    if(field == 'organization') {
      this.organization = value;
      this.new_number_doc();
      if(this.contract.organization != value) {
        this.contract = $p.cat.contracts.by_partner_and_org(this.partner, value);
      }
    }
    else if(field == 'partner' && this.contract.owner != value) {
      this.contract = $p.cat.contracts.by_partner_and_org(value, this.organization);
    }
    // если изменение инициировано человеком, дополним список изменённых полей
    this._manager.emit_add_fields(this, ['contract']);

  }

  // при удалении строки
  after_del_row(name) {
    name === 'production' && this.product_rows();
    return this;
  }


  /**
   * Возвращает валюту документа
   */
  get doc_currency() {
    const currency = this.contract.settlements_currency;
    return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
  }

  set doc_currency(v) {

  }

  get rounding() {
    const {pricing} = $p.job_prm;
    if(!pricing.hasOwnProperty('rounding')) {
      const parts = this.doc_currency.parameters_russian_recipe.split(',');
      pricing.rounding = parseInt(parts[parts.length - 1]);
      if(isNaN(pricing.rounding)) {
        pricing.rounding = 2;
      }
    }
    return pricing.rounding;
  }

  /**
   * При установке договора, синхронно устанавливаем параметры НДС
   */
  get contract() {
    return this._getter('contract');
  }
  set contract(v) {
    this._setter('contract', v);
    this.vat_consider = this.contract.vat_consider;
    this.vat_included = this.contract.vat_included;
  }

  /**
   * Пересчитывает номера изделий в продукциях,
   * обновляет контрагента, состояние транспорта и подразделение
   * @param save
   */
  product_rows(save) {
    const res = [];
    this.production.forEach(({row, characteristic}) => {
      if(!characteristic.empty() && characteristic.calc_order === this) {
        if(characteristic.product !== row || characteristic._modified ||
          characteristic.partner !== this.partner ||
          characteristic.obj_delivery_state !== this.obj_delivery_state ||
          characteristic.department !== this.department) {

          characteristic.product = row;
          characteristic.obj_delivery_state = this.obj_delivery_state;
          characteristic.partner = this.partner;
          characteristic.department = this.department;

          if(!characteristic.owner.empty()) {
            if(save) {
              res.push(characteristic.save());
            }
            else {
              characteristic.name = characteristic.prod_name();
            }
          }
        }
      }
    });
    if(save) {
      return Promise.all(res);
    }
  }

  /**
   * рассчитывает итоги диспетчеризации
   * @return {Promise.<TResult>|*}
   */
  dispatching_totals() {
    var options = {
      reduce: true,
      limit: 10000,
      group: true,
      keys: []
    };
    this.production.forEach(({nom, characteristic}) => {
      if(!characteristic.empty() && !nom.is_procedure && !nom.is_service && !nom.is_accessory) {
        options.keys.push([characteristic.ref, '305e374b-3aa9-11e6-bf30-82cf9717e145', 1, 0]);
      }
    });
    return $p.adapters.pouch.remote.doc.query('server/dispatching', options)
      .then(function ({rows}) {
        const res = {};
        rows && rows.forEach(function ({key, value}) {
          if(value.plan) {
            value.plan = moment(value.plan).format('L');
          }
          if(value.fact) {
            value.fact = moment(value.fact).format('L');
          }
          res[key[0]] = value;
        });
        return res;
      });
  }

  /**
   * Возвращает данные для печати
   */
  print_data(attr = {}) {
    const {organization, bank_account, partner, contract, manager} = this;
    const {individual_person} = manager;
    const our_bank_account = bank_account && !bank_account.empty() ? bank_account : organization.main_bank_account;
    const get_imgs = [];
    const {cat: {contact_information_kinds, characteristics}, utils: {blank, blob_as_text}} = $p;

    // заполняем res теми данными, которые доступны синхронно
    const res = {
      АдресДоставки: this.shipping_address,
      ВалютаДокумента: this.doc_currency.presentation,
      ДатаЗаказаФорматD: moment(this.date).format('L'),
      ДатаЗаказаФорматDD: moment(this.date).format('LL'),
      ДатаТекущаяФорматD: moment().format('L'),
      ДатаТекущаяФорматDD: moment().format('LL'),
      ДоговорДатаФорматD: moment(contract.date.valueOf() == blank.date.valueOf() ? this.date : contract.date).format('L'),
      ДоговорДатаФорматDD: moment(contract.date.valueOf() == blank.date.valueOf() ? this.date : contract.date).format('LL'),
      ДоговорНомер: contract.number_doc ? contract.number_doc : this.number_doc,
      ДоговорСрокДействия: moment(contract.validity).format('L'),
      ЗаказНомер: this.number_doc,
      Контрагент: partner.presentation,
      КонтрагентОписание: partner.long_presentation,
      КонтрагентДокумент: '',
      КонтрагентКЛДолжность: '',
      КонтрагентКЛДолжностьРП: '',
      КонтрагентКЛИмя: '',
      КонтрагентКЛИмяРП: '',
      КонтрагентКЛК: '',
      КонтрагентКЛОснованиеРП: '',
      КонтрагентКЛОтчество: '',
      КонтрагентКЛОтчествоРП: '',
      КонтрагентКЛФамилия: '',
      КонтрагентКЛФамилияРП: '',
      КонтрагентИНН: partner.inn,
      КонтрагентКПП: partner.kpp,
      КонтрагентЮрФизЛицо: '',
      КратностьВзаиморасчетов: this.settlements_multiplicity,
      КурсВзаиморасчетов: this.settlements_course,
      ЛистКомплектацииГруппы: '',
      ЛистКомплектацииСтроки: '',
      Организация: organization.presentation,
      ОрганизацияГород: organization.contact_information._obj.reduce((val, row) => val || row.city, '') || 'Москва',
      ОрганизацияАдрес: organization.contact_information._obj.reduce((val, row) => {
        if(row.kind == contact_information_kinds.predefined('ЮрАдресОрганизации') && row.presentation) {
          return row.presentation;
        }
        else if(val) {
          return val;
        }
        else if(row.presentation && (
            row.kind == contact_information_kinds.predefined('ФактАдресОрганизации') ||
            row.kind == contact_information_kinds.predefined('ПочтовыйАдресОрганизации')
          )) {
          return row.presentation;
        }
      }, ''),
      ОрганизацияТелефон: organization.contact_information._obj.reduce((val, row) => {
        if(row.kind == contact_information_kinds.predefined('ТелефонОрганизации') && row.presentation) {
          return row.presentation;
        }
        else if(val) {
          return val;
        }
        else if(row.kind == contact_information_kinds.predefined('ФаксОрганизации') && row.presentation) {
          return row.presentation;
        }
      }, ''),
      ОрганизацияБанкБИК: our_bank_account.bank.id,
      ОрганизацияБанкГород: our_bank_account.bank.city,
      ОрганизацияБанкКоррСчет: our_bank_account.bank.correspondent_account,
      ОрганизацияБанкНаименование: our_bank_account.bank.name,
      ОрганизацияБанкНомерСчета: our_bank_account.account_number,
      ОрганизацияИндивидуальныйПредприниматель: organization.individual_entrepreneur.presentation,
      ОрганизацияИНН: organization.inn,
      ОрганизацияКПП: organization.kpp,
      ОрганизацияСвидетельствоДатаВыдачи: organization.certificate_date_issue,
      ОрганизацияСвидетельствоКодОргана: organization.certificate_authority_code,
      ОрганизацияСвидетельствоНаименованиеОргана: organization.certificate_authority_name,
      ОрганизацияСвидетельствоСерияНомер: organization.certificate_series_number,
      ОрганизацияЮрФизЛицо: organization.individual_legal.presentation,
      Офис: this.department.presentation,
      ПродукцияЭскизы: {},
      Проект: this.project.presentation,
      СистемыПрофилей: this.sys_profile,
      СистемыФурнитуры: this.sys_furn,
      Сотрудник: manager.presentation,
      СотрудникКомментарий: manager.note,
      СотрудникДолжность: individual_person.Должность || 'менеджер',
      СотрудникДолжностьРП: individual_person.ДолжностьРП,
      СотрудникИмя: individual_person.Имя,
      СотрудникИмяРП: individual_person.ИмяРП,
      СотрудникОснованиеРП: individual_person.ОснованиеРП,
      СотрудникОтчество: individual_person.Отчество,
      СотрудникОтчествоРП: individual_person.ОтчествоРП,
      СотрудникФамилия: individual_person.Фамилия,
      СотрудникФамилияРП: individual_person.ФамилияРП,
      СотрудникФИО: individual_person.Фамилия +
      (individual_person.Имя ? ' ' + individual_person.Имя[0].toUpperCase() + '.' : '' ) +
      (individual_person.Отчество ? ' ' + individual_person.Отчество[0].toUpperCase() + '.' : ''),
      СотрудникФИОРП: individual_person.ФамилияРП + ' ' + individual_person.ИмяРП + ' ' + individual_person.ОтчествоРП,
      СуммаДокумента: this.doc_amount.toFixed(2),
      СуммаДокументаПрописью: this.doc_amount.in_words(),
      СуммаДокументаБезСкидки: this.production._obj.reduce((val, row) => val + row.quantity * row.price, 0).toFixed(2),
      СуммаСкидки: this.production._obj.reduce((val, row) => val + row.discount, 0).toFixed(2),
      СуммаНДС: this.production._obj.reduce((val, row) => val + row.vat_amount, 0).toFixed(2),
      ТекстНДС: this.vat_consider ? (this.vat_included ? 'В том числе НДС 18%' : 'НДС 18% (сверху)') : 'Без НДС',
      ТелефонПоАдресуДоставки: this.phone,
      СуммаВключаетНДС: contract.vat_included,
      УчитыватьНДС: contract.vat_consider,
      ВсегоНаименований: this.production.count(),
      ВсегоИзделий: 0,
      ВсегоПлощадьИзделий: 0,
      Продукция: [],
      Аксессуары: [],
      Услуги: [],
      НомерВнутр: this.number_internal,
      КлиентДилера: this.client_of_dealer,
      Комментарий: this.note,
    };

    // дополняем значениями свойств
    this.extra_fields.forEach((row) => {
      res['Свойство' + row.property.name.replace(/\s/g, '')] = row.value.presentation || row.value;
    });

    // TODO: дополнить датами доставки и монтажа
    res.МонтажДоставкаСамовывоз = !this.shipping_address ? 'Самовывоз' : 'Монтаж по адресу: ' + this.shipping_address;

    // получаем логотип организации
    for (let key in organization._attachments) {
      if(key.indexOf('logo') != -1) {
        get_imgs.push(organization.get_attachment(key)
          .then((blob) => {
            return blob_as_text(blob, blob.type.indexOf('svg') == -1 ? 'data_url' : '');
          })
          .then((data_url) => {
            res.ОрганизацияЛоготип = data_url;
          })
          .catch($p.record_log));
        break;
      }
    }

    return this.load_production().then(() => {

      // получаем эскизы продукций, параллельно накапливаем количество и площадь изделий
      this.production.forEach((row) => {
        if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory) {

          res.Продукция.push(this.row_description(row));

          res.ВсегоИзделий += row.quantity;
          res.ВсегоПлощадьИзделий += row.quantity * row.s;

          // если запросили эскиз без размерных линий или с иными параметрами...
          if(attr.sizes === false) {

          }
          else {
            if(row.characteristic.svg) {
              res.ПродукцияЭскизы[row.characteristic.ref] = row.characteristic.svg;
            }
          }
        }
        else if(!row.nom.is_procedure && !row.nom.is_service && row.nom.is_accessory) {
          res.Аксессуары.push(this.row_description(row));
        }
        else if(!row.nom.is_procedure && row.nom.is_service && !row.nom.is_accessory) {
          res.Услуги.push(this.row_description(row));
        }
      });
      res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

      return (get_imgs.length ? Promise.all(get_imgs) : Promise.resolve([]))
        .then(() => !window.QRCode && $p.load_script('/dist/qrcodejs/qrcode.min.js', 'script'))
        .then(() => {

          const svg = document.createElement('SVG');
          svg.innerHTML = '<g />';
          const qrcode = new QRCode(svg, {
            text: 'http://www.oknosoft.ru/zd/',
            width: 100,
            height: 100,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H,
            useSVG: true
          });
          res.qrcode = svg.innerHTML;

          return res;
        });

    });

  }

  /**
   * Возвращает струклуру с описанием строки продукции для печати
   */
  row_description(row) {

    if(!(row instanceof $p.DocCalc_orderProductionRow) && row.characteristic) {
      this.production.find_rows({characteristic: row.characteristic}, (prow) => {
        row = prow;
        return false;
      });
    }
    const {characteristic, nom} = row;
    const res = {
      ref: characteristic.ref,
      НомерСтроки: row.row,
      Количество: row.quantity,
      Ед: row.unit.name || 'шт',
      Цвет: characteristic.clr.name,
      Размеры: row.len + 'x' + row.width + ', ' + row.s + 'м²',
      Площадь: row.s,
      //Отдельно размеры, общая площадь позиции и комментарий к позиции
      Длина: row.len,
      Ширина: row.width,
      ВсегоПлощадь: row.s * row.quantity,
      Примечание: row.note,
      Номенклатура: nom.name_full || nom.name,
      Характеристика: characteristic.name,
      Заполнения: '',
      Фурнитура: '',
      Параметры: [],
      Цена: row.price,
      ЦенаВнутр: row.price_internal,
      СкидкаПроцент: row.discount_percent,
      СкидкаПроцентВнутр: row.discount_percent_internal,
      Скидка: row.discount.round(2),
      Сумма: row.amount.round(2),
      СуммаВнутр: row.amount_internal.round(2)
    };

    // формируем описание заполнений
    characteristic.glasses.forEach((row) => {
      const {name} = row.nom;
      if(res.Заполнения.indexOf(name) == -1) {
        if(res.Заполнения) {
          res.Заполнения += ', ';
        }
        res.Заполнения += name;
      }
    });

    // наименования фурнитур
    characteristic.constructions.forEach((row) => {
      const {name} = row.furn;
      if(name && res.Фурнитура.indexOf(name) == -1) {
        if(res.Фурнитура) {
          res.Фурнитура += ', ';
        }
        res.Фурнитура += name;
      }
    });

    // параметры, помеченные к включению в описание
    const params = new Map();
    characteristic.params.forEach((row) => {
      if(row.param.include_to_description) {
        params.set(row.param, row.value);
      }
    });
    for (let [param, value] of params) {
      res.Параметры.push({
        param: param.presentation,
        value: value.presentation || value
      });
    }

    return res;
  }

  /**
   * Заполняет табчасть планирования запросом к сервису windowbuilder-planning
   */
  fill_plan() {

    // чистим не стесняясь - при записи всё равно перезаполнять
    this.planning.clear();

    // получаем url сервиса
    const {wsql, aes, current_user: {suffix}, msg} = $p;
    const url = (wsql.get_user_param('windowbuilder_planning', 'string') || '/plan/') + `doc.calc_order/${this.ref}`;

    // сериализуем документ и характеристики
    const post_data = this._obj._clone();
    post_data.characteristics = {};

    // получаем объекты характеристик и подклеиваем их сериализацию к post_data
    this.load_production()
      .then((prod) => {
        for (const cx of prod) {
          post_data.characteristics[cx.ref] = cx._obj._clone();
        }
      })
      // выполняем запрос к сервису
      .then(() => {
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(
          wsql.get_user_param('user_name') + ':' + aes.Ctr.decrypt(wsql.get_user_param('user_pwd'))))));
        if(suffix){
          headers.append('suffix', suffix);
        }
        fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(post_data)
        })
          .then(response => response.json())
          // заполняем табчасть
          .then(json => {
            if (json.rows) {
              this.planning.load(json.rows)
            }
            else{
              console.log(json)
            }
          })
          .catch(err => {
            msg.show_msg({
              type: "alert-warning",
              text: err.message,
              title: "Сервис планирования"
            });
            $p.record_log(err);
          });
      });

  }

  /**
   * Выясняет, можно ли редактировать данный объект
   */
  get is_read_only() {
    const {obj_delivery_state, posted, _deleted} = this;
    const {Черновик, Шаблон, Отозван} = $p.enm.obj_delivery_states;
    let ro = false;
    // технолог может изменять шаблоны
    if(obj_delivery_state == Шаблон) {
      ro = !$p.current_user.role_available('ИзменениеТехнологическойНСИ');
    }
    // ведущий менеджер может изменять проведенные
    else if(posted || _deleted) {
      ro = !$p.current_user.role_available('СогласованиеРасчетовЗаказов');
    }
    else if(!obj_delivery_state.empty()) {
      ro = obj_delivery_state != Черновик && obj_delivery_state != Отозван;
    }
    return ro;
  }

  /**
   * Загружает в RAM данные характеристик продукций заказа
   * @return {Promise.<TResult>|*}
   */
  load_production(forse) {
    const prod = [];
    const {cat: {characteristics}, enm: {obj_delivery_states}} = $p;
    this.production.forEach(({nom, characteristic}) => {
      if(!characteristic.empty() && (forse || characteristic.is_new())) {
        prod.push(characteristic.ref);
      }
    });
    return characteristics.adapter.load_array(characteristics, prod, false,
        this.obj_delivery_state == obj_delivery_states.Шаблон && characteristics.adapter.local.templates)
      .then(() => {
        prod.length = 0;
        this.production.forEach(({nom, characteristic}) => {
          if(!characteristic.empty()) {
            if((!nom.is_procedure && !nom.is_accessory) || characteristic.specification.count() || characteristic.constructions.count() || characteristic.coordinates.count()){
              prod.push(characteristic);
            }
          }
        });
        return prod;
      });
  }

  /**
   * Обработчик события _ЗаписанаХарактеристикаПостроителя_
   * @param scheme
   * @param sattr
   */
  characteristic_saved(scheme, sattr) {
    const {ox, _dp} = scheme;
    const row = ox.calc_order_row;

    if(!row || ox.calc_order != this) {
      return;
    }

    //nom,characteristic,note,quantity,unit,qty,len,width,s,first_cost,marginality,price,discount_percent,discount_percent_internal,
    //discount,amount,margin,price_internal,amount_internal,vat_rate,vat_amount,ordn,changed

    row._data._loading = true;
    row.nom = ox.owner;
    row.note = _dp.note;
    row.quantity = _dp.quantity || 1;
    row.len = ox.x;
    row.width = ox.y;
    row.s = ox.s;
    row.discount_percent = _dp.discount_percent;
    row.discount_percent_internal = _dp.discount_percent_internal;
    if(row.unit.owner != row.nom) {
      row.unit = row.nom.storage_unit;
    }
    row._data._loading = false;
  }

  /**
   * Создаёт строку заказа с уникальной характеристикой
   * @param row_spec
   * @param elm
   * @param len_angl
   * @param params
   * @param create
   * @param grid
   * @return {Promise.<TResult>}
   */
  create_product_row({row_spec, elm, len_angl, params, create, grid}) {

    const row = row_spec instanceof $p.DpBuyers_orderProductionRow && !row_spec.characteristic.empty() && row_spec.characteristic.calc_order === this ?
      row_spec.characteristic.calc_order_row :
      this.production.add({
        qty: 1,
        quantity: 1,
        discount_percent_internal: $p.wsql.get_user_param('discount_percent_internal', 'number')
      });

    if(grid) {
      this.production.sync_grid(grid);
      grid.selectRowById(row.row);
    }

    if(!create) {
      return row;
    }

    // ищем объект продукции в RAM или берём из строки заказа
    const mgr = $p.cat.characteristics;
    let cx;
    function fill_cx(ox) {
      if(ox._deleted){
        return;
      }
      for (let ts in mgr.metadata().tabular_sections) {
        ox[ts].clear();
      }
      ox.leading_elm = 0;
      ox.leading_product = '';
      cx = Promise.resolve(ox);
      return false;
    }
    if(!row.characteristic.empty() && !row.characteristic._deleted){
      fill_cx(row.characteristic);
    }

    // если не нашли в RAM, создаём объект продукции, но из базы не читаем и пока не записываем
    return (cx || mgr.create({
      ref: $p.utils.generate_guid(),
      calc_order: this,
      product: row.row
    }, true))
      .then((ox) => {
        // если указана строка-генератор, заполняем реквизиты
        if(row_spec instanceof $p.DpBuyers_orderProductionRow) {

          if(params) {
            params.find_rows({elm: row_spec.row}, (prow) => {
              ox.params.add(prow, true).inset = row_spec.inset;
            });
          }

          elm.project = {ox};
          elm.fake_origin = row_spec.inset;

          ox.owner = row_spec.inset.nom(elm);
          ox.origin = row_spec.inset;
          ox.x = row_spec.len;
          ox.y = row_spec.height;
          ox.z = row_spec.depth;
          ox.s = row_spec.s || row_spec.len * row_spec.height / 1000000;
          ox.clr = row_spec.clr;
          ox.note = row_spec.note;

        }

        // устанавливаем свойства в строке заказа
        Object.assign(row._obj, {
          characteristic: ox.ref,
          nom: ox.owner.ref,
          unit: ox.owner.storage_unit.ref,
          len: ox.x,
          width: ox.y,
          s: ox.s,
          qty: (row_spec && row_spec.quantity) || 1,
          quantity: (row_spec && row_spec.quantity) || 1,
          note: ox.note,
        });

        ox.name = ox.prod_name();

        // записываем расчет, если не сделали этого ранее, чтобы не погибла ссылка на расчет в характеристике
        return this.is_new() && !$p.wsql.alasql.utils.isNode ? this.save().then(() => row) : row;
      });

  }

  /**
   * ### Создаёт продукции заказа по массиву строк и параметров
   * если в dp.production заполнены уникальные характеристики - перезаполняет их, а новые не создаёт
   * @method process_add_product_list
   * @param dp {DpBuyers_order} - экземпляр обработки с заполненными табличными частями
   */
  process_add_product_list(dp) {

    return new Promise(async (resolve, reject) => {

      const ax = [];

      for (let i = 0; i < dp.production.count(); i++) {
        const row_spec = dp.production.get(i);
        let row_prod;

        if(row_spec.inset.empty()) {
          row_prod = this.production.add(row_spec);
          row_prod.unit = row_prod.nom.storage_unit;
          if(!row_spec.clr.empty()) {
            // ищем цветовую характеристику
            $p.cat.characteristics.find_rows({owner: row_spec.nom}, (ox) => {
              if(ox.clr == row_spec.clr) {
                row_prod.characteristic = ox;
                return false;
              }
            });
          }
        }
        else {
          // рассчитываем спецификацию по текущей вставке
          const len_angl = new $p.DocCalc_order.FakeLenAngl(row_spec);
          const elm = new $p.DocCalc_order.FakeElm(row_spec);
          // создаём или получаем строку заказа с уникальной харктеристикой
          row_prod = await this.create_product_row({row_spec, elm, len_angl, params: dp.product_params, create: true});
          row_spec.inset.calculate_spec({elm, len_angl, ox: row_prod.characteristic});

          // сворачиваем
          row_prod.characteristic.specification.group_by('nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop', 'qty,totqty,totqty1');
        }

        // производим дополнительную корректировку спецификации и рассчитываем цены
        [].push.apply(ax, $p.spec_building.specification_adjustment({
          //scheme: scheme,
          calc_order_row: row_prod,
          spec: row_prod.characteristic.specification,
          save: true,
        }, true));

      }

      resolve(ax);

    });
  }

  /**
   * Пересчитывает все изделия заказа по тем же правилам, что и визуальная рисовалка
   * @param attr
   * @param editor
   */
  recalc(attr = {}, editor) {

    // при необходимости, создаём редактор
    const remove = !editor;
    if(remove) {
      editor = new $p.EditorInvisible();
    }
    const project = editor.create_scheme();
    let tmp = Promise.resolve();

    // получаем массив продукций в озу
    return this.load_production()
      .then((prod) => {
        // бежим по табчасти, если продукция, пересчитываем в рисовалке, если материал или paramrtric - пересчитываем строку
        this.production.forEach((row) => {
          const {characteristic} = row;
          if(characteristic.empty() || characteristic.calc_order !== this) {
            // это материал
            row.value_change('quantity', '', row.quantity);
          }
          else if(characteristic.coordinates.count()) {
            // это изделие рисовалки
            tmp = tmp.then(() => {
              return project.load(characteristic, true).then(() => {
                // выполняем пересчет
                project.save_coordinates({save: true, svg: false});
              });
            });
          }
          else if(characteristic.leading_product.calc_order === this) {
            return;
          }
          else {
            if(!characteristic.origin.empty() && !characteristic.origin.slave) {
              // это paramrtric
              characteristic.specification.clear();
              const len_angl = new $p.DocCalc_order.FakeLenAngl({len: row.len, inset: characteristic.origin});
              const elm = new $p.DocCalc_order.FakeElm(row);
              characteristic.origin.calculate_spec({elm, len_angl, ox: characteristic});
              tmp = tmp.then(() => {
                return characteristic.save().then(() => {
                  // выполняем пересчет
                  row.value_change('quantity', '', row.quantity);
                });
              });
            }
            else {
              row.value_change('quantity', '', row.quantity);
            }
          }
        });
        return tmp;
      })
      .then(() => {
        project.ox = '';
        if(remove) {
          editor.unload();
        }
        else {
          project.remove();
        }
        return this;
      });

  }

  /**
   * Рисует изделия или фрагмент изделий заказа в Buffer в соответствии с параметрами attr
   * @param attr
   * @param editor
   */
  draw(attr = {}, editor) {

    // при необходимости, создаём редактор
    const remove = !editor;
    if(remove) {
      editor = new $p.EditorInvisible();
    }
    const project = editor.create_scheme();

    attr.res = {number_doc: this.number_doc};

    let tmp = Promise.resolve();

    // получаем массив продукций в озу
    return this.load_production()
      .then((prod) => {
        for(let ox of prod){
          if(ox.coordinates.count()) {
            tmp = tmp.then(() => ox.draw(attr, editor));
          }
        }
        return tmp;
      });

  }

  /**
   * Устанавливает подразделение по умолчанию
   */
  static set_department() {
    const department = $p.wsql.get_user_param('current_department');
    if(department) {
      this.department = department;
    }
    const {current_user, cat} = $p;
    if(this.department.empty() || this.department.is_new()) {
      current_user.acl_objs && current_user.acl_objs.find_rows({by_default: true, type: cat.divisions.class_name}, (row) => {
        if(this.department != row.acl_obj) {
          this.department = row.acl_obj;
        }
        return false;
      });
    }
  }

};

$p.DocCalc_order.FakeElm = class FakeElm {

  constructor(row_spec) {
    this.row_spec = row_spec;
  }

  get elm() {
    return 0;
  }

  get angle_hor() {
    return 0;
  }

  get _row() {
    return this;
  }

  get clr() {
    return this.row_spec.clr;
  }

  get len() {
    return this.row_spec.len;
  }

  get height() {
    const {height, width} = this.row_spec;
    return height === undefined ? width : height;
  }

  get depth() {
    return this.row_spec.depth || 0;
  }

  get s() {
    return this.row_spec.s;
  }

  get perimeter() {
    const {len, height, width} = this.row_spec;
    return [{len, angle: 0}, {len: height === undefined ? width : height, angle: 90}];
  }

  get x1() {
    return 0;
  }

  get y1() {
    return 0;
  }

  get x2() {
    return this.height;
  }

  get y2() {
    return this.len;
  }

}

$p.DocCalc_order.FakeLenAngl = class FakeLenAngl {

  constructor({len, inset}) {
    this.len = len;
    this.origin = inset;
  }

  get angle() {
    return 0;
  }

  get alp1() {
    return 0;
  }

  get alp2() {
    return 0;
  }

  get cnstr() {
    return 0;
  }

}

// свойства и методы табчасти продукции
$p.DocCalc_orderProductionRow = class DocCalc_orderProductionRow extends $p.DocCalc_orderProductionRow {

  // при изменении реквизита
  value_change(field, type, value, no_extra_charge) {

    let {_obj, _owner, nom, characteristic, unit} = this;
    let recalc;
    const {rounding, _slave_recalc} = _owner._owner;
    const rfield = $p.DocCalc_orderProductionRow.rfields[field];

    if(rfield) {

      _obj[field] = rfield === 'n' ? parseFloat(value) : '' + value;

      nom = this.nom;
      characteristic = this.characteristic;

      // проверим владельца характеристики
      if(!characteristic.empty()) {
        if(!characteristic.calc_order.empty() && characteristic.owner != nom) {
          characteristic.owner = nom;
        }
        else if(characteristic.owner != nom) {
          _obj.characteristic = $p.utils.blank.guid;
          characteristic = this.characteristic;
        }
      }

      // проверим единицу измерения
      if(unit.owner != nom) {
        _obj.unit = nom.storage_unit.ref;
      }

      // если это следящая вставка, рассчитаем спецификацию
      if(!characteristic.origin.empty() && characteristic.origin.slave) {
        characteristic.specification.clear();
        characteristic.x = this.len;
        characteristic.y = this.width;
        characteristic.s = this.s || this.len * this.width / 1000000;
        const len_angl = new $p.DocCalc_order.FakeLenAngl({len: this.len, inset: characteristic.origin});
        const elm = new $p.DocCalc_order.FakeElm(this);
        characteristic.origin.calculate_spec({elm, len_angl, ox: characteristic});
        recalc = true;
      }

      // рассчитаем цены
      const fake_prm = {
        calc_order_row: this,
        spec: characteristic.specification
      };
      const {price} = _obj;
      $p.pricing.price_type(fake_prm);
      $p.pricing.calc_first_cost(fake_prm);
      $p.pricing.calc_amount(fake_prm);
      if(price && !_obj.price) {
        _obj.price = price;
        recalc = true;
      }
    }

    if($p.DocCalc_orderProductionRow.pfields.indexOf(field) != -1 || recalc) {

      if(!recalc) {
        _obj[field] = parseFloat(value);
      }

      isNaN(_obj.price) && (_obj.price = 0);
      isNaN(_obj.price_internal) && (_obj.price_internal = 0);
      isNaN(_obj.discount_percent) && (_obj.discount_percent = 0);
      isNaN(_obj.discount_percent_internal) && (_obj.discount_percent_internal = 0);

      _obj.amount = (_obj.price * ((100 - _obj.discount_percent) / 100) * _obj.quantity).round(rounding);

      // если есть внешняя цена дилера, получим текущую дилерскую наценку
      if(!no_extra_charge) {
        const prm = {calc_order_row: this};
        let extra_charge = $p.wsql.get_user_param('surcharge_internal', 'number');

        // если пересчет выполняется менеджером, используем наценку по умолчанию
        if(!$p.current_user.partners_uids.length || !extra_charge) {
          $p.pricing.price_type(prm);
          extra_charge = prm.price_type.extra_charge_external;
        }

        if(field != 'price_internal' && extra_charge && _obj.price) {
          _obj.price_internal = (_obj.price * (100 - _obj.discount_percent) / 100 * (100 + extra_charge) / 100).round(rounding);
        }
      }

      _obj.amount_internal = (_obj.price_internal * ((100 - _obj.discount_percent_internal) / 100) * _obj.quantity).round(rounding);

      // ставка и сумма НДС
      const doc = _owner._owner;
      if(doc.vat_consider) {
        const {НДС18, НДС18_118, НДС10, НДС10_110, НДС20, НДС20_120, НДС0, БезНДС} = $p.enm.vat_rates;
        _obj.vat_rate = (nom.vat_rate.empty() ? НДС18 : nom.vat_rate).ref;
        switch (this.vat_rate) {
        case НДС18:
        case НДС18_118:
          _obj.vat_amount = (_obj.amount * 18 / 118).round(2);
          break;
        case НДС10:
        case НДС10_110:
          _obj.vat_amount = (_obj.amount * 10 / 110).round(2);
          break;
        case НДС20:
        case НДС20_120:
          _obj.vat_amount = (_obj.amount * 20 / 120).round(2);
          break;
        case НДС0:
        case БезНДС:
        case '_':
        case '':
          _obj.vat_amount = 0;
          break;
        }
        if(!doc.vat_included) {
          _obj.amount = (_obj.amount + _obj.vat_amount).round(2);
        }
      }
      else {
        _obj.vat_rate = '';
        _obj.vat_amount = 0;
      }

      const amount = _owner.aggregate([], ['amount', 'amount_internal']);
      amount.doc_amount = amount.amount.round(rounding);
      amount.amount_internal = amount.amount_internal.round(rounding);
      delete amount.amount;
      Object.assign(doc, amount);
      doc._manager.emit_async('update', doc, amount);

      // пересчитываем спецификации и цены в следящих вставках
      if(!_slave_recalc){
        _owner._owner._slave_recalc = true;
        _owner.forEach((row) => {
          if(row !== this && !row.characteristic.origin.empty() && row.characteristic.origin.slave) {
            row.value_change('quantity', 'update', row.quantity, no_extra_charge);
          }
        });
        _owner._owner._slave_recalc = false;
      }

      // TODO: учесть валюту документа, которая может отличаться от валюты упр. учета и решить вопрос с amount_operation

      return false;
    }
  }

};

$p.DocCalc_orderProductionRow.rfields = {
  nom: 's',
  characteristic: 's',
  quantity: 'n',
  len: 'n',
  width: 'n',
  s: 'n',
};

$p.DocCalc_orderProductionRow.pfields = 'price_internal,quantity,discount_percent_internal';
