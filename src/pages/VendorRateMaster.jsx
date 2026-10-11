// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../CSS/EmployeeRateMaster.css";

// import { getVendors } from "../api/vendorApi";
// import {
//     createVendorRate
//     //updateEmployeeRateMaster
// } from "../api/vendorRateMaster";

// const VendorRateMaster = () => {

//     const navigate = useNavigate();

//     const [vendors, setVendors] = useState([]);
//     const [rateMasters, setRateMasters] = useState([]);

//     useEffect(() => {
//         loadVendors();
//         loadRateMasters();
//     }, []);

//     // =========================
//     // LOAD VENDORS
//     // =========================

//     const loadVendors = async () => {
//         try {

//             const response = await getVendors(1, 2000);

//             console.log("Vendor API Response:", response.data);

//             setVendors(
//                 response.data.items ||
//                 response.data ||
//                 []
//             );

//         } catch (error) {

//             console.error(
//                 "Error loading vendors:",
//                 error
//             );

//         }
//     };

//     // =========================
//     // LOAD VENDOR RATES
//     // =========================

//     const loadRateMasters = async () => {

//         try {

//             const response =
//                 await getEmployeeRateMasters();

//             console.log(
//                 "Vendor Rate API Response:",
//                 response.data
//             );

//             setRateMasters(
//                 response.data.items ||
//                 response.data ||
//                 []
//             );

//         } catch (error) {

//             console.error(
//                 "Error loading vendor rates:",
//                 error
//             );

//         }
//     };

//     // =========================
//     // VENDOR NAME
//     // =========================

//     const getVendorName = (vendorId) => {

//         const vendor = vendors.find(
//             x =>
//                 Number(x.vendorId) ===
//                 Number(vendorId)
//         );

//         if (!vendor) {
//             return "-";
//         }

//         return vendor.vendorName || "-";
//     };

//     // =========================
//     // SHIFT NAME
//     // =========================

//     const getShiftName = (shiftId) => {

//         switch (Number(shiftId)) {

//             case 1:
//                 return "Morning";

//             case 2:
//                 return "Evening";

//             default:
//                 return "-";
//         }
//     };

//     // =========================
//     // EDIT
//     // =========================

//     const handleEdit = (item) => {

//         const id =
//             item.pk_RateMasterId ||
//             item.rateMasterId;

//         navigate(`/vendor-rates/edit/${id}`, {
//             state: {
//                 rateMaster: item
//             }
//         });

//     };

//     // =========================
//     // DELETE
//     // =========================

//     // const handleDelete = async (id) => {

//     //     const confirmDelete =
//     //         window.confirm(
//     //             "Are you sure you want to delete this Vendor rate?"
//     //         );

//     //     if (!confirmDelete) {
//     //         return;
//     //     }

//     //     try {

//     //         await deleteEmployeeRateMaster(id);

//     //         alert(
//     //             "Vendor rate deleted successfully."
//     //         );

//     //         loadRateMasters();

//     //     } catch (error) {

//     //         console.error(error);

//     //         alert(
//     //             error.response?.data?.message ||
//     //             "Unable to delete vendor rate."
//     //         );

//     //     }

//     // };

//     // =========================
//     // ADD VENDOR RATE
//     // =========================

//     const handleAddVendorRate = () => {

//         navigate("/vendor-rates/add");

//     };

//     return (

//         <div className="employee-rate-page">

//             {/* =========================
//                 HEADER
//             ========================= */}

//             <div className="employee-rate-header">

//                 <div>

//                     <h2>
//                         Vendor Rate Master
//                     </h2>

//                     <p>
//                         Manage Vendor Rates
//                     </p>

//                 </div>

//                 <button
//                     type="button"
//                     className="save-btn"
//                     onClick={handleAddVendorRate}
//                 >
//                     + Add Vendor Rate
//                 </button>

//             </div>


//             {/* =========================
//                 LIST
//             ========================= */}

//             <div className="employee-rate-card">

//                 <div className="table-container">

//                     <table className="employee-rate-table">

//                         <thead>

//                             <tr>

//                                 <th>
//                                     ID
//                                 </th>

//                                 <th>
//                                     Vendor
//                                 </th>

//                                 <th>
//                                     Shift
//                                 </th>

//                                 <th>
//                                     Half Day Rate
//                                 </th>

//                                 <th>
//                                     Full Day Rate
//                                 </th>

//                                 <th>
//                                     Two Half Day Rate
//                                 </th>

//                                 <th>
//                                     From Date
//                                 </th>

//                                 <th>
//                                     To Date
//                                 </th>

//                                 <th>
//                                     Action
//                                 </th>

//                             </tr>

//                         </thead>

//                         <tbody>

