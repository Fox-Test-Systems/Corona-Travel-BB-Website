import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Cyclones U9 Travel Baseball",
  description: "Get in touch with the Cyclones U9 travel baseball team.",
};

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center mb-12">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-no-repeat bg-center bg-contain pointer-events-none opacity-60"
            style={{ backgroundImage: "url('/images/cyclone-swirl.svg')" }}
          />
          <h1 className="relative text-4xl sm:text-5xl font-extrabold text-cyclone-yellow mb-4">
            GET IN TOUCH
          </h1>
          <p className="relative text-gray-400 text-lg">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-bold text-cyclone-green mb-6">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-bold text-cyclone-green mb-6">
              Other Ways to Reach Us
            </h2>

            <div className="space-y-6">
              <div className="bg-surface rounded-xl border border-cyclone-green/10 p-6">
                <h3 className="font-semibold text-white mb-2">📧 Email</h3>
                <a
                  href="mailto:info@cyclones-baseball.com"
                  className="text-cyclone-green hover:underline"
                >
                  info@cyclones-baseball.com
                </a>
              </div>

              <div className="bg-surface rounded-xl border border-cyclone-green/10 p-6">
                <h3 className="font-semibold text-white mb-2">📱 Phone</h3>
                <a
                  href="tel:+15551234567"
                  className="text-cyclone-green hover:underline"
                >
                  (555) 123-4567
                </a>
              </div>

              <div className="bg-surface rounded-xl border border-cyclone-green/10 p-6">
                <h3 className="font-semibold text-white mb-2">📍 Home Field</h3>
                <p className="text-gray-400">
                  Riverside Park, Field 3
                  <br />
                  123 Baseball Lane
                  <br />
                  Your City, ST 12345
                </p>
              </div>

              <div className="bg-surface rounded-xl border border-cyclone-green/10 p-6">
                <h3 className="font-semibold text-white mb-2">
                  🌐 Social Media
                </h3>
                <div className="flex gap-4 mt-2">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-cyclone-green transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-cyclone-green transition-colors"
                  >
                    Instagram
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-cyclone-green transition-colors"
                  >
                    Twitter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
