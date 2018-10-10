/**
 * ### Фильтр по статусам
 * вариация на тему TagList
 *
 * @module Statuses
 *
 * Created by Evgeniy Malyarov on 07.10.2018.
 */

import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import SelectTags from 'metadata-react/DataField/SelectTags';

import WorkOutline from '@material-ui/icons/WorkOutline';
import IconDrafts from '@material-ui/icons/Edit';
import IconSend from '@material-ui/icons/Send';
import IconConfitmed from '@material-ui/icons/ThumbUp';
import IconDeclined from '@material-ui/icons/ThumbDown';
import IconService from '@material-ui/icons/Build';
import IconComplaints from '@material-ui/icons/BugReport';
import IconPuzzle from '@material-ui/icons/Extension';
import IconFileDownload from '@material-ui/icons/CloudDownload';
import IconFileShuffle from '@material-ui/icons/Shuffle';

export const statuses = [];

class Statuses extends React.Component {

  render() {
    return <IconButton
      onClick={() => null}
      title="Фильтр по статусам"
    >
      <WorkOutline />
    </IconButton>
  }

}

export default Statuses;
