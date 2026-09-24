import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import Seo from '../components/seo/Seo';
import { brand } from '../config/brand';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: [
      `By accessing or purchasing from ${brand.name}, you agree to these terms. If you do not agree, do not use the site.`,
    ],
  },
  {
    title: 'Accounts',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
      'You must provide accurate information when creating an account and keep it up to date.',
    ],
  },
  {
    title: 'Orders and Pricing',
    body: [
      'All prices are displayed in PKR and are subject to change without notice. The price charged for an order is the price displayed at the time the order is placed and is recorded with the order.',
      'We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud, pricing errors, or stock unavailability. If an order is cancelled after payment, a full refund will be issued.',
    ],
  },
  {
    title: 'Shipping and Delivery',
    body: [
      'Delivery timelines are estimates and not guarantees. Delays caused by carriers, customs, or events outside our control are not our responsibility.',
      'Risk of loss and title for items pass to you upon delivery to the carrier.',
    ],
  },
  {
    title: 'Returns and Refunds',
    body: [
      'Returns are accepted within 14 days of delivery for unused items in original packaging. Return shipping costs are the responsibility of the customer unless the item was defective or incorrect.',
      'Refunds are issued to the original payment method within 7 business days of receiving the returned item.',
    ],
  },
  {
    title: 'Intellectual Property',
    body: [
      `All content on this site, including images, text, logos, and designs, is the property of ${brand.name} and may not be reproduced without written permission.`,
    ],
  },
  {
    title: 'Prohibited Conduct',
    body: [
      'You may not use the site to violate any law, infringe any third-party right, attempt to gain unauthorised access to any part of the site or its systems, or interfere with the operation of the site.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, our liability for any claim arising out of or relating to these terms or your use of the site is limited to the amount you paid for the product giving rise to the claim.',
    ],
  },
  {
    title: 'Governing Law',
    body: [
      'These terms are governed by the laws of Pakistan. Any dispute will be resolved in the courts of Karachi.',
    ],
  },
  {
    title: 'Changes to These Terms',
    body: [
      'We may update these terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the updated terms.',
    ],
  },
];

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Service"
        description={`Terms and conditions for using ${brand.name}.`}
        url="/terms"
      />

      <Container size="narrow" className="py-16">
        <SectionHeading
          eyebrow="Legal"
          title="Terms of Service"
          description={`Last updated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`}
        />

        <div className="mt-12 space-y-12">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-sm uppercase tracking-nav text-ink-white mb-4">{s.title}</h2>
              <div className="space-y-4">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm text-ink-dim leading-relaxed">{p}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="border-t border-ink-line pt-8">
            <h2 className="text-sm uppercase tracking-nav text-ink-white mb-4">Contact</h2>
            <p className="text-sm text-ink-dim leading-relaxed">
              Questions about these terms? Email{' '}
              <a href={`mailto:${brand.contact.email}`} className="text-ink-white underline underline-offset-4">
                {brand.contact.email}
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </>
  );
}