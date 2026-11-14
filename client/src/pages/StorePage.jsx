
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, ShoppingBag, X, ArrowUpRight, Plus, Minus,
  Trash2, Box, PackageCheck, Truck, ShieldCheck, Sparkles,
  ChevronLeft, ChevronRight, Maximize2
} from 'lucide-react';
import { api, imageUrl, money } from '../api';
import '../styles.css';

const WHATSAPP_NUMBER = '919270121685';
const BUSINESS_EMAIL = 'swapniljumde2025@gmail.com';

const demo = [
  {
    _id: 'demo-1',
    name: 'Orbit Desk Planter',
    category: 'Home & Living',
    price: 649,
    description: 'A sculptural planter with a soft geometric silhouette. Printed to order and finished by hand.',
    material: 'PLA',
    dimensions: '12 × 12 × 13 cm',
    colorOptions: ['Stone', 'Terracotta', 'Olive'],
    stock: 20,
    featured: true,
    images: []
  },
  {
    _id: 'demo-2',
    name: 'Arc Cable Organiser',
    category: 'Desk Essentials',
    price: 249,
    description: 'A small, satisfying fix for messy charging cables and desk clutter.',
    material: 'PLA+',
    dimensions: '8 × 5 × 3 cm',
    colorOptions: ['Black', 'White', 'Sage'],
    stock: 30,
    images: []
  },
  {
    _id: 'demo-3',
    name: 'Kumo Mini Sculpture',
    category: 'Collectibles',
    price: 899,
    description: 'A playful display piece with smooth curves and a considered matte finish.',
    material: 'PLA',
    dimensions: '10 × 10 × 15 cm',
    colorOptions: ['Cloud', 'Coral', 'Charcoal'],
    stock: 8,
    images: []
  },
  {
    _id: 'demo-4',
    name: 'Modular Wall Hook',
    category: 'Home & Living',
    price: 399,
    description: 'A clean, sturdy hook for keys, headphones and everyday carry.',
    material: 'PETG',
    dimensions: '7 × 4 × 5 cm',
    colorOptions: ['Black', 'Sand', 'Blue'],
    stock: 15,
    images: []
  }
];

const categories = [
  'All',
  'Home & Living',
  'Desk Essentials',
  'Collectibles',
  'Accessories'
];

const blank = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category: 'Home & Living',
  material: 'PLA',
  dimensions: '',
  colorOptions: 'Black, White',
  stock: 10,
  featured: false,
  madeToOrder: false,
  images: []
};

