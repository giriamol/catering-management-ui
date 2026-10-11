// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../CSS/EmployeeRateMaster.css";

// import {
//     getEmployeeRateMastersPaged
// } from "../api/employeeRateMasterApi";

// import {
//     getEmployees
// } from "../api/employeeApi";

// const EmployeeRateMaster = () => {
//     const navigate = useNavigate();

//     const [employees, setEmployees] = useState([]);
//     const [employeeList, setEmployeeList] = useState([]);
//     const [searchText, setSearchText] = useState("");
//     const [loading, setLoading] = useState(false);

//     const [pageNumber, setPageNumber] = useState(1);
//     const [pageSize] = useState(20);
//     const [totalRecords, setTotalRecords] = useState(0);
//     const [totalPages, setTotalPages] = useState(0);

//     useEffect(() => {
//         loadEmployees();
//     }, []);

//     useEffect(() => {
//         loadRateRecords();
//     }, [pageNumber, pageSize]);

//     const loadEmployees = async () => {
//         try {
//             const response = await getEmployees(1, 2000);

//             console.log(
//                 "Employee API response:",
//                 response.data
//             );

//             const data = response.data;

//             if (Array.isArray(data)) {
//                 setEmployeeList(data);
//             }
//             else if (Array.isArray(data?.items)) {
//                 setEmployeeList(data.items);
//             }
//             else if (Array.isArray(data?.data)) {
//                 setEmployeeList(data.data);
//             }
//             else if (Array.isArray(data?.employees)) {
//                 setEmployeeList(data.employees);
//             }
//             else {
//                 setEmployeeList([]);
//             }
//         }
//         catch (error) {
//             console.error(
//                 "Error loading employees:",
//                 error.response?.data || error
//             );

//             setEmployeeList([]);
//         }
//     };

//     const loadRateRecords = async () => {
//         try {
//             setLoading(true);

//             const response =
//                 await getEmployeeRateMastersPaged(
//                     pageNumber,
//                     pageSize
//                 );

//             const data = response.data;

//             console.log(
//                 "Rate Master API response:",
//                 data
//             );

//             setEmployees(data.items || []);
//             setTotalRecords(
//                 data.totalRecords || 0
//             );
//             setTotalPages(
//                 data.totalPages || 0
//             );
//         }
//         catch (error) {
//             console.error(
//                 "Error fetching Rate Master records:",
//                 error.response?.data || error
//             );

//             setEmployees([]);
//             setTotalRecords(0);
//             setTotalPages(0);
//         }
//         finally {
//             setLoading(false);
//         }
//     };

//     const getEmployeeName = (employeeId) => {
//         if (!employeeId) {
//             return "-";
//         }

//         const employee =
//             employeeList.find(
//                 (item) =>
//                     Number(item.employeeId) ===
//                     Number(employeeId)
//             );

//         return employee?.fullName || "-";
//     };

//     const handleAdd = () => {
//         navigate(
//             "/RateMasters/employeerate/add"
//         );
//     };

//     const handleEdit = (rateMasterId) => {
//         if (!rateMasterId) {
//             alert(
//                 "Employee rate ID not found."
//             );
//             return;
//         }

//         navigate(
//             "/RateMasters/employeerate/add", {
//             state: {
//                 rateId: rate.employeeRateHistoryId
//             }} );
//     };

//     const filteredEmployees =
//         employees.filter((employee) => {

//             const employeeId =
//                 employee.employeeId ??
//                 employee.fkEmployeeId ??
//                 "";

//             const employeeName =
//                 getEmployeeName(
//                     employeeId
//                 ).toLowerCase();

//             const search =
//                 searchText
//                     .trim()
//                     .toLowerCase();

//             return (
//                 employeeName.includes(search) ||
//                 String(employeeId).includes(search)
//             );
//         });

//     return (
//         <div className="employee-rate-page">

//             <div className="employee-rate-header">

//                 <div>

//                     <h2>
//                         Employee Rate Master List
//                     </h2>

//                     <p>
//                         Employees added to Rate Master
//                     </p>

//                 </div>

//                 <button
//                     type="button"
//                     className="add-rate-btn"
//                     onClick={handleAdd}
//                 >
//                     + Add Employee Rate
//                 </button>

//             </div>

//             <div className="employee-rate-search">

//                 <input
//                     type="text"
//                     placeholder="Search employee by name or ID..."
//                     value={searchText}
//                     onChange={(e) => {
//                         setSearchText(
//                             e.target.value
//                         );
//                         setPageNumber(1);
//                     }}
//                 />

//             </div>

//             {loading ? (

