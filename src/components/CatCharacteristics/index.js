import Lazy from 'metadata-react/DumbLoader/Lazy';

export default class SpecFragment extends Lazy {
  componentDidMount() {
    import('./Spec').then((module) => this.setState({Component: module.default}));
  }
}
