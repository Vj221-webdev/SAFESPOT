import React, { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "How do I view my reports?",
    answer:
      "Go to the 'View Reports' page from the dashboard. Use filters or search to quickly find specific reports.",
  },
  {
    id: 2,
    question: "How can I manage report priorities?",
    answer:
      "Click on 'Manage Reports'. You can update priority levels: Normal, High, Urgent. High-priority reports are highlighted for easy tracking.",
  },
  {
    id: 3,
    question: "Can I filter reports by status?",
    answer:
      "Yes! You can filter reports by Pending, Approved, or Rejected using the status filter at the top of the View Reports page.",
  },
  {
    id: 4,
    question: "How do I contact support?",
    answer:
      "You can contact support by emailing support@myplatform.com or using the live chat feature available on the dashboard.",
  },
];

export default function HelpSupport() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="w-full p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Help & Support</h2>
      <p className="text-gray-600 mb-8">
        Find answers to common questions, tips on using the platform, or reach out to our support team.
      </p>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer transition hover:shadow-lg"
            onClick={() => toggleFAQ(faq.id)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">{faq.question}</h3>
              <span className="text-purple-600 font-bold text-xl">
                {expandedFAQ === faq.id ? "−" : "+"}
              </span>
            </div>
            {expandedFAQ === faq.id && (
              <p className="mt-4 text-gray-600">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      {/* Contact Info Section */}
      <div className="max-w-4xl mx-auto mt-12 bg-gray-50 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Support</h3>
        <p className="text-gray-600 mb-2">
          Email: <span className="text-purple-600 font-medium">support@myplatform.com</span>
        </p>
        <p className="text-gray-600">
          Live Chat: <span className="text-purple-600 font-medium">Available 9am - 6pm (Mon-Fri)</span>
        </p>
        <button className="mt-6 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">
          Open Live Chat
        </button>
      </div>
    </div>
  );
}
