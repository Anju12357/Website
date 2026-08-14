import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div>


            <div
      style={{
        border: "2px solid red",
        padding: "20px",
      }}
    >

      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/employees">Employees</Link>
        </li>

        <li>
          <Link to="/profile">Profile</Link>
        </li>

        <li>
          <Link to="/">Logout</Link>
        </li>
      </ul>
    </div>
    </div>
  );
}

export default Sidebar;