/**
 * Карта
 *
 * @module YaMap
 *
 * Created by Evgeniy Malyarov on 15.02.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';

class YaMap extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      script: global.ymaps !== undefined,
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
        ymaps.ready(() => this.setState({script: true}, this.cteateMap));
      };
      s.addEventListener('load', listener, false);
      document.head.appendChild(s);
    }
  }

  cteateMap = () => {
    if(this.el && this.state.script && !this.map) {
      const {v, mapRef} = this.props;

      const mapParams = {
        center: v.coordinates,
        zoom: v.street ? 13 : 9,
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
      point.events.add(['dragend'], function (e) {
        const co = point.geometry.getCoordinates();
        v.marker_dragend(co);
      });

      // Размещение геообъекта на карте.
      this.map.geoObjects.add(point);
      mapRef(this.map);
      this.map.reflectCenter = function ([lat, lng]) {
        this.setCenter([lat, lng], 14, {checkZoomRange: true});
        point.geometry.setCoordinates([lat, lng]);
      }
    }
    else if(this.map && !this.el) {
      this.map.destroy;
    }
  }

  render() {
    const {larger} = this.props;
    return <div
      style={{width: '100%', height: `calc(100% - ${larger ? 60 : 116}px)`}}
      ref={(el) => {
        this.el = el;
        this.cteateMap();
      }}
    />;
  }

}

YaMap.propTypes = {
  v: PropTypes.object,
  mapRef: PropTypes.func,
  larger: PropTypes.bool,
};

export default YaMap;
