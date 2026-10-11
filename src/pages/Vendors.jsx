
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVendors, deleteVendor } from "../api/vendorApi";

function Vendors() {

    const navigate = useNavigate();

    const [vendors, setVendors] = useState([]);
    const [searchText, setSearchText] = useState("");

    const [loading, setLoading] = useState(false);

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);

    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        loadVendors(pageNumber);
    }, [pageNumber]);

    const loadVendors = async (page) => {
        try {
            setLoading(true);

            const response = await getVendors(page, pageSize);

            console.log("Vendor API Response:", response.data);

            const data = response.data;

            setVendors(data.items || data);

            setTotalRecords(
                data.totalRecords ||
                data.length ||
                0
            );

            setTotalPages(
                data.totalPages ||
                Math.ceil(
                    (data.totalRecords || data.length || 0) / pageSize
                )
            );

        } catch (error) {
            console.error("Error loading vendors:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVendors = vendors.filter((vendor) => {

        const search = searchText.toLowerCase();

        return (
            vendor.vendorName?.toLowerCase().includes(search) ||
            vendor.mobileNumber1?.toLowerCase().includes(search) ||
            vendor.mobileNumber2?.toLowerCase().includes(search) ||
            vendor.address?.toLowerCase().includes(search)
        );

    });

    const handleEdit = (vendorId) => {
        console.log("Edit Vendor ID:", vendorId);

        navigate(`/vendors/edit/${vendorId}`);
    };

    const handleDelete = async (vendorId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this vendor?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await deleteVendor(vendorId);

            alert("Vendor deleted successfully.");

            loadVendors(pageNumber);

        } catch (error) {

            console.error("Error deleting vendor:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete vendor."
            );
        }
    };

    const handlePrevious = () => {

        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }

    };

    const handleNext = () => {

        if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1);
        }

    };

    const handlePageChange = (page) => {
        setPageNumber(page);
    };

    return (

        <div className="employees-page">

            <div className="employees-header">

                <div>
                    <h1>Vendors List</h1>

                    <p>
                        Manage all vendors in the catering system.
                    </p>
                </div>

                <div className="add-employe-header">

                    <h2>Search</h2>

                    <input
                        type="text"
                        placeholder="Search vendor"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPageNumber(1);
                        }}
                    />

                </div>

                <button
                    className="add-employee-btn"
                    onClick={() => navigate("/vendors/add")}
                >
                    + Add Vendor
                </button>

            </div>

            <div className="employees-card">

                <div className="table-container">

                    {loading ? (

                        <p>Loading vendors...</p>

                    ) : (

                        <table className="employees-table">

                            <thead>

                                <tr>
                                    <th>Id</th>
                                    <th>Vendor Name</th>
                                    <th>Mobile Number 1</th>
                                    <th>Mobile Number 2</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredVendors.length > 0 ? (

                                    filteredVendors.map((vendor) => (

                                        <tr key={vendor.vendorId}>

                                            <td>
                                                {vendor.vendorId}
                                            </td>

                                            <td>
                                                {vendor.vendorName}
                                            </td>

                                            <td>
                                                {vendor.mobileNumber1 || "-"}
                                            </td>

                                            <td>
                                                {vendor.mobileNumber2 || "-"}
                                            </td>

                                            <td>
                                                {vendor.address || "-"}
                                            </td>

                                            <td>
                                                {vendor.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </td>

                                            <td className="action-buttons">

                                                <button
                                                    type="button"
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleEdit(
                                                            vendor.vendorId
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
                                                            vendor.vendorId
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

                                        <td
                                            colSpan="7"
                                            style={{
                                                textAlign: "center"
                                            }}
                                        >
                                            No vendors found.
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

                        Total Vendors: {totalRecords}

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

export default Vendors;
