import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import Seo from '../components/seo/Seo';
import { brand } from '../config/brand';

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'When you create an account, we collect your name and email address. When you place an order, we store the products you purchased, the price at the time of purchase, and the order status.',
      'We do not store payment card details on our servers. Payment processing is handled by third-party providers.',
    ],
  },
  {
    title: 'How We Use Your Information',
    body: [
      'Your information is used to fulfil orders, provide customer support, prevent fraud, and improve our services.',
      'We send transactional emails related to your account and orders. We do not send marketing emails without your consent.',
    ],
  },
  {
    title: 'Data Storage and Security',
    body: [
      'Your data is stored on Supabase infrastructure with encryption at rest and in transit. Access is restricted by row-level security policies so that you can only read and modify your own records.',
      'Passwords are never stored in plain text. Authentication is handled by Supabase Auth using industry-standard hashing.',
    ],
  },
  {
    title: 'Sharing Your Information',
    body: [
      'We do not sell your personal information. We share data only with service providers necessary to operate the store (hosting, database, payment processing) and only to the extent required.',
    ],
  },
  {
    title: 'Your Rights',
    body: [
      'You can access and update your account information at any time from your profile page. You can request deletion of your account and associated data by contacting us.',
      `To exercise any of these rights, contact us at ${brand.contact.email}.`,
    ],
  },
  {
    title: 'Cookies',
    body: [
      'We use essential cookies to keep you signed in and to maintain your cart. We do not use advertising or tracking cookies.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'We may update this policy from time to time. Material changes will be communicated via the email associated with your account.',
    ],
  },
];

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description={`How ${brand.name} collects, uses and protects your information.`}
        url="/privacy-policy"
      />

      <Container size="narrow" className="py-16">
        <SectionHeading
          eyebrow="Legal"
          title="Privacy Policy"
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
              Questions about this policy? Email{' '}
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