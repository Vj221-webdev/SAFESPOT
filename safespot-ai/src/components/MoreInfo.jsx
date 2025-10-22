import React, { useState } from "react";

// Top informative cards (key usage)
const infoCardsTop = [
  {
    id: 1,
    title: "Dashboard Overview",
    description:
      "Access all your reports and track their statuses easily. The dashboard presents critical information at a glance with clear categorization.",
  },
  {
    id: 2,
    title: "Report Categories",
    description:
      "Reports are divided into Pending, Approved, and Rejected. Click any report to view details, priority, and updates for effective monitoring.",
  },
  {
    id: 3,
    title: "Benefits of Using the Platform",
    description:
      "Stay organized, prioritize urgent tasks, and gain insights from reports analytics. Save time and increase productivity efficiently.",
  },
];

// Bottom informative cards (secondary details)
const infoCardsBottom = [
  {
    id: 4,
    title: "Tips for Efficient Use",
    description:
      "Use filters and search effectively to find reports quickly. Check timestamps and statuses regularly to stay updated.",
  },
  {
    id: 5,
    title: "Engagement & Interaction",
    description:
      "Hover on cards for summaries, click for full details. Prioritize high-impact reports to make timely decisions.",
  },
  {
    id: 6,
    title: "Security & Privacy",
    description:
      "All reports are securely stored and access is controlled. Your information is safe while using the platform.",
  },
];

// Variants for subtle differentiation of cards
const cardVariants = [
  "bg-white shadow-md border-l-4 border-purple-600 hover:shadow-lg",
  "bg-gray-50 shadow-sm border-l-4 border-gray-400 hover:shadow-md",
  "bg-white shadow-lg border-l-4 border-purple-400 hover:shadow-xl",
];

export default function MoreInfo() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (card) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setShowModal(false);
  };

  return (
    <div className="w-full p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Discover the Platform</h2>
      <p className="text-gray-600 mb-8">
        Learn how to navigate your dashboard, understand reports, and maximize the benefits of using this platform.
      </p>

      {/* Top Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {infoCardsTop.map((card, index) => (
          <div
            key={card.id}
            onClick={() => openModal(card)}
            className={`cursor-pointer p-6 rounded-xl transition ${cardVariants[index % cardVariants.length]}`}
          >
            <h3 className="font-bold text-gray-800 text-xl mb-2">{card.title}</h3>
            <p className="text-gray-600 line-clamp-4">{card.description}</p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition w-max">
              Learn More
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {infoCardsBottom.map((card, index) => (
          <div
            key={card.id}
            onClick={() => openModal(card)}
            className={`cursor-pointer p-6 rounded-xl transition ${cardVariants[(index + 1) % cardVariants.length]}`}
          >
            <h3 className="font-semibold text-gray-800 text-lg mb-2">{card.title}</h3>
            <p className="text-gray-600 line-clamp-4">{card.description}</p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-900 transition w-max">
              Learn More
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full md:w-2/3 lg:w-1/2 p-6 rounded-xl shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 font-bold"
              onClick={closeModal}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4 text-purple-600">{selectedCard.title}</h3>
            <p className="text-gray-700 mb-4">{selectedCard.description}</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-xl border font-semibold hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-12 text-center text-gray-600">
        <p>
          Engage with these cards to understand reports, prioritize tasks, and make the most out of your workflow.
        </p>
      </div>
    </div>
  );
}
