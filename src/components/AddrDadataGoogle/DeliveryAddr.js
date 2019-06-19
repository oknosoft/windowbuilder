/**
 *
 *
 * @module DeliveryAddr
 *
 * Created by Evgeniy Malyarov on 13.02.2019.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import connect from './connect';

import FormGroup from '@material-ui/core/FormGroup';
import DataField from 'metadata-react/DataField';
import TextField  from '@material-ui/core/TextField';
import GoogleMap from './GoogleMap';
import {ReactDadata} from './DadataTyped/index.tsx';

class DeliveryAddr extends Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel, handleCalck, dialog: {ref, _mgr}} = props;
    const t = this;
    t.handleCancel = handleCancel.bind(t);
    t.handleCalck = handleCalck.bind(t);
    t.obj = _mgr.by_ref[ref];
    t.state = {
      msg: null,
      cpresentation: t.cpresentation(),
    };
    t.wnd = {
      setText() {},
      elmnts: {
        get map() {
          return t.map;
        },
        toolbar: {
          setValue() {
            t.obj.coordinates = JSON.stringify([t.v.latitude, t.v.longitude]);
            t.setState({cpresentation: t.cpresentation()});
          }
        }
      }
    };
    t.v = new $p.classes.WndAddressData(t);
    _mgr.on('update', this.onDataChange);
  }

  componentWillUnmount() {
    this.props.dialog._mgr.off('update', this.onDataChange);
  }

  refresh_grid() {
    const {obj, v, dadata} = this;
    v.assemble_address_fields(true);
    dadata && dadata.onInputChange({
      target: {value: obj.shipping_address}
    });
    this.findArea({
      lat: v.latitude,
      lng: v.longitude,
      data: {area: true},
    });
  }

  cpresentation() {
    let res = '';
    try {
      const point = JSON.parse(this.obj.coordinates);
      res = `${point[0].round(9)}, ${point[1].round(9)}`;
    }
    catch (e) {}
    return res;
  }

  handleErrClose = () => {
    this.setState({msg: null});
  };

  dadataChange = (data) => {
    const {props: {delivery}} = this;
    let nearest;
    if(data.data && data.data.geo_lat && data.data.geo_lon) {
      nearest = Promise.resolve();
    }
    else if(data.value) {
      nearest = delivery.dadata.suggestions(data.value)
        .then(({suggestions}) => {
          if(suggestions && suggestions[0].data.geo_lat && suggestions[0].data.geo_lon) {
            data.data.geo_lat = suggestions[0].data.geo_lat;
            data.data.geo_lon = suggestions[0].data.geo_lon;
            return;
          }
          else if(data.data && data.data.postal_code) {
            return delivery.geonames.postalCodeLookup(data.data.postal_code)
              .then(({postalcodes}) => {
                data.data.geo_lat = postalcodes[0].lat;
                data.data.geo_lon = postalcodes[0].lng;
              });
          }
        });
    }
    nearest && nearest.then(() => this.findArea({
      lat: parseFloat(data.data.geo_lat),
      lng: parseFloat(data.data.geo_lon),
      data,
    }));
  };

  findArea = ({lat, lng, data}) => {
    const {obj, props: {delivery}, map, v} = this;
    const [area, point] = delivery.nearest({lat, lng});
    if(data.data || data.area) {
      obj.delivery_area = area;
    }
    if(data.data) {
      obj.coordinates = JSON.stringify([point.lat, point.lng]);
      obj.shipping_address = data.value || data.unrestricted_value;
      if(map) {
        const latLng = new global.google.maps.LatLng(point.lat, point.lng);
        map.setCenter(latLng);
        v.marker.setPosition(latLng);
      }
    }
  }

  coordinatesChange = ({target}) => {
    this.setState({cpresentation: target.value});
  };

  coordinatesKeyPress = ({key}) => {
    if(key === 'Enter') {
      this.coordinatesFin();
    }
  };

  coordinatesFin() {
    try{
      const {v, map, state: {cpresentation}} = this;
      const coordinates = v.assemble_lat_lng(cpresentation);
      if(coordinates) {
        const latLng = new global.google.maps.LatLng(coordinates.lat, coordinates.lng);
        map.setCenter(latLng);
        v.marker.setPosition(latLng);
        v.marker_dragend({latLng});
        this.obj.coordinates = JSON.stringify(coordinates);
        this.setState({cpresentation: this.cpresentation()});
      }
    }
    catch (e) {}
  }

  onDataChange = (obj, fields) => {
    if(obj === this.obj && ('delivery_area' in fields || 'coordinates' in fields)) {
      this.forceUpdate();
    }
  }

  render() {

    const {handleCancel, handleErrClose, obj, state: {msg, cpresentation}, props: {delivery, classes}} = this;


    return <Dialog
      open
      initFullScreen
      large
      title="Адрес доставки"
      onClose={handleCancel}
    >
      <FormGroup row>
        <DataField _obj={obj} _fld="delivery_area"/>
        <TextField
          value={cpresentation}
          label="Координаты"
          classes={{root: classes.coordinates}}
          onChange={this.coordinatesChange}
          onBlur={this.coordinatesFin}
          onKeyPress={this.coordinatesKeyPress}
        />
      </FormGroup>
      <ReactDadata
        label="Населенный пункт, улица, дом, квартира"
        ref={(el) => this.dadata = el}
        token={delivery.dadata.token}
        query={obj.shipping_address}
        onChange={this.dadataChange}
      />
      <GoogleMap
        mapRef={(map) => this.map = map}
        v={this.v}
      />
      {msg && <Dialog
        open
        title={msg.title}
        onClose={handleErrClose}
        actions={[
          <Button key="ok" onClick={handleErrClose} color="primary">Ок</Button>,
        ]}
      >
        {msg.text || msg}
      </Dialog>}
    </Dialog>;

  }
}

DeliveryAddr.propTypes = {
  dialog: PropTypes.object.isRequired,
  delivery: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(DeliveryAddr);
