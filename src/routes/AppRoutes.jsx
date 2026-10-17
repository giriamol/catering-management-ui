import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Vendors from "../pages/Vendors";
import Hotels from "../pages/Hotels";
import Shifts from "../pages/RateMaster";
import Assignments from "../pages/Assignments";
import Billing from "../pages/Billing";
import Payments from "../pages/Payments";
import AddEmployee from "../pages/AddEmployee";
import EmployeeEdit from "../pages/EmployeeEdit";
import AddVendor from "../pages/AddVendor";
import EditVendor from "../pages/EditVendor";
import AddHotel from "../pages/AddHotel";
import EditHotel from "../pages/EditHotel";
//import EmployeeRateMaster from "../pages/EmployeeRateMaster";
import VendorRateMaster from "../pages/VendorRateMaster";
// import HoteRateMaster from "../pages/HoteRateMaster";
import EmployeeRateMaster from "../pages/EmployeeRateMaster";
import DailyEmployeePayment from "../pages/DailyEmployeePayment";
import VendorPayment from "../pages/VendorPayment";

import AddEmployeeRateMaster from "../pages/AddEmployeeRateMaster";
import EditEmployeeRateMaster from "../pages/EditEmployeeRateMaster";

import EmployeeAdvance  from "../pages/EmployeeAdvance";
import VendorAdvance from "../pages/VendorAdvance";

import AddEditEmployeeAdvance from "../pages/AddEditEmployeeAdvance";
import AddEditVendorAdvance from "../pages/AddEditVendorAdvance";

import AddVendorRate from "../pages/AddVendorRate";

import MasterAllocations from "../pages/MasterAllocations";
import HotelRateHistory from "../pages/HotelRateHistory";
import AddEditHotelRateHistory from "../pages/AddEditHotelRateHistory";

import EmployeePaymentReports from "../pages/EmployeePaymentReports";
import EditVendorRate from "../pages/EditVendorRate";


function AppRoutes() {
    return (
        <Routes>

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/add" element={<AddEmployee />} />

            <Route path="/vendors" element={<Vendors />} />

            <Route path="/hotels" element={<Hotels />} />

           {/* // <Route path="/RateMaster" element={<HotelRateHistory />} /> */}

            <Route path="/assignments" element={<Assignments />} />

            <Route path="/billing" element={<Billing />} />

            <Route path="/payments" element={<Payments />} />

            <Route path="/employees/edit/:id" element={<EmployeeEdit />}   />
            <Route path="/vendors/add" element={<AddVendor />} />
            <Route path="/vendors/edit/:id"  element={<EditVendor />} />
            <Route path="/hotels/add" element={<AddHotel />} />
            <Route path="/hotels/edit/:id"  element={<EditHotel />} />
            <Route path="/RateMasters/employee" element={<EmployeeRateMaster />}/>
            <Route path="/RateMasters/employeerate"element={  <EmployeeRateMaster /> } />
            <Route path="/RateMasters/employeerate/add"element={ <AddEmployeeRateMaster /> }/>
            <Route path="/RateMasters/employeerate/edit/:rateId" element={<EditEmployeeRateMaster  />} /> 

           <Route path="/RateMasters/vendor" element={<VendorRateMaster />} />
           <Route path="/RateMasters/vendor/add" element={<AddVendorRate />} />
          

           <Route path="/RateMasters/hotel" element={<HotelRateHistory />} />
           <Route path="/RateMasters/hotel/add" element={<AddEditHotelRateHistory />} />
           <Route path="/RateMasters/hotel/edit/:id" element={<AddEditHotelRateHistory />} />
           <Route  path="/daily-employee-payment" element={<DailyEmployeePayment />} /> 
           <Route  path="/vendor-employee-payment" element={<VendorPayment />} />
           <Route  path="/advances/employee" element={<EmployeeAdvance />}/>
           <Route  path="/advances/employee/add"  element={<AddEditEmployeeAdvance />} /> 
           <Route  path="/advances/employee/edit/:id"  element={<AddEditEmployeeAdvance />} />
           <Route  path="/advances/vendor" element={<VendorAdvance />}/>
           <Route  path="/advances/vendor/add"  element={<AddEditVendorAdvance />} /> 
           <Route  path="/advances/vendor/edit/:id"  element={<AddEditVendorAdvance />} />
           <Route  path="/master-allocations"  element={<MasterAllocations />} /> 
           <Route  path="/reports/employee" element={<EmployeePaymentReports />} />
           <Route  path="/RateMasters/vendor/edit/:id" element={<EditVendorRate />}/>

        </Routes> 
    );
}


export default AppRoutes;