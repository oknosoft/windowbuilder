import {connect} from "react-redux";
import {mapStateToProps, mapDispatchToProps} from "../modules/datalist.js";
import DynList from "components/DataList";

export default connect(mapStateToProps, mapDispatchToProps)(DynList)
