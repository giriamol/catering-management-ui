
// import { Link } from "react-router-dom";
// import { useState } from "react";

// import {
//     FaTachometerAlt,
//     FaUsers,
//     FaTruck,
//     FaHotel,
//     FaClipboardList,
//     FaCalendarAlt,
//     FaLayerGroup,
//     FaWallet,
//     FaMoneyBillWave,
//     FaChartBar,
//     FaUserClock,
//     FaCoins,
//     FaFileInvoiceDollar,
//     FaChevronDown,
//     FaUtensils
// } from "react-icons/fa";

// import "../CSS/Sidebar.css";

// function Sidebar() {

//     // ----------------------------------------------------
//     // Menu States
//     // ----------------------------------------------------
//     const [rateMasterOpen, setRateMasterOpen] = useState(false);
//     const [paymentOpen, setPaymentOpen] = useState(false);
//     const [advanceOpen, setAdvanceOpen] = useState(false);
//     const [reportOpen, setReportOpen] = useState(false);

//     return (
//         <aside className="sidebar">

//             {/* BRAND / SIDEBAR TITLE */}
//             <div className="sidebar-brand">
//                 <FaUtensils className="brand-icon" />
//                 <h3>BP Enterprises</h3>
//             </div>

//             <ul>

//                 {/* DASHBOARD */}
//                 <li>
//                     <Link to="/dashboard">
//                         <FaTachometerAlt className="menu-icon" />
//                         <span>Dashboard</span>
//                     </Link>
//                 </li>

//                 {/* EMPLOYEES */}
//                 <li>
//                     <Link to="/employees">
//                         <FaUsers className="menu-icon" />
//                         <span>Employees</span>
//                     </Link>
//                 </li>

//                 {/* VENDORS */}
//                 <li>
//                     <Link to="/vendors">
//                         <FaTruck className="menu-icon" />
//                         <span>Vendors</span>
//                     </Link>
//                 </li>

//                 {/* CATERERS */}
//                 <li>
//                     <Link to="/hotels">
//                         <FaHotel className="menu-icon" />
//                         <span>Caterers</span>
//                     </Link>
//                 </li>

//                 {/* RATE MASTER */}
//                 <li className="menu-parent">

//                     <div
//                         className="menu-title"
//                         onClick={() => setRateMasterOpen(!rateMasterOpen)}
//                     >
//                         <span className="menu-title-left">
//                             <FaCoins className="menu-icon" />
//                             <span>Rate Master</span>
//                         </span>

//                         <FaChevronDown
//                             className={`arrow ${rateMasterOpen ? "rotate" : ""}`}
//                         />
//                     </div>

//                     {rateMasterOpen && (
//                         <ul className="submenu">

//                             <li>
//                                 <Link to="/RateMasters/employee">
//                                     <FaUsers className="submenu-icon" />
//                                     <span>Employee Rate</span>
//                                 </Link>
//                             </li>

//                             <li>
//                                 <Link to="/RateMasters/vendor">
//                                     <FaTruck className="submenu-icon" />
//                                     <span>Vendor Rate</span>
//                                 </Link>
//                             </li>

//                             <li>
//                                 <Link to="/RateMasters/hotel">
//                                     <FaHotel className="submenu-icon" />
//                                     <span>Caterers Rate</span>
//                                 </Link>
//                             </li>

//                         </ul>
//                     )}
//                 </li>

//                 {/* ASSIGNMENTS */}
//                 <li>
//                     <Link to="/assignments">
//                         <FaCalendarAlt className="menu-icon" />
//                         <span>Assignments</span>
//                     </Link>
//                 </li>

//                 {/* MASTER ALLOCATIONS */}
//                 <li>
//                     <Link to="/master-allocations">
//                         <FaLayerGroup className="menu-icon" />
//                         <span>Master Allocations</span>
//                     </Link>
//                 </li>

//                 {/* BILLING */}
//                 {/* <li>
//                     <Link to="/billing">
//                         <FaFileInvoiceDollar className="menu-icon" />
//                         <span>Billing</span>
//                     </Link>
//                 </li> */}

