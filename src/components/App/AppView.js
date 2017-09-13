import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

// сообщения в верхней части страницы (например, обновить после первого запуска)
import Snackbar from 'material-ui/Snackbar';
import Button from 'material-ui/Button';

// диалог сообщения пользователю
import Dialog, {DialogActions, DialogContent, DialogContentText, DialogTitle} from 'material-ui/Dialog';

// навигация
import Header from 'metadata-react/Header';
import items from './menu_items'; // массив элементов меню

// заставка "загрузка занных"
import DumbScreen from '../DumbScreen';

// вложенный маршрутизатор страниц с данными
import DataRoute from '../DataRoute';

// информация о программе
import AboutPage from '../About';

// настройки
import Settings from '../Settings';

// 404
import NotFoundPage from '../NotFoundPage';

// дерево метаданных
import MetaTreePage from '../MetaTreePage';

// логин и свойства подключения
import FrmLogin from 'metadata-react/FrmLogin';

import withNavigateAndMeta from 'metadata-redux/src/withNavigateAndMeta';

import Builder from '../Builder';
import CalcOrderList from '../CalcOrderList';

class AppRoot extends Component {

  constructor(props, context) {
    super(props, context);
    this.handleAlertClose = this.handleDialogClose.bind(this, 'alert');
  }

  componentDidMount() {
    const {handleOffline} = this.props;
    this._online = handleOffline.bind(this, false);
    this._offline = handleOffline.bind(this, true);
    window.addEventListener('online', this._online, false);
    window.addEventListener('offline', this._offline, false);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this._online);
    window.removeEventListener('offline', this._offline);
  }

  shouldComponentUpdate(props) {
    const {user, data_empty, couch_direct, offline, history, path_log_in} = props;
    let res = true;

    // если есть сохранённый пароль и online, пытаемся авторизоваться
    if(!user.logged_in && user.has_login && !user.try_log_in && !offline) {
      props.handleLogin();
      res = false;
    }

    // если это первый запуск или couch_direct и offline, переходим на страницу login
    if(!path_log_in && ((data_empty === true && !user.try_log_in) || (couch_direct && !user.logged_in))) {
      history.push('/login');
      res = false;
    }

    return res;
  }

  handleReset = () => {
    const {handleNavigate, first_run} = this.props;
    if(first_run) {
      $p.eve && ($p.eve.redirect = true);
      location.replace('/');
    }
    else {
      handleNavigate('/');
    }
  }

  handleDialogClose(name) {
    this.props.handleIfaceState({component: '', name, value: {open: false}});
  }


  render() {
    const {props} = this;
    const {snack, alert, doc_ram_loaded} = props;

    return (
      <div>
        <Header items={items} {...props} />
        {
          (!props.path_log_in && !props.complete_loaded) ?
            <DumbScreen
              title={doc_ram_loaded ? 'Подготовка данных в памяти...' : 'Загрузка из IndexedDB...'}
              page={{text: doc_ram_loaded ? 'Цены и характеристики...' : 'Почти готово...'}}
              top={92}/>
            :
            <Switch>
              <Route exact path="/" component={CalcOrderList}/>
              <Route path="/builder/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" component={Builder} />
              <Route path="/:area(doc|cat|ireg|cch|rep).:name" component={DataRoute} />
              <Route path="/about" component={AboutPage} />
              <Route path="/meta" component={MetaTreePage} />
              <Route path="/login" component={FrmLogin} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFoundPage} />
            </Switch>
        }

        {((snack && snack.open) || (props.first_run && doc_ram_loaded)) && <Snackbar
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open
          message={snack && snack.open ? snack.message : 'Требуется перезагрузить страницу после первой синхронизации данных'}
          action={<Button
            color="accent"
            onClick={snack && snack.open ? this.handleDialogClose.bind(this, 'snack') : this.handleReset}
          >Выполнить</Button>}
        />}

        {
          alert && alert.open && <Dialog open onRequestClose={this.handleAlertClose}>
            <DialogTitle>
              {alert.title}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                {alert.text}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleAlertClose} color="primary">
                Ок
              </Button>
            </DialogActions>
          </Dialog>
        }

      </div>
    );
  }
}

AppRoot.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  handleOffline: PropTypes.func.isRequired,
  handleNavigate: PropTypes.func.isRequired,
  handleIfaceState: PropTypes.func.isRequired,
  first_run: PropTypes.bool.isRequired,
};

export default withNavigateAndMeta(AppRoot);

