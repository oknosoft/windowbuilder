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
import IconButton  from '@material-ui/core/IconButton';
import LiveHelp from '@material-ui/icons/LiveHelp';
import GoogleMap from './GoogleMap';
import YaMap from './YaMap';
import YaSuggest from './YaSuggest';
import {ReactDadata} from './DadataTyped/index.tsx';

function Toolbtn({suggest_type, handleSuggestType}) {
  const lbl = suggest_type[0].toUpperCase() + ' ';
  return <IconButton
    title={`Источник подсказок: ${suggest_type}`}
    onClick={handleSuggestType}>
    <span style={{color: lbl.startsWith('D') ? 'blue' : 'red'}}>{lbl}</span>
    <LiveHelp/>
  </IconButton>;
}

Toolbtn.propTypes = {
  suggest_type: PropTypes.string.isRequired,
  handleSuggestType: PropTypes.func.isRequired,
};

class DeliveryAddr extends Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel, handleCalck, FakeAddrObj, dialog: {ref, _mgr}} = props;
    const t = this;
    t.handleCancel = handleCancel.bind(t);
    t.handleCalck = handleCalck.bind(t);
    t.obj = new FakeAddrObj(_mgr.by_ref[ref]);
    t.state = {
      msg: null,
      queryClose: false,
      cpresentation: t.cpresentation(),
      suggest_type: $p.wsql.get_user_param('suggest_type') || 'dadata',
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
    t.geo_map = $p.job_prm.builder.geo_map;
  }

  componentWillUnmount() {
    this.props.dialog._mgr.off('update', this.onDataChange);
  }

  refresh_grid(co) {
    const {obj, v, dadata} = this;
    if(co) {
      v.latitude = co[0];
      v.longitude = co[1];
    }
    v.assemble_address_fields(true);
    dadata && dadata.onInputChange({
      fake: true,
      target: {value: obj.shipping_address}
    });
    const data = {area: true};
    if(co) {
      data.data = true;
      data.value = obj.shipping_address;
    }
    this.findArea({
      lat: v.latitude,
      lng: v.longitude,
      data,
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

  handleOk = () => {
    this.props.handleCalck.call(this)
      .then(this.handleCancel)
      .catch((err) => {
        this.setState({msg: err.msg || err.message});
      });
  };

  handleSuggestType = () => {
    let {suggest_type} = this.state;
    if(suggest_type === 'dadata') {
      suggest_type = 'yandex';
    }
    else {
      suggest_type = 'dadata';
    }
    $p.wsql.set_user_param('suggest_type', suggest_type);
    this.setState({suggest_type});
  };

  handleCalck = () => {
    this.props.handleCalck.call(this)
      .catch((err) => {
        this.setState({msg: err.msg});
      });
  };

  handleErrClose = () => {
    this.setState({msg: null, queryClose: false});
  };

  queryClose = () => {
    if(this.obj._data._modified) {
      this.setState({queryClose: true});
    }
    else {
      this.handleCancel();
    }
  };

  dadataChange = (data) => {
    const {props: {delivery}, v} = this;
    let nearest;
    if(data.data && (data.data.qc_geo == 0 || data.data.qc_geo == 1)) {
      nearest = Promise.resolve();
    }
    else if(data.value) {
      nearest = delivery.dadata.specify(data.value)
        .then(({suggestions}) => {
          if(suggestions && suggestions[0].data.geo_lat && suggestions[0].data.geo_lon) {
            if(!Object.keys(data.data).length) {
              Object.assign(data.data, suggestions[0].data);
              delivery.dadata.components(v, data.data);
              v.assemble_address_fields(true);
              //v.owner.refresh_grid(co);
            }
            else {
              data.data.geo_lat = suggestions[0].data.geo_lat;
              data.data.geo_lon = suggestions[0].data.geo_lon;
            }
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

  flatChange = ({target}) => {
    const {v} = this;
    v.flat = target.value.trim();
    if(v.flat) {
      if(/^\d+$/.test(v.flat)) {
        v.flat = 'кв ' + v.flat;
      }
    }
    v.assemble_address_fields(false);
  };

  findArea = ({lat, lng, data}) => {
    const {obj, props: {delivery}, map} = this;
    const [area, point] = delivery.nearest({lat, lng});
    if(data.data || data.area) {
      obj.delivery_area = area;
    }
    if(data.data) {
      obj.coordinates = JSON.stringify([point.lat, point.lng]);
      this.setState({cpresentation: this.cpresentation()});
      obj.shipping_address = data.value || data.unrestricted_value;
      map && map.reflectCenter([point.lat, point.lng]);
    }
  };

  coordinatesChange = ({target}) => {
    this.setState({cpresentation: target ? target.value : this.cpresentation()});
  };

  coordinatesKeyPress = ({key}) => {
    if(key === 'Enter') {
      this.coordinatesFin();
    }
  };

  onDataChange = (obj, fields) => {
    if(obj === this.obj) {
      if('delivery_area' in fields || 'coordinates' in fields) {
        this.forceUpdate();
      }
      if('delivery_area' in fields && this.map) {
        this.map.reflectArea();
      }
    }
  };

  mapRef = (map) => {
    this.map = map;
    if(this.state.suggest_type === 'yandex') {
      this.dadata.init(true);
    }
  };

  coordinatesFin() {
    try{
      const {v, map, state: {cpresentation}} = this;
      const co = v.assemble_lat_lng(cpresentation);
      if(co) {
        map && map.reflectCenter([co.lat, co.lng]);
        this.obj.coordinates = JSON.stringify([co.lat, co.lng]);
        this.setState({cpresentation: this.cpresentation()});

        map.coordinatesFin();
      }
    }
    catch (e) {}
  }

  content() {
    const {obj, state: {cpresentation, suggest_type}, props: {delivery, classes}, geo_map} = this;
    const ComponentMap = geo_map.includes('google') ? GoogleMap : YaMap;
    const addr = suggest_type === 'dadata' ?
      <ReactDadata
        key="row_addr"
        label="Населенный пункт, улица, дом, квартира"
        ref={(el) => this.dadata = el}
        token={delivery.dadata.token}
        query={obj.shipping_address}
        onChange={this.dadataChange}
      />
      :
    <YaSuggest
      key="row_addr"
      ref={(el) => this.dadata = el}
      query={obj.shipping_address}
      v={this.v}
      onChange={this.dadataChange}
      flatChange={this.flatChange}
    />;
    const coordin = <TextField
      value={cpresentation}
      label="Координаты"
      classes={{root: classes.coordinates}}
      onChange={this.coordinatesChange}
      onBlur={this.coordinatesFin}
      onKeyPress={this.coordinatesKeyPress}
    />;
    return [
      !geo_map.includes('without_area') && <FormGroup key="row1" row>
        <DataField _obj={obj} _fld="delivery_area"/>
        {coordin}
      </FormGroup>,
      !geo_map.includes('without_area') && addr,
      geo_map.includes('without_area') && <FormGroup key="row" row>
        {addr}
        {coordin}
      </FormGroup>,
      <ComponentMap
        key="map"
        mapRef={this.mapRef}
        v={this.v}
        larger={geo_map.includes('without_area')}
      />
    ];
  }

  render() {

    const {handleCancel, handleErrClose, obj: {_data}, state: {msg, queryClose, suggest_type}} = this;


    return <Dialog
      open
      initFullScreen
      large
      title={`Адрес доставки${_data._modified ? ' *' : ''}`}
      onClose={this.queryClose}
      actions={[
        <Button key="ok" onClick={this.handleOk} color="primary">Ок</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Отмена</Button>
      ]}
      toolbtns={<Toolbtn suggest_type={suggest_type} handleSuggestType={this.handleSuggestType}/>}
    >
      {this.content()}
      {msg &&
      <Dialog
        open
        title={msg.title}
        onClose={handleErrClose}
        actions={[
          <Button key="ok" onClick={handleErrClose} color="primary">Ок</Button>,
        ]}
      >
        {msg.text || msg}
      </Dialog>}
      {queryClose &&
      <Dialog
        open
        title="Закрыть форму ввода адреса?"
        onClose={handleErrClose}
        actions={[
          <Button key="ok" onClick={handleCancel} color="primary">Ок</Button>,
          <Button key="cancel" onClick={handleErrClose} color="primary">Отмена</Button>
        ]}
      >
        Внесённые изменения будут потеряны
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
  FakeAddrObj: PropTypes.func.isRequired,
};

export default connect(DeliveryAddr);
