import { Helmet } from 'react-helmet-async';

export default function DefaultSEO() {
  return (
    <Helmet>
      {/* Default meta tags for CoachAcadem */}
      <title>CoachAcadem: Online Tutoring Platform</title>
      <meta name="description" content="Coach Academ is an online tutoring platform that helps students find and connect the best online tutors in the UAE. Learn from the comfort of your home." />
      <meta name="robots" content="index, follow" />
      
      {/* Default Open Graph tags */}
      <meta property="og:site_name" content="CoachAcadem" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="CoachAcadem: Online Tutoring Platform" />
      <meta property="og:description" content="Coach Academ is an online tutoring platform that helps students find and connect the best online tutors in the UAE. Learn from the comfort of your home." />
      <meta property="og:image" content="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png" />
      <meta property="og:url" content="https://www.coachacadem.ae" />
      
      {/* Default Twitter tags */}
      <meta name="twitter:creator" content="CoachAcadem" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="CoachAcadem: Online Tutoring Platform" />
      <meta name="twitter:description" content="Coach Academ is an online tutoring platform that helps students find and connect the best online tutors in the UAE. Learn from the comfort of your home." />
      <meta name="twitter:image" content="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png" />
      
      {/* Default structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "CoachAcadem",
          "url": "https://www.coachacadem.ae",
          "logo": "https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/iphone-community-portrait.png",
          "description": "Coach Academ is an online tutoring platform that helps students find and connect the best online tutors in the UAE. Learn from the comfort of your home.",
          "sameAs": [
            "https://www.coachacadem.ae"
          ]
        })}
      </script>
    </Helmet>
  );
} 