import React, {Component} from "react";

import FrmReport from "metadata-ui/FrmReport";
import RepParams from "./RepParams";

// используем типовой отчет, в котором переопределяем закладку параметров и обработчик при изменении схемы компоновки
export default class Report extends Component {

  render() {
    const {props} = this;
    return <FrmReport
      {...props}
      TabParams={RepParams}
      _tabular="specification"
    />
  }

}