//                 {/* ADVANCE */}
//                 <li className="menu-parent">

//                     <div
//                         className="menu-title"
//                         onClick={() => setAdvanceOpen(!advanceOpen)}
//                     >
//                         <span className="menu-title-left">
//                             <FaWallet className="menu-icon" />
//                             <span>Advance</span>
//                         </span>

//                         <FaChevronDown
//                             className={`arrow ${advanceOpen ? "rotate" : ""}`}
//                         />
//                     </div>

//                     {advanceOpen && (
//                         <ul className="submenu">

//                             <li>
//                                 <Link to="/advances/employee">
//                                     <FaUserClock className="submenu-icon" />
//                                     <span>Employee Advance</span>
//                                 </Link>
//                             </li>

//                             {/* <li>
//                                 <Link to="/advances/hotel">
//                                     <FaHotel className="submenu-icon" />
//                                     <span>Hotel Advance</span>
//                                 </Link>
//                             </li> */}

//                             <li>
//                                 <Link to="/advances/vendor">
//                                     <FaTruck className="submenu-icon" />
//                                     <span>Vendor Advance</span>
//                                 </Link>
//                             </li>

//                         </ul>
//                     )}
//                 </li>

//                 {/* PAYMENT */}
//                 <li className="menu-parent">

//                     <div
//                         className="menu-title"
//                         onClick={() => setPaymentOpen(!paymentOpen)}
//                     >
//                         <span className="menu-title-left">
//                             <FaMoneyBillWave className="menu-icon" />
//                             <span>Payment</span>
//                         </span>

//                         <FaChevronDown
//                             className={`arrow ${paymentOpen ? "rotate" : ""}`}
//                         />
//                     </div>

//                     {paymentOpen && (
//                         <ul className="submenu">

//                             <li>
//                                 <Link to="/daily-employee-payment">
//                                     <FaUserClock className="submenu-icon" />
//                                     <span>In-House Employee Payment</span>
//                                 </Link>
//                             </li>

//                             <li>
//                                 <Link to="/vendor-employee-payment">
//                                     <FaTruck className="submenu-icon" />
//                                     <span>Vendor Payment</span>
//                                 </Link>
//                             </li>

//                             <li>
//                                 <Link to="/hotel-payment">
//                                     <FaHotel className="submenu-icon" />
//                                     <span>Caterers Payment</span>
//                                 </Link>
//                             </li>

//                         </ul>
//                     )}
//                 </li>

//                 {/* REPORT */}
//                 <li className="menu-parent">

//                     <div
//                         className="menu-title"
//                         onClick={() => setReportOpen(!reportOpen)}
//                     >
//                         <span className="menu-title-left">
//                             <FaChartBar className="menu-icon" />
//                             <span>Report</span>
//                         </span>

//                         <FaChevronDown
//                             className={`arrow ${reportOpen ? "rotate" : ""}`}
//                         />
//                     </div>

//                     {reportOpen && (
//                         <ul className="submenu">

//                             <li>
//                                 <Link to="/reports">
//                                     <FaFileInvoiceDollar className="submenu-icon" />
//                                     <span>All Reports</span>
//                                 </Link>
//                             </li>

//                             {/* <li>
//                                 <Link to="/reports/employee">
//                                     <FaUsers className="submenu-icon" />
//                                     <span>Employee Report</span>
//                                 </Link>
//                             </li>

//                             <li>
//                                 <Link to="/reports/hotel">
//                                     <FaHotel className="submenu-icon" />
//                                     <span>Caterers Report</span>
//                                 </Link>
//                             </li>

//                             <li>
//                                 <Link to="/reports/vendor">
//                                     <FaTruck className="submenu-icon" />
//                                     <span>Vendor Report</span>
//                                 </Link>
//                             </li> */}

//                         </ul>
//                     )}
//                 </li>

//             </ul>
//         </aside>
//     );
// }

// export default Sidebar;


import { Link } from "react-router-dom";

import {
    FaTachometerAlt,
    FaUsers,
    FaTruck,
    FaHotel,
    FaCalendarAlt,
    FaLayerGroup,
    FaWallet,
    FaMoneyBillWave,
    FaChartBar,
    FaUserClock,
    FaCoins,
    FaFileInvoiceDollar,
    FaUtensils
} from "react-icons/fa";