//                             {rateMasters.length === 0 ? (

//                                 <tr>

//                                     <td
//                                         colSpan="9"
//                                         className="no-data"
//                                     >
//                                         No vendor rates found.
//                                     </td>

//                                 </tr>

//                             ) : (

//                                 rateMasters.map(item => {

//                                     const id =
//                                         item.pk_RateMasterId ||
//                                         item.rateMasterId;

//                                     const vendorId =
//                                         item.fk_VendorId ??
//                                         item.vendorId;

//                                     const shiftId =
//                                         item.shiftId ??
//                                         item.ShiftId;

//                                     return (

//                                         <tr key={id}>

//                                             <td>
//                                                 {id}
//                                             </td>

//                                             <td>
//                                                 {getVendorName(
//                                                     vendorId
//                                                 )}
//                                             </td>

//                                             <td>
//                                                 {getShiftName(
//                                                     shiftId
//                                                 )}
//                                             </td>

//                                             <td>
//                                                 {item.halfDayRate ?? "-"}
//                                             </td>

//                                             <td>
//                                                 {item.fullDayRate ?? "-"}
//                                             </td>

//                                             <td>
//                                                 {item.twoHalfDayRate ?? "-"}
//                                             </td>

//                                             <td>
//                                                 {item.fromDate
//                                                     ? item.fromDate.substring(
//                                                         0,
//                                                         10
//                                                     )
//                                                     : "-"}
//                                             </td>

//                                             <td>
//                                                 {item.toDate
//                                                     ? item.toDate.substring(
//                                                         0,
//                                                         10
//                                                     )
//                                                     : "-"}
//                                             </td>

//                                             <td>

//                                                 <button
//                                                     type="button"
//                                                     className="edit-btn"
//                                                     onClick={() =>
//                                                         handleEdit(item)
//                                                     }
//                                                 >
//                                                     Edit
//                                                 </button>

//                                                 <button
//                                                     type="button"
//                                                     className="delete-btn"
//                                                     onClick={() =>
//                                                         handleDelete(id)
//                                                     }
//                                                 >
//                                                     Delete
//                                                 </button>

//                                             </td>

//                                         </tr>

//                                     );

//                                 })

//                             )}

//                         </tbody>

//                     </table>

//                 </div>

//             </div>

//         </div>

//     );

// };

// export default VendorRateMaster;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../CSS/EmployeeRateMaster.css";

import { getVendors } from "../api/vendorApi";

import {
    getVendorRates
} from "../api/vendorRateMaster";


