function Dashboard() {
    return (
        <div className="dashboard">

            <h1>Dashboard</h1>

            <p className="dashboard-subtitle">
                Welcome to the Catering Management System
            </p>

            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <h3>Total Employees</h3>
                    <p>1200</p>
                </div>

                <div className="dashboard-card">
                    <h3>Active Employees</h3>
                    <p>110</p>
                </div>

                <div className="dashboard-card">
                    <h3>Total Hotels</h3>
                    <p>25</p>
                </div>

                <div className="dashboard-card">
                    <h3>Today's Assignments</h3>
                    <p>45</p>
                </div>

            </div>

            <div className="quick-actions">

                <h2>Quick Actions</h2>

                <div className="action-buttons">

                    <button>
                        Add Employee
                    </button>
                     <button>
                        Add Vendor
                    </button>
                    <button>
                        Add Caters
                    </button>

                    <button>
                        Create Assignment
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;