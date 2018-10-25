/**
 * ### Визуализация процесса раскроя
 *
 * @module ProgressDialog
 *
 * Created by Evgeniy Malyarov on 27.09.2018.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import List from '@material-ui/core/List';

import Progress from './Progress';

class ProgressDialog extends Component {

  handleCancel = () => {

  };

  render() {

    const {props: {statuses}, handleCancel} = this;

    return <Dialog
      open
      large
      minheight
      title="Оптимизация раскроя"
      onClose={handleCancel}
      actions={[
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      <List>
        {statuses.map((status, index) => <Progress key={`p-${index}`} status={status}/>)}
      </List>
    </Dialog>;

  }
}

ProgressDialog.propTypes = {
  statuses: PropTypes.array.isRequired,
};

export default ProgressDialog;
