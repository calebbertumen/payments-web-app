export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <p className="text-gray-600 mb-8">
          <strong>Effective Date:</strong> January 12, 2026
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to Payments ("we," "us," or "our").
          </p>
          <p className="text-gray-700 leading-relaxed">
            This Privacy Policy explains how we collect, use, disclose, and protect your information when you access or use our web and mobile applications, websites, and related services (collectively, the "Services").
          </p>
          <p className="text-gray-700 leading-relaxed">
            By using the Services, you consent to the practices described in this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3 mt-6">A. Information You Provide Directly</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            When you create or use an account, we may collect:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Personal mailing or residential address</li>
            <li>Account profile information</li>
            <li>Communications with us (support requests, feedback)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">B. Financial Information and Payment Methods</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We allow users to connect bank accounts and credit/debit cards through secure third-party payment and financial data providers.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do <strong>NOT</strong> collect or store:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Bank login credentials</li>
            <li>Full bank account numbers</li>
            <li>Full credit or debit card numbers</li>
            <li>Card CVV codes or expiration dates</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            We <strong>MAY</strong> receive and store limited identifiers, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Last four digits of bank accounts</li>
            <li>Last four digits of credit or debit cards</li>
            <li>Account type (checking, savings, credit, debit)</li>
            <li>Card brand or network (e.g., Visa, Mastercard)</li>
            <li>Payment method nickname or label chosen by the user</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            All sensitive payment credentials are handled and tokenized by third-party providers in compliance with applicable security standards (such as PCI-DSS).
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">C. Transaction and Payment Activity</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            When users send or receive money through the Services, we may collect:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Transaction amounts</li>
            <li>Transaction dates and timestamps</li>
            <li>Sender and recipient user identifiers</li>
            <li>Selected payment method (identified only by last four digits)</li>
            <li>Transaction status (pending, completed, failed)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Funds are transferred directly from a user's selected payment method, and we do not hold or store user funds.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">D. Automatically Collected Information</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may automatically collect:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Device and browser information</li>
            <li>IP address and approximate location</li>
            <li>App usage data (features used, pages visited, session duration)</li>
            <li>Cookies or similar technologies for authentication, analytics, and security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use your information to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Create and manage user accounts</li>
            <li>Verify identity and prevent fraud</li>
            <li>Enable payments between users</li>
            <li>Display transaction history and summaries</li>
            <li>Provide customer support</li>
            <li>Improve functionality and reliability</li>
            <li>Comply with legal and regulatory obligations</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            We do not sell your personal or financial information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Sharing of Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may share information only with:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Payment processors and financial data providers to complete authorized transactions</li>
            <li>Service providers (hosting, analytics, authentication, monitoring)</li>
            <li>Legal authorities when required by law or to protect our rights</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            All third parties are required to safeguard your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use reasonable administrative, technical, and physical safeguards, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Secure authentication systems</li>
            <li>Tokenized handling of payment information</li>
            <li>Restricted access to sensitive data</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            No system is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We retain personal and transaction data only as long as necessary to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Operate the Services</li>
            <li>Meet legal and financial recordkeeping requirements</li>
            <li>Resolve disputes and enforce agreements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Account Deletion</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Users may delete their account at any time through the app or by contacting us.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Upon deletion:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Profile information will be removed or anonymized</li>
            <li>Linked payment methods will be disconnected</li>
            <li>Certain transaction records may be retained as required by law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Your Rights and Choices</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent where applicable</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Requests can be made by contacting <a href="mailto:calebbertumen99@gmail.com" className="text-[#9D00FF] hover:underline">calebbertumen99@gmail.com</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Payments is not intended for individuals under the age of 18.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We do not knowingly collect personal information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy periodically.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Any changes will be effective upon posting with an updated effective date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have questions about this Privacy Policy, contact:
          </p>
          <p className="text-gray-700 leading-relaxed">
            <a href="mailto:calebbertumen99@gmail.com" className="text-[#9D00FF] hover:underline">calebbertumen99@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  )
}

