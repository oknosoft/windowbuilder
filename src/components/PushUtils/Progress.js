/**
 * Абстрактный компонент с индикатором прогресса
 *
 * @module Progress
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React, {Component} from 'react';
import { LinearProgress } from 'material-ui/Progress';

class Progress extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      error: '',
      step: 'Подготовка данных...',
      docs: null,
      prods: null,
      completed: 0,
      buffer: 10,
    };
    this.timer = 0;
  }

  on_index = (info) => {
    this.setState({step: `Перестраиваем индекс ${info.index}...`});
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  progress = () => {
    const { completed } = this.state;
    if (completed > 100) {
      this.setState({ completed: 0, buffer: 10 });
    } else {
      const diff = Math.random() * 5;
      const diff2 = Math.random() * 5;
      this.setState({ completed: completed + diff, buffer: completed + diff + diff2 });
    }
  };

  render() {
    const {error, step, completed, buffer} = this.state;

    if(error) {
      return <div>{error}</div>;
    }

    return [
      <div key="progress" style={{flexGrow: 1}}>
        <LinearProgress color="secondary" variant="buffer" value={completed} valueBuffer={buffer} />
        <br />
      </div>,
      <div key="text">{step}</div>
    ];
  }
}

export default Progress;
