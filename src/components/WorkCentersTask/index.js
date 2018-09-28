/**
 * Lazy-load для WorkCentersTask
 *
 * @module index
 *
 * Created by Evgeniy Malyarov on 28.09.2018.
 */

import Lazy from 'metadata-react/DumbLoader/Lazy';

export default class FrmObj extends Lazy {

  componentDidMount() {
    import('./FrmObj')
      .then((module) => this.setState({Component: module.default}));
  }
}
