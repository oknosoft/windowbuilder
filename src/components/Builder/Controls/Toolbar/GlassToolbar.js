import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import BorderHorizontalIcon from '@material-ui/icons/BorderHorizontal';
import BorderVerticalIcon from '@material-ui/icons/BorderVertical';
import Tip from 'metadata-react/App/Tip';
import InfoButton from 'metadata-react/App/InfoButton';
import IconButton from '../../Toolbar/IconButton';
import GoLayer from './GoLayer';
import {useStyles} from '../../Toolbar/styles';

function GlassToolbar({editor, elm, classes}) {
  const {inset} = elm;
  return <Toolbar disableGutters>
    <Tip title="Вставить вертикальный импост">
      <IconButton disabled onClick={null}>
        <BorderVerticalIcon/>
      </IconButton>
    </Tip>
    <Tip title="Вставить горизонтальный импост">
      <IconButton disabled onClick={null}>
        <BorderHorizontalIcon/>
      </IconButton>
    </Tip>
    <div className={classes.title}/>
    <GoLayer elm={elm} editor={editor}/>
    <Tip title={$p.msg.elm_spec}>
      <IconButton onClick={() => editor.elm_spec(elm)}>
        <i className="fa fa-table" />
      </IconButton>
    </Tip>
    {inset?.note &&
      <Tip title='Информация' >
        <InfoButton text={inset.note} />
      </Tip>
    }
  </Toolbar>;
}

export default useStyles(GlassToolbar);

GlassToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  elm: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};
