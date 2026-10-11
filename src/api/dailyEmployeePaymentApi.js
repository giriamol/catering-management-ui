// import axiosClient from "./axiosClient";

// export const calculateDailyEmployeePayment = (data) =>
//     axiosClient.post("/DailyEmployeePayment/calculate", data);

// export const getDailyEmployeePayment = (employeeId, paymentDate) =>
//     axiosClient.get(
//         `/DailyEmployeePayment/employee/${employeeId}/date/${paymentDate}`
//     );
import axiosClient from "./axiosClient";

// Calculate and save an employee's daily payment
// export const calculateDailyEmployeePayment = (data) =>
//     axiosClient.post("/DailyEmployeePayment/calculate", data);

// // Get an existing payment for an employee and date
// export const getDailyEmployeePayment = (employeeId, paymentDate) =>
//     axiosClient.get(
//         `/DailyEmployeePayment/employee/${employeeId}/date/${paymentDate}`
//     );
    
//     export const getAllEmployeePayments = (fromDate, toDate) =>
//     axiosClient.get("/DailyEmployeePayment/list", {
//         params: {
//             fromDate,
//             toDate
//         }
//     });

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