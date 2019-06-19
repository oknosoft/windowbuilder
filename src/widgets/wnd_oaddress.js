/**
 * Поле ввода адреса связанная с ним форма ввода адреса
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module  wnd_oaddress
 */

class WndAddressData {

  constructor(owner){
    this.owner = owner;
    this.country = "Россия";
    this.region = "";
    this.city = "";
    this.street =	"";
    this.postal_code = "";
    this.marker = null;
    this.poly_area = null;
    this.poly_direction = null;
    this.flat = "";

    this._house = "";
    this._housing = "";

    // если координаты есть в Расчете, используем их
    const {coordinates} = this;
    this.latitude = coordinates.length ? coordinates[0] : 0;
    this.longitude = coordinates.length ? coordinates[1] : 0;
  }

  get delivery_area() {
    return this.owner.obj.delivery_area;
  }
  set delivery_area(v) {
    this.owner.pgrid_on_select(v);
  }

  get house() {
    return this._house + (this._housing ? " " + this._housing : "");
  }
  set house(v) {
    this._house = v;
  }

  get coordinates() {
    const {coordinates} = this.owner.obj;
    return coordinates ? JSON.parse(coordinates) : []
  }

  init_map(map, position) {
    const {maps} = window.google || {};
    if(maps) {
      this.marker = new maps.Marker({
        map,
        draggable: true,
        animation: maps.Animation.DROP,
        position
      });
      this.poly_area = new maps.Polygon(
        {
          map,
          strokeColor     : '#aaff80',
          strokeOpacity   : 0.35,
          strokeWeight    : 1,
          fillColor       : "#ccffaa",
          fillOpacity     : 0.2,
          geodesic        : true
        });
      this.poly_direction = new maps.Polygon(
        {
          map,
          strokeColor     : '#aa80ff',
          strokeOpacity   : 0.4,
          strokeWeight    : 1,
          fillColor       : "#ccaaff",
          fillOpacity     : 0.2,
          geodesic        : true
        });
      this.refresh_coordinates();
      this._marker_toggle_bounce = maps.event.addListener(this.marker, 'click', this.marker_toggle_bounce.bind(this));
      this._marker_dragend = maps.event.addListener(this.marker, 'dragend', this.marker_dragend.bind(this));
    }
  }

  ulisten() {
    const {maps} = window.google || {};
    if(maps) {
      maps.event.removeListener(this._marker_toggle_bounce);
      maps.event.removeListener(this._marker_dragend);
    }
  }

  /**
   * Сворачивает все поля адреса в строку
   * @return {string}
   */
  assemble_addr(with_flat){
    const {country, region, city, street, postal_code, house, flat} = this;
    return (street ? (street.replace(/,/g," ") + ", ") : "") +
      (house ? (house + ", ") : "") +
      (with_flat && flat ? (flat + ", ") : "") +
      (city ? (city + ", ") : "") +
      (region ? (region + ", ") : "") + country +
      (postal_code ? (", " + postal_code) : "");
  }

