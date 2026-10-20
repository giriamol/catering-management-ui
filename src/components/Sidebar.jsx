import { Link } from "react-router-dom";
import { useState } from "react";

function Sidebar() {

    // ----------------------------------------------------
    // Menu States
    // ----------------------------------------------------
    const [rateMasterOpen, setRateMasterOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [advanceOpen, setAdvanceOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    return (
        <aside className="sidebar">

            <h3>Menu</h3>

            <ul>

                {/* ==================================================
                    DASHBOARD
                ================================================== */}
                <li>
                    <Link to="/dashboard">
                        Dashboard
                    </Link>
                </li>


                {/* ==================================================
                    EMPLOYEES
                ================================================== */}
                <li>
                    <Link to="/employees">
                        Employees
                    </Link>
                </li>


                {/* ==================================================
                    VENDORS
                ================================================== */}
                <li>
                    <Link to="/vendors">
                        Vendors
                    </Link>
                </li>


                {/* ==================================================
                    HOTELS
                ================================================== */}
                <li>
                    <Link to="/hotels">
                        Hotels
                    </Link>
                </li>


                {/* ==================================================
                    RATE MASTER
                ================================================== */}
                <li className="menu-parent">

                    <div
                        className="menu-title"
                        onClick={() =>
                            setRateMasterOpen(!rateMasterOpen)
                        }
                    >
                        <span>
                            RateMaster
                        </span>

                        <span className="arrow">
                            {rateMasterOpen ? "▲" : "▼"}
                        </span>
                    </div>


                    {rateMasterOpen && (

                        <ul className="submenu">

                            <li>
                                <Link to="/RateMasters/employee">
                                    Employee Rate
                                </Link>
                            </li>

                            <li>
                                <Link to="/RateMasters/vendor">
                                    Vendor Rate
                                </Link>
                            </li>

                            <li>
                                <Link to="/RateMasters/hotel">
                                    Hotel Rate
                                </Link>
                            </li>

                        </ul>

                    )}

                </li>


                {/* ==================================================
                    ASSIGNMENTS
                ================================================== */}
                <li>
                    <Link to="/assignments">
                        Assignments
                    </Link>
                </li>
                 {/* MASTER ALLOCATIONS */}
                <li>
                    <Link
                        to="/master-allocations"
                        // className={({ isActive }) =>
                        //     isActive ? "menu-link active" : "menu-link"
                        // }
                    >
                        <span>Master Allocations</span>
                    </Link>
                </li>

                {/* ==================================================
                    BILLING
                ================================================== */}
                {/* <li>
                    <Link to="/billing">
                        Billing
                    </Link>
                </li> */}

                     {/* ==================================================
                    ADVANCE
                ================================================== */}
                <li className="menu-parent">

                    <div
                        className="menu-title"
                        onClick={() =>
                            setAdvanceOpen(!advanceOpen)
                        }
                    >

                        <span>
                            Advance
                        </span>

                        <span className="arrow">
                            {advanceOpen ? "▲" : "▼"}
                        </span>

                    </div>


                    {advanceOpen && (

                        <ul className="submenu">

                            <li>
                                <Link to="/advances/employee">
                                    Employee Advance
                                </Link>
                            </li>

                            {/* <li>
                                <Link to="/advances/hotel">
                                    Hotel Advance
                                </Link>
                            </li> */}

                            <li>
                                <Link to="/advances/vendor">
                                    Vendor Advance
                                </Link>
                            </li>

                        </ul>

                    )}

                </li>


                {/* ==================================================
                    PAYMENT
                ================================================== */}
                <li className="menu-parent">

                    <div
                        className="menu-title"
                        onClick={() =>
                            setPaymentOpen(!paymentOpen)
                        }
                    >

                        <span>
                            Payment
                        </span>

                        <span className="arrow">
                            {paymentOpen ? "▲" : "▼"}
                        </span>

                    </div>


                    {paymentOpen && (

                        <ul className="submenu">

                            {/* In-House Employee Payment */}
                            <li>
                                <Link to="/daily-employee-payment">
                                    In-House Employee Payment
                                </Link>
                            </li>

                            {/* Vendor Employee Payment */}
                            <li>
                                <Link to="/vendor-employee-payment">
                                    Vendor Payment
                                </Link>
                            </li>


                            {/* Hotel Payment */}
                            <li>
                                <Link to="/hotel-payment">
                                    Hotel Payment
                                </Link>
                            </li>

                        </ul>

                    )}

                </li>


               

                {/* ==================================================
                    REPORT
                ================================================== */}
                <li className="menu-parent">

                    <div
                        className="menu-title"
                        onClick={() =>
                            setReportOpen(!reportOpen)
                        }
                    >

                        <span>
                            Report
                        </span>

                        <span className="arrow">
                            {reportOpen ? "▲" : "▼"}
                        </span>

                    </div>


                    {reportOpen && (

                        <ul className="submenu">

                            <li>
                                <Link to="/reports">
                                    All Reports
                                </Link>
                            </li>

                            <li>
                                <Link to="/reports/employee">
                                    Employee Report
                                </Link>
                            </li>

                            <li>
                                <Link to="/reports/hotel">
                                    Hotel Report
                                </Link>
                            </li>

                            <li>
                                <Link to="/reports/vendor">
                                    Vendor Report
                                </Link>
                            </li>

                        </ul>

                    )}

                </li>

            </ul>

        </aside>
    );
}

export default Sidebar;