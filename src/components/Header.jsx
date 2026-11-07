// function Header()
// {
//     return (
//          <header className="header">
//             <h2>Catering Management System</h2>

//             <div className="user-info">
//                 Welcome, Admin
//             </div>
//         </header>
//     );
// }

// export default Header;

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../CSS/Header.css";

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="header">
            <h2>Catering Management System</h2>

            <div className="user-info">
                <span>
                    Welcome, {user?.fullName || "Admin"}
                </span>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Header;
