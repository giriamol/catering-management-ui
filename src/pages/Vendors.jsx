import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVendors, deleteVendor } from "../api/vendorApi";
import "../CSS/Employees.css";

const PAGE_SIZE = 20;

function Vendors() {
    const navigate = useNavigate();

    const [popup, setPopup] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);

    const showPopup = (title, message, onClose) => {
        setPopup({ title, message, onClose });
    };

    // Fetch the complete vendor list. Search and pagination are UI-side.
    const loadVendors = async () => {
        try {
            setLoading(true);

            // Do not pass pageNumber/pageSize: API should return all vendors.
            const response = await getVendors();
            const responseData = response?.data;

            // Support common API response shapes.
            const vendorList = Array.isArray(responseData)
                ? responseData
                : Array.isArray(responseData?.data)
                  ? responseData.data
                  : Array.isArray(responseData?.items)
                    ? responseData.items
                    : Array.isArray(responseData?.Items)
                      ? responseData.Items
                      : Array.isArray(responseData?.vendors)
                        ? responseData.vendors
                        : Array.isArray(responseData?.vendorsList)
                          ? responseData.vendorsList
                          : [];

            setVendors(vendorList);
        } catch (error) {
            console.error("Error loading vendors:", error);
            setVendors([]);
            showPopup(
                "Error",
                error?.response?.data?.message ||
                    error?.response?.data?.title ||
                    "Unable to load vendors."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
        // Fetch once when the component mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Search the complete list returned by the API, not only the current page.
    const filteredVendors = useMemo(() => {
        const search = searchText.trim().toLowerCase();
        if (!search) return vendors;

        return vendors.filter((vendor) => {
            const searchableValues = [
                vendor.vendorId,
                vendor.vendorName,
                vendor.mobileNumber1,
                vendor.mobileNumber2,
                vendor.address,
                vendor.isActive ? "active" : "inactive",
            ];

            return searchableValues.some((value) =>
                String(value ?? "").toLowerCase().includes(search)
            );
        });
    }, [vendors, searchText]);

    const totalRecords = filteredVendors.length;
    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

    // Keep the selected page valid when search results shrink or a vendor is deleted.
    useEffect(() => {
        if (totalPages === 0 && pageNumber !== 1) {
            setPageNumber(1);
        } else if (totalPages > 0 && pageNumber > totalPages) {
            setPageNumber(totalPages);
        }
    }, [totalPages, pageNumber]);

    const paginatedVendors = useMemo(() => {
        const startIndex = (pageNumber - 1) * PAGE_SIZE;
        return filteredVendors.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredVendors, pageNumber]);

    const handleSearchChange = (event) => {
        setSearchText(event.target.value);
        setPageNumber(1);
    };

    const handleEdit = (vendorId) => {
        navigate(`/vendors/edit/${vendorId}`);
    };

    const handleDelete = async (vendorId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this vendor?"
        );
        if (!confirmDelete) return;

        try {
            await deleteVendor(vendorId);
            await loadVendors();
            showPopup("Success!", "Vendor deleted successfully.");
        } catch (error) {
            console.error("Error deleting vendor:", error);
            showPopup(
                "Error",
                error?.response?.data?.message || "Failed to delete vendor."
            );
        }
    };

    const handlePrevious = () => {
        setPageNumber((currentPage) => Math.max(1, currentPage - 1));
    };

    const handleNext = () => {
        setPageNumber((currentPage) =>
            Math.min(totalPages, currentPage + 1)
        );
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setPageNumber(page);
        }
    };

    const closePopup = () => {
        const onClose = popup?.onClose;
        setPopup(null);
        onClose?.();
    };

    const startRecord =
        totalRecords === 0 ? 0 : (pageNumber - 1) * PAGE_SIZE + 1;
    const endRecord = Math.min(pageNumber * PAGE_SIZE, totalRecords);

    return (
        <div className="employees-page">
            <div className="employees-header">
                <div>
                    <h1>Vendors List</h1>
                    <p>Manage all vendors in the catering system.</p>
                </div>

                <div className="add-employe-header">
                    <h2>Search</h2>
                    <input
                        type="text"
                        placeholder="Search vendor"
                        value={searchText}
                        onChange={handleSearchChange}
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
                                {paginatedVendors.length > 0 ? (
                                    paginatedVendors.map((vendor) => (
                                        <tr key={vendor.vendorId}>
                                            <td>{vendor.vendorId}</td>
                                            <td>{vendor.vendorName}</td>
                                            <td>{vendor.mobileNumber1 || "-"}</td>
                                            <td>{vendor.mobileNumber2 || "-"}</td>
                                            <td>{vendor.address || "-"}</td>
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
                                                        handleEdit(vendor.vendorId)
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDelete(vendor.vendorId)
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
                                            style={{ textAlign: "center" }}
                                        >
                                            {searchText.trim()
                                                ? "No vendors match your search."
                                                : "No vendors found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="pagination">
                    <div className="pagination-info">
                        Showing {startRecord}-{endRecord} of {totalRecords} vendors
                        {" | "}
                        Page {totalRecords === 0 ? 0 : pageNumber} of {totalPages}
                        {" | "}
                        {PAGE_SIZE} records per page
                    </div>

                    <div className="pagination-buttons">
                        <button
                            type="button"
                            onClick={() => handlePageChange(1)}
                            disabled={pageNumber === 1 || totalPages === 0}
                        >
                            First
                        </button>
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={pageNumber === 1 || totalPages === 0}
                        >
                            Previous
                        </button>

                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <button
                                type="button"
                                key={page}
                                className={
                                    page === pageNumber ? "active-page" : ""
                                }
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={
                                totalPages === 0 || pageNumber === totalPages
                            }
                        >
                            Next
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={
                                totalPages === 0 || pageNumber === totalPages
                            }
                        >
                            Last
                        </button>
                    </div>
                </div>
            </div>

            {popup && (
                <div className="screen-popup-backdrop" onClick={closePopup}>
                    <div
                        className="screen-popup-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3>{popup.title}</h3>
                        <p>{popup.message}</p>
                        <button
                            type="button"
                            className="screen-popup-ok"
                            onClick={closePopup}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Vendors;
