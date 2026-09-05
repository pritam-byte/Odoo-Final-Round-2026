import React, { useState, useRef } from 'react';
import { Plus, Mail, Phone, MapPin, Image as ImageIcon, Check, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { useAccountingStore, Contact } from '../../accounting/store';
import { Button } from '../../../components/ui/Button';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { AccountantNav } from '../../../components/ui/AccountantNav';

export const ContactsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { contacts, addContact, updateContact } = useAccountingStore();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [type, setType] = useState<'customer' | 'vendor' | 'partner'>('customer');
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
    setEditingContact(null);
    setName('');
    setEmail('');
    setPhone('');
    setImageUrl('');
    setStreet('');
    setCity('');
    setState('');
    setCountry('India');
    setPincode('');
    setType('customer');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Contact) => {
    setEditingContact(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setImageUrl(c.imageUrl || '');
    setStreet(c.address.street);
    setCity(c.address.city);
    setState(c.address.state);
    setCountry(c.address.country);
    setPincode(c.address.pincode);
    setType(c.type as any);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Contact Name and Email are required.');
      return;
    }

    // Check unique email
    const duplicate = contacts.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.id !== editingContact?.id
    );
    if (duplicate) {
      setError('This email is already registered with another contact.');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      imageUrl: imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      type,
      address: {
        street,
        city,
        state,
        country,
        pincode,
      },
    };

    if (editingContact) {
      updateContact(editingContact.id, payload);
    } else {
      addContact(payload);
    }

    setIsModalOpen(false);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const columns: Column<Contact>[] = [
    {
      key: 'image',
      header: 'Avatar',
      width: '60px',
      render: (c) => (
        <img
          src={c.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`}
          alt={c.name}
          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
        />
      ),
    },
    {
      key: 'name',
      header: 'Contact Name',
      render: (c) => <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{c.name}</span>,
    },
    {
      key: 'email',
      header: 'Email Address',
    },
    {
      key: 'phone',
      header: 'Phone Number',
    },
    {
      key: 'city',
      header: 'Location',
      render: (c) => <span>{c.address.city ? `${c.address.city}, ${c.address.state}` : '—'}</span>,
    },
    {
      key: 'type',
      header: 'Role',
      render: (c) => (
        <span className="badge-pill badge-neutral" style={{ textTransform: 'capitalize' }}>
          {c.type}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Accountant Module Top Navigation Bar */}
      <AccountantNav currentRoute="/contacts" onNavigate={onNavigate} />

      {/* Header & Controls matching Wireframe */}
      <div className="content-header">
        <div>
          <h1 className="page-title">Contacts Master Directory</h1>
          <p className="page-subtitle">Manage customer, vendor, and partner directory profiles</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} strokeWidth={2.2} />}>
            New Contact
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
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filteredContacts.length}</strong> contacts
          </span>
        </div>

        {/* View Mode: List or Kanban */}
        {viewMode === 'list' ? (
          <DataTable
            columns={columns}
            data={filteredContacts}
            keyExtractor={(c) => c.id}
            onRowClick={openEditModal}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {filteredContacts.map((c) => (
              <div
                key={c.id}
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
                onClick={() => openEditModal(c)}
              >
                <img
                  src={c.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`}
                  alt={c.name}
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Mail size={12} /> {c.email}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} /> {c.phone || 'No phone'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Master Form View (Create / Edit Modal matching Wireframe) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContact ? `Edit Contact: ${editingContact.name}` : 'New Contact Master Profile'}
        maxWidth="600px"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '16px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <FormField
                label="Contact Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Open Wood Corp"
                required
                autoFocus
              />

              <FormField
                label="Email (Unique)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="openwood21@example.com"
                leadingIcon={<Mail size={15} />}
                required
              />

              <FormField
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9090090909"
                leadingIcon={<Phone size={15} />}
              />
            </div>

            {/* Image Upload Box matching Wireframe */}
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label">Profile Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageFileUpload}
              />
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-bg)',
                  overflow: 'hidden',
                  margin: '0 auto 8px auto',
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload image file"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                    <ImageIcon size={22} strokeWidth={1.5} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Choose File</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload size={13} />}
                >
                  {imageUrl ? 'Change' : 'Upload'}
                </Button>
                {imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageUrl('')}
                    leftIcon={<Trash2 size={13} />}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Address Block matching Wireframe */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} style={{ color: 'var(--color-primary)' }} />
              Address Block
            </label>

            <FormField
              placeholder="Street Address (e.g. 42 Timberland Ave)"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField
                placeholder="City (e.g. Mumbai)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <FormField
                placeholder="State (e.g. Maharashtra)"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField
                placeholder="Country (e.g. India)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              <FormField
                placeholder="Pincode (e.g. 400001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContactsPage;
