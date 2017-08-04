import React, {Component} from 'react';
import PropTypes from 'prop-types';

class DumbScreen extends Component {

  render() {

    let {title, page, top, first_run} = this.props;
    const over = page && page.limit * page.page > page.total_rows;
    if (!title) {
      title = (first_run || over) ? 'Первый запуск требует дополнительного времени...' : 'Загрузка модулей...';
    }
    const footer = page ? (over ?
      <div>{`Такт №${page.page}, загружено ${page.total_rows} объектов - чтение изменений `} <i className="fa fa-spinner fa-pulse"></i></div>
      :
      page.text || `Такт №${page.page}, загружено ${Math.min(page.page * page.limit, page.total_rows)} из ${page.total_rows} объектов`)
    : '';

    return <div className='splash' style={{marginTop: top}}>
      <div className="description">
        <h1 itemProp="name">Окнософт: Заказ дилера</h1>
        <p>Категория: <span itemProp="applicationSubCategory">CRM, CAD, E-Commerce</span></p>
        <p>Платформа: <i className="fa fa-chrome" aria-hidden="true"></i> браузер Chrome для <span itemProp="operatingSystem">Windows 8, 10 | Android | Mac | iOS</span>
        </p>
        <div itemProp="description">
          <p>Заказ дилера - это веб-сервис компании <a href="http://www.oknosoft.ru/" title="Программы для оконных заводов и дилеров"
                                                       target="_blank" rel="noopener noreferrer">Окнософт</a>, предназначенный для:</p>
          <ul>
            <li>Расчета геометрии, спецификации и стоимости оконных и витражных конструкций (ПВХ, Дерево, Алюминий)</li>
            <li>Aвтоматизации работы менеджеров и дилеров</li>
            <li>Ускорения и упрощения подготовки производства</li>
            <li>Планирования и контроля на всех этапах</li>
          </ul>
        </div>
      </div>

      <div style={{position: 'absolute', bottom: '-24px'}}>{title}</div>
      {page && <div style={{position: 'absolute', bottom: '-52px'}}>{footer}</div>}

    </div>;
  }
}

DumbScreen.propTypes = {
  step: PropTypes.number,
  step_size: PropTypes.number,
  count_all: PropTypes.number,
  top: PropTypes.number,
  first_run: PropTypes.bool,
  title: PropTypes.string,
  processed: PropTypes.string,
  current: PropTypes.string,
  bottom: PropTypes.string,
  page: PropTypes.object,
};

export default DumbScreen;
