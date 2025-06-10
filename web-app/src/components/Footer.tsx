
import { Mail, MapPin } from 'lucide-react';
import AppleLogo from "../assets/apple-black-logo-svgrepo-com.svg"
import { frontendURL } from '../common/ipUrl';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <img src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/logo-circle.png" alt="Logo" className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-2xl font-bold text-white">
                Coach Academ
              </span>
            </div>
            <p className="mb-6 text-gray-400 leading-relaxed">
             Learn and grow with Coach Academ.
            </p>
            {/* Social Media Links */}


            {/* <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div> */}
          </div>

              {/* Course Categories */}
          {/* <div>
            <h3 className="text-lg font-semibold text-white mb-6">Categories</h3>
            <ul className="space-y-3">
              {['Design', 'Development', 'Marketing', 'Business', 'Finance', 'Personal Growth'].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors hover:underline"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'Courses','FAQ'].map((item) => (
                <li key={item}>
                  <a 
                    href={`${frontendURL}/#${item.toLowerCase()}`} 
                    className="text-gray-400 hover:text-white transition-colors hover:underline"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
      
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                <span>support@coachacadem.ae</span>
              </li>
              {/* <li className="flex items-start">
                <Phone className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                <span>+1 (555) 123-4567</span>
              </li> */}
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                <span>Unit 201, Level 1, Zone South - Avenue G, DIFC

Dubai</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">Download Our App</h4>
              <div className="flex space-x-3">
                <a href="https://apps.apple.com/in/app/coach-academ/id6745173635" className="bg-gray-800 hover:bg-gray-700 p-2 rounded transition-colors">
                <img src={AppleLogo} alt="Apple Logo" className="w-6 h-6" />
                </a>
                {/* <a href="#" className="bg-gray-800 hover:bg-gray-700 p-2 rounded transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M3.60156 3.60156V20.3984H20.3984V3.60156H3.60156ZM15.9984 11.9984L12.9984 9.59844V14.3984L15.9984 11.9984Z" fill="white"/>
                  </svg>
                </a> */}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Coach Academ. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/Privacy+Policy+for+CoachAcadem1.pdf" className="text-gray-500 hover:text-gray-300 text-sm">Privacy Policy</a>
            <a href="https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/COACHACADEM_TOU_(EULA).pdf" className="text-gray-500 hover:text-gray-300 text-sm">EULA </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;