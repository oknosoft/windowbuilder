import {connect} from "react-redux";
import {mapStateToProps, mapDispatchToProps} from "../../DataList/modules/datalist.js";
import DynList from "components/HomeView";

export default connect(mapStateToProps, mapDispatchToProps)(DynList)