/**
 * ### Адрес доставки
 * обработчики событий и модификаторы данных
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import {connect} from 'react-redux';
import withStyles from './styles';
import {compose} from 'redux';

class DeliveryManager {

  constructor() {
    const {keys, rest_path} = $p.job_prm;
    this.geonames = {
      postalCodeLookup(postalcode) {
        return fetch(`http://api.geonames.org/postalCodeLookupJSON?postalcode=${postalcode}&country=RU&username=${keys.geonames}`)
          .then(res => res.json());
      },
      geoLookup({lat, lng}) {
        return fetch(`http://api.geonames.org/addressJSON?lat=${lat}&lng=${lng}&username=${keys.geonames}`)
          .then(res => res.json());
      }
    };

    this.dadata = {

      get token() {
        return keys.dadata;
      },

      suggestions(query, kind = 'address') {
        return fetch(`https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/${kind}?5`, {
          method: 'post',
          body: JSON.stringify({query, count: 1}),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Token ${this.token}`
          }
        })
          .then(res => res.json());
      },

      address(raw) {
        return fetch(`${rest_path}proxy/dadata`, {
          method: 'post',
          body: JSON.stringify({body: raw}),
        })
          .then(res => res.json());
      }
    };
  }

  distance(p1, p2) {
    const dlat = p1.lat - p2.lat;
    const dlng = p1.lng - p2.lng;
    return Math.sqrt(dlat * dlat + dlng * dlng);
  }

  // ищет ближайший по координатам
  nearest(point) {
    let tmp, distance = Infinity;
    $p.cat.delivery_areas.forEach((doc) => {
      const td = this.distance(point, {lat: doc.latitude, lng: doc.longitude});
      if(!tmp || td < distance) {
        distance = td;
        tmp = doc;
      }
    });
    return [tmp, point];
  }

  coord_presentation() {

  }
}

const delivery = new DeliveryManager();


function mapStateToProps(state, props) {
  return {
    handleCalck() {
      //dp.calc_order.production.sync_grid(props.dialog.wnd.elmnts.grids.production);
      return Promise.resolve();
    },

    handleCancel() {
      props.handlers.handleIfaceState({
        component: 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    },

    delivery,
  };
}

// function mapDispatchToProps(dispatch) {
//   return {};
// }

export default compose(
  withStyles,
  connect(mapStateToProps /*, mapDispatchToProps */),
);
