/**
 *
 *
 * @module maps
 *
 * Created by Evgeniy Malyarov on 03.08.2018.
 */


// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);

function init () {
  // Создание экземпляра карты и его привязка к контейнеру с
  // заданным id ("map").
  var myMap = new ymaps.Map('map', {
      center: [55.76, 37.64],
      zoom: 6,
      controls: ['zoomControl', 'fullscreenControl']
    });

  var objectManager = new ymaps.ObjectManager({
      // Чтобы метки начали кластеризоваться, выставляем опцию.
      clusterize: true,
      // ObjectManager принимает те же опции, что и кластеризатор.
      gridSize: 48,
      clusterDisableClickZoom: true
    });

  var collection = {
    type: 'FeatureCollection',
    features: []
  };

  function aribaz(cb) {

    $.ajax({
      url: 'js/aribaz.json'
    }).done(function (data) {
      for (var i = 0; i < data.length; i++) {
        collection.features.push(data[i]);
      }
      cb();
    });

  }

  function tmk(cb) {

    $.ajax({
      url: 'js/tmk.json'
    }).done(function (data) {
      for (var i = 0; i < data.length; i++) {
        var curr = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [55.831903, 37.411961]
            },
            properties: {
              balloonContentHeader: '',
              balloonContentBody: '',
              balloonContentFooter: '',
              clusterCaption: '',
              hintContent: '<strong>Текст  <s>подсказки</s></strong>'
            }
          },
          elm = data[i];
        curr.geometry.coordinates = elm.coords.replace(/\s/g, '').split(',').map(function (v) { return parseFloat(v) });
        curr.properties.clusterCaption = elm.address.replace('на ', '');
        curr.properties.balloonContentHeader = '<small>' + curr.properties.clusterCaption + '</small>';
        curr.properties.hintContent = '<strong>ТМК</strong> ' + elm.city + ' ' + curr.properties.clusterCaption;
        curr.properties.balloonContentFooter = '<strong>ТМК</strong> ' + elm.city;
        curr.properties.balloonContentBody = 'Телефон:' + elm.phone;

        curr.geometry.coordinates.length === 2 && collection.features.push(curr);
      }
      cb();
    });
  }

  function eco(cb) {
    cb();
  }

  // Создаем собственный класс.
  function CustomControlClass(options) {
    CustomControlClass.superclass.constructor.call(this, options);
    this._$content = null;
    this._geocoderDeferred = null;
  }

  var customControlProps = {

    onAddToMap: function (map) {
      CustomControlClass.superclass.onAddToMap.call(this, map);
      this._lastCenter = null;
      this.getParent().getChildElement(this).then(this._onGetChildElement, this);
    },

    onRemoveFromMap: function (oldMap) {
      this._lastCenter = null;
      if (this._$content) {
        this._$content.remove();
        this._mapEventGroup.removeAll();
      }
      CustomControlClass.superclass.onRemoveFromMap.call(this, oldMap);
    },

    _onGetChildElement: function (parentDomContainer) {
      // Создаем HTML-элемент с текстом. // 1224 пользователей
      this._$content = $('<div class="customControl"><b>266 организаций (дилеры и филиалы)<br/>416 пользователей</b></div>').appendTo(parentDomContainer);
      // this._mapEventGroup = this.getMap().events.group();
      // // Запрашиваем данные после изменения положения карты.
      // this._mapEventGroup.add('boundschange', this._createRequest, this);
      // // Сразу же запрашиваем название места.
      // this._createRequest();
    },

    // _createRequest: function() {
    //   var lastCenter = this._lastCenter = this.getMap().getCenter().join(',');
    //   // Запрашиваем информацию о месте по координатам центра карты.
    //   ymaps.geocode(this._lastCenter, {
    //     // Указываем, что ответ должен быть в формате JSON.
    //     json: true,
    //     // Устанавливаем лимит на кол-во записей в ответе.
    //     results: 1
    //   }).then(function (result) {
    //     // Будем обрабатывать только ответ от последнего запроса.
    //     if (lastCenter == this._lastCenter) {
    //       this._onServerResponse(result);
    //     }
    //   }, this);
    // },

    // _onServerResponse: function (result) {
    //   // Данные от сервера были получены и теперь их необходимо отобразить.
    //   // Описание ответа в формате JSON.
    //   var members = result.GeoObjectCollection.featureMember,
    //     geoObjectData = (members && members.length) ? members[0].GeoObject : null;
    //   if (geoObjectData) {
    //     this._$content.text(geoObjectData.metaDataProperty.GeocoderMetaData.text);
    //   }
    // }
  }

  // Наследуем CustomControlClass от collection.Item.
  ymaps.util.augment(CustomControlClass, ymaps.collection.Item, customControlProps);

  var customControl = new CustomControlClass();
  myMap.controls.add(customControl, {
    float: 'none',
    position: {
      top: 10,
      left: 10
    }
  });

  // Чтобы задать опции одиночным объектам и кластерам,
  // обратимся к дочерним коллекциям ObjectManager.
  objectManager.objects.options.set('preset', 'islands#greenDotIcon');
  objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
  myMap.geoObjects.add(objectManager);



  tmk(function () {
    aribaz(function () {
      eco(function () {
        objectManager.add(collection);
      });
    });
  });


}