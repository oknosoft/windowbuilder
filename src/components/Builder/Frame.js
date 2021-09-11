/**
 * Каркас графического редактора
 *
 * @module Frame
 *
 * Created by Evgeniy Malyarov on 26.09.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import {Prompt} from 'react-router-dom';
import {Resize, ResizeHorizon} from 'metadata-react/Resize';
import Toolbar from './Toolbar';
import Builder from './Builder';
import ControlsAservice from './ControlsAservice';
import ProductStructure from './ProductStructure';

const styles = ({spacing}) => ({
  canvas: {
    margin: 2,
    width: '100%',
    height: '100%',
    backgroundColor: grey[50],
  },
  title: {
    flexGrow: 1,
  },
  toolbar: {
    backgroundColor: grey[200],
  },
  padding: {
    paddingLeft: spacing(),
    paddingRight: spacing(),
  },
});

class Frame extends React.Component {

  constructor() {
    super();
    this.state = {
      ox_opened: false,
      controls_ext: $p.wsql.get_user_param('controls_ext', 'boolean'),
      editor: null,
    };
  }

  registerChild = (editor) => {
    if(editor !== this.state.editor) {
      this.setState({editor});
    }
  };

  handleClose = () => {
    const {state: {editor}, props} = this;
    if(editor) {
      props.handleNavigate('/');
    }
  };

  setExt = (controls_ext) => {
    $p.wsql.set_user_param('controls_ext', controls_ext);
    this.setState({controls_ext});
  }

  openTemplate = () => {
    const {state: {editor}, props: {handleNavigate}} = this;
    if(editor) {
      const {ox} = editor.project;
      if(ox.empty() || ox.calc_order.empty()) {
        $p.ui.dialogs.alert({text: `Пустая ссылка изделия или заказа`, title: 'Ошибка данных'});
      }
      else {
        handleNavigate(`/templates/?order=${ox.calc_order.ref}&ref=${ox.ref}`);
      }
    }
  };

  resizeStop = (inf) => {
    const {editor} = this.state;
    if(editor) {
      const {offsetWidth, offsetHeight} = editor.view.element.parentNode;
      editor.project.resize_canvas(offsetWidth, offsetHeight);
    }
  };

  /**
   * проверка, можно ли покидать страницу
   * @return {String|Boolean}
   */
  prompt = (loc) => {
    const {editor} = this.state;
    if(!editor || !editor.project || loc.pathname.includes('templates')) {
      return true;
    }
    const {ox} = editor.project;
    return ox && ox._modified ? `Изделие ${ox.prod_name(true)} изменено.\n\nЗакрыть без сохранения?` : true;
  };

  render() {
    const {props: {classes, match}, state: {controls_ext, editor}} = this;
    const width = innerWidth;
    return <>
      <Prompt when message={this.prompt} />
      {editor && <Toolbar
        classes={classes}
        editor={editor}
        controls_ext={controls_ext}
        handleClose={this.handleClose}
        openTemplate={this.openTemplate}
        setExt={this.setExt}
      />}
      <div style={{position: 'relative', height: 'calc(100vh - 50px)'}}>
        <Resize handleWidth="6px" handleColor={grey[200]} onResizeStop={this.resizeStop} onResizeWindow={this.resizeStop}>
          <ResizeHorizon width={`${(width * (controls_ext ? 1 : 1.5) / 6).toFixed()}px`} minWidth="200px">
            {editor ?
              (controls_ext ? <ProductStructure editor={editor} /> : <ControlsAservice editor={editor} />) :
              'Загрузка...'
            }
          </ResizeHorizon>
          <ResizeHorizon width={`${(width * (controls_ext ? 4 : 4.5) / 6).toFixed()}px`} minWidth="600px">
            <Builder
              classes={classes}
              match={match}
              registerChild={this.registerChild}
            />
          </ResizeHorizon>
          {controls_ext && <ResizeHorizon width={`${(width / 6).toFixed()}px`} minWidth="200px">Свойства</ResizeHorizon>}
        </Resize>
      </div>
    </>;
  }
}

Frame.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  handleNavigate: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  title: PropTypes.string,
};

export default withStyles(styles)(Frame);
