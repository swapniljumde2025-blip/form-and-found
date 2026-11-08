import React, { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingBag, Menu, X, ArrowUpRight, Plus, Minus, Trash2, Box, PackageCheck, Truck, ShieldCheck, ChevronRight, SlidersHorizontal, LogIn, LogOut, Pencil, Eye, Check, Sparkles } from 'lucide-react';
import { api, imageUrl, money } from './api';
import './styles.css';

const demo = [
 { _id:'demo-1', name:'Orbit Desk Planter', category:'Home & Living', price:649, description:'A sculptural planter with a soft geometric silhouette. Printed to order and finished by hand.', material:'PLA', dimensions:'12 × 12 × 13 cm', colorOptions:['Stone','Terracotta','Olive'], stock:20, featured:true, images:[] },
 { _id:'demo-2', name:'Arc Cable Organiser', category:'Desk Essentials', price:249, description:'A small, satisfying fix for messy charging cables and desk clutter.', material:'PLA+', dimensions:'8 × 5 × 3 cm', colorOptions:['Black','White','Sage'], stock:30, images:[] },
 { _id:'demo-3', name:'Kumo Mini Sculpture', category:'Collectibles', price:899, description:'A playful display piece with smooth curves and a considered matte finish.', material:'PLA', dimensions:'10 × 10 × 15 cm', colorOptions:['Cloud','Coral','Charcoal'], stock:8, images:[] },
 { _id:'demo-4', name:'Modular Wall Hook', category:'Home & Living', price:399, description:'A clean, sturdy hook for keys, headphones and everyday carry.', material:'PETG', dimensions:'7 × 4 × 5 cm', colorOptions:['Black','Sand','Blue'], stock:15, images:[] }
];
const categories = ['All','Home & Living','Desk Essentials','Collectibles','Accessories'];
const blank = { name:'', description:'', price:'', compareAtPrice:'', category:'Home & Living', material:'PLA', dimensions:'', colorOptions:'Black, White', stock:10, featured:false, madeToOrder:false, images:[] };
export default function App(){
 const [products,setProducts]=useState(demo), [loading,setLoading]=useState(true), [search,setSearch]=useState(''), [category,setCategory]=useState('All'), [sort,setSort]=useState('featured');
 const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem('store_cart')||'[]')), [drawer,setDrawer]=useState(false), [selected,setSelected]=useState(null), [checkout,setCheckout]=useState(false);
 const [admin,setAdmin]=useState(!!localStorage.getItem('store_admin_token')), [adminOpen,setAdminOpen]=useState(false), [orders,setOrders]=useState([]), [editing,setEditing]=useState(null), [form,setForm]=useState(blank), [notice,setNotice]=useState('');
 const [login,setLogin]=useState({email:'',password:''}), [busy,setBusy]=useState(false);
