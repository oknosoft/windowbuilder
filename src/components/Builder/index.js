import Lazy from 'metadata-react/DumbLoader/Lazy';

export default class Builder extends Lazy {
  componentDidMount() {
    import('./Frame').then((module) => this.setState({Component: module.default}));
  }
}