  /**
   * Устанавливает поля адреса в документе
   */
  assemble_address_fields(without_flat){

    const {fias} = WndAddressData;
    const {obj} = this.owner;
    const v = this;

    obj.shipping_address = this.assemble_addr(!without_flat);

    let fields = '<КонтактнаяИнформация  \
				xmlns="http://www.v8.1c.ru/ssl/contactinfo" \
				xmlns:xs="http://www.w3.org/2001/XMLSchema" \
				xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"   \
				Представление="%1">   \
					<Комментарий/>  \
					<Состав xsi:type="Адрес" Страна="РОССИЯ">   \
						<Состав xsi:type="АдресРФ">'.replace('%1', obj.shipping_address);

    if(v.region){
      fields += '\n<СубъектРФ>' + v.region + '</СубъектРФ>';
    }

    if(v.city){
      if(v.city.indexOf('г.') != -1 || v.city.indexOf('г ') != -1 || v.city.indexOf(' г') != -1)
        fields += '\n<Город>' + v.city + '</Город>';
      else
        fields += '\n<НаселПункт>' + v.city + '</НаселПункт>';
    }

    if(v.street){
      fields += '\n<Улица>' + (v.street.replace(/,/g," ")) + '</Улица>';
    }

    let suffix, index, house_type, flat_type;

    let house = v.house;
    if(house){
      // отделяем улицу от дома, корпуса и квартиры
      for(let i in fias){
        if(fias[i].type == 1){
          for(let syn of fias[i].syn){
            if((index = house.indexOf(syn.trimLeft())) != -1){
              house_type = i;
              house = house.substr(index + syn.trimLeft().length).trim();
              break;
            }
          }
          if(house_type)
            break;
        }
      }
      if(!house_type){
        house_type = "1010";
        if((index = house.indexOf(" ")) != -1){
          house = house.substr(index);
        }
      }
      fields += '\n<ДопАдрЭл><Номер Тип="' + house_type +  '" Значение="' + house.trim() + '"/></ДопАдрЭл>';
    }

    // квартира и тип квартиры (офиса)
    let flat = v.flat;
    if(flat){
      for(let i in fias){
        if(fias[i].type == 3){
          for(let syn of fias[i].syn){
            if((index = flat.indexOf(syn)) != -1){
              flat_type = i;
              flat = flat.substr(index + syn.length);
              break;
            }
          }
          if(flat_type)
            break;
        }
      }
      if(!flat_type){
        flat_type = "2010";
        if((index = flat.indexOf(" ")) != -1){
          flat = flat.substr(index);
        }
      }
      fields += '\n<ДопАдрЭл><Номер Тип="' + flat_type +  '" Значение="' + flat.trim() + '"/></ДопАдрЭл>';
    }

    if(v.postal_code)
      fields += '<ДопАдрЭл ТипАдрЭл="10100000" Значение="' + v.postal_code + '"/>';

    fields += '</Состав> \
					</Состав></КонтактнаяИнформация>';

    obj.address_fields = fields;
  }

  /**
   * обновляет текст координат и полигоны
   * @param [wnd]
   * @param [latitude]
   * @param [longitude]
   */
  refresh_coordinates(latitude, longitude){
    const v = this;
    const {wnd} = this.owner;
    if(latitude && longitude) {
      v.latitude = latitude;
      v.longitude = longitude;
    }
    // если форма уже существует
    if(wnd && wnd.elmnts && wnd.elmnts.map) {
      v.latitude && wnd.elmnts.toolbar.setValue('coordinates', `${v.latitude.toFixed(8)} ${v.longitude.toFixed(8)}`);
      // перерисовывает полигоны
      const {delivery_area, poly_area, poly_direction} = v;
      const {LatLng} = google.maps;
      for(const poly of [poly_area, poly_direction]) {
        poly.getPath().clear();
      }
      if(delivery_area.coordinates.count() > 2) {
        poly_area.setPath(delivery_area.coordinates._obj.map((v) => new LatLng(v.latitude, v.longitude)));
      }
      $p.cat.delivery_directions.forEach(({composition, coordinates}) => {
        if(composition.find({elm: delivery_area})) {
          poly_direction.setPath(coordinates._obj.map((v) => new LatLng(v.latitude, v.longitude)));
          return false;
        }
      });
    }
  }

