import {connect} from "react-redux";
import {mapStateToProps, mapDispatchToProps} from "./actions.js";
import DynList from "metadata-ui/DataList";

export default connect(mapStateToProps, mapDispatchToProps)(DynList)
