import React from 'react';
import PropTypes from 'prop-types';
import Progress from '../PushUtils/AbstractProgress';
import LinearProgress from '@material-ui/core/LinearProgress';

class Repl extends Progress {

  render() {
    const {state: {completed, buffer}, props: {info}} = this;
    const percent = !info.text && !info.index && info.docs_read * 100 /(info.docs_read + info.pending);

    percent && completed !== percent && this.setState({completed: percent});

    const syn = {
      templates: 'Шаблоны',
      ram: 'Справочники',
      doc: 'Документы'
    };

    return [
      <div key="progress" style={{flexGrow: 1, marginTop: 8}}>
        <LinearProgress color="secondary" variant="buffer" value={completed} valueBuffer={buffer} />
      </div>,
      !info.text && !info.index &&
        <div key="text">{`${syn[info.db]}: прочитано ${info.docs_read} из ${info.docs_read + info.pending} (${percent.toFixed()}%)`}</div>,
      !info.text && info.index &&
        <div key="text">{`${syn[info.db]}: строим индекс ${info.index}`}</div>,
      info.text && <div key="text">{info.text}</div>,
    ];
  }

}

Repl.propTypes = {
  info: PropTypes.object.isRequired,
};

export default Repl;
