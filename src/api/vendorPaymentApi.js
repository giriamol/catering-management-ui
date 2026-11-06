import axiosClient from "./axiosClient";

export const getVendorPaymentSummary = (vendorId, fromDate, toDate) => {
    return axiosClient.get("/VendorPayments/summary", {
        params: { vendorId, fromDate, toDate },
    });
};

export const SaveVendorPayment = (data) => {
    return axiosClient.post("/VendorPayments", data);
};

export const getAllVendorPaymentSummary = (fromDate, toDate) => {
    return axiosClient.get("/VendorPayments/All", {
        params: { fromDate, toDate },
    });
};

export const getVendorReport = (vendorId, fromDate, toDate,status) => {
    return axiosClient.get("/VendorPayments/GetReport", {
        params: { vendorId, fromDate, toDate,status },
    });
};

export const getAllVendorReport = (fromDate, toDate,status) => {
    return axiosClient.get("/VendorPayments/GetAllReport", {
        params: { fromDate, toDate,status },
    });
};

export const getVendorWorkReportSummary = (vendorId, fromDate, toDate) => {
    return axiosClient.get("/VendorPayments/VendorReport", {
        params: { vendorId, fromDate, toDate },
    });
};