//                 <div className="loading-message">
//                     Loading employee rate records...
//                 </div>

//             ) : (

//                 <>

//                     <div className="employee-rate-table-container">

//                         <table className="employee-rate-table">

//                             <thead>

//                                 <tr>

//                                     <th>
//                                         Sr.No
//                                     </th>

//                                     <th>
//                                         Employee
//                                     </th>

//                                     <th>
//                                         Half Day Rate
//                                     </th>

//                                     <th>
//                                         Full Day Rate
//                                     </th>

//                                     <th>
//                                         Two Half Day Rate
//                                     </th>

//                                     <th>
//                                         From Date
//                                     </th>

//                                     <th>
//                                         To Date
//                                     </th>

//                                     <th>
//                                         Action
//                                     </th>

//                                 </tr>

//                             </thead>

//                             <tbody>

//                                 {filteredEmployees.length === 0 ? (

//                                     <tr>

//                                         <td
//                                             colSpan="8"
//                                             className="no-data"
//                                         >
//                                             No employee rate records found.
//                                         </td>

//                                     </tr>

//                                 ) : (

//                                     filteredEmployees.map(
//                                         (employee, index) => {

//                                             const rateMasterId =
//                                                 employee.rateMasterId ??
//                                                 employee.employeeRateHistoryId ??
//                                                 employee.employeeRateHistoryID ??
//                                                 employee.id;

//                                             const employeeId =
//                                                 employee.employeeId ??
//                                                 employee.fkEmployeeId;

//                                             const employeeName =
//                                                 getEmployeeName(
//                                                     employeeId
//                                                 );

//                                             return (

//                                                 <tr
//                                                     key={
//                                                         rateMasterId
//                                                     }
//                                                 >

//                                                     <td>
//                                                         {
//                                                             (pageNumber - 1) *
//                                                             pageSize +
//                                                             index +
//                                                             1
//                                                         }
//                                                     </td>

//                                                     <td>
//                                                         {
//                                                             employeeName
//                                                         }
//                                                     </td>

//                                                     <td>
//                                                         {
//                                                             employee.halfDayRate ??
//                                                             "-"
//                                                         }
//                                                     </td>

//                                                     <td>
//                                                         {
//                                                             employee.fullDayRate ??
//                                                             "-"
//                                                         }
//                                                     </td>

//                                                     <td>
//                                                         {
//                                                             employee.twoHalfDayRate ??
//                                                             "-"
//                                                         }
//                                                     </td>

//                                                     <td>
//                                                         {
//                                                             employee.fromDate
//                                                                 ? String(
//                                                                     employee.fromDate
//                                                                 ).substring(
//                                                                     0,
//                                                                     10
//                                                                 )
//                                                                 : "-"
//                                                         }
//                                                     </td>

//                                                     <td>
//                                                         {
//                                                             employee.toDate
//                                                                 ? String(
//                                                                     employee.toDate
//                                                                 ).substring(
//                                                                     0,
//                                                                     10
//                                                                 )
//                                                                 : "-"
//                                                         }
//                                                     </td>

//                                                     <td>

//                                                         <button
//                                                             type="button"
//                                                             className="edit-rate-btn"
//                                                             onClick={() =>
//                                                                 handleEdit(
//                                                                     rateMasterId
//                                                                 )
//                                                             }
//                                                         >
//                                                             Edit
//                                                         </button>

//                                                     </td>

//                                                 </tr>

//                                             );
//                                         }
//                                     )

//                                 )}

//                             </tbody>

//                         </table>

//                     </div>

//                     <div className="employee-rate-pagination">

//                         <span>
//                             Total Records:{" "}
//                             {totalRecords}
//                         </span>

//                         <button
//                             type="button"
//                             disabled={
//                                 pageNumber <= 1
//                             }
//                             onClick={() =>
//                                 setPageNumber(
//                                     (prev) =>
//                                         prev - 1
//                                 )
//                             }
//                         >
//                             Previous
//                         </button>

//                         <span>
//                             Page{" "}
//                             {pageNumber}{" "}
//                             of{" "}
//                             {Math.max(
//                                 totalPages,
//                                 1
//                             )}
//                         </span>

//                         <button
//                             type="button"
//                             disabled={
//                                 totalPages === 0 ||
//                                 pageNumber >=
//                                     totalPages
//                             }
//                             onClick={() =>
//                                 setPageNumber(
//                                     (prev) =>
//                                         prev + 1
//                                 )
//                             }
//                         >
//                             Next
//                         </button>

//                     </div>

//                 </>

//             )}

//         </div>
//     );
// };

// export default EmployeeRateMaster;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/EmployeeRateMaster.css";

