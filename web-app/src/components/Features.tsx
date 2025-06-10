
import { BookOpen, MessageSquare, Users, Video } from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="h-7 w-7 text-indigo-600" />,
    title: "Interactive Courses",
    description: "Engage with rich multimedia content, interactive quizzes, and hands-on exercises designed for maximum knowledge retention."
  },
  {
    icon: <Video className="h-7 w-7 text-indigo-600" />,
    title: "Live Zoom Sessions",
    description: "Join expert instructors for live classes, Q&A sessions, and collaborative learning opportunities."
  },
  {
    icon: <Users className="h-7 w-7 text-indigo-600" />,
    title: "Community Learning",
    description: "Connect with peers, form study groups, and participate in discussions to enhance your learning experience."
  },
  // {
  //   icon: <Monitor className="h-7 w-7 text-indigo-600" />,
  //   title: "Multi-device Access",
  //   description: "Seamlessly transition between mobile app and web platform, continuing your learning journey wherever you go."
  // },
  // {
  //   icon: <Calendar className="h-7 w-7 text-indigo-600" />,
  //   title: "Personalized Schedule",
  //   description: "Create your own learning routine with customizable schedules and reminders tailored to your availability."
  // },
  // {
  //   icon: <Award className="h-7 w-7 text-indigo-600" />,
  //   title: "Certificates",
  //   description: "Earn recognized certificates upon course completion to showcase your new skills and knowledge."
  // },
  // {
  //   icon: <BarChart className="h-7 w-7 text-indigo-600" />,
  //   title: "Progress Tracking",
  //   description: "Monitor your learning progress with detailed analytics and personalized insights to optimize your studies."
  // },
  {
    icon: <MessageSquare className="h-7 w-7 text-indigo-600" />,
    title: "Community-Driven Fun",
    description: "Think something’s missing? Contact us at support@coachacadem.ae and lets make it happen."
  }
];

const Features = () => {
  return (
    <section id="features\" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for 
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent pl-2"> 
               Modern Learning
            </span>
          </h2>
          {/* <p className="text-xl text-gray-600">
            Our comprehensive learning platform combines cutting-edge technology with effective pedagogy.
          </p> */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="bg-indigo-50 rounded-lg w-14 h-14 flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;