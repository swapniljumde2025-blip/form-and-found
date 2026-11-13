import React, { useEffect, useState } from 'react';
import { api, imageUrl, money } from '../../api';
import '../../dashboard.css';
const statuses=['placed','confirmed','printing','shipped','delivered','cancelled'];

export default function OrdersPage(){
  const [orders,setOrders]=useState([]),[error,setError]=useState(''),[expanded,setExpanded]=useState(null);
  async function load(){try{setOrders(await api('/orders'));setError('');}catch(e){setError(e.message);}}
  useEffect(()=>{load();},[]);
  async function update(id,status){try{await api(`/orders/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});load();}catch(e){setError(e.message);}}
  return <section><div className="tr-page-heading"><div><span>FULFILMENT</span><h1>Orders</h1><p>Review customer orders and update their progress.</p></div></div>
    {error&&<div className="tr-alert">{error}</div>}
    <div className="tr-panel"><div className="tr-panel-head"><div><span>ALL ORDERS</span><h2>{orders.length} orders</h2></div></div>
    {!orders.length?<p className="tr-empty">No orders have been placed yet.</p>:orders.map(o=><article className="tr-order" key={o._id}>
      <div className="tr-order-head"><div><b>#{String(o._id).slice(-7).toUpperCase()} · {o.customer?.name||'Customer'}</b><small>{new Date(o.createdAt).toLocaleString('en-IN')} · {money(o.total)}</small></div><div className="tr-order-controls"><select value={o.status} onChange={e=>update(o._id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select><button className="tr-secondary" onClick={()=>setExpanded(expanded===o._id?null:o._id)}>{expanded===o._id?'Hide details':'View details'}</button></div></div>
      {expanded===o._id&&<div className="tr-order-detail"><div className="tr-order-items">{o.items?.map((item,i)=><div className="tr-order-item" key={i}>{item.image?<img src={imageUrl(item.image)} alt=""/>:<div className="tr-thumb-empty">✳</div>}<div><b>{item.name}</b><small>{item.color||'Standard'} · Qty {item.quantity}</small></div><strong>{money(item.price*item.quantity)}</strong></div>)}</div>
        <div className="tr-order-columns"><div><h3>Customer</h3><p>{o.customer?.name}</p><p>{o.customer?.email}</p><p>{o.customer?.phone}</p></div><div><h3>Delivery address</h3><p>{o.shippingAddress?.line1} {o.shippingAddress?.line2}</p><p>{o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.postalCode}</p><p>{o.shippingAddress?.country||'India'}</p></div></div>
        <div className="tr-order-total"><span>Subtotal {money(o.subtotal)}</span><span>Shipping {money(o.shipping)}</span><b>Total {money(o.total)}</b><span>Payment {(o.paymentMethod||'cod').toUpperCase()} · {o.paymentStatus||'pending'}</span></div>
      </div>}
    </article>)}</div>
  </section>;
}
