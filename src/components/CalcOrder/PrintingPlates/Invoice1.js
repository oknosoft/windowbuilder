/**
 * Пример печатной формы
 *
 * @module Invoice1
 *
 * Created by Evgeniy Malyarov on 19.04.2020.
 */

import React from 'react';

class Invoice1 extends React.Component {

  // идентификатор - должен быть уникальным для каждой виртуальной формулы
  static ref = '80ecfed0-8263-11ea-a364-7bbe5c31efe8';

  static title = 'Демо счет вирт. формула';

  render() {
    return <div>123</div>;
  }
}

export default Invoice1;
