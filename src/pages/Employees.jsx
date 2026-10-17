
import { useEffect, useState } from "react";
import { getEmployees, deleteEmployee } from "../api/employeeApi";
import { useNavigate } from "react-router-dom";
import "../CSS/Employees.css";

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(30);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleEdit = (employeeId) => {
        navigate(`/employees/edit/${employeeId}`);
    };

    const handleDelete = async (employeeId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteEmployee(employeeId);

            alert("Employee deleted successfully.");

            loadEmployees(pageNumber);
        } catch (error) {
            console.error("Error deleting employee:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete employee."
            );
        }
    };

    const loadEmployees = async (page = 1) => {
        try {
            setLoading(true);

            const response = await getEmployees(page, pageSize);
            const data = response.data;

            setEmployees(data.items || []);
            setPageNumber(data.pageNumber || page);
            setTotalPages(data.totalPages || 0);
            setTotalRecords(data.totalRecords || 0);
        } catch (error) {
            console.error("Error loading employees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployees(1);
    }, []);

    const filteredEmployees = employees.filter((employee) => {
        const search = searchText.trim().toLowerCase();

        const fullName = employee.fullName?.toLowerCase() || "";
        const email = employee.emailId?.toLowerCase() || "";
        const mobile = employee.mobileNumber?.toLowerCase() || "";
        const aadhaar = employee.aadhaarNumber?.toLowerCase() || "";

        return (
            fullName.includes(search) ||
            email.includes(search) ||
            mobile.includes(search) ||
            aadhaar.includes(search)
        );
    });

    const handlePrevious = () => {
        if (pageNumber > 1) {
            loadEmployees(pageNumber - 1);
        }
    };

    const handleNext = () => {
        if (pageNumber < totalPages) {
            loadEmployees(pageNumber + 1);
        }
    };

    const handlePageChange = (page) => {
        loadEmployees(page);
    };

    return (
        <div className="employees-page">

            <div className="employees-header">
                <div>
                    <h1>Employees List</h1>
                    <p>
                        Manage all employees in the catering system.
                    </p>
                </div>

                <div className="add-employe-header">
                    <h2>Search</h2>

                    <input
                        type="text"
                        placeholder="Search by name, email, mobile or Aadhaar"
                        value={searchText}
                        onChange={(e) =>
                            setSearchText(e.target.value)
                        }
                    />
                </div>

                <button
                    className="add-employee-btn"
                    onClick={() =>
                        navigate("/employees/add")
                    }
                >
                    + Add Employee
                </button>
            </div>

            <div className="employees-card">

                <div className="table-container">

                    {loading ? (
                        <p>Loading employees...</p>
                    ) : (
                        <table className="employees-table">

                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Aadhaar Number</th>
                                    <th>Mobile</th>
                                    <th>Member Type</th>
                                    <th>Joining Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredEmployees.length > 0 ? (

                                    filteredEmployees.map((employee) => (
                                        <tr
                                            key={employee.employeeId}
                                        >
                                            <td>
                                                {employee.employeeId}
                                            </td>

                                            <td>
                                                {employee.fullName}
                                            </td>

                                            <td>
                                                {employee.gender}
                                            </td>

                                            <td>
                                                {employee.aadhaarNumber}
                                            </td>

                                            <td>
                                                {employee.mobileNumber}
                                            </td>

                                            <td>
                                                {employee.memberType}
                                            </td>

                                            <td>
                                                {/* {employee.joiningDate
                                                    ? new Date(
                                                        employee.joiningDate
                                                    ).toLocaleDateString(
                                                        "en-GB"
                                                    )
                                                    : ""} */}
                                                     {employee.joiningDate
                                                    ? (() => {
                                                        const date = new Date(employee.joiningDate);

                                                        return (
                                                            `${String(date.getDate()).padStart(2, "0")}/` +
                                                            `${String(date.getMonth() + 1).padStart(2, "0")}/` +
                                                            `${date.getFullYear()}`
                                                        );
                                                    })()
                                                    : ""}
                                            </td>

                                            <td>
                                                {employee.isActive ? (
                                                    <span className="active-status">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inactive-status">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleEdit(
                                                            employee.employeeId
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
                                                            employee.employeeId
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))

                                ) : (

                                    <tr>
                                        <td colSpan="9">
                                            No employees found.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>
                    )}

                </div>

                <div className="pagination">

                    <div className="pagination-info">
                        Showing page {pageNumber} of {totalPages}
                        {" | "}
                        Total Employees: {totalRecords}
                    </div>

                    <div className="pagination-buttons">

                        <button
                            onClick={handlePrevious}
                            disabled={pageNumber === 1}
                        >
                            Previous
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <button
                                key={page}
                                className={
                                    page === pageNumber
                                        ? "active-page"
                                        : ""
                                }
                                onClick={() =>
                                    handlePageChange(page)
                                }
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={handleNext}
                            disabled={
                                pageNumber === totalPages ||
                                totalPages === 0
                            }
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Employees;
