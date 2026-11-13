import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, IndianRupee, Clock3, ArrowUpRight } from 'lucide-react';
import { api, money } from '../../api';
import '../../dashboard.css';

export default function OverviewPage() {
  const [products,setProducts]=useState([]), [orders,setOrders]=useState([]), [error,setError]=useState('');
  useEffect(()=>{ Promise.all([api('/products/admin/all'),api('/orders')]).then(([p,o])=>{setProducts(p);setOrders(o);}).catch(e=>setError(e.message)); },[]);
  const revenue=orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.total||0),0);
  const pending=orders.filter(o=>!['delivered','cancelled'].includes(o.status)).length;
  const stats=[['Products',products.length,Package],['Total orders',orders.length,ShoppingCart],['Order value',money(revenue),IndianRupee],['In progress',pending,Clock3]];
  return <section><div className="tr-page-heading"><div><span>OVERVIEW</span><h1>Good to see you.</h1><p>Here’s what’s happening with your store.</p></div><Link className="tr-primary tr-link-button" to="/dashboard/products/new">Add product <ArrowUpRight size={16}/></Link></div>
    {error&&<div className="tr-alert">{error}</div>}
    <div className="tr-stat-grid">{stats.map(([label,value,Icon])=><article className="tr-stat" key={label}><div><span>{label}</span><Icon size={18}/></div><strong>{value}</strong></article>)}</div>
    <div className="tr-panel"><div className="tr-panel-head"><div><span>RECENT ACTIVITY</span><h2>Latest orders</h2></div><Link to="/dashboard/orders">View all <ArrowUpRight size={15}/></Link></div>
    {orders.length===0?<p className="tr-empty">No orders yet. New customer orders will appear here.</p>:<div className="tr-table-wrap"><table className="tr-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.slice(0,6).map(o=><tr key={o._id}><td>#{String(o._id).slice(-7).toUpperCase()}</td><td>{o.customer?.name||'—'}</td><td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td><td>{money(o.total)}</td><td><span className="tr-status">{o.status}</span></td></tr>)}</tbody></table></div>}</div>
  </section>;
}