  /**
   * Заполняет структуру адреса v по данным полей адреса документа
   * @return {Promise.<TResult>}
   */
  process_address_fields(){

    const v = this;
    const {obj} = this.owner;
    const {ipinfo, msg} = $p;
    const {fias} = WndAddressData;


    if(obj.address_fields){
      v.xml = ( new DOMParser() ).parseFromString(obj.address_fields, "text/xml");
      let tmp = {}, res = {}, tattr,
        nss = "СубъектРФ,Округ,СвРайМО,СвРайМО,ВнутригРайон,НаселПункт,Улица,Город,ДопАдрЭл,Адрес_по_документу,Местоположение".split(",");

      function get_aatributes(ca){
        if(ca.attributes && ca.attributes.length == 2){
          return {[ca.attributes[0].value]: ca.attributes[1].value};
        }
      }

      for(let i in nss){
        tmp[nss[i]] = v.xml.getElementsByTagName(nss[i]);
      }
      for(let i in tmp){
        for(let j in tmp[i]){
          if(j == "length" || !tmp[i].hasOwnProperty(j))
            continue;
          if(tattr = get_aatributes(tmp[i][j])){
            if(!res[i])
              res[i] = [];
            res[i].push(tattr);
          }
          else if(tmp[i][j].childNodes.length){
            for(let k in tmp[i][j].childNodes){
              if(k == "length" || !tmp[i][j].childNodes.hasOwnProperty(k))
                continue;
              if(tattr = get_aatributes(tmp[i][j].childNodes[k])){
                if(!res[i])
                  res[i] = [];
                res[i].push(tattr);
              }else if(tmp[i][j].childNodes[k].nodeValue){
                if(!res[i])
                  res[i] = tmp[i][j].childNodes[k].nodeValue;
                else
                  res[i] += " " + tmp[i][j].childNodes[k].nodeValue;
              }
            }
          }
        }
      }
      for(let i in res["ДопАдрЭл"]){
        for(let j in fias){
          if(j.length != 4)
            continue;
          if(res["ДопАдрЭл"][i][j])
            if(fias[j].type == 1){
              v._house = fias[j].name + " " + res["ДопАдрЭл"][i][j];
            }
            else if(fias[j].type == 2){
              v._housing = fias[j].name + " " + res["ДопАдрЭл"][i][j];
            }
            else if(fias[j].type == 3){
              v.flat = fias[j].name + " " + res["ДопАдрЭл"][i][j];
            }
        }

        if(res["ДопАдрЭл"][i]["10100000"])
          v.postal_code = res["ДопАдрЭл"][i]["10100000"];
      }

      v.address_fields = res;

      //
      v.region = res["СубъектРФ"] || res["Округ"] || "";
      v.city = res["Город"] || res["НаселПункт"] || "";
      v.street = (res["Улица"] || "");
    }

    return ipinfo.google_ready()
      .then(() => {

        // если есть координаты $p.ipinfo, используем их, иначе - Москва
        if(!v.latitude || !v.longitude){
          // если координаты есть в Расчете, используем их
          if(obj.shipping_address){
            // если есть строка адреса, пытаемся геокодировать
            ipinfo.ggeocoder.geocode({address: v.assemble_addr()}, (results, status) => {
              if (status == google.maps.GeocoderStatus.OK) {
                const {location} = results[0].geometry;
                v.refresh_coordinates(location.lat(), location.lng());
              }
            });
          }
          else if(ipinfo.latitude && ipinfo.longitude ){
            v.refresh_coordinates(ipinfo.latitude, ipinfo.longitude);
          }
          else{
            v.latitude = 55.635924;
            v.longitude = 37.6066379;
            msg.show_msg(msg.empty_geocoding);
          }
        }
      });
  }

  /**
   * Parse a string containing a latitude, longitude pair and return them as an object.
   * @function toLatLng
   * @param {String} Str
   * @return {{lat: Number, lng: Number}}
   */
  assemble_lat_lng(str) {
    //simple coordinates
    const simpleMatches = [];
    simpleMatches[0] = /^\s*?(-?[0-9]+\.?[0-9]+?)\s*\,\s*(-?[0-9]+\.?[0-9]+?)\s*$/.exec(str);
    simpleMatches[2] = /^\s*?(-?[0-9]+[,.]?[0-9]+?)\s*;?\s*(-?[0-9]+[,.]?[0-9]+?)\s*$/.exec(str);
    const simpleMatch = simpleMatches.find(match => match && match.length === 3);
    //complex coordinates
    const otherMatches = [];
    otherMatches[0] = /^\s*([0-9]+)°([0-9]+)'([0-9.,]*)"?\s*[NS]\s*([0-9]+)°([0-9]+)'([0-9.,]*)"?\s*[WE]\s*$/.exec(str);
    otherMatches[1] = /^\s*[NS]\s*([0-9]+)°([0-9]+)'([0-9.,]*)"?\s*[EW]\s*([0-9]+)°([0-9]+)'([0-9.,]*)"?\s*$/.exec(str);
    const otherMatch = otherMatches.find(match => match && match.length === 7);
    if (simpleMatch) {
      const lat = parseFloat(simpleMatch[1].replace(',', '.'));
      const lng = parseFloat(simpleMatch[2].replace(',', '.'));

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }

    } else if (otherMatch) {
      const latDeg = parseFloat(otherMatch[1]);
      const latMin = parseFloat(otherMatch[2]);
      const latSec = parseFloat(otherMatch[3].replace(',', '.'));
      const lngDeg = parseFloat(otherMatch[4]);
      const lngMin = parseFloat(otherMatch[5]);
      const lngSec = parseFloat(otherMatch[6].replace(',', '.'));

      const lat = (latDeg + latMin / 60 + latSec / 3600) * (str.indexOf('S') !== -1 ? -1 : 1);
      const lng = (lngDeg + lngMin / 60 + lngSec / 3600) * (str.indexOf('W') !== -1 ? -1 : 1);

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

  }

