import {configureStore} from "@reduxjs/toolkit";
import settingsReducer from "../state-slice/settings-slice";
import profileReducer from "../state-slice/profile-slice";
import dashboardReducer from "../state-slice/dashboard-slice";
import departmentReducer from "../state-slice/department-slice"
import facultyReducer from "../state-slice/faculty-slice"

import userProfileReducer from "../state-slice/userProfile-slice";


export default configureStore({
    reducer:{
        settings:settingsReducer,
        dashboard:dashboardReducer,
        profile:profileReducer,
        // brand:brandReducer,
        // supplier:supplierReducer,
        // category:categoryReducer,
        // customer:customerReducer,
        // expense:expenseReducer,
        // expensetype:expensetypeReducer,
        // purchase:purchaseReducer,
        // report:reportReducer,
        // product:productReducer,
        // return:returnReducer,
        // sale:saleReducer,
        department:departmentReducer,
        faculty:facultyReducer,
        // section:sectionReducer,
        userProfile:userProfileReducer
    }
})