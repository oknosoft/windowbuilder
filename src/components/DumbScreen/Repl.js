import React from 'react';
import PropTypes from 'prop-types';
import Progress from '../PushUtils/Progress';
import LinearProgress from '@material-ui/core/LinearProgress';

class Repl extends Progress {

  render() {
    const {state: {completed, buffer}, props: {info}} = this;
    const percent = info.docs_read * 100 /(info.docs_read + info.pending);

    setTimeout(() => {
      if(completed !== percent) {
        this.setState({ completed: percent });
      }
    }, 300);

    const syn = {
      templates: 'Шаблоны',
      ram: 'Справочники',
      doc: 'Документы'
    };

    return [
      <div key="progress" style={{flexGrow: 1, marginTop: 8}}>
        <LinearProgress color="secondary" variant="buffer" value={completed} valueBuffer={buffer} />
      </div>,
      <div key="text">{`${syn[info.db]}: прочитано ${info.docs_read} из ${info.docs_read + info.pending}, ${percent.toFixed()}%`}</div>
    ];
  }

}

Repl.propTypes = {
  info: PropTypes.object.isRequired,
};

export default Repl;
