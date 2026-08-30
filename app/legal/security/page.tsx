import { LegalPageShell } from '@/src/ui/legal/LegalPageShell'

export default function SecurityPage() {
  return (
    <LegalPageShell
      eyebrow="Security"
      title="Security without invented guarantees."
      description="JyotiAI is designed to protect account and service data using the controls available across its application and infrastructure, while recognizing that no online system is risk-free."
      updated="30 August 2026"
      sections={[
        {
          title: 'Our approach',
          content: (
            <p>
              Security is treated as an engineering and operational
              responsibility across authentication, authorization, server-side
              secrets, payment verification and access to application data.
            </p>
          ),
        },
        {
          title: 'Authentication and access',
          content: (
            <p>
              JyotiAI uses authenticated sessions and server-side authorization
              checks for protected functionality. Sensitive server credentials
              are intended to remain outside client-side application code.
            </p>
          ),
        },
        {
          title: 'Payments',
          content: (
            <p>
              Payment flows use provider-side transaction processing and
              server-side verification before JyotiAI grants the corresponding
              entitlement. JyotiAI does not claim that beginning checkout alone
              grants access.
            </p>
          ),
        },
        {
          title: 'Data transmission and infrastructure',
          content: (
            <p>
              Production web traffic is expected to use HTTPS transport
              provided by the deployed web infrastructure. JyotiAI also relies
              on established third-party cloud services for portions of its
              infrastructure. We do not claim a specific at-rest encryption
              algorithm, security certification or audit status unless it has
              been separately verified.
            </p>
          ),
        },
        {
          title: 'No absolute-security promise',
          content: (
            <p>
              No application, network or storage system can guarantee complete
              security. Security practices evolve as the product, providers and
              threat landscape change.
            </p>
          ),
        },
        {
          title: 'Reporting a security concern',
          content: (
            <p>
              If you believe you have identified a security issue affecting
              JyotiAI, please use the security contact published on our Contact
              page. Do not exploit, publicly disclose or access other
              users&apos; information while investigating a suspected issue.
            </p>
          ),
        },
      ]}
    />
  )
}
