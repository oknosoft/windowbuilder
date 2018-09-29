import Lazy from 'metadata-react/DumbLoader/Lazy';

export default class FrmObj extends Lazy {
  componentDidMount() {
    import('./FrmObj')
      .then((module) => this.setState({Component: module.default}));
  }
}
