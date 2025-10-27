import React, { useState } from "react";

const infoCardsTop = [
  {
    id: 1,
    title: "Dashboard Overview",
    description:
      "Access all your reports and track their statuses easily. The dashboard presents critical information at a glance with clear categorization.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Report Categories",
    description:
      "Reports are divided into Pending, Approved, and Rejected. Click any report to view details, priority, and updates for effective monitoring.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Benefits of Using the Platform",
    description:
      "Stay organized, prioritize urgent tasks, and gain insights from reports analytics. Save time and increase productivity efficiently.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: "from-green-500 to-emerald-500",
  },
];

const infoCardsBottom = [
  {
    id: 4,
    title: "Tips for Efficient Use",
    description:
      "Use filters and search effectively to find reports quickly. Check timestamps and statuses regularly to stay updated.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: 5,
    title: "Engagement & Interaction",
    description:
      "Hover on cards for summaries, click for full details. Prioritize high-impact reports to make timely decisions.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: 6,
    title: "Security & Privacy",
    description:
      "All reports are securely stored and access is controlled. Your information is safe while using the platform.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: "from-red-500 to-pink-500",
  },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl mb-6 group hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Discover the Platform
          </h2>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Learn how to navigate your dashboard, understand reports, and maximize the benefits of using this platform.
          </p>
        </div>

        {/* Top Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {infoCardsTop.map((card, index) => (
            <div
              key={card.id}
              onClick={() => openModal(card)}
              className="group cursor-pointer bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10`}>
                {card.icon}
              </div>

              {/* Content */}
              <h3 className="font-black text-gray-900 text-2xl mb-3 relative z-10">{card.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6 relative z-10 line-clamp-4">{card.description}</p>
              
              {/* Button */}
              <button className={`px-6 py-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 relative z-10 flex items-center gap-2`}>
                Learn More
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {infoCardsBottom.map((card, index) => (
            <div
              key={card.id}
              onClick={() => openModal(card)}
              className="group cursor-pointer bg-white rounded-3xl shadow-lg hover:shadow-2xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100 relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10`}>
                {card.icon}
              </div>

              {/* Content */}
              <h3 className="font-bold text-gray-900 text-xl mb-3 relative z-10">{card.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-5 relative z-10 line-clamp-4">{card.description}</p>
              
              {/* Button */}
              <button className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 relative z-10 flex items-center gap-2">
                Learn More
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 text-white relative overflow-hidden animate-fade-in">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Engage with these cards to understand reports, prioritize tasks, and make the most out of your workflow.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-black shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
                Start Exploring
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-black hover:bg-white/20 transition-all">
                View Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-4 gap-6 animate-fade-in">
          {[
            { icon: "🚀", title: "Fast", desc: "Lightning speed" },
            { icon: "🔒", title: "Secure", desc: "Protected data" },
            { icon: "📊", title: "Analytics", desc: "Deep insights" },
            { icon: "💡", title: "Smart", desc: "AI-powered" },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="font-black text-gray-900 mb-1">{feature.title}</h4>
              <p className="text-gray-600 text-sm font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative animate-scale-in overflow-hidden">
              {/* Modal Header with Gradient */}
              <div className={`bg-gradient-to-r ${selectedCard.gradient} p-8 relative`}>
                <button
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white font-bold transition-all transform hover:scale-110 hover:rotate-90"
                  onClick={closeModal}
                >
                  ✕
                </button>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white mb-4">
                  {selectedCard.icon}
                </div>
                
                <h3 className="text-3xl font-black text-white mb-2">{selectedCard.title}</h3>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">{selectedCard.description}</p>
                
                {/* Additional Info */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-medium">Easy to use and intuitive interface</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-medium">Real-time updates and notifications</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-medium">Secure and reliable performance</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 rounded-xl border-2 border-gray-300 font-bold hover:bg-gray-50 transition-all"
                  >
                    Close
                  </button>
                  <button className={`px-6 py-3 rounded-xl bg-gradient-to-r ${selectedCard.gradient} text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.6s both;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}