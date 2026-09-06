import React, { useState, useRef } from 'react';
import { Plus, IndianRupee, Image as ImageIcon, Check, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { useAccountingStore, Product, ProductType } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Many2OneSelect } from '../../../components/ui/Many2OneSelect';
import { AccountantNav } from '../../../components/ui/AccountantNav';
import { CustomSelect } from '../../../components/ui/CustomSelect';

export const ProductsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { products, categories, addProduct, updateProduct, addCategory } = useAccountingStore();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('Goods');
  const [categoryId, setCategoryId] = useState('');
  const [salesPrice, setSalesPrice] = useState<number>(100);
  const [cost, setCost] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setType('Goods');
    setCategoryId(categories[0]?.id || '');
    setSalesPrice(100);
    setCost(50);
    setImageUrl('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setType(p.type);
    setCategoryId(p.categoryId);
    setSalesPrice(p.salesPrice);
    setCost(p.cost);
    setImageUrl(p.imageUrl || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }

    const matchedCat = categories.find((c) => c.id === categoryId) || categories[0];

    const payload = {
      name,
      type,
      categoryId: matchedCat?.id || categories[0]?.id || 'cat_general',
      categoryName: matchedCat?.name || 'General',
      salesPrice: Number(salesPrice) || 0,
      cost: Number(cost) || 0,
      imageUrl: imageUrl || '',
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: 'Image',
      width: '60px',
      render: (p) => (
        <div style={{ width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageIcon size={18} color="var(--color-text-muted)" />
          )}
        </div>
      ),
    },
    {
      key: 'name',

      header: 'Product Name',
      render: (p) => <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{p.name}</span>,
    },
    {
      key: 'categoryName',
      header: 'Category',
      render: (p) => (
        <span className="badge-pill badge-neutral" style={{ fontSize: '11px' }}>
          {p.categoryName}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (p) => (
        <span
          className={`badge-pill ${
            p.type === 'Goods' ? 'badge-completed' : p.type === 'Service' ? 'badge-pending' : 'badge-neutral'
          }`}
        >
          {p.type}
        </span>
      ),
    },
    {
      key: 'salesPrice',
      header: 'Sales Price',
      align: 'right',
      render: (p) => <span style={{ fontWeight: 600 }}>₹{p.salesPrice.toLocaleString()}</span>,
    },
    {
      key: 'cost',
      header: 'Cost Price',
      align: 'right',
      render: (p) => <span style={{ color: 'var(--color-text-muted)' }}>₹{p.cost.toLocaleString()}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Accountant Module Navigation */}
      <AccountantNav currentRoute="/products" onNavigate={onNavigate} />

      {/* Header & Controls matching Wireframe */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Product & Services Catalog</h1>
          <p className="page-subtitle">Configure saleable goods, billable services, and combo items</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
            New Product
          </Button>
        </div>
      </div>

      {/* Search Bar matching Wireframe */}
      <div className="card-panel" style={{ padding: '16px 20px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <input
            type="text"
            className="form-input search-bar-input"
            style={{ width: '100%', maxWidth: '360px' }}
            placeholder="Search by product name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredProducts.length}</strong> items
          </span>
        </div>

        {/* View Mode: List or Kanban matching Wireframe */}
        {viewMode === 'list' ? (
          <DataTable
            columns={columns}
            data={filteredProducts}
            keyExtractor={(p) => p.id}
            onRowClick={openEditModal}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="card-panel"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => openEditModal(p)}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <ImageIcon size={24} color="var(--color-text-muted)" />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.categoryName} • {p.type}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>₹{p.salesPrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                      Cost: ₹{p.cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Master Form View (Modal matching Wireframe) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'New Product Master Form'}
        maxWidth="560px"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} leftIcon={<ArrowLeft size={15} />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleSave} leftIcon={<Check size={15} strokeWidth={2.2} />}>
              Confirm & Save
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <FormField
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Air Conditioner Pro 2.5T"
            required
            autoFocus
          />

          {/* Product Type Dropdown (Goods / Service / Combo) matching Wireframe */}
          <div className="form-group">
            <label className="form-label" htmlFor="prod-type">
              Product Type
            </label>
            <CustomSelect<ProductType>
              value={type}
              onChange={(newVal) => setType(newVal)}
              options={[
                { value: 'Goods', label: 'Goods (Stockable / Physical Item)' },
                { value: 'Service', label: 'Service (Non-stockable / Billable Work)' },
                { value: 'Combo', label: 'Combo (Bundled Kit / Assembly)' },
              ]}
              width="100%"
            />
          </div>

          {/* Category Many2One Field (Creatable and Saved on the fly) matching Wireframe */}
          <Many2OneSelect
            label="Product Category"
            options={categories.map((c) => ({ id: c.id, name: c.name }))}
            value={categoryId}
            onChange={(id) => setCategoryId(id)}
            placeholder="Select or create category..."
            createEntityName="Product Category"
            onCreateNew={(catName) => {
              const created = addCategory(catName);
              return { id: created.id, name: created.name };
            }}
            required
          />

          {/* Sales Price & Cost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField
              label="Sales Price (₹)"
              type="number"
              step="0.01"
              value={salesPrice}
              onChange={(e) => setSalesPrice(Number(e.target.value))}
              leadingIcon={<IndianRupee size={15} />}
              required
            />
            <FormField
              label="Cost Price (₹)"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              leadingIcon={<IndianRupee size={15} />}
              required
            />
          </div>

          {/* Product Image Upload (No URL entry required) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Product Image</span>
              {imageUrl && (
                <button
                  type="button"
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-danger)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={() => setImageUrl('')}
                >
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </label>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileUpload}
            />

            <div
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={26} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload size={14} />}
                  >
                    {imageUrl ? 'Change Image File' : 'Upload Image File'}
                  </Button>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Select an image file from your device or choose a quick preset below.
                </span>
              </div>
            </div>

            {/* Quick Presets for Furniture & Stock */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Quick Furniture & Stock Presets:
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { name: 'Refrigerator', url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=120&auto=format&fit=crop&q=60' },
                  { name: 'Chair', url: 'https://images.unsplash.com/photo-1580481077197-9e663a8e7e1c?w=120&auto=format&fit=crop&q=60' },
                  { name: 'Sofa', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&auto=format&fit=crop&q=60' },
                  { name: 'Table', url: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=120&auto=format&fit=crop&q=60' },
                  { name: 'Bed', url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=120&auto=format&fit=crop&q=60' },
                  { name: 'Service', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=120&auto=format&fit=crop&q=60' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: imageUrl === preset.url ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: imageUrl === preset.url ? 'var(--color-primary-light, #e6f4ea)' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                    onClick={() => setImageUrl(preset.url)}
                  >
                    <img src={preset.url} alt={preset.name} style={{ width: '18px', height: '18px', borderRadius: '3px', objectFit: 'cover' }} />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
