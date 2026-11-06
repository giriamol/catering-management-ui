
import axiosClient from "./axiosClient";

export const getEmployeePaymentSummary = (employeeId, fromDate, toDate) => {
  return axiosClient.get("/EmployeePayments/summary", {
  params: { employeeId, fromDate, toDate },
});
};
// Save employee payment
export const SaveEmployeePayment = (data) => {
    return axiosClient.post("/EmployeePayments", data);
};


export const getAllEmployeePaymentSummary = ( fromDate, toDate) => {
  return axiosClient.get("/EmployeePayments/All", {
  params: { fromDate, toDate },
});
};


export const getReportEmployee = (
    employeeId,
    fromDate,
    toDate,
    status = ""
) => {
    return axiosClient.get("/EmployeePayments/GetReport", {
        params: { employeeId, fromDate, toDate, status },
    });
};

export const getAllReportEmployee = (
    fromDate,
    toDate,
    status = ""
) => {
    return axiosClient.get("/EmployeePayments/GetAllReport", {
        params: { fromDate, toDate, status },
    });
};
