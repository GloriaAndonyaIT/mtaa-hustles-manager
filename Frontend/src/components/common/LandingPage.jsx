import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold italic text-teal-600">
                Mtaa Hustle Manager
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#home" className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Home</a>
                <a href="#features" className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Features</a>
                <a href="#how-it-works" className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">How It Works</a>
                <a href="#about" className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">About Us</a>
                <a href="#contact" className="text-gray-900 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Contacts</a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center">
                <Link 
                  to="/login" 
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Login
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-900 hover:text-teal-600 p-2 rounded-md transition-colors duration-200">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <a href="#home" className="text-gray-900 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Home</a>
              <a href="#features" className="text-gray-900 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="text-gray-900 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-200">How It Works</a>
              <a href="#about" className="text-gray-900 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-200">About Us</a>
              <a href="#contact" className="text-gray-900 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Contacts</a>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex justify-center px-3">
                  <Link 
                    to="/login"
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full text-base font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg w-full max-w-xs text-center"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Background Image */}
      <section 
        id="home" 
        className="relative h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://pawapos.com/wp-content/uploads/2024/06/open-small-business-in-Kenya-1024x614.jpg')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-start pl-8 md:pl-16 lg:pl-24">
          <div className="text-left text-white max-w-lg">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
              Grow Your Hustle.<br />
              Manage Your Money.<br />
              <span className="text-teal-400">Anywhere.</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 leading-relaxed drop-shadow-lg opacity-90">
              Mtaa Hustle Manager helps Kenya's informal entrepreneurs take control of their income, expenses, and debts — all from your phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/login" 
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
              >
                Get Started
              </Link>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white border-2 border-white px-8 py-3 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Learn More
              </button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 opacity-75"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-700">Why Choose Mtaa Hustle Manager?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-teal-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Financial Tracking</h3>
              <p className="text-gray-700">Easily record income and expenses for each of your hustles — see what's making you money.</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Debt Management</h3>
              <p className="text-gray-700">Track debts you owe or are owed. Get reminders before things slip.</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Business Insights</h3>
              <p className="text-gray-700">Understand your hustle with clear graphs and reports — no math degree needed.</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Offline Mode</h3>
              <p className="text-gray-700">Manage your finances even without bundles or Wi-Fi.</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Data Security</h3>
              <p className="text-gray-700">Your financial info stays safe and private — always.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-teal-700">How It Works</h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Download the App</h3>
                <p className="text-gray-700">Download the app on your smartphone from Google Play Store or Apple App Store.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Create Your Account</h3>
                <p className="text-gray-700">Create your free account in less than 2 minutes with just your phone number.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Add Your Hustles</h3>
                <p className="text-gray-700">Add your hustles: mama mboga, boda boda, salon, mitumba — whatever you do to earn money.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Track Daily</h3>
                <p className="text-gray-700">Record income, expenses, or debts daily or weekly. Takes just a few seconds.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Get Insights</h3>
                <p className="text-gray-700">View simple reports and graphs to see how you're doing and grow your business.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-teal-700">Our Story</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p className="text-xl font-medium text-teal-700">
                "Kila mtu ana hustle yake" — Everyone has their hustle.
              </p>
              <p>
                We started this journey after meeting Mama Wanjiku, a mitumba seller in Gikomba who kept her business records on scraps of paper. 
                When it rained, months of hard work literally washed away.
              </p>
              <p>
                That's when we realized: Kenya's 14 million informal workers — the mama mbogas, boda boda riders, salon owners, and street vendors — 
                needed a tool built specifically for them, not another complicated banking app.
              </p>
            </div>
            <div className="bg-teal-50 p-8 rounded-2xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600 mb-2">14M+</div>
                <p className="text-gray-700 mb-4">Informal workers in Kenya</p>
                <div className="text-4xl font-bold text-teal-600 mb-2">78%</div>
                <p className="text-gray-700 mb-4">Of Kenya's workforce</p>
                <div className="text-4xl font-bold text-teal-600 mb-2">1</div>
                <p className="text-gray-700">Simple app to manage it all</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-8 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-xl leading-relaxed">
              To put financial power in the hands of every hustler — because when informal businesses thrive, Kenya thrives.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl mb-4">🇰🇪</div>
              <h4 className="font-semibold text-lg mb-2 text-gray-800">Built for Kenya</h4>
              <p className="text-gray-600">Designed with Kenyan entrepreneurs in mind, using local language and understanding our unique challenges.</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-4">📱</div>
              <h4 className="font-semibold text-lg mb-2 text-gray-800">Mobile First</h4>
              <p className="text-gray-600">Works on any smartphone, even when bundles are low. Your business shouldn't stop when WiFi does.</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-4">💚</div>
              <h4 className="font-semibold text-lg mb-2 text-gray-800">Community Driven</h4>
              <p className="text-gray-600">Built by hustlers, for hustlers. Every feature comes from real feedback from people like you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-teal-700">Tuongee — Let's Talk!</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Support */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="font-bold text-2xl mb-6 text-gray-800 flex items-center">
                <span className="text-3xl mr-4">💬</span>
                Get Support
              </h3>
              <div className="space-y-6 text-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">📱</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">WhatsApp Support</p>
                    <p className="text-teal-600 font-medium">+254 700 HUSTLE</p>
                    <p className="text-sm text-gray-500">(+254 700 487853)</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Email Support</p>
                    <p className="text-teal-600 font-medium">support@mtaahustle.co.ke</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">⏰</span>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Support Hours</p>
                    <p className="text-gray-600">Monday - Saturday</p>
                    <p className="text-gray-600">8:00 AM - 8:00 PM EAT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="font-bold text-2xl mb-6 text-gray-800">Quick Questions?</h3>
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                  <p className="font-semibold text-gray-800 mb-2">💰 "Is it free?"</p>
                  <p className="text-sm text-gray-600">Yes! Basic features are completely free. Premium features start at just KSh 50/month.</p>
                </div>
                
                <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                  <p className="font-semibold text-gray-800 mb-2">📶 "Works without internet?"</p>
                  <p className="text-sm text-gray-600">Absolutely! Record transactions offline, sync when you have bundles.</p>
                </div>
                
                <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                  <p className="font-semibold text-gray-800 mb-2">🔒 "Is my data safe?"</p>
                  <p className="text-sm text-gray-600">100%. Bank-level security, and your data stays in Kenya.</p>
                </div>
                
                <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                  <p className="font-semibold text-gray-800 mb-2">📲 "Which phones work?"</p>
                  <p className="text-sm text-gray-600">Any Android or iPhone. Works great on older phones too!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="text-2xl font-bold italic text-teal-400 mb-4">
                Mtaa Hustle Manager
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Empowering Kenya's informal entrepreneurs with simple, powerful financial tools. 
                Built by hustlers, for hustlers.
              </p>
            
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-300 hover:text-teal-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-300 hover:text-teal-400 transition-colors">How It Works</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-teal-400 transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <div className="space-y-2 text-gray-300">
                <p>📱 +254 700 487853</p>
                <p>📧 support@mtaahustle.co.ke</p>
                <p>🇰🇪 Nairobi, Kenya</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 Mtaa Hustle Manager. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;