// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import AppRoutes from "./routes/AppRoutes";
// import EmployeeEdit from "./pages/EmployeeEdit";

// function App() {
//     return (
//         <div>

//             <Header />

//             <div className="main-container">

//                 <Sidebar />

//                 <main className="content">
//                     <AppRoutes />
                    
//                 </main>

//             </div>

//         </div>
//     );
// }


// export default App;

import { Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";

import { useAuth } from "./context/AuthContext";

function App() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Not logged in: show login page only
    if (!isAuthenticated) {
        if (location.pathname !== "/login") {
            return <Navigate to="/login" replace />;
        }

        return <AppRoutes />;
    }

    // Already logged in: don't show login page again
    if (location.pathname === "/login" || location.pathname === "/") {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div>
            <Header />

            <div className="main-container">
                <Sidebar />

                <main className="content">
                    <AppRoutes />
                </main>
            </div>
        </div>
    );
}

export default App;
