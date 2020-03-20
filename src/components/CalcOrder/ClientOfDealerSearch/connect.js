/**
 * ### Карточка покупателя
 * обработчики событий и модификаторы данных
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import {connect} from 'react-redux';
import withStyles from './styles';
import {compose} from 'redux';


function mapStateToProps(state, props) {
  return {
    searchOrders(search) {
      if(search.length < 2) {
        return Promise.resolve([]);
      }
      return $p.adapters.pouch.local.doc.query('client_of_dealer', {
        startkey: search,
        endkey: search + '\u0fff',
        limit: 200,
        reduce: false,
      })
        .then(({rows}) => {
          // сворачиваем
          const res = {};
          for (const {value} of rows) {
            const id = `${value[2]} ${value[1]}`;
            if(!res[value[0]]) {
              res[value[0]] = [id];
            }
            else {
              const row = res[value[0]];
              row.indexOf(id) === -1 && row.push(id);
            }
          }
          rows.length = 0;
          for (const name in res) {
            rows.push({name, orders: res[name]});
          }
          rows.sort((a, b) => {
            if(a.name < b.name) {
              return -1;
            }
            else if(a.name > b.name) {
              return 1;
            }
            else {
              return 0;
            }
          });
          return rows;
        });
    },
    handleCalck(row) {
      const key = row.orders[0].split(' ');
      $p.adapters.pouch.local.doc.query('doc/number_doc',
        {
          limit: 1,
          include_docs: true,
          key: ['doc.calc_order', parseInt(key[1].split('-')[0], 10), key[0]],
        })
        .then(({rows}) => {
          const {dialog: {_mgr, ref}} = this.props;
          if(rows.length && _mgr.by_ref[ref]) {
            _mgr.by_ref[ref].client_of_dealer = rows[0].doc.client_of_dealer;
            if(!_mgr.by_ref[ref].phone) {
              _mgr.by_ref[ref].phone = rows[0].doc.phone;
            }
            this.handleCancel();
          }
        });
      //dp.calc_order.production.sync_grid(props.dialog.wnd.elmnts.grids.production);
    },
    handleCancel() {
      props.handlers.handleIfaceState({
        component: 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    }
  };
}

// function mapDispatchToProps(dispatch) {
//   return {};
// }

export default compose(
  withStyles,
  connect(mapStateToProps /*, mapDispatchToProps */),
);