const VendorRateMaster = () => {

    const navigate = useNavigate();


    // =====================================================
    // VENDORS
    // =====================================================

    const [vendors, setVendors] = useState([]);

    const [vendorLoading, setVendorLoading] = useState(false);


    // =====================================================
    // VENDOR RATES
    // =====================================================

    const [rateMasters, setRateMasters] = useState([]);

    const [loading, setLoading] = useState(false);


    // =====================================================
    // PAGINATION
    // =====================================================

    const [pageNumber, setPageNumber] = useState(1);

    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(1);

    const [totalCount, setTotalCount] = useState(0);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadVendors();

    }, []);


    useEffect(() => {

        loadRateMasters();

    }, [pageNumber]);


    // =====================================================
    // LOAD VENDORS
    // =====================================================

    const loadVendors = async () => {

        try {

            setVendorLoading(true);

            const response =
                await getVendors(1, 2000);

            console.log(
                "Vendor API Response:",
                response.data
            );


            const data = response.data;


            const vendorList =
                data?.items ??
                data?.data ??
                data ??
                [];


            setVendors(
                Array.isArray(vendorList)
                    ? vendorList
                    : []
            );


        } catch (error) {

            console.error(
                "Error loading vendors:",
                error
            );

            setVendors([]);

        } finally {

            setVendorLoading(false);

        }
    };


    // =====================================================
    // LOAD VENDOR RATES
    // =====================================================

    const loadRateMasters = async () => {

        try {

            setLoading(true);


            console.log(
                "Loading Vendor Rates...",
                pageNumber,
                pageSize
            );


            const response =
                await getVendorRates(
                    pageNumber,
                    pageSize
                );


            console.log(
                "Vendor Rate API Response:",
                response.data
            );


            const data = response.data;


            // =================================================
            // GET ITEMS
            // =================================================

            const rateList =
                data?.items ??
                data?.data ??
                data ??
                [];


            setRateMasters(
                Array.isArray(rateList)
                    ? rateList
                    : []
            );


            // =================================================
            // TOTAL COUNT
            // =================================================

            const count =
                Number(
                    data?.totalCount ??
                    data?.totalItems ??
                    data?.count ??
                    0
                );


            setTotalCount(count);


            // =================================================
            // TOTAL PAGES
            // =================================================

            const pages =
                Number(
                    data?.totalPages ??
                    (
                        count > 0
                            ? Math.ceil(
                                count / pageSize
                            )
                            : 1
                    )
                );


            setTotalPages(
                pages || 1
            );


        } catch (error) {

            console.log(
                "Error loading vendor rates:",
                error
            );


            console.error(
                "Response:",
                error?.response?.data
            );


            setRateMasters([]);

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // GET VENDOR NAME
    // =====================================================

    const getVendorName = (vendorId) => {

        if (!vendorId) {
            return "-";
        }


        const vendor =
            vendors.find(
                x =>
                    Number(
                        x.vendorId
                    ) ===
                    Number(
                        vendorId
                    )
            );


        if (!vendor) {
            return `Vendor ID: ${vendorId}`;
        }


        return (
            vendor.vendorName ||
            vendor.name ||
            "-"
        );
    };


    // =====================================================
    // GET SHIFT NAME
    // =====================================================

    const getShiftName = (shiftId) => {

        switch (
            Number(shiftId)
        ) {

            case 1:
                return "Morning";

            case 2:
                return "Evening";

            default:
                return "-";
        }
    };


    // =====================================================
    // ADD VENDOR RATE
    // =====================================================

    const handleAddVendorRate = () => {

        navigate(
            "/RateMasters/vendor/add"
        );
    };


    // =====================================================
    // EDIT
    // =====================================================

    const handleEdit = (item) => {

        const id =
            item.vendorRateHistoryId ??
            item.VendorRateHistoryId ??
            item.rateHistoryId ??
            item.id;


        if (!id) {

            alert(
                "Vendor rate ID not found."
            );

            return;
        }


        navigate(
            `/RateMasters/vendor/edit/${id}`,
            {
                state: {
                    rateMaster: item
                }
            }
        );
    };


    // =====================================================
    // PREVIOUS PAGE
    // =====================================================

    const handlePrevious = () => {

        if (
            pageNumber > 1 &&
            !loading
        ) {

            setPageNumber(
                previous =>
                    previous - 1
            );
        }
    };


    // =====================================================
    // NEXT PAGE
    // =====================================================

    const handleNext = () => {

        if (
            pageNumber < totalPages &&
            !loading
        ) {

            setPageNumber(
                previous =>
                    previous + 1
            );
        }
    };


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {

        loadRateMasters();
    };
const handleAdd = () => {
    navigate("/RateMasters/vendor/add");
};

// const handleEdit = (rate) => {
//     navigate(`/RateMasters/vendor/edit/${rate.vendorRateHistoryId}`, {
//         state: { rateMaster: rate }
//     });
// };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="employee-rate-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-rate-header">

                <div>

                    <h2>
                        Vendor Rate Master
                    </h2>

                    <p>
                        Manage Vendor Rates
                    </p>

                </div>


                <button
    type="button"
    className="save-btn"
    onClick={handleAddVendorRate}
    style={{
        position: "relative",
        zIndex: 10,
        cursor: "pointer",
        pointerEvents: "auto"
    }}
>
    + Add Vendor Rate
</button>

            </div>


            {/* =================================================
                TABLE CARD
            ================================================= */}

            <div className="employee-rate-card">


                {/* =================================================
                    TOP INFORMATION
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginBottom: "15px"
                    }}
                >

                    <div>

                        <strong>
                            Vendor Rates
                        </strong>

                        <span
                            style={{
                                marginLeft: "10px"
                            }}
                        >
                            Total: {totalCount}
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            loading
                        }
                    >
                        {loading
                            ? "Loading..."
                            : "Refresh"}
                    </button>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="table-container">

                    <table
                        className="employee-rate-table"
                    >

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Vendor
                                </th>

                                <th>
                                    Half Day Shift
                                </th>

                                <th>
                                    Half Day Rate
                                </th>

                                <th>
                                    Full Day Shift
                                </th>

                                <th>
                                    Full Day Rate
                                </th>

                                {/* <th>
                                    Two Half Day Rate
                                </th> */}

                                <th>
                                    From Date
                                </th>

                                <th>
                                    To Date
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            {/* =================================================
                                LOADING
                            ================================================= */}

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="10"
                                        className="no-data"
                                    >
                                        Loading vendor rates...
                                    </td>

                                </tr>

                            ) : rateMasters.length === 0 ? (

                                /* =================================================
                                    NO DATA
                                ================================================= */

                                <tr>

                                    <td
                                        colSpan="10"
                                        className="no-data"
                                    >
                                        No vendor rates found.
                                    </td>

                                </tr>

                            ) : (

                                /* =================================================
                                    DATA
                                ================================================= */

                                rateMasters.map(
                                    (item, index) => {


                                        // -----------------------------------------
                                        // ID
                                        // -----------------------------------------

                                        const id =
                                            item.vendorRateHistoryId ??
                                            item.VendorRateHistoryId ??
                                            item.rateHistoryId ??
                                            item.id ??
                                            index;


                                        // -----------------------------------------
                                        // Vendor ID
                                        // -----------------------------------------

                                        const vendorId =
                                            item.vendorId ??
                                            item.VendorId ??
                                            item.fk_VendorId;


                                        // -----------------------------------------
                                        // Half Shift
                                        // -----------------------------------------

                                        const halfShiftId =
                                            item.HalfDShiftId ??
                                            item.halfDShiftId ??
                                            item.halfDayShiftId;


                                        // -----------------------------------------
                                        // Full Shift
                                        // -----------------------------------------

                                        const fullShiftId =
                                            item.FullDShiftId ??
                                            item.fullDShiftId ??
                                            item.fullDayShiftId;


                                        // -----------------------------------------
                                        // Rates
                                        // -----------------------------------------

                                        const halfDayRate =
                                            item.halfDayRate ??
                                            item.HalfDayRate;


                                        const fullDayRate =
                                            item.fullDayRate ??
                                            item.FullDayRate;


                                        const twoHalfDayRate =
                                            item.twoHalfDayRate ??
                                            item.TwoHalfDayRate;


                                        // -----------------------------------------
                                        // Dates
                                        // -----------------------------------------

                                        const fromDate =
                                            item.fromDate ??
                                            item.FromDate;


                                        const toDate =
                                            item.toDate ??
                                            item.ToDate;


                                        return (

                                            <tr
                                                key={id}
                                            >

                                                {/* ID */}

                                                <td>
                                                    {id}
                                                </td>


                                                {/* Vendor */}

                                                <td>
                                                    {
                                                        getVendorName(
                                                            vendorId
                                                        )
                                                    }
                                                </td>


                                                {/* Half Shift */}

                                                <td>

                                                    {halfShiftId
                                                        ? (
                                                            <>
                                                                {halfShiftId}
                                                                {" - "}
                                                                {
                                                                    getShiftName(
                                                                        halfShiftId
                                                                    )
                                                                }
                                                            </>
                                                        )
                                                        : "-"
                                                    }

                                                </td>


                                                {/* Half Rate */}

                                                <td>
                                                    {
                                                        halfDayRate ??
                                                        "-"
                                                    }
                                                </td>


                                                {/* Full Shift */}

                                                <td>

                                                    {fullShiftId
                                                        ? (
                                                            <>
                                                                {fullShiftId}
                                                                {" - "}
                                                                {
                                                                    getShiftName(
                                                                        fullShiftId
                                                                    )
                                                                }
                                                            </>
                                                        )
                                                        : "-"
                                                    }

                                                </td>


                                                {/* Full Rate */}

                                                <td>
                                                    {
                                                        fullDayRate ??
                                                        "-"
                                                    }
                                                </td>


                                                {/* Two Half */}

                                                {/* <td>
                                                    {
                                                        twoHalfDayRate ??
                                                        "-"
                                                    }
                                                </td> */}


                                                {/* From */}

                                                <td>

                                                    {fromDate
                                                        ? String(
                                                            fromDate
                                                        ).substring(
                                                            0,
                                                            10
                                                        )
                                                        : "-"
                                                    }

                                                </td>


                                                {/* To */}

                                                <td>

                                                    {toDate
                                                        ? String(
                                                            toDate
                                                        ).substring(
                                                            0,
                                                            10
                                                        )
                                                        : "-"
                                                    }

                                                </td>


                                                {/* Actions */}

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            handleEdit(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                            )}

                        </tbody>

                    </table>

                </div>


                {/* =================================================
                    PAGINATION
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        marginTop: "20px",
                        padding: "10px 0"
                    }}
                >

                    {/* Left */}

                    <div>

                        Showing page{" "}
                        <strong>
                            {pageNumber}
                        </strong>

                        {" "}of{" "}

                        <strong>
                            {totalPages}
                        </strong>

                    </div>


                    {/* Right */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={
                                handlePrevious
                            }
                            disabled={
                                pageNumber === 1 ||
                                loading
                            }
                        >
                            Previous
                        </button>


                        <span>

                            Page{" "}
                            <strong>
                                {pageNumber}
                            </strong>

                        </span>


                        <button
                            type="button"
                            onClick={
                                handleNext
                            }
                            disabled={
                                pageNumber >=
                                totalPages ||
                                loading
                            }
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default VendorRateMaster;