export default function StorePage() {
  const [products, setProducts] = useState(demo);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');

  const [cart, setCart] = useState(
    () => JSON.parse(localStorage.getItem('store_cart') || '[]')
  );

  const [drawer, setDrawer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);

  const [admin, setAdmin] = useState(
    !!localStorage.getItem('store_admin_token')
  );

  const [adminOpen, setAdminOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState('');

  const [login, setLogin] = useState({
    email: '',
    password: ''
  });

  const [busy, setBusy] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const refresh = async () => {
    try {
      const p = await api('/products');
      setProducts(p);
    } catch (e) {
      setNotice(
        'Showing preview products. Connect the API and MongoDB to load your live catalogue.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    localStorage.setItem('store_cart', JSON.stringify(cart));
  }, [cart]);

  // Keyboard navigation for product gallery and full-screen preview
  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = e => {
      const imageCount = selected.images?.length || 0;

      if (e.key === 'Escape') {
        if (imagePreviewOpen) {
          setImagePreviewOpen(false);
        } else {
          setSelected(null);
          setSelectedImageIndex(0);
        }
      }

      if (imageCount > 1 && e.key === 'ArrowRight') {
        setSelectedImageIndex(i => (i + 1) % imageCount);
      }

      if (imageCount > 1 && e.key === 'ArrowLeft') {
        setSelectedImageIndex(
          i => (i - 1 + imageCount) % imageCount
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected, imagePreviewOpen]);

  const visible = useMemo(
    () =>
      products
        .filter(
          p =>
            (category === 'All' || p.category === category) &&
            `${p.name} ${p.description} ${p.category}`
              .toLowerCase()
              .includes(search.toLowerCase())
        )
        .sort((a, b) =>
          sort === 'price-low'
            ? a.price - b.price
            : sort === 'price-high'
            ? b.price - a.price
            : sort === 'new'
            ? new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
            : (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        ),
    [products, category, search, sort]
  );

  const subtotal = cart.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  const shipping = subtotal >= 1499 ? 0 : subtotal ? 79 : 0;

  const closeProductModal = () => {
    setSelected(null);
    setSelectedImageIndex(0);
    setImagePreviewOpen(false);
  };

  const add = (p, color) => {
    setCart(old => {
      const found = old.find(
        i => i.productId === p._id && i.color === color
      );

      return found
        ? old.map(i =>
            i === found
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [
            ...old,
            {
              productId: p._id,
              name: p.name,
              price: p.price,
              image: p.images?.[0] || '',
              quantity: 1,
              color
            }
          ];
    });

    setDrawer(true);
    closeProductModal();
  };

  const updateQty = (id, color, delta) =>
    setCart(old =>
      old.map(i =>
        i.productId === id && i.color === color
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    );

  const remove = (id, color) =>
    setCart(old =>
      old.filter(
        i => !(i.productId === id && i.color === color)
      )
    );

  const doLogin = async e => {
    e.preventDefault();
    setBusy(true);

    try {
      const d = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(login)
      });

      localStorage.setItem('store_admin_token', d.token);
      setAdmin(true);
      setNotice('Owner signed in.');
      await loadAdmin();
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  };

  const loadAdmin = async () => {
    try {
      const [p, o] = await Promise.all([
        api('/products/admin/all'),
        api('/orders')
      ]);

      setProducts(p);
      setOrders(o);
    } catch (e) {
      setNotice(e.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('store_admin_token');
    setAdmin(false);
    setAdminOpen(false);
  };

  const saveProduct = async e => {
    e.preventDefault();
    setBusy(true);

    try {
      let images = form.images || [];
      const files = e.target.elements.imageFiles.files;

      if (files.length) {
        const fd = new FormData();
        [...files].forEach(f => fd.append('images', f));

        const uploaded = await api('/products/upload', {
          method: 'POST',
          body: fd
        });

        images = [...images, ...uploaded.images];
      }

      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : undefined,
        stock: Number(form.stock),
        colorOptions: String(form.colorOptions)
          .split(',')
          .map(x => x.trim())
          .filter(Boolean),
        images
      };

      if (editing) {
        await api(`/products/${editing}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await api('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setForm(blank);
      setEditing(null);
      await loadAdmin();
      setNotice('Product saved.');
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  };

  const editProduct = p => {
    setEditing(p._id);
    setForm({
      ...p,
      colorOptions: (p.colorOptions || []).join(', '),
      images: p.images || []
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async id => {
    if (!confirm('Delete this product?')) return;

    try {
      await api(`/products/${id}`, {
        method: 'DELETE'
      });

      await loadAdmin();
    } catch (e) {
      setNotice(e.message);
    }
  };

  // Send customer details and complete order to WhatsApp
  const placeOrder = e => {
    e.preventDefault();

    if (!cart.length) {
      setNotice('Your shopping bag is empty.');
      return;
    }

    const f = new FormData(e.target);

    const customer = {
      name: f.get('name'),
      email: f.get('email') || 'Not provided',
      phone: f.get('phone'),
      line1: f.get('line1'),
      line2: f.get('line2'),
      city: f.get('city'),
      state: f.get('state'),
      postalCode: f.get('postalCode'),
      notes: f.get('notes')
    };

    const items = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name}
Colour: ${item.color || 'Standard'}
Quantity: ${item.quantity}
Price: ${money(item.price * item.quantity)}`
      )
      .join('\n\n');

    const message = `Hi Trimerge! I would like to place an order.

CUSTOMER DETAILS
Name: ${customer.name}
Phone: ${customer.phone}
Email: ${customer.email}

DELIVERY ADDRESS
${customer.line1}
${customer.line2 ? customer.line2 + '\n' : ''}${customer.city}, ${customer.state}
PIN Code: ${customer.postalCode}

ORDER DETAILS
${items}

Subtotal: ${money(subtotal)}
Estimated Shipping: ${shipping ? money(shipping) : 'FREE'}
Estimated Total: ${money(subtotal + shipping)}

Order Notes: ${customer.notes || 'None'}

Please confirm my order, delivery charges and payment details.`;

    const whatsappURL =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank', 'noopener,noreferrer');

    setCheckout(false);
    setDrawer(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await api(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });

      await loadAdmin();
    } catch (e) {
      setNotice(e.message);
    }
  };

  return (
    <div className="site">
      <div className="announcement">
        DESIGNED TO DELIGHT, PRINTED TO LAST
        <span>•</span>
        FREE SHIPPING ABOVE ₹1,499
      </div>

      <header className="header">
        <a className="brand" href="#">
          <span className="brand-mark">
            <img src="/trimerge-icon.svg" alt="" />
          </span>
          <span className="brand-name">
            Trimerge
            <small>3D PRINTED. THOUGHTFULLY MADE.</small>
          </span>
        </a>

        <nav>
          <a href="#shop">Shop</a>
          <a href="#story">Our process</a>
          <a href="#footer">Contact</a>
        </nav>

        <div className="head-actions">
          <button
            className="bag-btn"
            onClick={() => {
              setCheckout(false);
              setDrawer(true);
            }}
          >
            <ShoppingBag size={19} />
            <span>Bag</span>
            <b>
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </b>
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice" onClick={() => setNotice('')}>
          {notice}
          <button>
            <X size={15} />
          </button>
        </div>
      )}

      <main>
         
        <section className="hero">
  <img
    src="/trimerge-hero.png"
    alt="A collection of colourful 3D printed creations by Trimerge"
    className="hero-bg"
  />
  <div className="hero-scrim" />

  <div className="hero-copy">
    <span className="eyebrow">
      <Sparkles size={14} />
      SMALL BATCH. BIG IMAGINATION.
    </span>

    <h1>
      Make room
      <br />
      for <em>wonder.</em>
    </h1>

    <p>
      Freshly imagined objects for your desk, home and everyday
      rituals. Designed with curiosity. Made layer by layer.
    </p>

    <a className="btn btn-dark" href="#shop">
      Explore the collection <ArrowUpRight size={17} />
    </a>

    <div className="hero-note">
      <span>01 / 03</span>
      <i></i>
      DESIGNED WITH INTENTION
    </div>
  </div>
</section>

       




        <section className="trust-row">
          <div>
            <Box />
            <span>
              <b>Made to order</b>
              <small>Less waste, more wonder</small>
            </span>
          </div>

          <div>
            <PackageCheck />
            <span>
              <b>Quality checked</b>
              <small>Every piece, by hand</small>
            </span>
          </div>

          <div>
            <Truck />
            <span>
              <b>Delivered to you</b>
              <small>Across India</small>
            </span>
          </div>

          <div>
            <ShieldCheck />
            <span>
              <b>Order assistance</b>
              <small>Direct WhatsApp confirmation</small>
            </span>
          </div>
        </section>

        <section id="shop" className="shop-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE COLLECTION</span>
              <h2>
                Objects with <em>character.</em>
              </h2>
            </div>

            <p>
              Useful, playful and a little unexpected.
              <br />
              Find your next favourite thing.
            </p>
          </div>

          <div className="shop-tools">
            <div className="category-dropdown">
              <label htmlFor="categoryFilter">Category</label>

              <select
                id="categoryFilter"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-sort">
              <label>
                <Search size={16} />
                <input
                  placeholder="Search objects…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </label>

              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="new">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="product-grid">
            {visible.map((p, i) => (
              <article
                className="product-card"
                key={p._id}
                onClick={() => {
                  setSelected(p);
                  setSelectedImageIndex(0);
                  setImagePreviewOpen(false);
                }}
              >
                <div className={`product-visual visual-${i % 4}`}>
                  {p.images?.[0] ? (
                    <img src={imageUrl(p.images[0])} alt={p.name} />
                  ) : (
                    <div className="placeholder-object">
                      <span>{['◒', '⌂', '✳', '◍'][i % 4]}</span>
                    </div>
                  )}

                  {p.featured && (
                    <span className="tag">FEATURED</span>
                  )}

                  <button
                    className="quick-add"
                    onClick={e => {
                      e.stopPropagation();
                      add(p, p.colorOptions?.[0] || 'Standard');
                    }}
                  >
                    <Plus size={17} /> QUICK ADD
                  </button>
                </div>

                <div className="product-meta">
                  <div>
                    <span className="product-category">{p.category}</span>
                    <h3>{p.name}</h3>
                  </div>
                  <b>{money(p.price)}</b>
                </div>

                <p className="product-material">
                  {p.material || '3D printed'} ·{' '}
                  {p.madeToOrder
                    ? 'Made to order'
                    : `${p.stock ?? 0} available`}
                </p>
              </article>
            ))}
          </div>

          {!visible.length && (
            <div className="empty">
              No objects found. Try another search.
            </div>
          )}
        </section>

        <section className="process" id="story">
          <div className="process-art">
            <div className="stack stack-a"></div>
            <div className="stack stack-b"></div>
            <div className="stack stack-c"></div>
            <span>MADE ONE LAYER AT A TIME</span>
          </div>

          <div className="process-copy">
            <span className="eyebrow">THE TRIMERGE WAY</span>
            <h2>
              Designed with intent.
              <br />
              Made to <em>delight.</em>
            </h2>

            <p>
              We believe good design should be useful, expressive and made
              with care. Each object begins as a digital form, then takes
              shape through precision 3D printing and a hands-on finishing
              process.
            </p>

            <div className="steps">
              <div>
                <b>01</b>
                <span>
                  DESIGN
                  <small>Every curve has a purpose.</small>
                </span>
              </div>
              <div>
                <b>02</b>
                <span>
                  PRINT
                  <small>Built layer by layer.</small>
                </span>
              </div>
              <div>
                <b>03</b>
                <span>
                  DELIVER
                  <small>Ready for your everyday.</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="newsletter">
          <span className="eyebrow">A NOTE FROM THE WORKSHOP</span>
          <h2>New forms. Fresh ideas.</h2>
          <p>Follow along as we add new pieces to the collection.</p>
          <a href="#footer">
            Connect with Trimerge <ArrowUpRight size={16} />
          </a>
        </section>
      </main>

      <footer id="footer">
        <a className="brand" href="#">
          <span className="brand-mark">
            <img src="/trimerge-icon.svg" alt="" />
          </span>
          <span className="brand-name">
            Trimerge
            <small>3D PRINTED. THOUGHTFULLY MADE.</small>
          </span>
        </a>

        <div className="footer-copy">
          <p>Made with curiosity. Printed with care.</p>
          <span>
            © {new Date().getFullYear()} Trimerge. All rights reserved.
          </span>
        </div>

        <div className="footer-contact">
          <h4>Get in touch</h4>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp: +91 92701 21685
          </a>

          <a href={`mailto:${BUSINESS_EMAIL}`}>
            Email: {BUSINESS_EMAIL}
          </a>
        </div>

        <p className="creator-credit">
          Designed &amp; Developed by <strong>Swapnil</strong> ;)
        </p>
      </footer>

      {/* Product details modal */}
      {selected && (
        <div
          className="overlay"
          onClick={closeProductModal}
        >
          <div
            className="detail-modal"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={closeProductModal}
              aria-label="Close product details"
            >
              <X />
            </button>

            {/* Product image gallery */}
            <div className="detail-gallery">
              {selected.images?.length > 0 ? (
                <>
                  <div className="gallery-main">
                    <img
                      src={imageUrl(selected.images[selectedImageIndex])}
                      alt={`${selected.name} - Image ${selectedImageIndex + 1}`}
                    />

                    {selected.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="gallery-arrow gallery-prev"
                          onClick={() =>
                            setSelectedImageIndex(
                              i =>
                                (i - 1 + selected.images.length) %
                                selected.images.length
                            )
                          }
                          aria-label="Previous image"
                        >
                          <ChevronLeft />
                        </button>

                        <button
                          type="button"
                          className="gallery-arrow gallery-next"
                          onClick={() =>
                            setSelectedImageIndex(
                              i => (i + 1) % selected.images.length
                            )
                          }
                          aria-label="Next image"
                        >
                          <ChevronRight />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="gallery-expand"
                      onClick={() => setImagePreviewOpen(true)}
                      aria-label="View larger image"
                    >
                      <Maximize2 size={18} />
                    </button>

                    <span className="gallery-counter">
                      {selectedImageIndex + 1} / {selected.images.length}
                    </span>
                  </div>

                  {selected.images.length > 1 && (
                    <div className="gallery-thumbnails">
                      {selected.images.map((img, index) => (
                        <button
                          type="button"
                          key={`${img}-${index}`}
                          className={
                            selectedImageIndex === index ? 'active' : ''
                          }
                          onClick={() => setSelectedImageIndex(index)}
                          aria-label={`View image ${index + 1}`}
                        >
                          <img
                            src={imageUrl(img)}
                            alt={`${selected.name} thumbnail ${index + 1}`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="gallery-placeholder">
                  <div className="placeholder-object">
                    <span>✳</span>
                  </div>
                </div>
              )}
            </div>

            {/* Product information */}
            <div className="detail-copy">
              <span className="eyebrow">{selected.category}</span>
              <h2>{selected.name}</h2>
              <b className="detail-price">{money(selected.price)}</b>
              <p>{selected.description}</p>

              <div className="specs">
                <span>
                  Material
                  <strong>{selected.material || 'PLA'}</strong>
                </span>

                <span>
                  Dimensions
                  <strong>{selected.dimensions || 'Made to fit'}</strong>
                </span>

                <span>
                  Availability
                  <strong>
                    {selected.madeToOrder
                      ? 'Made to order'
                      : `${selected.stock ?? 0} in stock`}
                  </strong>
                </span>
              </div>

              <label className="color-select">
                Choose a colour
                <select id="chosenColor">
                  {(selected.colorOptions?.length
                    ? selected.colorOptions
                    : ['Standard']
                  ).map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <div className="product-order-actions">
                <button
                  className="btn btn-outline full"
                  onClick={() => {
                    const color =
                      document.getElementById('chosenColor')?.value ||
                      'Standard';

                    add(selected, color);
                  }}
                >
                  <Plus size={17} />
                  Add to Bag
                </button>

                <button
                  className="btn btn-dark full"
                  onClick={() => {
                    const color =
                      document.getElementById('chosenColor')?.value ||
                      'Standard';

                    add(selected, color);
                    setCheckout(true);
                  }}
                >
                  Order Now <ArrowUpRight size={17} />
                </button>
              </div>

              <a
                className="email-order-link"
                href={`mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(
                  `Product enquiry - ${selected.name}`
                )}&body=${encodeURIComponent(
                  `Hi Trimerge,\n\nI'm interested in ${selected.name}.\n\nPlease share the ordering details.`
                )}`}
              >
                Prefer email? {BUSINESS_EMAIL}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen image preview */}
      {imagePreviewOpen && selected?.images?.length > 0 && (
        <div
          className="image-preview-overlay"
          onClick={() => setImagePreviewOpen(false)}
        >
          <button
            type="button"
            className="image-preview-close"
            onClick={() => setImagePreviewOpen(false)}
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>

          {selected.images.length > 1 && (
            <button
              type="button"
              className="image-preview-arrow preview-prev"
              onClick={e => {
                e.stopPropagation();

                setSelectedImageIndex(
                  i =>
                    (i - 1 + selected.images.length) %
                    selected.images.length
                );
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          <img
            src={imageUrl(selected.images[selectedImageIndex])}
            alt={selected.name}
            onClick={e => e.stopPropagation()}
          />

          {selected.images.length > 1 && (
            <button
              type="button"
              className="image-preview-arrow preview-next"
              onClick={e => {
                e.stopPropagation();

                setSelectedImageIndex(
                  i => (i + 1) % selected.images.length
                );
              }}
              aria-label="Next image"
            >
              <ChevronRight size={30} />
            </button>
          )}

          <span className="image-preview-counter">
            {selectedImageIndex + 1} / {selected.images.length}
          </span>
        </div>
      )}

      {/* Shopping bag and checkout drawer */}
      {drawer && (
        <div
          className="drawer-backdrop"
          onClick={() => setDrawer(false)}
        >
          <aside
            className="cart-drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="drawer-head">
              <h2>
                Your bag <small>({cart.length} items)</small>
              </h2>

              <button
                className="icon-btn"
                onClick={() => setDrawer(false)}
              >
                <X />
              </button>
            </div>

            {!checkout ? (
              <>
                <div className="cart-lines">
                  {cart.map(i => (
                    <div
                      className="cart-line"
                      key={i.productId + i.color}
                    >
                      <div className="cart-thumb">
                        {i.image ? (
                          <img src={imageUrl(i.image)} alt={i.name} />
                        ) : (
                          <span>✳</span>
                        )}
                      </div>

                      <div className="cart-info">
                        <b>{i.name}</b>
                        <small>
                          {i.color || 'Standard'} · {money(i.price)}
                        </small>

                        <div className="qty">
                          <button
                            onClick={() =>
                              updateQty(i.productId, i.color, -1)
                            }
                          >
                            <Minus size={13} />
                          </button>

                          {i.quantity}

                          <button
                            onClick={() =>
                              updateQty(i.productId, i.color, 1)
                            }
                          >
                            <Plus size={13} />
                          </button>

                          <button
                            className="remove"
                            onClick={() =>
                              remove(i.productId, i.color)
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <b>{money(i.price * i.quantity)}</b>
                    </div>
                  ))}
                </div>

                {cart.length ? (
                  <>
                    <div className="totals">
                      <span>
                        Subtotal <b>{money(subtotal)}</b>
                      </span>

                      <span>
                        Shipping
                        <b>{shipping ? money(shipping) : 'FREE'}</b>
                      </span>

                      <strong>
                        Total <b>{money(subtotal + shipping)}</b>
                      </strong>

                      <small>
                        {subtotal < 1499
                          ? `Add ${money(1499 - subtotal)} for free shipping.`
                          : 'You unlocked free shipping!'}
                      </small>
                    </div>

                    <button
                      className="btn btn-dark full"
                      onClick={() => setCheckout(true)}
                    >
                      Continue to Order <ArrowUpRight />
                    </button>
                  </>
                ) : (
                  <div className="empty-cart">
                    <ShoppingBag size={32} />
                    <p>Your bag is waiting for something good.</p>

                    <button
                      className="btn btn-dark"
                      onClick={() => setDrawer(false)}
                    >
                      Continue shopping
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  className="back-link"
                  onClick={() => setCheckout(false)}
                >
                  ← Back to bag
                </button>

                <form
                  className="checkout-form"
                  onSubmit={placeOrder}
                >
                  <h3>Delivery details</h3>

                  <input
                    name="name"
                    placeholder="Full name"
                    required
                  />

                  <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                  />

                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone number"
                    required
                  />

                  <input
                    name="line1"
                    placeholder="Address line 1"
                    required
                  />

                  <input
                    name="line2"
                    placeholder="Apartment, landmark (optional)"
                  />

                  <div className="two">
                    <input
                      name="city"
                      placeholder="City"
                      required
                    />

                    <input
                      name="state"
                      placeholder="State"
                      required
                    />
                  </div>

                  <input
                    name="postalCode"
                    placeholder="PIN code"
                    required
                  />

                  <textarea
                    name="notes"
                    placeholder="Order notes (optional)"
                  />

                  <div className="payment-note">
                    No online payment required. We'll contact you on
                    WhatsApp to confirm your order, delivery charges
                    and payment details.
                  </div>

                  <div className="totals">
                    <strong>
                      Estimated order total
                      <b>{money(subtotal + shipping)}</b>
                    </strong>
                  </div>

                  <button
                    className="btn btn-dark full"
                    type="submit"
                  >
                    Confirm &amp; Send Order on WhatsApp
                    <ArrowUpRight />
                  </button>
                </form>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
