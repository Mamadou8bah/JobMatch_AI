import { useEffect } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo.jsx";

const LAST_UPDATED = "July 10, 2026";
const CONTACT_EMAIL = "support@jobmatchgambia.com";
const SITE_URL = "https://jobmatchgambia.vercel.app";

function Section({ title, children }) {
  return (
    <section className="scroll-mt-24">
      <h2 className="text-xl font-bold text-brand-dark sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-600 sm:text-base">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy — JobMatch AI";
    return () => {
      document.title = "JobMatch AI — Smart Job Matching for The Gambia";
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-brand-dark antialiased">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <BrandLogo to="/" size="sm" />
          <Link
            to="/"
            className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-600"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Legal</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>

          <div className="mt-8 space-y-10">
            <Section title="1. Introduction">
              <p>
                JobMatch AI (&quot;JobMatch AI&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the
                JobMatch AI website at{" "}
                <a href={SITE_URL} className="font-medium text-emerald-700 hover:underline">
                  {SITE_URL}
                </a>{" "}
                and the JobMatch AI mobile application (together, the &quot;Service&quot;). This Privacy Policy
                explains how we collect, use, store, and share information when you use the Service.
              </p>
              <p>
                By creating an account or using the Service, you agree to the practices described in this
                policy. If you do not agree, please do not use the Service.
              </p>
            </Section>

            <Section title="2. Information we collect">
              <p>
                <strong className="text-brand-dark">Account information.</strong> When you register, we
                collect your name, email address, password (stored in hashed form), and account role (job
                seeker, employer, or training provider).
              </p>
              <p>
                <strong className="text-brand-dark">Profile information.</strong> Depending on your role,
                you may provide a profile photo, phone number, location, company details, skills, education,
                work experience, and other career-related information.
              </p>
              <p>
                <strong className="text-brand-dark">Resume and CV data.</strong> If you upload a resume or
                CV, we store the file and may extract skills, education, and experience to power job
                matching and career recommendations.
              </p>
              <p>
                <strong className="text-brand-dark">Job and application data.</strong> We collect
                information about jobs you post, save, or apply to, including application status and related
                messages between users.
              </p>
              <p>
                <strong className="text-brand-dark">Messages and notifications.</strong> Content you send
                through in-app messaging and notification preferences are stored so the Service can deliver
                them to you and other users.
              </p>
              <p>
                <strong className="text-brand-dark">Payment information.</strong> If you purchase a Premium
                subscription, payment processing is handled by our payment partner. We receive transaction
                status and billing metadata, but we do not store full card or mobile-money credentials on
                our servers.
              </p>
              <p>
                <strong className="text-brand-dark">Technical data.</strong> We may collect device type,
                browser or app version, IP address, and usage logs needed to secure the Service, prevent
                abuse, and fix errors. Authentication tokens may be stored locally on your device so you
                can stay signed in.
              </p>
            </Section>

            <Section title="3. How we use your information">
              <p>We use the information we collect to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Create and manage your account</li>
                <li>Match job seekers with relevant jobs and employers with suitable candidates</li>
                <li>Parse resumes and generate AI-powered match scores and career guidance</li>
                <li>Process applications, messages, and notifications</li>
                <li>Provide training recommendations and skills-gap insights</li>
                <li>Process Premium subscriptions and manage entitlements</li>
                <li>Improve, secure, and troubleshoot the Service</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </Section>

            <Section title="4. AI and automated processing">
              <p>
                JobMatch AI uses automated systems, including artificial intelligence, to parse resumes,
                score candidate–job fit, and provide career coaching suggestions. These outputs are intended
                to support hiring and career decisions; employers and job seekers remain responsible for
                their own decisions.
              </p>
            </Section>

            <Section title="5. How we share information">
              <p>
                <strong className="text-brand-dark">Between users.</strong> When you apply to a job, message
                an employer, or interact on the platform, relevant profile and application information is
                shared with the other party as needed for the Service to function.
              </p>
              <p>
                <strong className="text-brand-dark">Service providers.</strong> We use trusted third parties
                to operate the Service, including:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-brand-dark">Cloudinary</strong> — profile image hosting and
                  delivery
                </li>
                <li>
                  <strong className="text-brand-dark">ModemPay</strong> — payment processing for Premium
                  subscriptions
                </li>
                <li>
                  <strong className="text-brand-dark">Hosting providers</strong> — application and database
                  hosting (for example, Render and Vercel)
                </li>
              </ul>
              <p>
                These providers process data only as needed to perform services on our behalf and are
                required to protect it appropriately.
              </p>
              <p>
                <strong className="text-brand-dark">Legal requirements.</strong> We may disclose information
                if required by law, court order, or to protect the rights, safety, and security of users and
                the Service.
              </p>
              <p>We do not sell your personal information.</p>
            </Section>

            <Section title="6. Data retention">
              <p>
                We retain your information for as long as your account is active or as needed to provide
                the Service. You may request account deletion by contacting us. Some data may be retained
                longer where required for legal, security, or billing record-keeping purposes.
              </p>
            </Section>

            <Section title="7. Data security">
              <p>
                We use reasonable technical and organizational measures to protect your information,
                including encrypted connections (HTTPS), hashed passwords, and access controls. No method
                of transmission or storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="8. Your choices and rights">
              <p>You can:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Update most profile information from your account settings</li>
                <li>Request access to or correction of your personal data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of non-essential communications where applicable</li>
              </ul>
              <p>
                To exercise these rights, contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-emerald-700 hover:underline">
                  {CONTACT_EMAIL}
                </a>
                . We will respond within a reasonable timeframe.
              </p>
            </Section>

            <Section title="9. Children">
              <p>
                The Service is not intended for users under 16 years of age. We do not knowingly collect
                personal information from children. If you believe a child has provided us data, please
                contact us so we can remove it.
              </p>
            </Section>

            <Section title="10. International transfers">
              <p>
                Your information may be processed on servers located outside The Gambia, including by our
                hosting and service providers. By using the Service, you consent to this processing subject
                to appropriate safeguards.
              </p>
            </Section>

            <Section title="11. Changes to this policy">
              <p>
                We may update this Privacy Policy from time to time. We will post the revised version on
                this page and update the &quot;Last updated&quot; date. Continued use of the Service after
                changes become effective means you accept the updated policy.
              </p>
            </Section>

            <Section title="12. Contact us">
              <p>
                If you have questions about this Privacy Policy or how we handle your data, contact us at:
              </p>
              <p>
                <strong className="text-brand-dark">JobMatch AI</strong>
                <br />
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-emerald-700 hover:underline">
                  {CONTACT_EMAIL}
                </a>
                <br />
                Website:{" "}
                <a href={SITE_URL} className="font-medium text-emerald-700 hover:underline">
                  {SITE_URL}
                </a>
              </p>
            </Section>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500 sm:px-6">
        <p>© 2026 JobMatch AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
