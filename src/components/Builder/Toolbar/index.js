import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import CloseBtn from 'wb-forms/dist/Common/CloseBtn';
import Tip from 'wb-forms/dist/Common/Tip';
import SelectTool from './SelectTool';
import ControlsMode from './ControlsMode';
import Notifications from '../../Notifications';


export default function BuilderToolbar({editor, handleClose, openTemplate, controls_ext, setExt, classes}) {

  return <Toolbar disableGutters variant="dense" className={classes.toolbar}>
    <Tip title="Рассчитать, записать и закрыть редактор">
      <IconButton
        onClick={() => editor.project && editor.project.save_coordinates({save: true, _from_service: true})
          .then(() => null)
        }
      ><i className="fa fa-floppy-o" /></IconButton>
    </Tip>
    <Tip title="Рассчитать и записать иизделие">
      <IconButton
        onClick={() => editor.project && editor.project.save_coordinates({save: true, _from_service: true})}
      ><i className="fa fa-calculator" /></IconButton>
    </Tip>
    <Tip title="Загрузить из типового блока">
      <IconButton onClick={openTemplate}><i className="tb_stamp" /></IconButton>
    </Tip>
    <Tip title="Вписать в окно">
      <IconButton onClick={() => editor.project.zoom_fit && editor.project.zoom_fit()}><i className="tb_cursor-zoom" /></IconButton>
    </Tip>
    <SelectTool editor={editor} />

    <div className={classes.title} />
    <ControlsMode controls_ext={controls_ext} setExt={setExt}/>
    <Notifications />
    <CloseBtn handleClose={handleClose}/>
  </Toolbar>;
}

BuilderToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  handleClose: PropTypes.func,
  openTemplate: PropTypes.func,
  classes: PropTypes.object.isRequired,
};