const [expandedOrder,setExpandedOrder]=useState(null);
 const refresh=async()=>{try{const p=await api('/products');setProducts(p);}catch(e){setNotice('Showing preview products. Connect the API and MongoDB to load your live catalogue.');}finally{setLoading(false);}};
 useEffect(()=>{refresh();},[]);
 useEffect(()=>{localStorage.setItem('store_cart',JSON.stringify(cart));},[cart]);
 const visible=useMemo(()=>products.filter(p=>(category==='All'||p.category===category)&&(`${p.name} ${p.description} ${p.category}`).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='price-low'?a.price-b.price:sort==='price-high'?b.price-a.price:sort==='new'?new Date(b.createdAt||0)-new Date(a.createdAt||0):(b.featured?1:0)-(a.featured?1:0)),[products,category,search,sort]);
 const subtotal=cart.reduce((s,i)=>s+i.price*i.quantity,0), shipping=subtotal>=1499?0:subtotal?79:0;
 const add=(p,color)=>{setCart(old=>{const found=old.find(i=>i.productId===p._id&&i.color===color);return found?old.map(i=>i===found?{...i,quantity:i.quantity+1}:i):[...old,{productId:p._id,name:p.name,price:p.price,image:p.images?.[0]||'',quantity:1,color}];});setDrawer(true);setSelected(null);};
 const updateQty=(id,color,delta)=>setCart(old=>old.map(i=>i.productId===id&&i.color===color?{...i,quantity:Math.max(1,i.quantity+delta)}:i));
 const remove=(id,color)=>setCart(old=>old.filter(i=>!(i.productId===id&&i.color===color)));
 const doLogin=async e=>{e.preventDefault();setBusy(true);try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify(login)});localStorage.setItem('store_admin_token',d.token);setAdmin(true);setNotice('Owner signed in.');await loadAdmin();}catch(e){setNotice(e.message);}finally{setBusy(false);}};
 const loadAdmin=async()=>{try{const [p,o]=await Promise.all([api('/products/admin/all'),api('/orders')]);setProducts(p);setOrders(o);}catch(e){setNotice(e.message);}};
 const logout=()=>{localStorage.removeItem('store_admin_token');setAdmin(false);setAdminOpen(false);};
 const saveProduct=async e=>{e.preventDefault();setBusy(true);try{let images=form.images||[];const files=e.target.elements.imageFiles.files;if(files.length){const fd=new FormData();[...files].forEach(f=>fd.append('images',f));const uploaded=await api('/products/upload',{method:'POST',body:fd});images=[...images,...uploaded.images];}
 const payload={...form,price:Number(form.price),compareAtPrice:form.compareAtPrice?Number(form.compareAtPrice):undefined,stock:Number(form.stock),colorOptions:String(form.colorOptions).split(',').map(x=>x.trim()).filter(Boolean),images};
 if(editing) await api(`/products/${editing}`,{method:'PUT',body:JSON.stringify(payload)});else await api('/products',{method:'POST',body:JSON.stringify(payload)});
 setForm(blank);setEditing(null);await loadAdmin();setNotice('Product saved.');}catch(e){setNotice(e.message);}finally{setBusy(false);}};
 const editProduct=p=>{setEditing(p._id);setForm({...p,colorOptions:(p.colorOptions||[]).join(', '),images:p.images||[]});window.scrollTo({top:0,behavior:'smooth'});};
 const deleteProduct=async id=>{if(!confirm('Delete this product?'))return;try{await api(`/products/${id}`,{method:'DELETE'});await loadAdmin();}catch(e){setNotice(e.message);}};
 const placeOrder=async e=>{e.preventDefault();setBusy(true);const f=new FormData(e.target);const data={items:cart,customer:{name:f.get('name'),email:f.get('email'),phone:f.get('phone')},shippingAddress:{line1:f.get('line1'),line2:f.get('line2'),city:f.get('city'),state:f.get('state'),postalCode:f.get('postalCode'),country:'India'},notes:f.get('notes')};try{const result=await api('/orders',{method:'POST',body:JSON.stringify(data)});setCart([]);setCheckout(false);setDrawer(false);setNotice(`Order received! Your order reference is ${result.orderNumber}.`);}catch(e){setNotice(e.message+' (The API must be running to place a real order.)');}finally{setBusy(false);}};
 const updateStatus=async(id,status)=>{try{await api(`/orders/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});await loadAdmin();}catch(e){setNotice(e.message);}};
 return <div className="site">
  <div className="announcement">DESIGNED TO DELIGHT, PRINTED TO LAST <span>•</span> FREE SHIPPING ABOVE ₹1,499</div>
  <header className="header"><a className="brand" href="#"><span className="brand-mark">L</span><span>FORM & FOUND<small>OBJECTS, REIMAGINED</small></span></a><nav><a href="#shop">Shop</a><a href="#story">Our process</a><a href="#footer">Contact</a></nav><div className="head-actions"><button className="icon-btn owner" onClick={()=>{setAdminOpen(!adminOpen);if(admin)loadAdmin();}}> {admin?<Box size={18}/>:<LogIn size={18}/>} <span>{admin?'Owner desk':'Owner login'}</span></button><button className="bag-btn" onClick={()=>setDrawer(true)}><ShoppingBag size={19}/><span>Bag</span><b>{cart.reduce((s,i)=>s+i.quantity,0)}</b></button></div></header>
  {notice&&<div className="notice" onClick={()=>setNotice('')}>{notice}<button><X size={15}/></button></div>}
  {adminOpen&&<section className="admin-wrap"><div className="admin-top"><div><span className="eyebrow">PRIVATE WORKSPACE</span><h2>{admin?'Owner desk':'Welcome back'}</h2></div>{admin&&<button className="btn btn-dark" onClick={logout}><LogOut size={15}/> Sign out</button>}</div>
   {!admin?<form className="login-form" onSubmit={doLogin}><input type="email" placeholder="Owner email" required value={login.email} onChange={e=>setLogin({...login,email:e.target.value})}/><input type="password" placeholder="Password" required value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/><button className="btn btn-dark" disabled={busy}>Sign in <ArrowUpRight size={16}/></button><small>First setup: configure the server .env and run npm run seed:admin.</small></form>:
   <><div className="admin-tabs"><span>{products.length} products</span><span>{orders.length} orders</span></div><div className="admin-grid"><form className="product-form" onSubmit={saveProduct}><h3>{editing?'Edit product':'Add a new product'}</h3><div className="form-grid"><label>Product name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Price (₹)<input type="number" min="0" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.slice(1).map(c=><option>{c}</option>)}</select></label><label>Material<input value={form.material} onChange={e=>setForm({...form,material:e.target.value})}/></label><label>Dimensions<input placeholder="e.g. 10 × 8 × 12 cm" value={form.dimensions} onChange={e=>setForm({...form,dimensions:e.target.value})}/></label><label>Stock<input type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label><label className="wide">Available colours<input value={form.colorOptions} onChange={e=>setForm({...form,colorOptions:e.target.value})}/></label><label className="wide">Description<textarea rows="3" required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="wide">Product photos<input type="file" name="imageFiles" accept="image/*" multiple/></label></div><div className="checks"><label><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured</label><label><input type="checkbox" checked={form.madeToOrder} onChange={e=>setForm({...form,madeToOrder:e.target.checked})}/> Made to order</label></div><div className="form-actions"><button className="btn btn-dark" disabled={busy}>{busy?'Saving…':'Save product'} <Check size={16}/></button>{editing&&<button type="button" className="btn btn-light" onClick={()=>{setEditing(null);setForm(blank);}}>Cancel</button>}</div></form>
   <div className="admin-side"><h3>Catalogue</h3>{products.map(p=><div className="admin-product" key={p._id}><span>{p.name}<small>{money(p.price)} · {p.stock??'—'} in stock</small></span><button onClick={()=>editProduct(p)}><Pencil size={15}/></button><button onClick={()=>deleteProduct(p._id)}><Trash2 size={15}/></button></div>)}</div></div>
   
<div className="orders-admin">
  <h3>Recent orders ({orders.length})</h3>

  {orders.length === 0 ? (
    <p className="muted">New orders will appear here.</p>
  ) : (
    orders.map(o => (
      <div className="order-row" key={o._id}>
        <div className="order-details">
          <div className="order-summary">
            <div>
              <b>#{o._id.slice(-7).toUpperCase()}</b>
              <small>{o.customer?.name} · {money(o.total)}</small>
              <small>
                {new Date(o.createdAt).toLocaleString('en-IN')}
              </small>
            </div>

            <button
              type="button"
              className="btn btn-light"
              onClick={() =>
                setExpandedOrder(
                  expandedOrder === o._id ? null : o._id
                )
              }
            >
              {expandedOrder === o._id ? 'Hide details' : 'View details'}
            </button>
          </div>

          {expandedOrder === o._id && (
            <div className="order-expanded">
              <h4>Products ordered</h4>

              {o.items?.map((item, index) => (
                <div className="order-item" key={index}>
                  {item.image ? (
                    <img
                      src={imageUrl(item.image)}
                      alt={item.name}
                    />
                  ) : (
                    <div className="order-item-placeholder">✳</div>
                  )}

                  <div>
                    <b>{item.name}</b>
                    <small>Colour: {item.color || 'Standard'}</small>
                    <small>Quantity: {item.quantity}</small>
                    <small>Unit price: {money(item.price)}</small>
                  </div>

                  <b>{money(item.price * item.quantity)}</b>
                </div>
              ))}

              <div className="order-customer">
                <h4>Customer details</h4>
                <p><b>Name:</b> {o.customer?.name}</p>
                <p><b>Email:</b> {o.customer?.email || 'Not provided'}</p>
                <p><b>Phone:</b> {o.customer?.phone}</p>
              </div>

              <div className="order-customer">
                <h4>Delivery address</h4>
                <p>{o.shippingAddress?.line1}</p>
                {o.shippingAddress?.line2 && (
                  <p>{o.shippingAddress.line2}</p>
                )}
                <p>
                  {o.shippingAddress?.city},
                  {' '}{o.shippingAddress?.state}
                  {' - '}{o.shippingAddress?.postalCode}
                </p>
                <p>{o.shippingAddress?.country || 'India'}</p>
              </div>

              {o.notes && (
                <div className="order-customer">
                  <h4>Order notes</h4>
                  <p>{o.notes}</p>
                </div>
              )}

              <div className="order-total">
                <span>Subtotal: {money(o.subtotal)}</span>
                <span>Shipping: {money(o.shipping)}</span>
                <strong>Total: {money(o.total)}</strong>
                <span>Payment: {(o.paymentMethod || 'cod').toUpperCase()}</span>
                <span>Payment status: {o.paymentStatus || 'pending'}</span>
              </div>
            </div>
          )}

          <div className="order-status">
            <label>Order status</label>
            <select
              value={o.status}
              onChange={e => updateStatus(o._id, e.target.value)}
            >
              {['placed', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    ))
  )}
</div>
</>}
  </section>}
  <main><section className="hero"><div className="hero-copy"><span className="eyebrow"><Sparkles size={14}/> SMALL BATCH. BIG IMAGINATION.</span><h1>Make room<br/>for <em>wonder.</em></h1><p>Freshly imagined objects for your desk, home and everyday rituals. Designed with curiosity. Made layer by layer.</p><a className="btn btn-dark" href="#shop">Explore the collection <ArrowUpRight size={17}/></a><div className="hero-note"><span>01 / 03</span><i></i> DESIGNED WITH INTENTION</div></div><div className="hero-art"><div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div><div className="hero-object"><div className="vase-neck"></div><div className="vase-body"></div><div className="vase-base"></div></div><div className="art-label label-top">FORM STUDY Nº 01</div><div className="art-label label-bottom">PRINTED, NOT MASS-PRODUCED.</div><span className="art-star">✳</span></div></section>
  <section className="trust-row"><div><Box/><span><b>Made to order</b><small>Less waste, more wonder</small></span></div><div><PackageCheck/><span><b>Quality checked</b><small>Every piece, by hand</small></span></div><div><Truck/><span><b>Delivered to you</b><small>Across India</small></span></div><div><ShieldCheck/><span><b>Secure checkout</b><small>Payment options coming soon</small></span></div></section>
  <section id="shop" className="shop-section"><div className="section-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>Objects with <em>character.</em></h2></div><p>Useful, playful and a little unexpected.<br/>Find your next favourite thing.</p></div><div className="shop-tools"><div className="category-pills">{categories.map(c=><button className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="search-sort"><label><Search size={16}/><input placeholder="Search objects…" value={search} onChange={e=>setSearch(e.target.value)}/></label><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="new">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></div>
  <div className="product-grid">{visible.map((p,i)=><article className="product-card" key={p._id} onClick={()=>setSelected(p)}><div className={`product-visual visual-${i%4}`}>{p.images?.[0]?<img src={imageUrl(p.images[0])} alt={p.name}/>:<div className="placeholder-object"><span>{['◒','⌂','✳','◍'][i%4]}</span></div>}{p.featured&&<span className="tag">FEATURED</span>}<button className="quick-add" onClick={e=>{e.stopPropagation();add(p,p.colorOptions?.[0]||'');}}> <Plus size={17}/> QUICK ADD</button></div><div className="product-meta"><div><span className="product-category">{p.category}</span><h3>{p.name}</h3></div><b>{money(p.price)}</b></div><p className="product-material">{p.material||'3D printed'} · {p.madeToOrder?'Made to order':`${p.stock??0} available`}</p></article>)}</div>{!visible.length&&<div className="empty">No objects found. Try another search.</div>}</section>
  <section className="process" id="story"><div className="process-art"><div className="stack stack-a"></div><div className="stack stack-b"></div><div className="stack stack-c"></div><span>MADE ONE LAYER AT A TIME</span></div><div className="process-copy"><span className="eyebrow">THE FORM & FOUND WAY</span><h2>Designed with intent.<br/>Made to <em>delight.</em></h2><p>We believe good design should be useful, expressive and made with care. Each object begins as a digital form, then takes shape through precision 3D printing and a hands-on finishing process.</p><div className="steps"><div><b>01</b><span>DESIGN<small>Every curve has a purpose.</small></span></div><div><b>02</b><span>PRINT<small>Built layer by layer.</small></span></div><div><b>03</b><span>DELIVER<small>Ready for your everyday.</small></span></div></div></div></section>
  <section className="newsletter"><span className="eyebrow">A NOTE FROM THE WORKSHOP</span><h2>New forms. Fresh ideas.</h2><p>Follow along as we add new pieces to the collection.</p><a href="mailto:hello@layerform.in">Say hello <ArrowUpRight size={16}/></a></section></main>
  <footer id="footer"><a className="brand" href="#"><span className="brand-mark">L</span><span>FORM & FOUND<small>OBJECTS, REIMAGINED</small></span></a><p>Made with curiosity. Printed with care.</p><span>© {new Date().getFullYear()} Layerform</span></footer>
  {selected&&<div className="overlay" onClick={()=>setSelected(null)}><div className="detail-modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}><X/></button><div className="detail-image">{selected.images?.[0]?<img src={imageUrl(selected.images[0])}/>:<div className="placeholder-object"><span>✳</span></div>}</div><div className="detail-copy"><span className="eyebrow">{selected.category}</span><h2>{selected.name}</h2><b className="detail-price">{money(selected.price)}</b><p>{selected.description}</p><div className="specs"><span>Material<strong>{selected.material||'PLA'}</strong></span><span>Dimensions<strong>{selected.dimensions||'Made to fit'}</strong></span><span>Availability<strong>{selected.madeToOrder?'Made to order':`${selected.stock??0} in stock`}</strong></span></div><label className="color-select">Choose a colour<select id="chosenColor">{(selected.colorOptions?.length?selected.colorOptions:['Standard']).map(c=><option>{c}</option>)}</select></label><button className="btn btn-dark full" onClick={()=>add(selected,document.getElementById('chosenColor')?.value||'')}>Add to bag · {money(selected.price)} <ArrowUpRight/></button></div></div></div>}
  {drawer&&<div className="drawer-backdrop" onClick={()=>setDrawer(false)}><aside className="cart-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><h2>Your bag <small>({cart.length} items)</small></h2><button className="icon-btn" onClick={()=>setDrawer(false)}><X/></button></div>{!checkout?<><div className="cart-lines">{cart.map(i=><div className="cart-line" key={i.productId+i.color}><div className="cart-thumb">{i.image?<img src={imageUrl(i.image)}/>:<span>✳</span>}</div><div className="cart-info"><b>{i.name}</b><small>{i.color||'Standard'} · {money(i.price)}</small><div className="qty"><button onClick={()=>updateQty(i.productId,i.color,-1)}><Minus size={13}/></button>{i.quantity}<button onClick={()=>updateQty(i.productId,i.color,1)}><Plus size={13}/></button><button className="remove" onClick={()=>remove(i.productId,i.color)}><Trash2 size={14}/></button></div></div><b>{money(i.price*i.quantity)}</b></div>)}</div>{cart.length?<><div className="totals"><span>Subtotal<b>{money(subtotal)}</b></span><span>Shipping<b>{shipping?money(shipping):'FREE'}</b></span><strong>Total<b>{money(subtotal+shipping)}</b></strong><small>{subtotal<1499?`Add ${money(1499-subtotal)} for free shipping.`:'You unlocked free shipping!'}</small></div><button className="btn btn-dark full" onClick={()=>setCheckout(true)}>Continue to checkout <ArrowUpRight/></button></>:<div className="empty-cart"><ShoppingBag size={32}/><p>Your bag is waiting for something good.</p><button className="btn btn-dark" onClick={()=>setDrawer(false)}>Continue shopping</button></div>}</>:<><button className="back-link" onClick={()=>setCheckout(false)}>← Back to bag</button><form className="checkout-form" onSubmit={placeOrder}><h3>Delivery details</h3><input name="name" placeholder="Full name" required/><input name="email" type="email" placeholder="Email address"/><input name="phone" placeholder="Phone number" required/><input name="line1" placeholder="Address line 1" required/><input name="line2" placeholder="Apartment, landmark (optional)"/><div className="two"><input name="city" placeholder="City" required/><input name="state" placeholder="State" required/></div><input name="postalCode" placeholder="PIN code" required/><textarea name="notes" placeholder="Order notes (optional)"/><div className="payment-note">Cash on Delivery / manual payment · Gateway integration can be added later.</div><div className="totals"><strong>Order total<b>{money(subtotal+shipping)}</b></strong></div><button className="btn btn-dark full" disabled={busy}>{busy?'Placing order…':'Place order (COD)'}</button></form></>}</aside></div>}
 </div>;
}
