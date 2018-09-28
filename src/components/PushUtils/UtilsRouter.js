/**
 * ### Утилиты автономного режима
 * каркас компонента - визуальная глупая часть
 *
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import connect from './connect';

import Download from './Download';
import Inbox from './Inbox';
import Share from './Share';

class UtilsRouter extends Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel, handleCalck} = props;
    this.handleCancel = handleCancel.bind(this);
    this.handleCalck = handleCalck.bind(this);

    this.state = {
      info: null,
      err: null,
      title: 'Утилиты автономного режима',
      Component: null,
    };
  }

  componentDidMount() {
    $p.adapters.pouch.remote.doc.info()
      .then((info) => {
        this.setState({info}, () => {
          switch (this.props.dialog.cmd) {

          case 'btn_download':
            this.setState({Component: Download, title: 'Обновление заказов из облака'});
            break;

          case 'btn_share':
            this.setState({Component: Share, title: 'Отправка заказа сотруднику'});
            break;

          case 'btn_inbox':
            this.setState({Component: Inbox, title: 'Входящие заказы'});
            break;

          }
        });
      })
      .catch((err) => {
        this.setState({error: err.message || 'Ошибка доступа к базе doc'});
      });
  }

  handleOk = () => {
    this.handleCalck().then(this.handleCancel);
  };

  renderContent() {
    const {err, info, Component} = this.state;

    if(err) {
      return <div>Сервер недоступен</div>;
    }

    if(!info) {
      return <div>Проверка связи с сервером...</div>;
    }

    if(Component) {
      return <Component {...this.props} handleCancel={this.handleCancel} />;
    }

    return <div>Подготовка данных...</div>;
  }

  render() {

    const {handleCancel, state: {title}} = this;

    return <Dialog
      open
      initFullScreen
      large
      title={title}
      onClose={handleCancel}
      actions={[
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      {this.renderContent()}
    </Dialog>;

  }
}

UtilsRouter.propTypes = {
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(UtilsRouter);
