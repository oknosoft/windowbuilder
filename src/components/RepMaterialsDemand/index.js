/**
 * Lazy-load для RepMaterialsDemand
 *
 * @module index
 *
 * Created by Evgeniy Malyarov on 28.09.2018.
 */

import Lazy from 'metadata-react/DumbLoader/Lazy';

export class Report extends Lazy {

  componentDidMount() {
    import('./Report')
      .then((module) => this.setState({Component: module.default}));
  }
}

export class RepParams extends Lazy {

  componentDidMount() {
    import('./RepParams')
      .then((module) => this.setState({Component: module.default}));
  }
}
