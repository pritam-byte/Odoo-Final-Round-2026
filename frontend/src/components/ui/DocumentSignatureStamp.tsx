import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface DocumentSignatureStampProps {
  documentRef?: string;
  firstDesignation?: string;
  firstSubtitle?: string;
  secondDesignation?: string;
  secondSubtitle?: string;
  compact?: boolean;
}

export const DocumentSignatureStamp: React.FC<DocumentSignatureStampProps> = ({
  documentRef,
  firstDesignation = 'Chief Accountant',
  firstSubtitle = 'Authorized Signatory',
  secondDesignation = 'Managing Director',
  secondSubtitle = 'Corporate Seal & Approval',
  compact = false,
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const refCode =
    documentRef ||
    `UF-AUTH-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

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
        gap: '24px',
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
            Certified &amp; Digitally Verified
          </span>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
          <div>
            <strong>Corporate Seal:</strong> Urban Furniture Enterprise Pvt. Ltd.
          </div>
          <div>
            <strong>Authentication ID:</strong>{' '}
            <code style={{ fontSize: '10px', fontWeight: 600 }}>{refCode}</code>
          </div>
          <div>
            <strong>Verification Date:</strong> {currentDate} (Financial Audit Approved)
          </div>
        </div>
      </div>

      {/* Right: Two Designated Authenticated Signing Fields (Vacant Signature Lines) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: compact ? '24px' : '36px',
          flexWrap: 'wrap',
        }}
      >
        {/* Field 1: First Authenticated Designated Field */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minWidth: compact ? '140px' : '170px',
          }}
        >
          {/* Vacant area for physical / manual signature */}
          <div style={{ height: compact ? '32px' : '44px', width: '100%' }} />

          <div
            style={{
              width: '100%',
              borderTop: '1.5px solid var(--color-text-primary)',
              paddingTop: '6px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {firstDesignation}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
              {firstSubtitle}
            </div>
          </div>
        </div>

        {/* Field 2: Second Authenticated Designated Field */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            minWidth: compact ? '140px' : '170px',
          }}
        >
          {/* Vacant area for physical / manual signature */}
          <div style={{ height: compact ? '32px' : '44px', width: '100%' }} />

          <div
            style={{
              width: '100%',
              borderTop: '1.5px solid var(--color-text-primary)',
              paddingTop: '6px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {secondDesignation}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
              {secondSubtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSignatureStamp;
