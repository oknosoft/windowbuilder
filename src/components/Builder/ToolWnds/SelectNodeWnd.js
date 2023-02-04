import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import DataField from 'metadata-react/DataField';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';
import Tip from 'metadata-react/App/Tip';


function SelectNodeWnd({editor, classes}) {
  const {dp} = editor.tool;
  const ext = extClasses(classes);
  return <div>
    <Toolbar disableGutters variant="dense">
      <Tip title="Оторвать узел профиля от скелетона">
        <Button
          variant="outlined"
          size="small"
          color="secondary"
          disabled
          //onClick={}
        >Оторвать узел
        </Button>
      </Tip>
    </Toolbar>
    <DataField _obj={dp} _fld="grid" extClasses={ext} fullWidth/>
  </div>;
}

SelectNodeWnd.propTypes = {
  editor: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(SelectNodeWnd);
