import React, {  useEffect,  useState } from "react";

import {    useNavigate } from "react-router-dom";

import { getEmployeeAdvances,deleteEmployeeAdvance } from "../api/employeeAdvanceApi";


import "../CSS/EmployeeAdvance.css";


function EmployeeAdvance() {

    const navigate = useNavigate();

    const [advances, setAdvances] = useState([]);

    const [searchText, setSearchText] =   useState("");

    const [loading, setLoading] =  useState(false);

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadAdvances = async () => {

        try {

            setLoading(true);

            const response =
                await getEmployeeAdvances();

            // console.log(
            //     "Employee Advance API:",
            //     response.data
            //);

            setAdvances(
                Array.isArray(response.data) ? response.data : []
            );

        } catch (error) {

            console.error(
                "Error loading employee advances:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load employee advances."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadAdvances();

    }, []);


    // =========================================================
    // ADD
    // =========================================================

    const handleAdd = () => {

        navigate(
            "/advances/employee/add"
        );

    };


    // =========================================================
    // EDIT
    // =========================================================

    const handleEdit = (id) => {

        navigate(
            `/advances/employee/edit/${id}`
        );

    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this employee advance?"
            );

        if (!confirmDelete) {
            return;
        }

        try {

            await deleteEmployeeAdvance(id);

            alert(
                "Employee advance deleted successfully."
            );

            await loadAdvances();

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete employee advance."
            );
        }
    };


    // =========================================================
    // SEARCH
    // =========================================================

    const filteredAdvances =
        advances.filter((item) => {

            const search =
                searchText
                    .trim()
                    .toLowerCase();

            if (!search) {
                return true;
            }

            const employeeName =
                item.employeeName
                    ?.toLowerCase() || "";

            const employeeId =
                String(
                    item.employeeId ?? ""
                ).toLowerCase();

            const description =
                item.description
                    ?.toLowerCase() || "";

            return (
                employeeName.includes(search) ||
                employeeId.includes(search) ||
                description.includes(search)
            );

        });


    return (

        <div className="employee-advance-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-advance-header">

                <div>

                    <h1>
                        Employee Advance
                    </h1>

                    <p>
                        Manage employee advance payments.
                    </p>

                </div>


                <button
                    type="button"
                    className="add-advance-btn"
                    onClick={handleAdd}
                >
                    + Add Employee Advance
                </button>

            </div>


            {/* =================================================
                FILTER
            ================================================= */}

            <div className="advance-filter-card">

                <div className="advance-search">

                    <label>
                        Search
                    </label>

                    <input
                        type="text"
                        placeholder="Search employee, ID or description"
                        value={searchText}
                        onChange={(e) =>
                            setSearchText(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="employee-advance-card">

                {loading ? (

                    <div className="loading-message">
                        Loading employee advances...
                    </div>

                ) : (

                    <div className="table-container">

                        <table className="employee-advance-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Advance Date
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    {/* <th>
                                        Adjusted
                                    </th> */}

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredAdvances.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="no-data"
                                        >
                                            No employee advances found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredAdvances.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.advanceId
                                                }
                                            >

                                                <td>
                                                    {
                                                        item.advanceId
                                                    }
                                                </td>

                                                <td>

                                                    <div className="employee-info">

                                                        <strong>
                                                            {
                                                                item.employeeName ||
                                                                "-"
                                                            }
                                                        </strong>

                                                        <small>
                                                            ID: {
                                                                item.employeeId
                                                            }
                                                        </small>

                                                    </div>

                                                </td>

                                                <td>
                                                    {
                                                        item.advanceDate
                                                            ? new Date(
                                                                item.advanceDate
                                                            ).toLocaleDateString(
                                                                "en-GB"
                                                            )
                                                            : "-"
                                                    }
                                                </td>

                                                <td className="amount-column">

                                                    ₹{" "}
                                                    {Number(
                                                        item.amount
                                                    ).toLocaleString(
                                                        "en-IN",
                                                        {
                                                            minimumFractionDigits: 2
                                                        }
                                                    )}

                                                </td>

                                                <td>
                                                    {
                                                        item.description ||
                                                        "-"
                                                    }
                                                </td>

                                                {/* <td>

                                                    {item.isAdjusted ? (

                                                        <span className="status-adjusted">
                                                            Adjusted
                                                        </span>

                                                    ) : (

                                                        <span className="status-pending">
                                                            Pending
                                                        </span>

                                                    )}

                                                </td> */}

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            type="button"
                                                            className="edit-btn"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    item.advanceId
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.advanceId
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );
}

export default EmployeeAdvance;