/* eslint-disable react/no-children-prop */
/*
  построено на штатном прототипе
  за рендер markdown отвечает ReactMarkdown
*/
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
//import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Tip from 'wb-forms/dist/Common/Tip';
import PropTypes from 'prop-types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export default function Btn({ note }) {
  //const {note} = this.props;
  const [open, setOpen] = React.useState(false);
  const [scroll, setScroll] = React.useState('paper');

  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
    setScroll(scrollType);
  };

  const handleClose = () => {
    setOpen(false);
  };



  return (
    <>
      {
        /*
        {
          // тип прокрутки для отладки 2 кнопки
        }
            <Tip title="расширенная информация">
                {note !== "" && <Button startIcon={<InfoIcon />} onClick={handleClickOpen('paper')}>scroll paper</Button>}
              </Tip>
              <Tip title="расширенная информация">
                {note !== "" && <Button startIcon={<InfoIcon />} onClick={handleClickOpen('body')}>scroll body</Button>}
              </Tip>

        */

      }

      {note !== "" &&
        <Tip title="расширенная информация">
          <IconButton color="primary" onClick={handleClickOpen('paper')} >
            <InfoIcon />
          </IconButton>
        </Tip>
      }


      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        {/*<DialogTitle id="scroll-dialog-title">info</DialogTitle> */}
        <DialogContent dividers={scroll === 'paper'}>
          <ReactMarkdown children={note} remarkPlugins={[remarkGfm]} />
        
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Закрыть
          </Button>

        </DialogActions>
      </Dialog>
    </>
  );
}


Btn.propTypes = {
  note: PropTypes.string.isRequired,

};
