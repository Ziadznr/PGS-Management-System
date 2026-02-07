import {configureStore} from "@reduxjs/toolkit";
import settingsReducer from "../state-slice/settings-slice";
import profileReducer from "../state-slice/profile-slice";
import dashboardReducer from "../state-slice/dashboard-slice";
import departmentReducer from "../state-slice/department-slice"
import facultyReducer from "../state-slice/faculty-slice"
import hallReducer from "../state-slice/hall-slice"
import userProfileReducer from "../state-slice/userProfile-slice";


export default configureStore({
    reducer:{
        settings:settingsReducer,
        dashboard:dashboardReducer,
        profile:profileReducer,
        department:departmentReducer,
        faculty:facultyReducer,
        hall:hallReducer,
        userProfile:userProfileReducer
    }
})