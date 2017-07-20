import React, {Component} from 'react';
import PropTypes from 'prop-types';
import StaticContainer from 'react-static-container';
import WindowSizer from '../../metadata-ui/WindowSize';

class Builder extends Component {

  componentDidMount() {

    this.checkHeight(this.props);

    const {el} = this;
    this.layout = new dhtmlXLayoutObject({

      parent:     el,    // id/object, parent container for layout
      pattern:    "3L",           // string, layout's pattern

      offsets: {          // optional, offsets for fullscreen init
        top:    0,     // you can specify all four sides
        right:  0,     // or only the side where you want to have an offset
        bottom: 0,
        left:   0
      },

      cells: [    // optional, cells configuration according to the pattern
        // you can specify only the cells you want to configure
        // all params are optional
        {
          id:             "a",        // id of the cell you want to configure
          text:           "Text A",     // header text
          collapsed_text: "Texta",   // header text for a collapsed cell
          header:         false,      // hide header on init
          width:          100,        // cell init width
          height:         100,        // cell init height
          collapse:       true,        // collapse on init
          fix_size:       [true,null] // fix cell's size, [width,height]
        },
        {
          id:             "b",        // id of the cell you want to configure
          text:           "Text B",     // header text
          collapsed_text: "Text b",   // header text for a collapsed cell
          header:         false,      // hide header on init
          width:          100,        // cell init width
          height:         100,        // cell init height
        },
        {
          id:             "c",        // id of the cell you want to configure
          text:           "Text C",     // header text
          collapsed_text: "Text c",   // header text for a collapsed cell
          header:         false,      // hide header on init
          width:          100,        // cell init width
          height:         100,        // cell init height
        },
      ]
    });
  }

  componentWillUnmount() {
    this.layout.unload();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.checkHeight(nextProps);
  }

  checkHeight(props) {
    const {windowHeight} = props;
    const {el, layout} = this;
    const height = (windowHeight > 400 ? windowHeight - 60 : 400).toFixed() + 'px';
    if(layout && el.style.height != height){
      el.style.height = height;
      layout.setSizes();
      return true;
    }
    return false;
  }

  render() {
    return <div
      ref={el => this.el = el}
    />;
  }
}

export default WindowSizer(Builder);

