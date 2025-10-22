// Importing React library and the useState hook for managing state in this component
import React, { useState } from "react";

// Defining a constant array 'faqs' that contains a list of frequently asked questions with id, question, and answer
const faqs = [
  {
    id: 1, // Unique ID for each FAQ
    question: "How do I view my reports?", // The FAQ question
    answer:
      "Go to the 'View Reports' page from the dashboard. Use filters or search to quickly find specific reports.", // The FAQ answer
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

// Defining the HelpSupport component as the default export
export default function HelpSupport() {
  // Declaring a state variable 'expandedFAQ' to keep track of which FAQ is currently expanded
  // Initially, no FAQ is expanded (null)
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Function to toggle the expansion of an FAQ when clicked
  // If the clicked FAQ is already expanded, set it to null (collapse it)
  // Otherwise, set it to the ID of the clicked FAQ (expand it)
  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  // Returning the JSX structure for rendering the Help & Support page
  return (
    <div className="w-full p-6 bg-gray-100 min-h-screen"> {/* Full-width container with padding, gray background, and minimum full screen height */}
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Help & Support</h2> {/* Page heading */}
      <p className="text-gray-600 mb-8">
        {/* Introductory text explaining the section */}
        Find answers to common questions, tips on using the platform, or reach out to our support team.
      </p>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-4"> {/* Container for FAQ list with spacing between items */}
        {faqs.map((faq) => ( // Looping through each FAQ object in the faqs array
          <div
            key={faq.id} // Unique key for each rendered FAQ item
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer transition hover:shadow-lg" // Styling for each FAQ box
            onClick={() => toggleFAQ(faq.id)} // Clicking toggles expansion for the selected FAQ
          >
            <div className="flex justify-between items-center"> {/* Flex container for question and icon */}
              <h3 className="font-semibold text-gray-800">{faq.question}</h3> {/* Displaying the FAQ question */}
              <span className="text-purple-600 font-bold text-xl">
                {/* Display minus sign if expanded, plus sign if collapsed */}
                {expandedFAQ === faq.id ? "−" : "+"}
              </span>
            </div>
            {expandedFAQ === faq.id && ( // If this FAQ is expanded, render its answer
              <p className="mt-4 text-gray-600">{faq.answer}</p> // Displaying the answer text
            )}
          </div>
        ))}
      </div>

      {/* Contact Info Section */}
      <div className="max-w-4xl mx-auto mt-12 bg-gray-50 p-6 rounded-xl shadow-md"> {/* Container for contact information */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Support</h3> {/* Contact section title */}
        <p className="text-gray-600 mb-2">
          {/* Support email information */}
          Email: <span className="text-purple-600 font-medium">support@myplatform.com</span>
        </p>
        <p className="text-gray-600">
          {/* Support live chat availability information */}
          Live Chat: <span className="text-purple-600 font-medium">Available 9am - 6pm (Mon-Fri)</span>
        </p>
        <button className="mt-6 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">
          {/* Button to open live chat support */}
          Open Live Chat
        </button>
      </div>
    </div>
  );
}