  marker_toggle_bounce() {
    if (this.marker.getAnimation() != null) {
      this.marker.setAnimation(null);
    }
    else {
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => this.marker.setAnimation(null), 1500);
    }
  }

  marker_dragend(e) {
    $p.ipinfo.ggeocoder.geocode({'latLng': e.latLng}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        const v = this;
        const {wnd} = this.owner;
        if (results[0]) {
          const addr = results[0];
          wnd.setText(addr.formatted_address);
          $p.ipinfo.components(v, addr.address_components);
          v.refresh_coordinates(e.latLng.lat(), e.latLng.lng());

          this.owner.refresh_grid && this.owner.refresh_grid();

          const zoom = v.street ? 15 : 12;
          if(wnd.elmnts.map.getZoom() != zoom){
            wnd.elmnts.map.setZoom(zoom);
            wnd.elmnts.map.setCenter(e.latLng);
          }

        }
      }
    });
  }

}

/**
 *  Окно ввода адреса
 */
class WndAddress {

  constructor(source) {
    this.obj = source.obj;
    this.pwnd = source.pwnd;
    this.grid = source.grid;
    // реквизиты формы
    this.v = new WndAddressData(this);
    this.v.process_address_fields()
      .then(() => this.frm_create());
  }

  /**
   * ПриСозданииНаСервере
   */
  frm_create() {

    const {obj, pwnd, v} = this;

    // параметры открытия формы
    const options = {
      name: 'wnd_addr',
      wnd: {
        id: 'wnd_addr',
        width: 800,
        height: 560,
        modal: true,
        center: true,
        pwnd: pwnd,
        allow_close: true,
        allow_minmax: true,
        on_close: this.frm_close.bind(this),
        caption: obj.shipping_address || 'Адрес доставки'
      }
    };

    // уменьшаем высоту, в случае малого фрейма
    if (pwnd && pwnd.getHeight) {
      if (options.wnd.height > pwnd.getHeight())
        options.wnd.height = pwnd.getHeight();
    }

    const wnd = this.wnd = $p.iface.dat_blank(null, options.wnd);
    const {elmnts} = wnd;

    //TODO: компактная кнопка выбора в заголовке формы
    // wnd.cell.parentElement.querySelector(".dhxwin_text")

    elmnts.layout = wnd.attachLayout('3U');
    elmnts.cell_frm1 = elmnts.layout.cells('a');
    elmnts.cell_frm1.setHeight('52');
    elmnts.cell_frm1.hideHeader();
    elmnts.cell_frm1.fixSize(0, 1);

    // TODO: переделать на OHeadFields
    elmnts.pgrid = elmnts.cell_frm1.attachPropertyGrid();
    elmnts.pgrid.init();
    elmnts.pgrid.parse(obj._manager.get_property_grid_xml({
      " ": [
        {id: "city", path: "o.city", synonym: "Насел. пункт", type: "ed", txt: v.city},
        {id: "street", path: "o.street", synonym: "Улица", type: "ed", txt: v.street}
      ]
    }, v), () => {
      elmnts.pgrid.enableAutoHeight(true);
      elmnts.pgrid.setInitWidthsP("40,60");
      elmnts.pgrid.setSizes();
      elmnts.pgrid.attachEvent("onPropertyChanged", (pname, new_value, old_value) => {
        this.pgrid_on_changed(elmnts.pgrid.getSelectedRowId(), new_value, old_value)
      });
    }, "xml");

    elmnts.cell_frm2 = elmnts.layout.cells('b');
    elmnts.cell_frm2.hideHeader();
    elmnts.pgrid2 = elmnts.cell_frm2.attachPropertyGrid();
    elmnts.pgrid2.init();
    elmnts.pgrid2.parse(obj._manager.get_property_grid_xml({
      " ": [
        {id: "house", path: "o.house", synonym: "Дом, корп., лит.", type: "ed", txt: v.house},
        {id: "flat", path: "o.flat", synonym: "Кварт., оф.", type: "ed", txt: v.flat}
      ]
    }, v), () => {
      elmnts.pgrid2.enableAutoHeight(true);
      elmnts.pgrid2.setInitWidthsP("40,60");
      elmnts.pgrid2.setSizes();
      elmnts.pgrid2.attachEvent("onPropertyChanged", (pname, new_value, old_value) => {
        this.pgrid_on_changed(elmnts.pgrid2.getSelectedRowId(), new_value, old_value)
      });
    }, "xml");


    // начинаем следить за объектом и, его табчастью допреквизитов
    this.listener = this.listener.bind(this);
    obj._manager.on('update', this.listener);

    elmnts.pgrid.get_cell_field = () => {
      return {
        obj: v,
        field: "delivery_area",
        on_select: this.pgrid_on_select.bind(this),
        pwnd: wnd,
        metadata: {
          "synonym": "Район",
          "tooltip": "Район (зона, направление) доставки для группировки при планировании и оптимизации маршрута геокодером",
          "choice_groups_elm": "elm",
          "type": {
            "types": [
              "cat.delivery_areas"
            ],
            "is_ref": true
          }
        }
      };
    };

    const toolbar_click = this.toolbar_click.bind(this);
    elmnts.toolbar = wnd.attachToolbar({icons_path: dhtmlx.image_path + 'dhxtoolbar' + dhtmlx.skin_suffix()});
    elmnts.toolbar.loadStruct('<toolbar><item id="btn_select" type="button" title="Установить адрес" text="&lt;b&gt;Выбрать&lt;/b&gt;" /><item type="separator"  id="sep1"	/></toolbar>', function(){

      this.attachEvent('onclick', toolbar_click);

      const delivery_area_id = `txt_${dhx4.newId()}`;
      this.addText(delivery_area_id);
      this.addSeparator('sep2');
      this.addText('txt_region');

      const txt_div = this.objPull[this.idPrefix + delivery_area_id].obj;
      const delivery_area = new $p.iface.OCombo({
        parent: txt_div,
        obj: obj,
        field: 'delivery_area',
        width: 200,
        hide_frm: true,
      });
      txt_div.style.border = '1px solid #ccc';
      txt_div.style.borderRadius = '3px';
      txt_div.style.padding = '3px 2px 1px 2px';
      txt_div.style.margin = '1px 5px 1px 1px';
      delivery_area.DOMelem_input.placeholder = 'Район доставки';

      this.addInput('coordinates');
      this.setWidth('coordinates', 210);
      this.cont.querySelector('.dhxtoolbar_float_left').style.width = '100%';
      const coordinates = this.getInput('coordinates');
      coordinates.parentElement.style.float = 'right';
      coordinates.placeholder = 'Координаты';

      this.setItemText('txt_region', v.region);

    });

    elmnts.toolbar.attachEvent("onEnter", (id, value) => {
      if(id === 'coordinates') {
        const {v, wnd} = this;
        const coordinates = v.assemble_lat_lng(value);
        if(coordinates) {
          const latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
          wnd.elmnts.map.setCenter(latLng);
          v.marker.setPosition(latLng);
          v.marker_dragend({latLng});
        }
      }
    });

    elmnts.cell_map = elmnts.layout.cells('c');
    elmnts.cell_map.hideHeader();

    // если координаты есть в Расчете, используем их
    // если есть строка адреса, пытаемся геокодировать
    // если есть координаты $p.ipinfo, используем их
    // иначе - Москва
    const {maps} = google;
    const mapParams = {
      center: new maps.LatLng(v.latitude, v.longitude),
      zoom: v.street ? 14 : 11,
      mapTypeId: maps.MapTypeId.ROADMAP
    };
    elmnts.map = elmnts.cell_map.attachMap(mapParams);
    v.init_map(elmnts.map, mapParams.center);

    this.refresh_grid();
  }

