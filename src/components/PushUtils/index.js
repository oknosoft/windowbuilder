import Lazy from 'metadata-react/DumbLoader/Lazy';

export default class UtilsRouter extends Lazy {

  componentDidMount() {
    import('./UtilsRouter')
      .then((module) => this.setState({Component: module.default}));
  }
}
