import React from 'react';

class Additions2D extends React.Component {

  handleCalck(attr) {
    if(attr.pre) { // удалить обрезь

    }
    else if (attr.calck) { // добавить в изделия

    }
    else {  // добавить в заказ

    }
    return Promise.resolve({close: true});
  }

  render() {
    return 'Additions2D';
  }
}

export default Additions2D;
