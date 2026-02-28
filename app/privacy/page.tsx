import Link from 'next/link';

export default function Privacy() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block"
        >
          &larr; Back
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              How your document is handled
            </h2>
            <p className="text-gray-600">
              Your tax return PDF is analyzed once and immediately discarded. We do not
              store, save, or retain your document in any way.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Third-party processing
            </h2>
            <p className="text-gray-600">
              To analyze your document, we send it to Anthropic&apos;s API (Claude). Anthropic
              processes the document to determine whether the American Opportunity Tax
              Credit was claimed. Anthropic&apos;s data handling is governed by their{' '}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                privacy policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No data persistence
            </h2>
            <p className="text-gray-600">
              This application has no database, no user accounts, and no logging of
              document contents. Once your analysis is complete, there is no record of
              your document on our servers.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