import {
    getEmployeeRateMastersPaged
} from "../api/employeeRateMasterApi";

import {
    getEmployees
} from "../api/employeeApi";

const EmployeeRateMaster = () => {

    const navigate = useNavigate();

    // Rate Master records
    const [employees, setEmployees] = useState([]);

    // Employee master list
    const [employeeList, setEmployeeList] = useState([]);

    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(20);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);


    // =========================================================
    // LOAD EMPLOYEES
    // =========================================================

    useEffect(() => {
        loadEmployees();
    }, []);


    // =========================================================
    // LOAD RATE MASTER RECORDS
    // =========================================================

    useEffect(() => {
        loadRateRecords();
    }, [pageNumber, pageSize]);


    // =========================================================
    // LOAD EMPLOYEE LIST
    // =========================================================

    const loadEmployees = async () => {

        try {

            const response =
                await getEmployees(1, 2000);

            console.log(
                "Employee API response:",
                response.data
            );

            const data = response.data;

            let employeeData = [];


            if (Array.isArray(data)) {

                employeeData = data;

            }
            else if (Array.isArray(data?.items)) {

                employeeData = data.items;

            }
            else if (Array.isArray(data?.data)) {

                employeeData = data.data;

            }
            else if (Array.isArray(data?.employees)) {

                employeeData = data.employees;

            }
            else if (Array.isArray(data?.result)) {

                employeeData = data.result;

            }
            else if (
                Array.isArray(data?.data?.items)
            ) {

                employeeData = data.data.items;

            }


            console.log(
                "Final employee list:",
                employeeData
            );

            console.log(
                "Employee count:",
                employeeData.length
            );


            setEmployeeList(employeeData);

        }
        catch (error) {

            console.error(
                "Error loading employees:",
                error.response?.data || error
            );

            setEmployeeList([]);

        }

    };


    // =========================================================
    // LOAD RATE MASTER
    // =========================================================

    const loadRateRecords = async () => {

        try {

            setLoading(true);

            const response =
                await getEmployeeRateMastersPaged(
                    pageNumber,
                    pageSize
                );

            console.log(
                "Rate Master API response:",
                response.data
            );

            const data = response.data;


            setEmployees(
                data?.items || []
            );


            setTotalRecords(
                data?.totalRecords || 0
            );


            setTotalPages(
                data?.totalPages || 0
            );

        }
        catch (error) {

            console.error(
                "Error fetching Rate Master records:",
                error.response?.data || error
            );

            setEmployees([]);

            setTotalRecords(0);

            setTotalPages(0);

        }
        finally {

            setLoading(false);

        }

    };


    // =========================================================
    // GET EMPLOYEE NAME
    // =========================================================

    const getEmployeeName = (employeeId) => {

        if (
            employeeId === null ||
            employeeId === undefined ||
            employeeId === ""
        ) {
            return "-";
        }


        const employee =
            employeeList.find(
                (item) => {

                    const id =
                        item?.employeeId ??
                        item?.EmployeeId ??
                        item?.id ??
                        item?.Id;

                    return (
                        Number(id) ===
                        Number(employeeId)
                    );

                }
            );


        if (!employee) {
            return "-";
        }


        return (
            employee?.fullName ??
            employee?.FullName ??
            employee?.employeeName ??
            employee?.EmployeeName ??
            employee?.name ??
            employee?.Name ??
            "-"
        );

    };


    // =========================================================
    // ADD
    // =========================================================

    const handleAdd = () => {

        navigate(
            "/RateMasters/employeerate/add"
        );

    };


    // =========================================================
    // EDIT
    // =========================================================

    const handleEdit = (rateMasterId) => {

        console.log(
            "Edit EmployeeRateHistoryId:",
            rateMasterId
        );


        if (
            rateMasterId === null ||
            rateMasterId === undefined ||
            rateMasterId === ""
        ) {

            alert(
                "Employee rate history ID not found."
            );

            return;

        }


        // SAME PAGE IS USED FOR ADD + EDIT
        navigate(
        `/RateMasters/employeerate/edit/${rateMasterId}`
    );

    };


    // =========================================================
    // SEARCH
    // =========================================================

    const filteredEmployees =
        employees.filter((employee) => {

            const employeeId =
                employee?.employeeId ??
                employee?.EmployeeId ??
                employee?.fkEmployeeId ??
                "";


            const employeeName =
                getEmployeeName(
                    employeeId
                ).toLowerCase();


            const search =
                searchText
                    .trim()
                    .toLowerCase();


            return (
                employeeName.includes(search) ||
                String(employeeId)
                    .includes(search)
            );

        });


    // =========================================================
    // RETURN
    // =========================================================

    return (

        <div className="employee-rate-page">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="employee-rate-header">

                <div>

                    <h2>
                        Employee Rate Master List
                    </h2>

                    <p>
                        Employees added to Rate Master
                    </p>

                </div>


                <button
                    type="button"
                    className="add-rate-btn"
                     style={{
        position: "relative",
        zIndex: 10,
        cursor: "pointer",
        pointerEvents: "auto"
    }}
                    onClick={handleAdd}

                >
                    + Add Employee Rate
                </button>

            </div>


            {/* ================================================= */}
            {/* SEARCH */}
            {/* ================================================= */}

            <div className="employee-rate-search">

                <input
                    type="text"
                    placeholder="Search employee by name or ID..."
                    value={searchText}
                    onChange={(e) => {

                        setSearchText(
                            e.target.value
                        );

                        setPageNumber(1);

                    }}
                />

            </div>


            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading ? (

                <div className="loading-message">

                    Loading employee rate records...

                </div>

            ) : (

                <>


                    {/* ================================================= */}
                    {/* TABLE */}
                    {/* ================================================= */}

                    <div className="employee-rate-table-container">

                        <table className="employee-rate-table">

                            <thead>

                                <tr>

                                    <th>
                                        Sr.No
                                    </th>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Half Day Rate
                                    </th>

                                    <th>
                                        Full Day Rate
                                    </th>

                                    <th>
                                        Two Half Day Rate
                                    </th>

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

                                {filteredEmployees.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="no-data"
                                        >
                                            No employee rate records found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredEmployees.map(
                                        (employee, index) => {


                                            // =================================================
                                            // EMPLOYEE RATE HISTORY ID
                                            // =================================================

                                            const rateMasterId =
                                                employee?.employeeRateHistoryId;


                                            // =================================================
                                            // EMPLOYEE ID
                                            // =================================================

                                            const employeeId =
                                                employee?.employeeId;


                                            // =================================================
                                            // EMPLOYEE NAME
                                            // =================================================

                                            const employeeName =
                                                getEmployeeName(
                                                    employeeId
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        rateMasterId
                                                    }
                                                >


                                                    {/* SR NO */}

                                                    <td>

                                                        {
                                                            (pageNumber - 1) *
                                                            pageSize +
                                                            index +
                                                            1
                                                        }

                                                    </td>


                                                    {/* EMPLOYEE */}

                                                    <td>

                                                        {employeeName}

                                                    </td>


                                                    {/* HALF DAY RATE */}

                                                    <td>

                                                        {
                                                            employee?.halfDayRate ??
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* FULL DAY RATE */}

                                                    <td>

                                                        {
                                                            employee?.fullDayRate ??
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* TWO HALF DAY RATE */}

                                                    <td>

                                                        {
                                                            employee?.twoHalfDayRate ??
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* EFFECTIVE FROM */}

                                                    <td>

                                                        {
                                                            employee?.effectiveFrom
                                                                ? String(
                                                                    employee.effectiveFrom
                                                                ).substring(
                                                                    0,
                                                                    10
                                                                )
                                                                : "-"
                                                        }

                                                    </td>


                                                    {/* EFFECTIVE TO */}

                                                    <td>

                                                        {
                                                            employee?.effectiveTo
                                                                ? String(
                                                                    employee.effectiveTo
                                                                ).substring(
                                                                    0,
                                                                    10
                                                                )
                                                                : "-"
                                                        }

                                                    </td>


                                                    {/* EDIT */}

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="edit-rate-btn"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    rateMasterId
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


                    {/* ================================================= */}
                    {/* PAGINATION */}
                    {/* ================================================= */}

                    <div className="employee-rate-pagination">

                        <span>

                            Total Records:{" "}

                            {totalRecords}

                        </span>


                        <button
                            type="button"
                            disabled={
                                pageNumber <= 1
                            }
                            onClick={() =>
                                setPageNumber(
                                    (prev) =>
                                        prev - 1
                                )
                            }
                        >
                            Previous
                        </button>


                        <span>

                            Page{" "}

                            {pageNumber}{" "}

                            of{" "}

                            {Math.max(
                                totalPages,
                                1
                            )}

                        </span>


                        <button
                            type="button"
                            disabled={
                                totalPages === 0 ||
                                pageNumber >= totalPages
                            }
                            onClick={() =>
                                setPageNumber(
                                    (prev) =>
                                        prev + 1
                                )
                            }
                        >
                            Next
                        </button>

                    </div>

                </>

            )}

        </div>

    );

};

export default EmployeeRateMaster;