import "../CSS/Sidebar.css";

function Sidebar() {

    return (
        <aside className="sidebar">

            {/* BRAND */}
            <div className="sidebar-brand">
                <FaUtensils className="brand-icon" />
                <h3>Menu</h3>
            </div>

            <ul className="sidebar-menu">

                {/* DASHBOARD */}
                <li>
                    <Link to="/dashboard">
                        <FaTachometerAlt className="menu-icon" />
                        <span>Dashboard</span>
                    </Link>
                </li>

                {/* EMPLOYEES */}
                <li>
                    <Link to="/employees">
                        <FaUsers className="menu-icon" />
                        <span>Employees</span>
                    </Link>
                </li>

                {/* VENDORS */}
                <li>
                    <Link to="/vendors">
                        <FaTruck className="menu-icon" />
                        <span>Vendors</span>
                    </Link>
                </li>

                {/* CATERERS */}
                <li>
                    <Link to="/hotels">
                        <FaHotel className="menu-icon" />
                        <span>Caterers</span>
                    </Link>
                </li>

                {/* RATE MASTER */}
                <li className="menu-parent">
                    <div className="menu-title">
                        <span className="menu-title-left">
                            <FaCoins className="menu-icon" />
                            <span>Rate Master</span>
                        </span>
                    </div>

                    <ul className="submenu">
                        <li>
                            <Link to="/RateMasters/employee">
                                <FaUsers className="submenu-icon" />
                                <span>Employee Rate</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/RateMasters/vendor">
                                <FaTruck className="submenu-icon" />
                                <span>Vendor Rate</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/RateMasters/hotel">
                                <FaHotel className="submenu-icon" />
                                <span>Caterers Rate</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                {/* ASSIGNMENTS */}
                <li>
                    <Link to="/assignments">
                        <FaCalendarAlt className="menu-icon" />
                        <span>Assignments</span>
                    </Link>
                </li>

                {/* MASTER ALLOCATIONS */}
                <li>
                    <Link to="/master-allocations">
                        <FaLayerGroup className="menu-icon" />
                        <span>Master Allocations</span>
                    </Link>
                </li>

                {/* ADVANCE */}
                <li className="menu-parent">
                    <div className="menu-title">
                        <span className="menu-title-left">
                            <FaWallet className="menu-icon" />
                            <span>Advance</span>
                        </span>
                    </div>

                    <ul className="submenu">
                        <li>
                            <Link to="/advances/employee">
                                <FaUserClock className="submenu-icon" />
                                <span>Employee Advance</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/advances/vendor">
                                <FaTruck className="submenu-icon" />
                                <span>Vendor Advance</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                {/* PAYMENT */}
                <li className="menu-parent">
                    <div className="menu-title">
                        <span className="menu-title-left">
                            <FaMoneyBillWave className="menu-icon" />
                            <span>Payment</span>
                        </span>
                    </div>

                    <ul className="submenu">
                        <li>
                            <Link to="/daily-employee-payment">
                                <FaUserClock className="submenu-icon" />
                                <span>In-House Employee Payment</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/vendor-employee-payment">
                                <FaTruck className="submenu-icon" />
                                <span>Vendor Payment</span>
                            </Link>
                        </li>

                        <li>
                            <Link to="/hotel-payment">
                                <FaHotel className="submenu-icon" />
                                <span>Caterers Payment</span>
                            </Link>
                        </li>
                    </ul>
                </li>

                {/* REPORT */}
                <li className="menu-parent">
                    <div className="menu-title">
                        <span className="menu-title-left">
                            <FaChartBar className="menu-icon" />
                            <span>Report</span>
                        </span>
                    </div>

                    <ul className="submenu">
                        <li>
                            <Link to="/reports">
                                <FaFileInvoiceDollar className="submenu-icon" />
                                <span>All Reports</span>
                            </Link>
                        </li>
                    </ul>
                </li>

            </ul>
        </aside>
    );
}

export default Sidebar;
