
import React, {Component, PropTypes} from "react";
import DataList from "../DataList"

export default class HomeView extends Component {

  static propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  }

  static contextTypes = {
    $p: React.PropTypes.object.isRequired
  }

  render () {

    const { props } = this

    return <DataList
      { ...props }
    />

  }

}
