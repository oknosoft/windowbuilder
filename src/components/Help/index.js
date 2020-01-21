import Lazy from 'metadata-react/DumbLoader/Lazy';

export default class MarkdownRoute extends Lazy {
  componentDidMount() {
    import('./Route').then((module) => this.setState({Component: module.default}));
  }
}
