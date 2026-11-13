import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import '../../dashboard.css';

const initial={name:'',description:'',price:'',compareAtPrice:'',category:'Home & Living',material:'PLA',dimensions:'',colorOptions:'Black, White',stock:10,featured:false,madeToOrder:false,images:[]};
const categories=['Home & Living','Desk Essentials','Collectibles','Accessories'];

export default function AddProductPage(){
  const {id}=useParams(), navigate=useNavigate();
  const [form,setForm]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{if(id)api('/products/admin/all').then(list=>{const p=list.find(x=>x._id===id);if(p)setForm({...p,colorOptions:(p.colorOptions||[]).join(', '),images:p.images||[]});}).catch(e=>setError(e.message));},[id]);
  const change=(key,value)=>setForm(old=>({...old,[key]:value}));
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{
    let images=form.images||[];const files=e.target.elements.imageFiles.files;
    if(files.length){const fd=new FormData();Array.from(files).forEach(f=>fd.append('images',f));const uploaded=await api('/products/upload',{method:'POST',body:fd});images=[...images,...uploaded.images];}
    const payload={...form,price:Number(form.price),compareAtPrice:form.compareAtPrice?Number(form.compareAtPrice):undefined,stock:Number(form.stock),colorOptions:String(form.colorOptions).split(',').map(x=>x.trim()).filter(Boolean),images};
    if(id)await api(`/products/${id}`,{method:'PUT',body:JSON.stringify(payload)});else await api('/products',{method:'POST',body:JSON.stringify(payload)});
    navigate('/dashboard/products');
  }catch(err){setError(err.message);}finally{setBusy(false);}}
  return <section><div className="tr-page-heading"><div><span>CATALOGUE</span><h1>{id?'Edit product':'Add product'}</h1><p>Product details customers will see in your store.</p></div><Link className="tr-secondary" to="/dashboard/products">← Back to products</Link></div>
    {error&&<div className="tr-alert">{error}</div>}
    <form className="tr-panel tr-product-form" onSubmit={submit}>
      <div className="tr-form-grid">
        <label>Product name<input value={form.name} onChange={e=>change('name',e.target.value)} required/></label>
        <label>Price (₹)<input type="number" min="0" value={form.price} onChange={e=>change('price',e.target.value)} required/></label>
        <label>Compare at price (₹)<input type="number" min="0" value={form.compareAtPrice||''} onChange={e=>change('compareAtPrice',e.target.value)}/></label>
        <label>Category<select value={form.category} onChange={e=>change('category',e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
        <label>Material<input value={form.material||''} onChange={e=>change('material',e.target.value)}/></label>
        <label>Dimensions<input placeholder="e.g. 10 × 8 × 12 cm" value={form.dimensions||''} onChange={e=>change('dimensions',e.target.value)}/></label>
        <label>Stock<input type="number" min="0" value={form.stock} onChange={e=>change('stock',e.target.value)}/></label>
        <label>Available colours<input value={form.colorOptions} onChange={e=>change('colorOptions',e.target.value)}/></label>
        <label className="tr-span-two">Description<textarea rows="5" value={form.description} onChange={e=>change('description',e.target.value)} required/></label>
        <label className="tr-span-two">Product photos<input type="file" name="imageFiles" accept="image/*" multiple/><small>Upload up to 6 images using the configured image storage.</small></label>
      </div>
      <div className="tr-checks"><label><input type="checkbox" checked={!!form.featured} onChange={e=>change('featured',e.target.checked)}/> Featured product</label><label><input type="checkbox" checked={!!form.madeToOrder} onChange={e=>change('madeToOrder',e.target.checked)}/> Made to order</label></div>
      <div className="tr-form-actions"><button className="tr-primary" disabled={busy}>{busy?'Saving…':'Save product'}</button><Link className="tr-secondary" to="/dashboard/products">Cancel</Link></div>
    </form>
  </section>;
}
