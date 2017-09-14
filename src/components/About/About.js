import React, {Component} from 'react';
import PropTypes from 'prop-types';
import withStyles from 'material-ui/styles/withStyles';
import Grid from 'material-ui/Grid';

import withIface from 'metadata-redux/src/withIface';

const styleSheet = {
  root: {
    flexGrow: 1,
    marginLeft: 12,
    marginRight: 16,
  },
};

class About extends Component {

  componentDidMount() {
    this.shouldComponentUpdate(this.props);
  }

  shouldComponentUpdate({handleIfaceState, title}) {
    const ltitle = 'О программе...';
    if(title != ltitle){
      handleIfaceState({
        component: '',
        name: 'title',
        value: ltitle,
      });
      return false;
    }
    return true;
  }

  render() {
    const {classes} = this.props;

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item md={1} lg={2} xl={3} />
          <Grid item xs={12} sm={12} md={11} lg={10} xl={8}>

            <h1>Окнософт: Заказ дилера</h1>
            <p>Заказ дилера - это веб-приложение, разработанное компанией <a href="http://www.oknosoft.ru/" target="_blank" rel="noopener noreferrer">Окнософт</a> на базе фреймворка <a href="http://www.oknosoft.ru/metadata/" target="_blank" rel="noopener noreferrer">Metadata.js</a><br />
              Исходный код и документация доступны в <a href="https://github.com/oknosoft/windowbuilder" target="_blank" rel="noopener noreferrer">GitHub <i className="fa fa-github-alt"></i></a>.<br />
            </p>

            <h3>Назначение и возможности</h3>
            <ul>
              <li>Построение и редактирование эскизов изделий в графическом 2D редакторе</li>
              <li>Экстремальная поддержка нестандартных изделий (многоугольники, сложные перегибы профиля)</li>
              <li>Расчет спецификации и координат технологических операций</li>
              <li>Расчет цены и плановой себестоимости изделий по произвольным формулам с учетом индивидуальных дилерских скидок и наценок</li>
              <li>Формирование печатных форм для заказчика и производства</li>
              <li>Поддержка автономной работы при отсутствии доступа в Интернет и прозрачного обмена с сервером при возобновлении соединения</li>
            </ul>

            <p>Использованы следующие библиотеки и инструменты:</p>

            <h3>Серверная часть</h3>
            <ul>
              <li><a href="http://couchdb.apache.org/" target="_blank" rel="noopener noreferrer">CouchDB</a>, NoSQL база данных с поддержкой master-master репликации</li>
              <li><a href="http://nginx.org/ru/" target="_blank" rel="noopener noreferrer">Nginx</a>, высокопроизводительный HTTP-сервер</li>
              <li><a href="https://nodejs.org/en/" target="_blank" rel="noopener noreferrer">NodeJS</a>, JavaScript runtime built on Chrome`s V8 JavaScript engine
              </li>
              {/*
      <li><a href="https://github.com/colinskow/superlogin" target="_blank" rel="noopener noreferrer">SuperLogin</a>, библиотека oAuth авторизации</li>
      */}
            </ul>

            <h3>Управление данными в памяти браузера</h3>
            <ul>
              <li><a href="http://www.oknosoft.ru/metadata/" target="_blank" rel="noopener noreferrer">Metadata.js</a>, движок ссылочной типизации для браузера и Node.js</li>
              <li><a href="https://pouchdb.com/" target="_blank" rel="noopener noreferrer">PouchDB</a>, клиентская NoSQL база данных с поддержкой автономной работы и репликации с CouchDB</li>
              <li><a href="https://github.com/agershun/alasql" target="_blank" rel="noopener noreferrer">AlaSQL</a>, SQL-интерфейс к массивам javascript в памяти браузера и Node.js</li>
              <li><a href="http://www.movable-type.co.uk/scripts/aes.html" target="_blank" rel="noopener noreferrer">Aes</a>, библиотека шифрования/дешифрования строк</li>
              <li><a href="https://github.com/reactjs/redux" target="_blank" rel="noopener noreferrer">Redux</a>, диспетчер состояния веб-приложения</li>
            </ul>

            <h3>UI библиотеки и компоненты интерфейса</h3>
            <ul>
              <li><a href="http://paperjs.org/" target="_blank" rel="noopener noreferrer">Paper.js</a>, фреймворк векторной графики для HTML5 Canvas</li>
              <li><a href="http://www.material-ui.com/" target="_blank" rel="noopener noreferrer">Material-ui</a>, компоненты React UI в стиле Google`s material design</li>
              <li><a href="https://github.com/bvaughn/react-virtualized" target="_blank" rel="noopener noreferrer">React virtualized</a>, компоненты React для динамических списков</li>
              <li><a href="https://github.com/adazzle/react-data-grid" target="_blank" rel="noopener noreferrer">React data grid</a>, React компонент табличной части</li>
              <li><a href="http://dhtmlx.com/" target="_blank" rel="noopener noreferrer">Dhtmlx</a>, кроссбраузерная javascript библиотека компонентов ui</li>
              <li><a href="http://momentjs.com/" target="_blank" rel="noopener noreferrer">Moment.js</a>, библиотека форматирования интервалов и дат</li>
              <li><a href="http://meritt.github.io/rubles/" target="_blank" rel="noopener noreferrer">Rubles.js</a>, библиотека форматирования чисел - сумма прописью</li>
              <li><a href="https://github.com/SheetJS/js-xlsx" target="_blank" rel="noopener noreferrer">Xlsx</a>, библиотека для чтения и записи XLSX / XLSM / XLSB / XLS / ODS</li>
              <li><a href="https://github.com/open-xml-templating/docxtemplater" target="_blank" rel="noopener noreferrer">Docxtemplater</a>, библиотека формирования файлов DOCX по шаблону</li>
              <li><a href="https://fortawesome.github.io/Font-Awesome/" target="_blank" rel="noopener noreferrer">fontawesome</a>, набор шрифтовых иконок</li>
            </ul>

            <h3><i className="fa fa-question-circle"></i> Вопросы</h3>
            <p>Если обнаружили ошибку, пожалуйста, <a href="https://github.com/oknosoft/windowbuilder/issues/new" target="_blank" rel="noopener noreferrer">зарегистрируйте вопрос в GitHub</a> или <a href="http://www.oknosoft.ru/metadata/#page-118" target="_blank" rel="noopener noreferrer">свяжитесь с разработчиком</a> напрямую<br /></p>

          </Grid>
        </Grid>
      </div>
    );
  }
}


About.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(withIface(About));
