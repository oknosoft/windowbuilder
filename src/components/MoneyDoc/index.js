import Lazy from 'metadata-react/DumbLoader/Lazy';

export default class MoneyDoc extends Lazy {
  componentDidMount() {
    import('./MoneyDoc')
      .then((module) => this.setState({Component: module.default}));
  }
}
