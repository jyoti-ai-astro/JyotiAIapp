import { LegalPageShell } from '@/src/ui/legal/LegalPageShell'

export default function RefundPage() {
  return (
    <LegalPageShell
      eyebrow="Payments"
      title="Refunds and subscription cancellation."
      description="This page explains the distinction between cancelling future subscription renewals and requesting review of a completed charge."
      updated="30 August 2026"
      sections={[
        {
          title: 'Subscriptions',
          content: (
            <p>
              Where cancellation is available, cancelling a subscription stops
              future renewal according to the subscription state and provider
              processing applicable to that account. Cancellation does not by
              itself mean that a previous charge has been refunded.
            </p>
          ),
        },
        {
          title: 'One-time purchases',
          content: (
            <p>
              One-time purchases grant the product or entitlement identified at
              checkout after payment verification. They are distinct from
              recurring subscriptions.
            </p>
          ),
        },
        {
          title: 'Refund requests',
          content: (
            <p>
              If you believe a charge is incorrect, duplicated, unauthorized,
              or the purchased entitlement was not delivered as expected,
              contact JyotiAI support with enough transaction information for
              the issue to be reviewed. Eligibility can depend on the
              transaction circumstances and applicable law.
            </p>
          ),
        },
        {
          title: 'Processing',
          content: (
            <p>
              Where a refund is approved and technically available, processing
              may involve the payment provider and financial institutions.
              JyotiAI does not promise a fixed bank-processing timeline that it
              cannot control.
            </p>
          ),
        },
        {
          title: 'Statutory rights',
          content: (
            <p>
              Nothing on this page is intended to remove consumer rights that
              apply and cannot lawfully be waived.
            </p>
          ),
        },
      ]}
    />
  )
}
