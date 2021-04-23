
import Lazy from 'metadata-react/DumbLoader/Lazy';

class TemplatesFrame extends Lazy {
  componentDidMount() {
    import('./Frame')
      .then((module) => {
        const {templates_nested} = $p.job_prm.builder;
        const fin = () => this.setState({Component: module.default});
        let res = Promise.resolve();
        if(templates_nested && templates_nested.length) {
          for(const tmp of templates_nested) {
            res = res.then(() => tmp.load_linked_refs());
          }
        }
        res.then(fin).catch(fin);
      });
  }
}

export default function ({ui}) {
  const {dialogs} = ui;
  dialogs.templates_nested = function () {
    return dialogs.alert({
      title: 'Шаблон вложения',
      hide_btn: true,
      initFullScreen: true,
      timeout: 180000,
      Component: TemplatesFrame,
    });
  };
}