  /**
   *	Обработчик выбора значения в свойствах (ссылочные типы)
   */
  pgrid_on_select(selv){
    if(selv===undefined){
      return;
    }
    obj.delivery_area = selv;
    this.delivery_area_changed();
  }

  /**
   *	Обработчик команд формы
   */
  toolbar_click(btn_id){
    if(btn_id=="btn_select"){
      const {obj, v, wnd} = this;
      const {elmnts: {pgrid, pgrid2}} = wnd;
      pgrid && pgrid.editStop();
      pgrid2 && pgrid2.editStop();
      v.assemble_address_fields();
      obj.coordinates = JSON.stringify([v.latitude, v.longitude]);
      wnd.close();
    }
  }

  listener(_obj, fields) {
    const {obj, v, wnd, listener} = this;
    const names = ['delivery_area','city','street','house','flat']
    if (obj == _obj) {
      for(let name of names){
        fields.hasOwnProperty(name) && this.pgrid_on_changed(name, v[name], fields[name]);
      }
    }
  }

  delivery_area_changed(){

    const {v, wnd} = this;
    const {delivery_area} = v;

    // получим город и район из "района доставки"
    if(!delivery_area.empty()){
      v.street = "";
    }

    if(delivery_area.region){
      v.region = delivery_area.region;
    }
    else {
      v.region = "";
    }
    wnd.elmnts.toolbar.setItemText('txt_region', v.region);

    if(delivery_area.city){
      v.city = delivery_area.city;
      wnd.elmnts.pgrid.cells("city", 1).setValue(v.city);
    }
    else{
      v.city = "";
    }

    if(delivery_area.latitude && delivery_area.longitude){
      const LatLng = new google.maps.LatLng(delivery_area.latitude, delivery_area.longitude);
      wnd.elmnts.map.setCenter(LatLng);
      v.marker.setPosition(LatLng);
      v.refresh_coordinates(delivery_area.latitude, delivery_area.longitude)
    }

    this.refresh_grid();
  }

