/**
 * Абстрактный компонент с индикатором прогресса
 *
 * @module Progress
 *
 * Created by Evgeniy Malyarov on 24.03.2018.
 */

import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

class AbstractProgress extends React.Component {

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

  componentDidMount() {

    const {local, remote, authorized} = $p.adapters.pouch;

    if(local.doc === remote.doc) {
      this.setState({error: `В режиме 'direct', синхронизация заказов не требуется`});
      return;
    }

    if(!authorized) {
      this.setState({error: `Пользователь должен быть авторизован на сервере`});
      return;
    }

    this.timer = setInterval(this.progress, 700);

    this.init && this.init();

  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  progress = () => {
    const { completed } = this.state;
    if (completed > 100) {
      this.setState({ completed: 0, buffer: 10 });
    } else {
      const diff = Math.random() * 2;
      const diff2 = Math.random() * 6;
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

export default AbstractProgress;
