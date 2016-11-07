import React from 'react';

export default function (props) {
  return (

    <div>
      <h1>Регистратор штрихкодов</h1>
      <p>Это веб-интерфейс для регистрации событий диспетчеризации на базе <a href="http://www.oknosoft.ru/metadata/" target="_blank">Metadata.js</a>
      </p>

      <h3>Назначение и возможности</h3>
      <ul>
        <li>Сканирование и регистрация штрихкодов в привязке к исполнителю и этапу производства</li>
        <li>Автономная работа при отсутствии доступа к сети</li>
        <li>Фоновая синхронизация с ИБ 1С</li>
      </ul>

      <h3>Использованы следующие библиотеки и инструменты:</h3>
      <h4>Серверная часть</h4>
      <ul>
        <li><a href="http://couchdb.apache.org/" target="_blank">CouchDB</a>, NoSQL база данных с поддержкой master-master репликации</li>
        <li><a href="http://nginx.org/ru/" target="_blank">Nginx</a>, высокопроизводительный HTTP-сервер</li>
        <li><a href="https://nodejs.org/en/" target="_blank">NodeJS</a>, JavaScript runtime built on Chrome's V8 JavaScript engine</li>
        <li><a href="http://expressjs.com/ru/" target="_blank">Express</a>, HTTP-сервер для NodeJS</li>
        <li><a href="https://github.com/colinskow/superlogin" target="_blank">SuperLogin</a>, библиотека oAuth авторизации</li>
      </ul>

      <h4>Управление данными в памяти браузера</h4>
      <ul>
        <li><a href="http://www.oknosoft.ru/metadata/" target="_blank">Metadata.js</a>, движок ссылочной типизации для браузера и Node.js</li>
        <li><a href="https://pouchdb.com/" target="_blank">PouchDB</a>, клиентская NoSQL база данных с поддержкой автономной работы и репликации с CouchDB</li>
        <li><a href="https://github.com/agershun/alasql" target="_blank">AlaSQL</a>, SQL-интерфейс к массивам javascript в памяти браузера и Node.js</li>
        <li><a href="http://www.movable-type.co.uk/scripts/aes.html" target="_blank">Aes</a>, библиотека шифрования/дешифрования строк</li>
        <li><a href="http://www.movable-type.co.uk/scripts/aes.html" target="_blank">Redux</a>, диспетчер состояния веб-приложения</li>
      </ul>

      <h4>UI библиотеки и компоненты интерфейса</h4>
      <ul>
        <li><a href="http://www.material-ui.com/" target="_blank">Material-ui</a>, компоненты React UI в стиле Google's material design</li>
        <li><a href="https://github.com/bvaughn/react-virtualized" target="_blank">React virtualized</a>, компоненты React для динамических списков</li>
        <li><a href="https://github.com/eligrey/FileSaver.js" target="_blank">Filesaver.js</a>, HTML5 реализация метода saveAs</li>
        <li><a href="http://momentjs.com/" target="_blank">Moment.js</a>, библиотека форматирования интервалов и дат</li>
        <li><a href="http://numbrojs.com/" target="_blank">Numbro</a>, библиотека форматирования чисел</li>
        <li><a href="http://meritt.github.io/rubles/" target="_blank">Rubles.js</a>, библиотека форматирования чисел - сумма прописью</li>
      </ul>

      <h3>Лицензия</h3>
      <p><a href="https://ru.wikipedia.org/wiki/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F_MIT" target="_blank">MIT</a></p>

      <h3>Вопросы</h3>
      <p>Если обнаружили ошибку, пожалуйста, <a href="https://github.com/oknosoft/metadata.js/issues" target="_blank">зарегистрируйте вопрос в GitHub
        </a> или <a href="http://www.oknosoft.ru/metadata/#page-118" target="_blank">свяжитесь с разработчиком</a> напрямую<br /></p>
    </div>
  )
}