  // перерисовывает табчасть
  refresh_grid(){
    const {pgrid, pgrid2} = this.wnd.elmnts;
    const {region, city, street, house, flat} = this.v;
    pgrid.cells("city", 1).setValue(city);
    pgrid.cells("street", 1).setValue(street);
    pgrid2.cells("house", 1).setValue(house);
    pgrid2.cells("flat", 1).setValue(flat);
  }

  addr_changed() {
    const {v, wnd} = this;
    const zoom = v.street ? 15 : 12;

    if(wnd.elmnts.map.getZoom() != zoom){
      wnd.elmnts.map.setZoom(zoom);
    }

    $p.ipinfo.ggeocoder.geocode({address: v.assemble_addr()}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        const loc = results[0].geometry.location;
        wnd.elmnts.map.setCenter(loc);
        v.marker.setPosition(loc);
        v.postal_code = $p.ipinfo.components({}, results[0].address_components).postal_code || "";
        v.refresh_coordinates(loc.lat(), loc.lng());
      }
    });
  }

  pgrid_on_changed(pname, new_value, old_value){
    const {v, wnd} = this;
    if(pname){
      if(v.delivery_area.empty()){
        new_value = old_value;
        $p.msg.show_msg({
          type: "alert",
          text: $p.msg.delivery_area_empty,
          title: $p.msg.addr_title});
        setTimeout(() => wnd.elmnts.pgrid.selectRowById("delivery_area"), 50);
      }
      else if(pname == "delivery_area"){
        this.delivery_area_changed();
      }
      else{
        v[pname] = new_value;
        this.addr_changed();
      }
    }
  }

  frm_close(win){
    const {grid, obj, listener, v} = this;
    grid && grid.editStop();
    obj && obj._manager.off('update', listener);
    v.ulisten();
    return !win.error;
  }

}

/**
 *  строки ФИАС адресного классификатора
 */
