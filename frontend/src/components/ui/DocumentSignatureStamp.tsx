import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface DocumentSignatureStampProps {
  documentRef?: string;
  signatoryName?: string;
  signatoryRole?: string;
  compact?: boolean;
}

export const DocumentSignatureStamp: React.FC<DocumentSignatureStampProps> = ({
  documentRef,
  signatoryName = 'Pritam Denria',
  signatoryRole = 'Chief Financial Officer / Lead Accountant',
  compact = false,
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const refCode = documentRef || `UF-AUTH-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  return (
    <div
      className="document-signature-stamp-container"
      style={{
        marginTop: compact ? '20px' : '32px',
        paddingTop: compact ? '14px' : '20px',
        borderTop: '1px dashed var(--color-border)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Left: Security & Digital Verification Seal */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          maxWidth: '340px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(15, 118, 110, 0.08)',
            border: '1px solid rgba(15, 118, 110, 0.25)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            width: 'fit-content',
          }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Certified & Digitally Verified
          </span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
          <div>
            <strong>Corporate Seal:</strong> Urban Furniture Enterprise Pvt. Ltd.
          </div>
          <div>
            <strong>Authentication ID:</strong> <code style={{ fontSize: '10px', fontWeight: 600 }}>{refCode}</code>
          </div>
          <div>
            <strong>Verification Date:</strong> {currentDate} (Financial Audit Approved)
          </div>
        </div>
      </div>

      {/* Right: Formal Signature Block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          minWidth: '220px',
        }}
      >
        {/* Stylized Digital Signature */}
        <div
          style={{
            fontFamily: "'Caveat', 'Dancing Script', 'Brush Script MT', cursive",
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--color-primary)',
            lineHeight: 1.1,
            marginBottom: '4px',
            userSelect: 'none',
            letterSpacing: '0.5px',
          }}
        >
          {signatoryName}
        </div>

        {/* Signature Line */}
        <div
          style={{
            width: '100%',
            borderTop: '1.5px solid var(--color-text-primary)',
            paddingTop: '6px',
            marginTop: '2px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Authorized Signatory
          </div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>
            {signatoryName}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
            {signatoryRole}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSignatureStamp;
