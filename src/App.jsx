import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import EmployeeEdit from "./pages/EmployeeEdit";

function App() {
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