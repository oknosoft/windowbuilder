/**
 * Компонент карты
 *
 * @module GoogleMap
 *
 * Created by Evgeniy Malyarov on 18.06.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';

/* global google */

class GoogleMap extends React.Component {

  componentDidMount() {
    const {v, mapRef} = this.props;
    v.process_address_fields()
      .then(() => {
        const {maps} = google;
        if(this.el && maps && !this.map) {

          const mapParams = {
            center: new maps.LatLng(v.latitude, v.longitude),
            zoom: v.street ? 14 : 11,
            mapTypeId: maps.MapTypeId.ROADMAP
          };

          this.map = new maps.Map(this.el, mapParams);

          v.init_map(this.map, mapParams.center);

          mapRef(this.map);
          this.map.reflectCenter = function ([lat, lng]) {
            const latLng = new maps.LatLng(lat, lng);
            this.setCenter(latLng);
            v.marker.setPosition(latLng);
          };
          this.map.coordinatesFin = () => {
            v.marker_dragend({latLng: v.marker.getPosition()});
          };
        }
        else if(this.map && !this.el) {
          this.map.destroy;
        }
      });
  }

  componentWillUnmount() {
    this.props.v.ulisten();
  }

  render() {
    const {larger} = this.props;
    return <div
      style={{width: '100%', height: `calc(100% - ${larger ? 60 : 116}px)`}}
      ref={(el) => this.el = el}
    />;
  }

}

GoogleMap.propTypes = {
  v: PropTypes.object,
  mapRef: PropTypes.func,
  larger: PropTypes.bool,
};

export default GoogleMap;
