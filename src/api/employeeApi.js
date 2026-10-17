import axios from "axios";
import axiosClient from "./axiosClient";

export const getEmployees = (pageNumber = 1, pageSize = 10) => {
    return axiosClient.get("/Employees", {
        params: {
            pageNumber,
            pageSize
        }
    });
};

export const createEmployee = (employee) => {
    return axiosClient.post("/Employees", employee);
};

export const getEmployeeById = (id) => {
    return axiosClient.get(`/Employees/${id}`);
};

export const updateEmployee = (id, employee) => {
    return axiosClient.put(`/Employees/${id}`, employee);
};


 // Delete employee
export const deleteEmployee = (id) => {
    return axiosClient.delete(`/Employees/${id}`);
}

export const GetEmployeesWithoutRateHistory=() =>{
    return axiosClient.get("/Employees/without-rate-history");
} 