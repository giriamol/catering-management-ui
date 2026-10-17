
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getVendorAdvances,
    deleteVendorAdvance,
    
} from "../api/vendorAdvanceApi";

import { getVendors } from "../api/vendorApi";
import "../CSS/EmployeeAdvance.css";

function VendorAdvance() {
    const navigate = useNavigate();

    const [advances, setAdvances] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);

    // Handles APIs returning either an array or an object containing an array.
    const getArray = (response) => {
        const data = response?.data ?? response;

        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.$values)) return data.$values;
        if (Array.isArray(data?.items)) return data.items;

        return [];
    };

    // Support common property names returned by different APIs.
    const getVendorId = (vendor) =>
        vendor?.vendorId ?? vendor?.VendorId ?? vendor?.id;

    const getVendorName = (vendor) =>
        vendor?.vendorName ??
        vendor?.VendorName ??
        vendor?.name ??
        vendor?.Name ??
        "";

    const getAdvanceId = (item) =>
        item?.vendorAdvanceId ??
        item?.VendorAdvanceId ??
        item?.advanceId ??
        item?.AdvanceId;

    // Load advances and vendor master data.
    const loadAdvances = async () => {
        try {
            setLoading(true);

            const [advanceResponse, vendorResponse] =
                await Promise.all([
                    getVendorAdvances(),
                    getVendors()
                ]);

            const advanceList = getArray(advanceResponse);
            const vendorList = getArray(vendorResponse);

            setVendors(vendorList);

            // Match VendorId in the advance with VendorId in Vendors.
            const updatedAdvances = advanceList.map((advance) => {
                const vendor = vendorList.find(
                    (v) =>
                        String(getVendorId(v)) ===
                        String(
                            advance.vendorId ??
                            advance.VendorId
                        )
                );

                return {
                    ...advance,
                    vendorName:
                        advance.vendorName ??
                        advance.VendorName ??
                        getVendorName(vendor) ??
                        ""
                };
            });

            setAdvances(updatedAdvances);

            console.log("Vendor list:", vendorList);
            console.log("Vendor advances:", updatedAdvances);
        } catch (error) {
            console.error("Error loading vendor advances:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load vendor advances or vendor names."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdvances();
    }, []);

    const handleAdd = () => {
        navigate("/advances/vendor/add");
    };

    const handleEdit = (id) => {
        navigate(`/advances/vendor/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this vendor advance?"
            )
        ) {
            return;
        }

        try {
            await deleteVendorAdvance(id);
            alert("Vendor advance deleted successfully.");
            await loadAdvances();
        } catch (error) {
            console.error("Delete error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete vendor advance."
            );
        }
    };

    const filteredAdvances = advances.filter((item) => {
        const search = searchText.trim().toLowerCase();

        if (!search) return true;

        const vendorName = String(item.vendorName ?? "").toLowerCase();
        const vendorId = String(
            item.vendorId ?? item.VendorId ?? ""
        ).toLowerCase();
        const description = String(item.description ?? "").toLowerCase();

        return (
            vendorName.includes(search) ||
            vendorId.includes(search) ||
            description.includes(search)
        );
    });

    return (
        <div className="employee-advance-page">
            <div className="employee-advance-header">
                <div>
                    <h1>Vendor Advance</h1>
                    <p>Manage vendor advance payments.</p>
                </div>

                <button
                    type="button"
                    className="add-advance-btn"
                    onClick={handleAdd}
                >
                    + Add Vendor Advance
                </button>
            </div>

            <div className="advance-filter-card">
                <div className="advance-search">
                    <label>Search</label>

                    <input
                        type="text"
                        placeholder="Search vendor, ID or description"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
            </div>

            <div className="employee-advance-card">
                {loading ? (
                    <div className="loading-message">
                        Loading vendor advances...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="employee-advance-table">
                            <thead>
                                <tr>
                                    <th>Sr. No.</th>
                                    <th>Vendor</th>
                                    <th>Advance Date</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredAdvances.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            No vendor advances found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAdvances.map((item, index) => {
                                        const advanceId = getAdvanceId(item);

                                        return (
                                            <tr key={advanceId ?? index}>
                                                <td>{index + 1}</td>

                                                <td>
                                                    <div className="employee-info">
                                                        <strong>
                                                            {item.vendorName ||
                                                                "Vendor name unavailable"}
                                                        </strong>
                                                        {/* <small>
                                                            ID:{" "}
                                                            {item.vendorId ??
                                                                item.VendorId ??
                                                                "-"}
                                                        </small> */}
                                                    </div>
                                                </td>

                                                <td>
                                                    {item.advanceDate ??
                                                    item.AdvanceDate
                                                        ? new Date(
                                                            item.advanceDate ??
                                                            item.AdvanceDate
                                                        ).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </td>

                                                <td className="amount-column">
                                                    ₹{" "}
                                                    {Number(
                                                        item.amount ??
                                                        item.Amount ??
                                                        0
                                                    ).toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>

                                                <td>
                                                    {item.description ??
                                                        item.Description ??
                                                        "-"}
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="edit-btn"
                                                            onClick={() =>
                                                                handleEdit(advanceId)
                                                            }
                                                            disabled={!advanceId}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(advanceId)
                                                            }
                                                            disabled={!advanceId}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VendorAdvance;