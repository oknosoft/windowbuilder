/**
 * Компонент карты
 *
 * @module GoogleMap
 *
 * Created by Evgeniy Malyarov on 18.06.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';

class GoogleMap extends React.Component {

  componentDidMount() {
    const {v, mapRef} = this.props;
    v.process_address_fields()
      .then(() => {
        const {maps} = global.google;
        if(this.el && maps && !this.map) {

          const mapParams = {
            center: new maps.LatLng(v.latitude, v.longitude),
            zoom: v.street ? 14 : 11,
            mapTypeId: maps.MapTypeId.ROADMAP
          };

          this.map = new maps.Map(this.el, mapParams);

          v.init_map(this.map, mapParams.center);

          mapRef(this.map);
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
    return <div
      style={{width: '100%', height: 'calc(100% - 116px)'}}
      ref={(el) => {
        this.el = el;
      }}
    />;
  }

}

GoogleMap.propTypes = {
  v: PropTypes.object,
  mapRef: PropTypes.func,
};

export default GoogleMap;
