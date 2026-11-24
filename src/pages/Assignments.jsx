import React, {
    useEffect,
    useMemo,
    useState,
    useCallback
} from "react";

import { getAllEmployeeRateMasters } from "../api/employeeRateMasterApi";
import { getHotels } from "../api/hotelApi";
import { getVendors } from "../api/vendorApi";

import {
    createAssignment,
    createVendorAssignment,
    getAllEmployeeAssignments
} from "../api/dailyHotelAssignmentApi";

import { addSupplierAssignment } from "../api/dailySupplierAssignmentToVendorApi";

import DatePicker from "../components/DatePicker";
import "../CSS/EmployeeHotelAssignment.css";

const PAGE_SIZE = 20;

// ======================================================
// DATE HELPERS
// ======================================================

const getTodayDate = () => {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
};

const normalizeDateForPayload = (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        throw new Error("Please select a valid assignment date.");
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        throw new Error("The selected assignment date is invalid.");
    }

    return value;
};

const getAssignmentDateKey = (value) => {
    if (!value) return "";

    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) return match[1];

    return "";
};

const formatDateForDisplay = (value) => {
    if (!value) return "Not selected";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }

    return value;
};

// ======================================================
// API RESPONSE HELPERS
// ======================================================

const extractList = (response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;

    const lists = [
        data?.items,
        data?.Items,
        data?.data,
        data?.Data,
        data?.$values,
        data?.vendors,
        data?.Vendors,
        data?.employees,
        data?.Employees,
        data?.hotels,
        data?.Hotels,
        data?.assignments,
        data?.Assignments,
        data?.dailyHotelAssignments,
        data?.DailyHotelAssignments,
    ];

    return lists.find(Array.isArray) ?? [];
};

const getApiErrorMessage = (error, fallback) => {
    const data = error?.response?.data;

    if (typeof data === "string") return data;

    return (
        data?.message ??
        data?.Message ??
        data?.title ??
        data?.detail ??
        error?.message ??
        fallback
    );
};

// ======================================================
// WORK TYPE HELPER
// ======================================================

const normalizeWorkType = (value) =>
    String(value ?? "")
        .replace(/\s+/g, "")
        .toLowerCase();

// ======================================================
// MAIN COMPONENT
// ======================================================

