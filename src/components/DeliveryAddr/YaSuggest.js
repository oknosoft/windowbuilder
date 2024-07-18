/**
 * Подсказки
 *
 * @module YaSuggest
 *
 * Created by Evgeniy Malyarov on 08.09.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/styles';
import cn from 'classnames';

/* global ymaps */

const styles = {
  flex: {
    flex: '1 1 auto',
  },
  right: {
    marginRight: 4
  },
  width: {
    maxWidth: 120
  }
};

class YaSuggest extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      query: props.query || '',
      flat: '',
      floor: '',
    };
  }

  init(fake) {
    if(this.addr && !this.inited) {
      this.suggestView = new ymaps.SuggestView(this.addr, {results: 10});
      this.suggestView.events.add('select', this.handleSelect);
      this.inited = true;
    }
    const {v} = this.props;
    if(fake && this.flat && (v.flat || v.floor)) {
      const query = this.props.v.assemble_addr();
      this.suggestView && this.suggestView.state.set({panelClosed: true, request: query});
      this.setState({query, flat: v.flat, floor: v.floor});
    }
  }

  handleSelect = ({originalEvent}) => {
    if(originalEvent && originalEvent.item) {
      const {value, displayName} = originalEvent.item;
      this.setState({query: value});
      if (this.props.onChange) {
        this.props.onChange({value, displayName, data: {}});
      }
    }
  };

  onInputChange = ({target, fake}) => {
    const {value} = target;
    if(fake && this.suggestView) {
      this.suggestView.state.set({panelClosed: true, request: value});
    }
    this.setState({query: value}, () => {
      if(fake && this.addr) {
        setTimeout(() => {
          this.suggestView.state.set({panelClosed: true});
        }, 300);
      }
    });
  };

  onFlatChange = ({target, fake}) => {
    this.setState({flat: target.value});
    !fake && this.props.flatChange({target});
  };

  onFloorChange = ({target, fake}) => {
    this.setState({floor: target.value});
    !fake && this.props.floorChange({target});
  };

  delayedSelect = (exec) => {
    this.delay && clearTimeout(this.delay);
    if(exec === true) {
      this.handleSelect({originalEvent: {item: this.addr}});
    }
    else {
      this.delay = setTimeout(this.delayedSelect.bind(this, true), 100);
    }
  };

  onInputKey = (e) => {
    if(e.key === 'Enter' || e.key === 'Tab') {
      this.handleSelect({originalEvent: {item: this.addr}});
    }
    else if(e.key === 'Escape') {
      e.stopPropagation();
    }
  };

  render() {
    const {classes: {width, flex, right}} = this.props;
    let {query, flat, floor} = this.state;
    return (
      <FormGroup row className={flex}>
        <TextField
          className={cn(flex, right)}
          margin="dense"
          label="Населенный пункт, улица, дом"
          inputRef={(el) => {
            this.addr = el;
            if(typeof ymaps !== 'undefined') {
              this.init();
            }
          }}
          value={query}
          onChange={this.onInputChange}
          onKeyDown={this.onInputKey}
          //onBlur={this.delayedSelect}
        />
        <TextField
          margin="dense"
          className={cn(width, right)}
          inputRef={ (el) => {this.floor = el;} }
          label="Этаж"
          value={floor}
          onChange={this.onFloorChange}
        />
        <TextField
          margin="dense"
          className={cn(width, right)}
          inputRef={ (el) => {this.flat = el;} }
          label="Квартира"
          value={flat}
          onChange={this.onFlatChange}
        />
      </FormGroup>
    );
  }
}

YaSuggest.propTypes = {
  classes: PropTypes.object,
  v: PropTypes.object,
  flatChange: PropTypes.func,
  onChange: PropTypes.func,
  query: PropTypes.string,
};

export default withStyles(styles)(YaSuggest);
