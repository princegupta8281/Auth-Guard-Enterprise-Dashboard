import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, BookOpen, MessageCircle, FileText } from 'lucide-react';

const faqs = [
  { question: "How do I reset my password?", answer: "You can reset your password by going to the Profile Settings page and selecting 'Change Password'. Alternatively, use the 'Forgot Password' link on the login screen." },
  { question: "What is Two-Factor Authentication (2FA)?", answer: "2FA adds an extra layer of security to your account. Instead of only entering a password, you will also enter a code sent to your authenticator app." },
  { question: "How can I book an appointment?", answer: "Navigate to the Appointments tab and click 'Book New Meeting'. Fill in the required details and click submit. You can view the status of your appointment in the list below." },
  { question: "Why is my support ticket still pending?", answer: "Our support team typically responds within 24-48 hours. Critical tickets are prioritized. You can track all updates in the Support Desk section." },
];

const HelpCenter = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-slate-900 dark:text-slate-200 transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 bg-gradient-to-r from-primary-600 to-accent-dark p-10 sm:p-16 text-center shadow-xl shadow-primary-500/20 border border-white/10">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none"></div>
        <div className="relative z-10">
          <HelpCircle className="mx-auto h-16 w-16 text-white mb-6 drop-shadow-md" />
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">How can we help you?</h1>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto font-medium">Search our knowledge base or browse frequently asked questions below.</p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 dark:bg-charcoal-900/95 border-none outline-none focus:ring-4 focus:ring-white/30 text-slate-900 dark:text-white shadow-2xl transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {[
          { icon: <BookOpen className="h-8 w-8 text-primary-500" />, title: "Getting Started", desc: "Learn the basics of setting up your account." },
          { icon: <FileText className="h-8 w-8 text-emerald-500" />, title: "Account & Security", desc: "Manage 2FA, passwords, and data privacy." },
          { icon: <MessageCircle className="h-8 w-8 text-blue-500" />, title: "Contact Support", desc: "Reach out to our team for personalized help." }
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer text-center group">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-50 dark:bg-charcoal-800 border border-slate-100 dark:border-white/5 mb-6 group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
            <p className="text-slate-800 dark:text-charcoal-300 font-medium">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#15151a]  border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-xl max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-charcoal-800/50 overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-charcoal-700/30 transition-colors"
              >
                {faq.question}
                {openFaq === index ? <ChevronUp className="h-5 w-5 text-primary-500" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 pt-2 text-slate-800 dark:text-charcoal-300 leading-relaxed border-t border-slate-100 dark:border-white/5">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

