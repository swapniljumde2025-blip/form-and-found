import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, ExternalLink, LogOut, Plus } from 'lucide-react';
import '../dashboard.css';

export default function DashboardLayout() {
  const navigate = useNavigate();
  function signOut() {
    localStorage.removeItem('store_admin_token');
    navigate('/dashboard/login', { replace: true });
  }
  return <div className="tr-admin-shell">
    <aside className="tr-sidebar">
      <a className="tr-side-brand" href="/"><img src="/trimerge-icon.svg" alt="" /><span>Trimerge<small>ADMIN</small></span></a>
      <div className="tr-side-label">WORKSPACE</div>
      <nav>
        <NavLink end to="/dashboard"><LayoutDashboard size={17}/> Overview</NavLink>
        <NavLink to="/dashboard/products"><Package size={17}/> Products</NavLink>
        <NavLink to="/dashboard/orders"><ShoppingCart size={17}/> Orders</NavLink>
        <NavLink to="/dashboard/settings"><Settings size={17}/> Settings</NavLink>
      </nav>
      <div className="tr-sidebar-bottom">
        <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={16}/> View storefront</a>
        <button onClick={signOut}><LogOut size={16}/> Sign out</button>
      </div>
    </aside>
    <main className="tr-admin-main">
      <header className="tr-admin-topbar"><div><span>TRIMERGE / ADMIN</span><b>Store management</b></div><a href="/dashboard/products/new" className="tr-top-action"><Plus size={16}/> Add product</a></header>
      <div className="tr-admin-content"><Outlet /></div>
    </main>
  </div>;
}