const Assignments = () => {

    const [memberType, setMemberType] = useState("InHouse");

    const [assignmentDate, setAssignmentDate] = useState(getTodayDate);

    const [searchText, setSearchText] = useState("");

    const [savingRowKey, setSavingRowKey] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const [employees, setEmployees] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [hotels, setHotels] = useState([]);

    const [existingAssignments, setExistingAssignments] = useState([]);

    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [loadingHotels, setLoadingHotels] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(false);

    const [pageError, setPageError] = useState("");

    const [rowData, setRowData] = useState({});

    const [successDialog, setSuccessDialog] = useState(null);

    // ======================================================
    // RESET PAGINATION
    // ======================================================

    useEffect(() => {
        setCurrentPage(1);
    }, [memberType, searchText]);

    // ======================================================
    // EMPLOYEE HELPERS
    // ======================================================

    const getEmployeeId = (employee) =>
        employee?.employeeId ??
        employee?.EmployeeId ??
        employee?.employeeID ??
        employee?.EmployeeID ??
        employee?.id ??
        employee?.Id;

    const getEmployeeName = (employee) => {
        const name =
            employee?.employeeName ??
            employee?.EmployeeName ??
            employee?.fullName ??
            employee?.FullName ??
            employee?.name ??
            employee?.Name;

        if (name) return name;

        return [
            employee?.firstName ?? employee?.FirstName,
            employee?.middleName ?? employee?.MiddleName,
            employee?.lastName ?? employee?.LastName,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const getEmployeeMemberType = (employee) => {
        const value =
            employee?.memberType ??
            employee?.MemberType ??
            employee?.member_type ??
            employee?.Member_Type ??
            employee?.workType ??
            employee?.WorkType ??
            employee?.work_type ??
            employee?.Work_Type ??
            employee?.employeeType ??
            employee?.EmployeeType ??
            employee?.employeeCategory ??
            employee?.EmployeeCategory ??
            employee?.workCategory ??
            employee?.WorkCategory ??
            employee?.employeeRateMaster?.workType ??
            employee?.EmployeeRateMaster?.WorkType ??
            "";

        const normalized = String(value).trim().toLowerCase();

        if (normalized === "outsourced" || normalized === "supplier") {
            return "supplier";
        }

        return normalized;
    };

    // ======================================================
    // VENDOR HELPERS
    // ======================================================

    const getVendorObject = (record) =>
        record?.vendor ??
        record?.Vendor ??
        record?.vendorMaster ??
        record?.VendorMaster ??
        record?.vendorDetails ??
        record?.VendorDetails ??
        record;

    const getVendorId = (record) => {
        const vendor = getVendorObject(record);

        return (
            vendor?.vendorId ??
            vendor?.VendorId ??
            vendor?.vendorID ??
            vendor?.VendorID ??
            record?.fk_VendorId ??
            record?.Fk_VendorId ??
            record?.FK_VendorId ??
            record?.vendorId ??
            record?.VendorId ??
            record?.id ??
            record?.Id
        );
    };

    const getVendorName = (record) => {
        const vendor = getVendorObject(record);

        const name =
            vendor?.vendorName ??
            vendor?.VendorName ??
            vendor?.vendorFullName ??
            vendor?.VendorFullName ??
            vendor?.vendorCompanyName ??
            vendor?.VendorCompanyName ??
            vendor?.companyName ??
            vendor?.CompanyName ??
            vendor?.businessName ??
            vendor?.BusinessName ??
            vendor?.fullName ??
            vendor?.FullName ??
            vendor?.name ??
            vendor?.Name;

        if (name) return name;

        return [
            vendor?.firstName ?? vendor?.FirstName,
            vendor?.middleName ?? vendor?.MiddleName,
            vendor?.lastName ?? vendor?.LastName,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const getVendorRowKey = (vendor) =>
        `vendor-${getVendorId(vendor)}`;

    // ======================================================
    // HOTEL HELPERS
    // ======================================================

    const getHotelId = (hotel) =>
        hotel?.hotelId ??
        hotel?.HotelId ??
        hotel?.hotelID ??
        hotel?.HotelID ??
        hotel?.id ??
        hotel?.Id;

    const getHotelName = (hotel) =>
        hotel?.hotelName ??
        hotel?.HotelName ??
        hotel?.name ??
        hotel?.Name ??
        "";

    // ======================================================
    // LOAD EMPLOYEES
    // ======================================================

    const loadEmployees = async () => {
        try {
            setLoadingEmployees(true);
            setPageError("");

            const response = await getAllEmployeeRateMasters(1, 2000);
            const list = extractList(response);

            const validEmployees = list.filter((employee) => {
                const id = getEmployeeId(employee);

                return (
                    id !== undefined &&
                    id !== null &&
                    String(id).trim() !== ""
                );
            });

            const uniqueEmployees = Array.from(
                new Map(
                    validEmployees.map((employee) => [
                        String(getEmployeeId(employee)),
                        employee,
                    ])
                ).values()
            );

            setEmployees(uniqueEmployees);

        } catch (error) {
            console.error(
                "Error loading employees:",
                error?.response?.data ?? error
            );

            setEmployees([]);

            setPageError(
                getApiErrorMessage(error, "Unable to load employees.")
            );

        } finally {
            setLoadingEmployees(false);
        }
    };

    // ======================================================
    // LOAD VENDORS
    // ======================================================

    const loadVendors = async () => {
        try {
            setLoadingVendors(true);
            setPageError("");

            const response = await getVendors(1, 2000);
            const list = extractList(response);

            const validVendors = list.filter((record) => {
                const id = getVendorId(record);

                return id !== undefined && id !== null && id !== "";
            });

            const uniqueVendors = Array.from(
                new Map(
                    validVendors.map((record) => [
                        String(getVendorId(record)),
                        record,
                    ])
                ).values()
            );

            setVendors(uniqueVendors);

        } catch (error) {
            console.error(
                "Error loading vendors:",
                error?.response?.data ?? error
            );

            setVendors([]);

            setPageError(
                getApiErrorMessage(error, "Unable to load vendors.")
            );

        } finally {
            setLoadingVendors(false);
        }
    };

    // ======================================================
    // LOAD HOTELS
    // ======================================================

    const loadHotels = async () => {
        try {
            setLoadingHotels(true);

            const response = await getHotels(1, 2000);

            setHotels(extractList(response));

        } catch (error) {
            console.error(
                "Error loading hotels:",
                error?.response?.data ?? error
            );

            setHotels([]);

            setPageError(
                getApiErrorMessage(error, "Unable to load hotels.")
            );

        } finally {
            setLoadingHotels(false);
        }
    };

    // ======================================================
    // LOAD EXISTING EMPLOYEE ASSIGNMENTS
    // ======================================================

    const loadExistingAssignments = useCallback(async (selectedDate) => {
        try {
            setLoadingAssignments(true);

            const response = await getAllEmployeeAssignments();
            const list = extractList(response);

            const activeAssignments = list.filter((item) => {
                const date =
                    item.assignmentDate ??
                    item.AssignmentDate;

                const cancelled =
                    item.isCancelled ??
                    item.IsCancelled;

                // Only assignments for the selected date.
                if (getAssignmentDateKey(date) !== selectedDate) {
                    return false;
                }

                // Ignore cancelled assignments.
                return (
                    cancelled !== true &&
                    Number(cancelled) !== 1
                );
            });

            setExistingAssignments(activeAssignments);

            return true;

        } catch (error) {
            console.error(
                "Error loading existing assignments:",
                error?.response?.data ?? error
            );

            setExistingAssignments([]);

            setPageError(
                getApiErrorMessage(
                    error,
                    "Unable to load existing employee assignments."
                )
            );

            return false;

        } finally {
            setLoadingAssignments(false);
        }
    }, []);

    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {
        loadEmployees();
        loadHotels();
    }, []);

    // Load assignments whenever selected date changes.
    useEffect(() => {
        setExistingAssignments([]);
        setRowData({});
        setCurrentPage(1);

        loadExistingAssignments(assignmentDate);

    }, [assignmentDate, loadExistingAssignments]);

    // ======================================================
    // EXISTING ASSIGNMENT LOOKUP
    // ======================================================

    const existingAssignmentsByEmployee = useMemo(() => {
        const result = {};

        existingAssignments.forEach((item) => {
            const employeeId =
                item.employeeId ??
                item.EmployeeId;

            if (employeeId == null) return;

            const key = String(employeeId);

            if (!result[key]) {
                result[key] = [];
            }

            result[key].push(item);
        });

        return result;

    }, [existingAssignments]);

    const getEmployeeAssignments = (employeeId) => {
        return existingAssignmentsByEmployee[String(employeeId)] ?? [];
    };

    const getShiftName = (shiftId) => {
        return Number(shiftId) === 1
            ? "Morning"
            : Number(shiftId) === 2
                ? "Evening"
                : `Shift ${shiftId}`;
    };

    const getUsedHalfDayShifts = (employeeId) => {
        return getEmployeeAssignments(employeeId)
            .filter((item) => {
                const workType = normalizeWorkType(
                    item.workType ?? item.WorkType
                );

                return workType === "halfday";
            })
            .map((item) =>
                Number(item.shiftId ?? item.ShiftId)
            );
    };

    const hasHalfDayAssignment = (employeeId) => {
        return getUsedHalfDayShifts(employeeId).length > 0;
    };

    const hasFullDayAssignment = (employeeId) => {
        return getEmployeeAssignments(employeeId).some((item) => {
            const workType = normalizeWorkType(
                item.workType ?? item.WorkType
            );

            return workType === "fullday";
        });
    };

    // Hide FullDay employees and employees with both shifts assigned.
    const hasNoRemainingShift = (employeeId) => {
        const usedShifts = getUsedHalfDayShifts(employeeId);

        return (
            hasFullDayAssignment(employeeId) ||
            (usedShifts.includes(1) && usedShifts.includes(2))
        );
    };

    // ======================================================
    // MEMBER TYPE
    // ======================================================

    const normalizeMemberType = (type) =>
        type === "Supplier" ? "Outsourced" : type;

    const handleMemberTypeChange = (type) => {
        const nextType = normalizeMemberType(type);

        setMemberType(nextType);
        setSearchText("");
        setRowData({});
        setCurrentPage(1);
        setPageError("");

        if (
            nextType === "InHouse" ||
            nextType === "Local" ||
            nextType === "Outsourced"
        ) {
            loadEmployees();
        }

        if (
            nextType === "Vendor" ||
            nextType === "Outsourced"
        ) {
            loadVendors();
        }
    };

    const handleAssignmentDateChange = (value) => {
        setAssignmentDate(value);
        setPageError("");
    };

    // ======================================================
    // INHOUSE EMPLOYEES
    // ======================================================

    // const currentEmployees = useMemo(() => {
    //     if (memberType !== "InHouse") return [];

    //     const search = searchText.trim().toLowerCase();

    //     const inHouseEmployees = employees.filter((employee) => {
    //         const typeValue = getEmployeeMemberType(employee);
    //         const employeeId = getEmployeeId(employee);

    //         return (
    //             typeValue !== "local" &&
    //             typeValue !== "supplier" &&
    //             typeValue !== "outsourced" &&
    //             !hasNoRemainingShift(employeeId)
    //         );
    //     });

    //     if (!search) return inHouseEmployees;

    //     return inHouseEmployees.filter((employee) => {
    //         const name = String(
    //             getEmployeeName(employee)
    //         ).toLowerCase();

    //         const id = String(
    //             getEmployeeId(employee)
    //         ).toLowerCase();

    //         return name.includes(search) || id.includes(search);
    //     });

    // }, [
    //     employees,
    //     memberType,
    //     searchText,
    //     existingAssignmentsByEmployee
    // ]);
    const currentEmployees = useMemo(() => {
    if (memberType !== "InHouse") return [];

    const search = searchText.trim().toLowerCase();

    const inHouseEmployees = employees.filter((employee) => {
        const typeValue = getEmployeeMemberType(employee);
        const employeeId = getEmployeeId(employee);

        return (
            typeValue !== "local" &&
            typeValue !== "supplier" &&
            typeValue !== "outsourced" &&
            !hasNoRemainingShift(employeeId)
        );
    });

    const filteredEmployees = !search
        ? inHouseEmployees
        : inHouseEmployees.filter((employee) => {
            const name = String(getEmployeeName(employee)).toLowerCase();
            const id = String(getEmployeeId(employee)).toLowerCase();

            return name.includes(search) || id.includes(search);
        });

    // HalfDay-assigned employees first
    return [...filteredEmployees].sort((a, b) => {
        const aAssigned =
            getUsedHalfDayShifts(getEmployeeId(a)).length > 0;

        const bAssigned =
            getUsedHalfDayShifts(getEmployeeId(b)).length > 0;

        return Number(bAssigned) - Number(aAssigned);
    });

    }, [
        employees,
        memberType,
        searchText,
        existingAssignmentsByEmployee
    ]);

    // ======================================================
    // LOCAL EMPLOYEES
    // ======================================================

    const currentLocalEmployees = useMemo(() => {
        if (memberType !== "Local") return [];

        const search = searchText.trim().toLowerCase();

        const localEmployees = employees.filter((employee) => {
            const employeeId = getEmployeeId(employee);

            return (
                getEmployeeMemberType(employee) === "local" &&
                !hasNoRemainingShift(employeeId)
            );
        });

        if (!search) return localEmployees;

        return localEmployees.filter((employee) => {
            const name = String(
                getEmployeeName(employee)
            ).toLowerCase();

            const id = String(
                getEmployeeId(employee)
            ).toLowerCase();

            return name.includes(search) || id.includes(search);
        });

    }, [
        employees,
        memberType,
        searchText,
        existingAssignmentsByEmployee
    ]);

    // ======================================================
    // OUTSOURCED / SUPPLIER EMPLOYEES
    // ======================================================

    const currentOutsourcedEmployees = useMemo(() => {
        if (
            memberType !== "Outsourced" &&
            memberType !== "Supplier"
        ) {
            return [];
        }

        const search = searchText.trim().toLowerCase();

        const outsourcedEmployees = employees.filter((employee) => {
            const typeValue = getEmployeeMemberType(employee);

            return (
                typeValue === "supplier" ||
                typeValue === "outsourced" ||
                typeValue === "supplier employee" ||
                typeValue === "supplieremployee"
            );
        });

        if (!search) return outsourcedEmployees;

        return outsourcedEmployees.filter((employee) => {
            const name = String(
                getEmployeeName(employee)
            ).toLowerCase();

            const id = String(
                getEmployeeId(employee)
            ).toLowerCase();

            return name.includes(search) || id.includes(search);
        });

    }, [employees, memberType, searchText]);

    // ======================================================
    // VENDORS
    // ======================================================

    const currentVendors = useMemo(() => {
        if (memberType !== "Vendor") return [];

        const search = searchText.trim().toLowerCase();

        if (!search) return vendors;

        return vendors.filter((vendor) => {
            const name = String(
                getVendorName(vendor)
            ).toLowerCase();

            const id = String(
                getVendorId(vendor)
            ).toLowerCase();

            return name.includes(search) || id.includes(search);
        });

    }, [vendors, memberType, searchText]);

    // ======================================================
    // TOTAL RECORDS
    // ======================================================

    const displayedCount =
        memberType === "Vendor"
            ? currentVendors.length
            : memberType === "Local"
                ? currentLocalEmployees.length
                : memberType === "Outsourced" ||
                    memberType === "Supplier"
                    ? currentOutsourcedEmployees.length
                    : currentEmployees.length;

    // ======================================================
    // PAGINATION
    // ======================================================

    const totalPages = Math.max(
        1,
        Math.ceil(displayedCount / PAGE_SIZE)
    );

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const endIndex = Math.min(
        startIndex + PAGE_SIZE,
        displayedCount
    );

    const paginatedEmployees = useMemo(
        () => currentEmployees.slice(
            startIndex,
            startIndex + PAGE_SIZE
        ),
        [currentEmployees, startIndex]
    );

    const paginatedLocalEmployees = useMemo(
        () => currentLocalEmployees.slice(
            startIndex,
            startIndex + PAGE_SIZE
        ),
        [currentLocalEmployees, startIndex]
    );

    const paginatedOutsourcedEmployees = useMemo(
        () => currentOutsourcedEmployees.slice(
            startIndex,
            startIndex + PAGE_SIZE
        ),
        [currentOutsourcedEmployees, startIndex]
    );

    const paginatedVendors = useMemo(
        () => currentVendors.slice(
            startIndex,
            startIndex + PAGE_SIZE
        ),
        [currentVendors, startIndex]
    );

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handlePreviousPage = () => {
        setCurrentPage((previous) =>
            Math.max(1, previous - 1)
        );
    };

    const handleNextPage = () => {
        setCurrentPage((previous) =>
            Math.min(totalPages, previous + 1)
        );
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // ======================================================
    // ROW DATA
    // ======================================================

    const handleRowChange = (rowKey, field, value) => {
        setRowData((previous) => ({
            ...previous,
            [rowKey]: {
                ...previous[rowKey],
                [field]: value,
            },
        }));
    };

    const getSelectedAssignmentDate = () =>
        normalizeDateForPayload(assignmentDate);

    const showDialog = (title, message) => {
        setSuccessDialog({ title, message });
    };

    const memberTypeLabel =
        memberType === "Outsourced" ||
        memberType === "Supplier"
            ? "Supplier"
            : memberType;

    // ======================================================
    // SAVE INHOUSE / LOCAL EMPLOYEE ASSIGNMENT
    // ======================================================

    const handleSubmit = async (employee) => {
        const employeeId = getEmployeeId(employee);

        if (employeeId == null || employeeId === "") {
            showDialog("Error", "Employee ID not found.");
            return;
        }

        const rowKey = String(employeeId);
        const row = rowData[rowKey] ?? {};

        if (hasFullDayAssignment(employeeId)) {
            showDialog(
                "Error",
                "This employee already has a FullDay assignment."
            );
            return;
        }

        const selectedShiftId = Number(row.shiftId);
        const usedShifts = getUsedHalfDayShifts(employeeId);

        if (usedShifts.includes(selectedShiftId)) {
            showDialog(
                "Error",
                "This employee is already assigned to this shift."
            );
            return;
        }

        // Prevent assigning FullDay after a HalfDay assignment.
        if (
            usedShifts.length > 0 &&
            normalizeWorkType(row.workType) === "fullday"
        ) {
            showDialog(
                "Error",
                "This employee already has a HalfDay assignment. Only the remaining HalfDay shift can be assigned."
            );
            return;
        }

        if (!row.hotelId) {
            showDialog("Error", "Please select hotel.");
            return;
        }

        if (!row.venue?.trim()) {
            showDialog("Error", "Please enter Venue.");
            return;
        }

        if (!row.shiftId) {
            showDialog("Error", "Please select shift type.");
            return;
        }

        if (!row.workType) {
            showDialog("Error", "Please select work type.");
            return;
        }

        let selectedDate;

        try {
            selectedDate = getSelectedAssignmentDate();
        } catch (error) {
            showDialog("Error", error.message);
            return;
        }

        const payload = {
            EmployeeId: Number(employeeId),
            HotelId: Number(row.hotelId),
            Venue: row.venue.trim(),
            AssignmentDate: selectedDate,
            ShiftId: Number(row.shiftId),
            WorkType: row.workType,
            IsCancelled: false,
            Description: row.description?.trim() || null,
        };

        try {
            setSavingRowKey(rowKey);
            setPageError("");

            await createAssignment(payload);

            await loadExistingAssignments(selectedDate);

            showDialog(
                "Success!",
                `Assignment saved successfully for ${getEmployeeName(employee)} on ${formatDateForDisplay(selectedDate)}.`
            );

            setRowData((previous) => {
                const updated = { ...previous };
                delete updated[rowKey];
                return updated;
            });

        } catch (error) {
            console.error(
                "Error saving employee assignment:",
                error?.response?.data ?? error
            );

            showDialog(
                "Error",
                getApiErrorMessage(
                    error,
                    "Failed to save employee assignment."
                )
            );

        } finally {
            setSavingRowKey(null);
        }
    };

    // ======================================================
    // SAVE VENDOR ASSIGNMENT
    // ======================================================

    const handleVendorSubmit = async (vendor) => {
        const vendorId = getVendorId(vendor);
        const rowKey = getVendorRowKey(vendor);
        const row = rowData[rowKey] ?? {};

        if (vendorId == null || vendorId === "") {
            showDialog("Error", "Vendor ID not found.");
            return;
        }

        const quantityText = String(
            row.employeeQuantity ?? ""
        ).trim();

        const quantity = Number(quantityText);

        if (
            quantityText === "" ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            showDialog(
                "Error",
                "Please enter a valid Employee Quantity (at least 1)."
            );
            return;
        }

        if (!row.hotelId) {
            showDialog("Error", "Please select hotel.");
            return;
        }

        if (!row.venue?.trim()) {
            showDialog("Error", "Please enter Venue.");
            return;
        }

        if (!row.shiftId) {
            showDialog("Error", "Please select shift type.");
            return;
        }

        if (!row.workType) {
            showDialog("Error", "Please select work type.");
            return;
        }

        let selectedDate;

        try {
            selectedDate = getSelectedAssignmentDate();
        } catch (error) {
            showDialog("Error", error.message);
            return;
        }

        const payload = {
            VendorId: Number(vendorId),
            Emp_Quantity: quantity,
            HotelId: Number(row.hotelId),
            Venue: row.venue.trim(),
            AssignmentDate: selectedDate,
            ShiftId: Number(row.shiftId),
            WorkType: row.workType,
            Description: row.description?.trim() || null,
        };

        try {
            setSavingRowKey(rowKey);
            setPageError("");

            await createVendorAssignment(payload);

            showDialog(
                "Success!",
                `Vendor assignment saved successfully for ${
                    getVendorName(vendor) || `Vendor ID ${vendorId}`
                } on ${formatDateForDisplay(selectedDate)}.`
            );

            setRowData((previous) => {
                const updated = { ...previous };
                delete updated[rowKey];
                return updated;
            });

        } catch (error) {
            console.error(
                "Error saving vendor assignment:",
                error?.response?.data ?? error
            );

            showDialog(
                "Error",
                getApiErrorMessage(
                    error,
                    "Failed to save vendor assignment."
                )
            );

        } finally {
            setSavingRowKey(null);
        }
    };

    // ======================================================
    // SAVE SUPPLIER ASSIGNMENT
    // ======================================================

    const handleSupplierSubmit = async (employee) => {
        const employeeId = getEmployeeId(employee);

        if (employeeId == null || employeeId === "") {
            showDialog(
                "Error",
                "Supplier employee ID not found."
            );
            return;
        }

        const rowKey = String(employeeId);
        const row = rowData[rowKey] ?? {};

        if (!row.vendorId) {
            showDialog("Error", "Please select vendor.");
            return;
        }

        const quantityText = String(
            row.employeeQuantity ?? ""
        ).trim();

        const quantity = Number(quantityText);

        if (
            quantityText === "" ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            showDialog(
                "Error",
                "Please enter a valid Employee Quantity (at least 1)."
            );
            return;
        }

        if (!row.venue?.trim()) {
            showDialog("Error", "Please enter Vendor Venue.");
            return;
        }

        if (!row.shiftId) {
            showDialog("Error", "Please select shift type.");
            return;
        }

        if (!row.workType) {
            showDialog("Error", "Please select work type.");
            return;
        }

        let selectedDate;

        try {
            selectedDate = getSelectedAssignmentDate();
        } catch (error) {
            showDialog("Error", error.message);
            return;
        }

        const payload = {
            EmployeeId: Number(employeeId),
            Emp_Quantity: quantity,
            VendorId: Number(row.vendorId),
            Venue: row.venue.trim(),
            AssignmentDate: selectedDate,
            ShiftId: Number(row.shiftId),
            WorkType: row.workType,
            Description: row.description?.trim() || null,
            IsHotelPay: false,
        };

        try {
            setSavingRowKey(rowKey);
            setPageError("");

            await addSupplierAssignment(payload);

            showDialog(
                "Success!",
                `Supplier assignment saved successfully for ${
                    getEmployeeName(employee) || `Supplier ID ${employeeId}`
                } on ${formatDateForDisplay(selectedDate)}.`
            );

            setRowData((previous) => {
                const updated = { ...previous };
                delete updated[rowKey];
                return updated;
            });

        } catch (error) {
            console.error(
                "Error saving outsourced supplier assignment:",
                error?.response?.data ?? error
            );

            showDialog(
                "Error",
                getApiErrorMessage(
                    error,
                    "Failed to save supplier assignment."
                )
            );

        } finally {
            setSavingRowKey(null);
        }
    };

    // ======================================================
    // CANCEL ROW
    // ======================================================

    const handleCancel = (rowKey) => {
        setRowData((previous) => {
            const updated = { ...previous };
            delete updated[rowKey];
            return updated;
        });
    };

    // ======================================================
    // LOADING STATUS
    // ======================================================

    const isLoading =
        memberType === "Vendor"
            ? loadingVendors
            : loadingEmployees;

    // ======================================================
    // EMPLOYEE TABLE ROWS
    // ======================================================

    const renderEmployeeRows = (employeeList) => {
        if (employeeList.length === 0) {
            return (
                <tr>
                    <td colSpan={8} className="no-data">
                        {employees.length === 0
                            ? "No employee records found."
                            : memberType === "Local"
                                ? "No Local employees found."
                                : "No matching InHouse employees found."}
                    </td>
                </tr>
            );
        }

        return employeeList.map((employee) => {
            const employeeId = getEmployeeId(employee);
            const rowKey = String(employeeId);
            const row = rowData[rowKey] ?? {};
            const isSaving = savingRowKey === rowKey;

            const employeeAssignments =
                getEmployeeAssignments(employeeId);

            const usedShifts =
                getUsedHalfDayShifts(employeeId);

            const alreadyAssignedHalfDay =
                hasHalfDayAssignment(employeeId);

            const assignmentStatus = employeeAssignments
                .map((item) => {
                    const shiftId =
                        item.shiftId ?? item.ShiftId;

                    const workType =
                        item.workType ?? item.WorkType;

                    return `${getShiftName(shiftId)} - ${workType}`;
                })
                .join(", ");

            return (
                <tr
                    key={rowKey}
                    className={
                        alreadyAssignedHalfDay
                            ? "halfday-assigned-row"
                            : ""
                    }
                >
                    <td>{employeeId}</td>

                    <td>
                        <div className="employee-name">
                            {getEmployeeName(employee)}
                        </div>

                        {alreadyAssignedHalfDay && (
                            <small className="assignment-status">
                                Already assigned: {assignmentStatus}
                            </small>
                        )}
                    </td>

                    <td>
                        <select
                            value={row.hotelId ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "hotelId",
                                    event.target.value
                                )
                            }
                            className="assignment-select-head"
                            disabled={loadingHotels || isSaving}
                        >
                            <option value="">Select Hotel</option>

                            {hotels.map((hotel) => (
                                <option
                                    key={getHotelId(hotel)}
                                    value={getHotelId(hotel)}
                                >
                                    {getHotelName(hotel)}
                                </option>
                            ))}
                        </select>
                    </td>

                    <td>
                        <input
                            type="text"
                            value={row.venue ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "venue",
                                    event.target.value
                                )
                            }
                            placeholder="Enter venue"
                            className="assignment-select"
                            maxLength={100}
                            disabled={isSaving}
                        />
                    </td>

                    <td>
                        <select
                            value={row.shiftId ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "shiftId",
                                    event.target.value
                                )
                            }
                            className="assignment-select"
                            disabled={isSaving}
                        >
                            <option value="">Select Shift Type</option>

                            <option
                                value="1"
                                disabled={usedShifts.includes(1)}
                            >
                                Morning
                                {usedShifts.includes(1)
                                    ? " (Already Assigned)"
                                    : ""}
                            </option>

                            <option
                                value="2"
                                disabled={usedShifts.includes(2)}
                            >
                                Evening
                                {usedShifts.includes(2)
                                    ? " (Already Assigned)"
                                    : ""}
                            </option>
                        </select>
                    </td>

                    <td>
                        <select
                            value={row.workType ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "workType",
                                    event.target.value
                                )
                            }
                            className="assignment-select"
                            disabled={isSaving}
                        >
                            <option value="">Select Work Type</option>

                            <option value="HalfDay">
                                HalfDay
                            </option>

                            <option
                                value="FullDay"
                                disabled={usedShifts.length > 0}
                            >
                                FullDay
                            </option>
                        </select>
                    </td>

                    <td>
                        <input
                            type="text"
                            placeholder="Enter description / note"
                            value={row.description ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "description",
                                    event.target.value
                                )
                            }
                            className="assignment-select-dscrip"
                            disabled={isSaving}
                        />
                    </td>

                    <td>
                        <div className="action-buttons">
                            <button
                                type="button"
                                className="btn-submit"
                                disabled={
                                    isSaving ||
                                    loadingHotels ||
                                    loadingAssignments
                                }
                                onClick={() => handleSubmit(employee)}
                            >
                                {isSaving ? "Saving..." : "Submit"}
                            </button>

                            <button
                                type="button"
                                className="btn-cancel"
                                disabled={isSaving}
                                onClick={() => handleCancel(rowKey)}
                            >
                                Cancel
                            </button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    // ======================================================
    // SUPPLIER TABLE ROWS
    // ======================================================

    const renderSupplierRows = (employeeList) => {
        if (employeeList.length === 0) {
            return (
                <tr>
                    <td colSpan={9} className="no-data">
                        {employees.length === 0
                            ? "No supplier records found."
                            : "No matching supplier records found."}
                    </td>
                </tr>
            );
        }

        return employeeList.map((employee) => {
            const employeeId = getEmployeeId(employee);
            const rowKey = String(employeeId);
            const row = rowData[rowKey] ?? {};
            const isSaving = savingRowKey === rowKey;

            return (
                <tr key={rowKey}>
                    <td>{employeeId}</td>

                    <td>
                        <div className="employee-name">
                            {getEmployeeName(employee)}
                        </div>
                    </td>

                    <td>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={row.employeeQuantity ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "employeeQuantity",
                                    event.target.value
                                )
                            }
                            placeholder="Enter quantity"
                            className="assignment-select"
                            disabled={isSaving}
                        />
                    </td>

                    <td>
                        <select
                            value={row.vendorId ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "vendorId",
                                    event.target.value
                                )
                            }
                            className="assignment-select-head"
                            disabled={loadingVendors || isSaving}
                        >
                            <option value="">Select Vendor</option>

                            {vendors.map((vendor) => (
                                <option
                                    key={getVendorId(vendor)}
                                    value={getVendorId(vendor)}
                                >
                                    {getVendorName(vendor) ||
                                        `Vendor ${getVendorId(vendor)}`}
                                </option>
                            ))}
                        </select>
                    </td>

                    <td>
                        <input
                            type="text"
                            value={row.venue ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "venue",
                                    event.target.value
                                )
                            }
                            placeholder="Enter vendor venue"
                            className="assignment-select"
                            maxLength={100}
                            disabled={isSaving}
                        />
                    </td>

                    <td>
                        <select
                            value={row.shiftId ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "shiftId",
                                    event.target.value
                                )
                            }
                            className="assignment-select"
                            disabled={isSaving}
                        >
                            <option value="">Select Shift Type</option>
                            <option value="1">Morning</option>
                            <option value="2">Evening</option>
                        </select>
                    </td>

                    <td>
                        <select
                            value={row.workType ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "workType",
                                    event.target.value
                                )
                            }
                            className="assignment-select"
                            disabled={isSaving}
                        >
                            <option value="">Select Work Type</option>
                            <option value="HalfDay">HalfDay</option>
                            <option value="FullDay">FullDay</option>
                        </select>
                    </td>

                    <td>
                        <input
                            type="text"
                            placeholder="Enter description / note"
                            value={row.description ?? ""}
                            onChange={(event) =>
                                handleRowChange(
                                    rowKey,
                                    "description",
                                    event.target.value
                                )
                            }
                            className="assignment-select-dscrip"
                            disabled={isSaving}
                        />
                    </td>

                    <td>
                        <div className="action-buttons">
                            <button
                                type="button"
                                className="btn-submit"
                                disabled={isSaving || loadingVendors}
                                onClick={() =>
                                    handleSupplierSubmit(employee)
                                }
                            >
                                {isSaving ? "Saving..." : "Submit"}
                            </button>

                            <button
                                type="button"
                                className="btn-cancel"
                                disabled={isSaving}
                                onClick={() => handleCancel(rowKey)}
                            >
                                Cancel
                            </button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    // ======================================================
    // PAGINATION CONTROLS
    // ======================================================

    const renderPagination = () => {
        if (displayedCount === 0) return null;

        return (
            <div className="assignment-pagination">

                <div className="pagination-info">
                    Showing <strong>{startIndex + 1}</strong> to{" "}
                    <strong>{endIndex}</strong> of{" "}
                    <strong>{displayedCount}</strong> records
                </div>

                <div className="pagination-controls">

                    <button
                        type="button"
                        className="pagination-btn"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                    )
                        .filter((page) =>
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                        )
                        .reduce((result, page, index, array) => {
                            if (
                                index > 0 &&
                                page - array[index - 1] > 1
                            ) {
                                result.push("...");
                            }

                            result.push(page);

                            return result;
                        }, [])
                        .map((page, index) =>
                            page === "..." ? (
                                <span
                                    key={`dots-${index}`}
                                    className="pagination-dots"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    key={page}
                                    className={`pagination-btn ${
                                        currentPage === page
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handlePageChange(page)
                                    }
                                >
                                    {page}
                                </button>
                            )
                        )}

                    <button
                        type="button"
                        className="pagination-btn"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>

                </div>
            </div>
        );
    };

    // ======================================================
    // MAIN UI
    // ======================================================

    const activeTabClass =
        memberType === "Outsourced"
            ? "supplier"
            : memberType.toLowerCase();

    return (
        <div className={`assignment-page ${activeTabClass}`}>

            <div className="assignment-header">
                <div>
                    <center>
                        <h2>Daily Employee Assignment</h2>
                    </center>
                </div>
            </div>

            {/* FILTERS */}

            <div className="assignment-filter-card">

                <div className="filter-group">
                    <label>Member Type</label>

                    <div className="member-type-buttons">

                        {[
                            "InHouse",
                            "Vendor",
                            "Local",
                            "Outsourced"
                        ].map((type) => {

                            const normalizedType =
                                type === "Outsourced"
                                    ? "supplier"
                                    : type.toLowerCase();

                            return (
                                <label
                                    className={`type-option ${normalizedType}`}
                                    key={type}
                                >
                                    <input
                                        type="radio"
                                        name="memberType"
                                        value={type}
                                        checked={memberType === type}
                                        onChange={() =>
                                            handleMemberTypeChange(type)
                                        }
                                    />

                                    <span>
                                        {type === "Outsourced"
                                            ? "Supplier"
                                            : type}
                                    </span>
                                </label>
                            );
                        })}

                    </div>
                </div>

                <div className="filter-group">
                    <DatePicker
                        label="Assignment Date"
                        name="assignmentDate"
                        value={assignmentDate}
                        onChange={handleAssignmentDateChange}
                        required
                        placeholder="DD/MM/YYYY"
                    />
                </div>

                <div className="filter-group search-group">

                    <label>
                        {memberType === "Vendor"
                            ? "Search Vendor"
                            : memberType === "Outsourced"
                                ? "Search Supplier"
                                : "Search Employee"}
                    </label>

                    <input
                        type="search"
                        placeholder={
                            memberType === "Vendor"
                                ? "Search by vendor name or ID"
                                : memberType === "Outsourced"
                                    ? "Search by supplier name or ID"
                                    : "Search by employee name or ID"
                        }
                        value={searchText}
                        onChange={(event) =>
                            setSearchText(event.target.value)
                        }
                    />

                </div>

            </div>

            {/* SUCCESS / ERROR DIALOG */}

            {successDialog && (
                <div
                    className="assignment-success-backdrop"
                    onClick={() => setSuccessDialog(null)}
                >
                    <div
                        className="assignment-success-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <h3>{successDialog.title}</h3>

                        <p>{successDialog.message}</p>

                        <button
                            type="button"
                            className="assignment-success-ok"
                            onClick={() =>
                                setSuccessDialog(null)
                            }
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* ERROR MESSAGE */}

            {pageError && (
                <div className="allocation-message allocation-error">
                    {pageError}
                </div>
            )}

            {/* ASSIGNMENT INFORMATION */}

            <div className="assignment-info">

                <span>
                    Type: <strong>{memberTypeLabel}</strong>
                </span>

                <span>
                    Selected Date:{" "}
                    <strong>
                        {formatDateForDisplay(assignmentDate)}
                    </strong>
                </span>

                <span>
                    {memberType === "Vendor"
                        ? "Vendors"
                        : memberType === "Outsourced"
                            ? "Suppliers"
                            : "Employees"}
                    : <strong>{displayedCount}</strong>
                </span>

                <span>
                    Records per page: <strong>{PAGE_SIZE}</strong>
                </span>

            </div>

            {/* LOADING */}

            {isLoading || loadingAssignments ? (
                <div className="loading-message">
                    {loadingAssignments
                        ? "Checking existing assignments..."
                        : memberType === "Vendor"
                            ? "Loading vendors..."
                            : "Loading employees..."}
                </div>
            ) : (
                <>
                    <div className="assignment-table-card">

                        <table className="assignment-table">

                            <thead>

                                {memberType === "Vendor" ? (
                                    <tr>
                                        <th>ID</th>
                                        <th>Vendor Name</th>
                                        <th>Employee Quantity</th>
                                        <th>Caterers_Name</th>
                                        <th>Caterers_Venue</th>
                                        <th>Shift Type</th>
                                        <th>Work Type</th>
                                        <th>Description / Note</th>
                                        <th>Action</th>
                                    </tr>
                                ) : memberType === "Outsourced" ? (
                                    <tr>
                                        <th>ID</th>
                                        <th>Supplier Name</th>
                                        <th>Employee Quantity</th>
                                        <th>Vendor_Name</th>
                                        <th>Vendor_Venue</th>
                                        <th>Shift Type</th>
                                        <th>Work Type</th>
                                        <th>Description / Note</th>
                                        <th>Action</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th>ID</th>
                                        <th>Employee Name</th>
                                        <th>Caterers_Name</th>
                                        <th>Caterers_Venue</th>
                                        <th>Shift Type</th>
                                        <th>Work Type</th>
                                        <th>Description / Note</th>
                                        <th>Action</th>
                                    </tr>
                                )}

                            </thead>

                            <tbody>

                                {memberType === "Vendor" ? (

                                    paginatedVendors.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="no-data"
                                            >
                                                {vendors.length === 0
                                                    ? "No vendor records found."
                                                    : "No matching vendors found."}
                                            </td>
                                        </tr>
                                    ) : (

                                        paginatedVendors.map((vendor) => {

                                            const vendorId =
                                                getVendorId(vendor);

                                            const rowKey =
                                                getVendorRowKey(vendor);

                                            const row =
                                                rowData[rowKey] ?? {};

                                            const isSaving =
                                                savingRowKey === rowKey;

                                            return (
                                                <tr key={rowKey}>

                                                    <td>{vendorId}</td>

                                                    <td>
                                                        <div className="employee-name">
                                                            {getVendorName(vendor) ||
                                                                `Vendor ID ${vendorId}`}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={row.employeeQuantity ?? ""}
                                                            onChange={(event) =>
                                                                handleRowChange(
                                                                    rowKey,
                                                                    "employeeQuantity",
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="Enter quantity"
                                                            className="assignment-select"
                                                            disabled={isSaving}
                                                        />
                                                    </td>

                                                    <td>
                                                        <select
                                                            value={row.hotelId ?? ""}
                                                            onChange={(event) =>
                                                                handleRowChange(
                                                                    rowKey,
                                                                    "hotelId",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="assignment-select-head"
                                                            disabled={loadingHotels || isSaving}
                                                        >
                                                            <option value="">
                                                                Select Hotel
                                                            </option>

                                                            {hotels.map((hotel) => (
                                                                <option
                                                                    key={getHotelId(hotel)}
                                                                    value={getHotelId(hotel)}
                                                                >
                                                                    {getHotelName(hotel)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={row.venue ?? ""}
                                                            onChange={(event) =>
                                                                handleRowChange(
                                                                    rowKey,
                                                                    "venue",
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder="Enter venue"
                                                            className="assignment-select"
                                                            maxLength={100}
                                                            disabled={isSaving}
                                                        />
                                                    </td>

                                                    <td>
                                                        <select
                                                            value={row.shiftId ?? ""}
                                                            onChange={(event) =>
                                                                handleRowChange(
                                                                    rowKey,
                                                                    "shiftId",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="assignment-select"
                                                            disabled={isSaving}
                                                        >
                                                            <option value="">
                                                                Select Shift Type
                                                            </option>
                                                            <option value="1">
                                                                Morning
                                                            </option>
                                                            <option value="2">
                                                                Evening
                                                            </option>
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <select
                                                            value={row.workType ?? ""}
                                                            onChange={(event) =>
                                                                handleRowChange(
                                                                    rowKey,
                                                                    "workType",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="assignment-select"
                                                            disabled={isSaving}
                                                        >
                                                            <option value="">
                                                                Select Work Type
                                                            </option>
                                                            <option value="HalfDay">
                                                                HalfDay
                                                            </option>
                                                            <option value="FullDay">
                                                                FullDay
                                                            </option>
                                                        </select>
                                                    </td>

                                                    <td>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter description / note"
                                                            value={row.description ?? ""}
                                                            onChange={(event) =>
                                                                handleRowChange(
                                                                    rowKey,
                                                                    "description",
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="assignment-select-dscrip"
                                                            disabled={isSaving}
                                                        />
                                                    </td>

                                                    <td>
                                                        <div className="action-buttons">

                                                            <button
                                                                type="button"
                                                                className="btn-submit"
                                                                disabled={isSaving || loadingHotels}
                                                                onClick={() =>
                                                                    handleVendorSubmit(vendor)
                                                                }
                                                            >
                                                                {isSaving
                                                                    ? "Saving..."
                                                                    : "Submit"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn-cancel"
                                                                disabled={isSaving}
                                                                onClick={() =>
                                                                    handleCancel(rowKey)
                                                                }
                                                            >
                                                                Cancel
                                                            </button>

                                                        </div>
                                                    </td>

                                                </tr>
                                            );
                                        })
                                    )

                                ) : memberType === "Local" ? (

                                    renderEmployeeRows(
                                        paginatedLocalEmployees
                                    )

                                ) : memberType === "Outsourced" ? (

                                    renderSupplierRows(
                                        paginatedOutsourcedEmployees
                                    )

                                ) : (

                                    renderEmployeeRows(
                                        paginatedEmployees
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* PAGINATION */}

                    {renderPagination()}
                </>
            )}

        </div>
    );
};

export default Assignments;
