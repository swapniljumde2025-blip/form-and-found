import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { api, imageUrl, money } from '../../api';
import '../../dashboard.css';

export default function ProductsPage() {
  const [products,setProducts]=useState([]), [error,setError]=useState(''), [loading,setLoading]=useState(true);
  async function load(){try{setProducts(await api('/products/admin/all'));setError('');}catch(e){setError(e.message);}finally{setLoading(false);}}
  useEffect(()=>{load();},[]);
  async function remove(id){if(!window.confirm('Delete this product?'))return;try{await api(`/products/${id}`,{method:'DELETE'});load();}catch(e){setError(e.message);}}
  return <section><div className="tr-page-heading"><div><span>CATALOGUE</span><h1>Products</h1><p>Manage the products shown in your storefront.</p></div><Link className="tr-primary tr-link-button" to="/dashboard/products/new"><Plus size={16}/> Add product</Link></div>
    {error&&<div className="tr-alert">{error}</div>}
    <div className="tr-panel"><div className="tr-panel-head"><div><span>YOUR CATALOGUE</span><h2>{products.length} products</h2></div></div>
    {loading?<p className="tr-empty">Loading products…</p>:products.length===0?<p className="tr-empty">No products yet. Add your first product.</p>:<div className="tr-table-wrap"><table className="tr-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{products.map(p=><tr key={p._id}><td><div className="tr-product-cell">{p.images?.[0]?<img src={imageUrl(p.images[0])} alt=""/>:<div className="tr-thumb-empty">✳</div>}<b>{p.name}</b></div></td><td>{p.category||'—'}</td><td>{money(p.price)}</td><td>{p.stock??'—'}</td><td><div className="tr-row-actions"><Link to={`/dashboard/products/${p._id}/edit`} title="Edit"><Pencil size={16}/></Link><button onClick={()=>remove(p._id)} title="Delete"><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}</div>
  </section>;
}
