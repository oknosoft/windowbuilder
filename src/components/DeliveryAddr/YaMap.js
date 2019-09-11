/**
 * Карта
 *
 * @module YaMap
 *
 * Created by Evgeniy Malyarov on 15.02.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

/* global ymaps */

class YaMap extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      script: typeof ymaps !== 'undefined',
    };
  }

  componentDidMount() {
    if(!this.state.script) {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = `https://api-maps.yandex.ru/2.1/?apikey=${$p.job_prm.keys.yandex}&lang=ru_RU`;
      s.async = false;
      const listener = () => {
        s.removeEventListener('load', listener);
        ymaps.ready(() => this.setState({script: true}));
      };
      s.addEventListener('load', listener, false);
      document.head.appendChild(s);
    }
  }

  cteateMap = () => {
    if(this.el && this.state.script && !this.map) {
      const {v, mapRef} = this.props;
      v.process_address_fields()
        .then(() => {
          const mapParams = {
            center: v.coordinates,
            zoom: v.street ? 16 : 11,
            controls: ['geolocationControl', 'zoomControl'],
          };

          this.map = new ymaps.Map(this.el, mapParams);

          // Создание геообъекта с типом точка (метка).
          const point = new ymaps.GeoObject({
              geometry: {
                type: "Point", // тип геометрии - точка
                coordinates: v.coordinates, // координаты точки
              },
            },
            {
              draggable: true,
            });
          point.events.add(['dragend'], this.dragend);

          // Размещение метки на карте.
          this.map.geoObjects.add(point);
          mapRef(this.map);
          this.map.reflectCenter = function ([lat, lng]) {
            this.setCenter([lat, lng], this.getZoom() >= 15 ? this.getZoom() : (v.street  ? 16 : 11), {checkZoomRange: true});
            point.geometry.setCoordinates([lat, lng]);
          };
          this.map.coordinatesFin = () => {
            this.dragend({originalEvent: {target: point}});
          };

          // добавляем полигоны периметров района и направления доставки
          v.poly_area = new ymaps.Polygon([
            // Координаты внешнего контура.
            [],
            ], {
            hintContent: "Район доставки"
          }, {
            cursor: 'auto',
            interactivityModel: 'default#transparent',
            fillColor: '#c0d0e0',
            strokeColor: '#709070',
            strokeOpacity: 0.4,
            strokeWidth: 3,
            opacity: 0.3
          });
          this.map.geoObjects.add(v.poly_area);
          this.map.reflectArea = () => {
            const {coordinates: {_obj}, name}  = v.delivery_area;
            v.poly_area.geometry.setCoordinates([_obj.map((row) => [row.latitude, row.longitude])]);
            v.poly_area.properties.set('hintContent', name);
          };
          this.map.reflectArea();

          v.poly_direction = new ymaps.Polygon([[]], {
            hintContent: "Направление доставки"
          }, {
            visible: false,
            cursor: 'auto',
            interactivityModel: 'default#transparent',
            fillColor: '#ccaaff',
            strokeColor: '#aa80ff',
            strokeOpacity: 0.4,
            strokeWidth: 2,
            opacity: 0.2
          });
          this.map.geoObjects.add(v.poly_direction);
        });
    }
    else if(this.map && !this.el) {
      this.map.destroy;
    }
  }

  dragend = ({originalEvent}) => {
    const {props: {v}} = this;
    const {props: {delivery}, obj} = v.owner;
    const co = originalEvent.target.geometry.getCoordinates();
    delivery.yandex.geolocate(co)
      .then(({suggestions}) => {
        if(suggestions.length && suggestions[0].data) {
          const data = suggestions[0];
          delivery.dadata.components(v, data.data);
          v.owner.refresh_grid(co);
        }
        else {
          obj.coordinates = JSON.stringify(co);
          v.owner.coordinatesChange({});
        }
      })
      .catch(() => null);
  };

  render() {
    const {state: {script}, props: {larger}} = this;
    return script ?
      <div
        style={{width: '100%', height: `calc(100% - ${larger ? 60 : 116}px)`}}
        ref={(el) => {
          this.el = el;
          this.cteateMap();
        }}
      />
      :
      <FormGroup row>
        <CircularProgress size={24}/>
        <Typography variant="subtitle1" color="primary" gutterBottom style={{marginLeft: 8}}>
          Загрузка карты
        </Typography>
      </FormGroup>;
  }

}

YaMap.propTypes = {
  v: PropTypes.object,
  mapRef: PropTypes.func,
  larger: PropTypes.bool,
};

export default YaMap;
