import '../../styles/UserLayout/SideBar.css'


const SideBar = () => {

    return(
        <div className="sidebar">
        <h2 className="sidebar-title">Regent Portal</h2>
        <ul className="sidebar-nav">
        <li><a href="/admin">Dashboard</a></li>
        <li><a href="/admin/users">Users</a></li>
        <li><a href="/admin/reports">Reports</a></li>
        <li><a href="/admin/settings">Settings</a></li>
        <li><a href="/logout" className="logout">Logout</a></li>
        </ul>
</div>
    )


}

export default SideBar