WndAddressData.fias = {
  types: ["владение", "здание", "помещение"],

  // Код, Наименование, Тип, Порядок, КодФИАС
  "1010": {name: "дом",			type: 1, order: 1, fid: 2, syn: [" д.", " д ", " дом"]},
  "1020": {name: "владение",		type: 1, order: 2, fid: 1, syn: [" вл.", " вл ", " влад.", " влад ", " владен.", " владен ", " владение"]},
  "1030": {name: "домовладение",	type: 1, order: 3, fid: 3, syn: [" домовлад"]},

  "1050": {name: "корпус",		type: 2, order: 1, syn: [" к.", " к ", " корп.", " корп ", "корпус"]},
  "1060": {name: "строение",	type: 2, order: 2, fid: 1, syn: [" стр.", " стр ", " строен.", " строен ", "строение"]},
  "1080": {name: "литера",		type: 2, order: 3, fid: 3, syn: [" л.", " л ", " лит.", " лит ", "литера"]},
  "1070": {name: "сооружение",	type: 2, order: 4, fid: 2, syn: [" соор.", " соор ", " сооруж.", " сооруж ", "сооружение"]},
  "1040": {name: "участок",	type: 2, order: 5, syn: [" уч.", " уч ", "участок"]},

  "2010": {name: "квартира",	type: 3, order: 1, syn: ["кв.", "кв ", "кварт.", "кварт ", "квартира", "-"]},
  "2030": {name: "офис",		type: 3, order: 2, syn: ["оф.", "оф ", "офис", "-"]},
  "2040": {name: "бокс",		type: 3, order: 3, syn: ["бокс", "бкс"]},
  "2020": {name: "помещение",	type: 3, order: 4, syn: ["помещение", "пом", "помещ"]},
  "2050": {name: "комната",	type: 3, order: 5, syn: ["комн.", "комн ", "комната"]},

  // Уточняющие объекты
  "10100000": {name: "Почтовый индекс"},
  "10200000": {name: "Адресная точка"},
  "10300000": {name: "Садовое товарищество"},
  "10400000": {name: "Элемент улично-дорожной сети, планировочной структуры дополнительного адресного элемента"},
  "10500000": {name: "Промышленная зона"},
  "10600000": {name: "Гаражно-строительный кооператив"},
  "10700000": {name: "Территория"},

}

/**
 * Конструктор структуры адреса
 * @type {WndAddressData}
 */
$p.classes.WndAddressData = WndAddressData;

/**
 *  Конструктор поля ввода адреса
 */
class eXcell_addr extends eXcell {

  constructor(cell) {

    if (!cell){
      return;
    }

    super(cell);

    this.cell = cell;
    this.open_selection = this.open_selection.bind(this);
    this.edit = eXcell_addr.prototype.edit.bind(this);
    this.detach = eXcell_addr.prototype.detach.bind(this);

  }

  get grid() {
    return this.cell.parentNode.grid
  }

  ti_keydown(e) {
    const {code, ctrlKey} = e;
    if(e.code === 'Backspace' || e.code === 'Delete'){          // по {del} и {bs} очищаем значение
      const {obj} = this.grid.get_cell_field();
      obj.shipping_address = '';
      obj.address_fields = '';
      this.grid.editStop();
      return $p.iface.cancel_bubble(e);
    }
    // по {F4} открываем форму списка
    else if(code === 'F4' || code === 'F2' || (ctrlKey && code === 'KeyF')) {
      return this.open_selection(e);
    }

    return eXcell_ocombo.prototype.input_keydown(e, this);
  }

  open_selection(e) {
    const v = this.grid.get_cell_field();
    const {iface, job_prm: {builder}, enm: {geo_map_kind}} = $p;

    if(v && v.field) {
      switch(builder.geo_map) {
      case undefined:
      case 'dhtmlx_google':
        new WndAddress({grid: this.grid}._mixin(v));
        break;
      case 'react_google':
        this.grid.xcell_action && this.grid.xcell_action('AddrDadataGoogle', v.field);
      }
    }

    return iface.cancel_bubble(e);
  }


  /**
   * Устанавливает текст в ячейке. например, this.setCValue("<input type='button' value='"+val+"'>",val);
   */
  setValue(val) {
    this.setCValue(val);
  }

  /**
   * Получает значение ячейки из табличной части или поля объекта или допполя допобъекта, а не из грида
   */
  getValue() {
    return this.grid.get_cell_value();
  }

  /**
   * Создаёт элементы управления редактора и назначает им обработчики
   */
  edit() {

    this.val = this.getValue();		//save current value
    this.cell.innerHTML = '<div class="ref_div21"><input type="text" class="dhx_combo_edit" style="height: 20px;"><div class="ref_field21">&nbsp;</div></div>';

    const td = this.cell.firstChild;
    const ti = td.childNodes[0];
    ti.value = this.val;
    ti.onclick = $p.iface.cancel_bubble;		//blocks onclick event
    ti.readOnly = true;
    ti.focus();
    ti.onkeydown = this.ti_keydown.bind(this);
    td.childNodes[1].onclick = this.open_selection;
  };

  /**
   * Вызывается при отключении редактора
   */
  detach() {
    this.setValue(this.getValue());
    return !$p.utils.is_equal(this.val, this.getValue());				// compares the new and the old values
  }

}
window.eXcell_addr = eXcell_addr;

