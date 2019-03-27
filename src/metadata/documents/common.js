/**
 *
 *
 * @module common
 *
 * Created by Evgeniy Malyarov on 22.03.2019.
 */

import Lazy from 'metadata-react/DumbLoader/Lazy';

export class FrmObj extends Lazy {
  componentDidMount() {
    import('metadata-react/FrmObj')
      .then((module) => this.setState({Component: module.default}));
  }
}

// перед записью рассчитываем итоги
export function before_save() {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
}
