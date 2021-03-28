import Lazy from 'metadata-react/DumbLoader/Lazy';

export default class LazyRouter extends Lazy {
  componentDidMount() {
    import('./Router')
      .then((module) => this.setState({Component: module.default}));
  }
}
