import React, {Component} from 'react';
import PropTypes from 'prop-types';

/* global dhtmlXLayoutObject, dhtmlXWindows */

class DhtmlxCell extends Component {

  constructor(props) {
    super(props);
    const {handleIfaceState, handleNavigate} = props;
    const that = this;
    this.handlers = {
      handleIfaceState,   // для изменения нашего snate из dhtmlx
      handleNavigate,     // для осуществления навигации из dhtmlx
      get props() {
        return that.props;// для получения наших свойств внутри dhtmlx
      },
    };
  }

  componentDidMount() {

    const {el} = this;
    this.layout = new dhtmlXLayoutObject({

      parent: el,    // id/object, parent container for layout
      pattern: '1C',           // string, layout's pattern

      offsets: {       // optional, offsets for fullscreen init
        top: 0,     // you can specify all four sides
        right: 0,     // or only the side where you want to have an offset
        bottom: 0,
        left: 0,
      },

      cells: [    // optional, cells configuration according to the pattern
        // you can specify only the cells you want to configure
        // all params are optional
        {
          id: 'a',        // id of the cell you want to configure
          text: 'Text A',     // header text
          header: false,      // hide header on init
        },
      ],
    });
    this.checkSizes(this.props);

    if (!$p.iface.w) {
      $p.iface.w = new dhtmlXWindows();
      $p.iface.w.attachViewportTo(el);
    }
  }

  componentWillUnmount() {
    delete this.handlers.onProps;
    if ($p.iface.w) {
      $p.iface.w.unload();
      $p.iface.w = null;
    }
    if (this.layout) {
      this.layout.unload();
      delete this.layout;
    }
  }

  shouldComponentUpdate(nextProps) {
    this.checkSizes(nextProps);
    const {onProps} = this.handlers;
    onProps && onProps(nextProps);
    const {match, dialog} = nextProps;
    return !!(dialog && match && (!match.params.ref || match.params.ref === dialog.ref)) || !!(this.props.dialog && !dialog);
  }

  onReize() {

  }

  checkSizes({windowHeight, windowWidth}) {
    const {el, layout} = this;
    if(el && layout) {
      const height = (windowHeight > 480 ? windowHeight - 52 : 428).toFixed() + 'px';
      const width = (windowWidth > 800 ? windowWidth - (height < 500 ? 20 : 0) : 800).toFixed() + 'px';
      if (el.style.height != height || el.style.width != width) {
        el.style.height = height;
        el.style.width = width;
        if (layout) {
          layout.setSizes();
          this.onReize();
        }
      }
    }
  }

  get cell() {
    return this.layout && this.layout.cells('a');
  }

  render() {
    return <div ref={el => this.el = el}/>;
  }
}

DhtmlxCell.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  handleNavigate: PropTypes.func.isRequired,
  dialog: PropTypes.object,
  match: PropTypes.object,
};

export default DhtmlxCell;

