import React, {Component} from 'react';
import PropTypes from 'prop-types';
import WindowSizer from 'metadata-react/WindowSize';

/* global dhtmlXWindows */

class DhtmlxRoot extends Component {

  componentDidMount() {

    this.checkSizes(this.props);

    const {el} = this;

    if (!this.layout) {
      $p.iface.w = new dhtmlXWindows();
      $p.iface.w.attachViewportTo(el);
      $p.iface.main = this.layout = new $p.iface.OrderDealerApp($p, el);
      $p.on('hash_route', this.hash_route);
    }

  }

  componentWillUnmount() {
    this.layout.unload();
    $p.off('hash_route', this.hash_route);
    $p.iface.main = this.layout = null;
    $p.iface.w.unload();
    $p.iface.w = null;
  }

  shouldComponentUpdate(nextProps) {
    return !!this.checkSizes(nextProps);
  }

  onReize() {

  }

  hash_route(hprm) {
    return $p.iface.main.hash_route(hprm);
  }

  checkSizes(props) {
    const {windowHeight, windowWidth} = props;
    const {el, layout} = this;
    const height = (windowHeight > 480 ? windowHeight - 4 : 480).toFixed() + 'px';
    const width = (windowWidth > 720 ? windowWidth : 720).toFixed() + 'px';
    if (el.style.height != height || el.style.width != width) {
      el.style.height = height;
      el.style.width = width;
      if (layout) {
        layout.sidebar.setSizes();
        this.onReize();
      }
    }
  }

  render() {
    return <div ref={el => this.el = el}/>;
  }
}

DhtmlxRoot.propTypes = {
  windowHeight: PropTypes.number.isRequired,
  windowWidth: PropTypes.number.isRequired,
};


export default WindowSizer(DhtmlxRoot);
