import React, { useState } from 'react';
import { Plus, IndianRupee, Image as ImageIcon, Check, ArrowLeft } from 'lucide-react';
import { useAccountingStore, Product, ProductType } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { Many2OneSelect } from '../../../components/ui/Many2OneSelect';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const ProductsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { products, categories, addProduct, updateProduct, addCategory } = useAccountingStore();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('Goods');
  const [categoryId, setCategoryId] = useState('');
  const [salesPrice, setSalesPrice] = useState<number>(100);
  const [cost, setCost] = useState<number>(50);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

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
      categoryId: matchedCat?.id || 'cat1',
      categoryName: matchedCat?.name || 'General',
      salesPrice: Number(salesPrice) || 0,
      cost: Number(cost) || 0,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=120&auto=format&fit=crop&q=60',
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
        <img
          src={p.imageUrl || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=120&auto=format&fit=crop&q=60'}
          alt={p.name}
          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
        />
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
                <img
                  src={p.imageUrl || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=120&auto=format&fit=crop&q=60'}
                  alt={p.name}
                  style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                />
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
              Product Type (Dropdown: Goods / Service / Combo)
            </label>
            <select
              id="prod-type"
              className="form-input select-filter"
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
            >
              <option value="Goods">Goods (Stockable / Physical Item)</option>
              <option value="Service">Service (Non-stockable / Billable Work)</option>
              <option value="Combo">Combo (Bundled Kit / Assembly)</option>
            </select>
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
              label="Sales Price ($)"
              type="number"
              step="0.01"
              value={salesPrice}
              onChange={(e) => setSalesPrice(Number(e.target.value))}
              leadingIcon={<IndianRupee size={15} />}
              required
            />
            <FormField
              label="Cost Price ($)"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              leadingIcon={<IndianRupee size={15} />}
              required
            />
          </div>

          {/* Image Upload Preview */}
          <div className="form-group">
            <label className="form-label">Product Image URL</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <FormField
                style={{ flex: 1 }}
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                leadingIcon={<ImageIcon size={15} />}
              />
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={16} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
