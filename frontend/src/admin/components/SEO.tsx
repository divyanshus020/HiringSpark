import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
}

const SEO = ({ 
  title = 'HireSpark - HR Dashboard for Smart Hiring',
  description = 'Post jobs across multiple platforms with HireSpark. Reach candidates on LinkedIn, Naukri, and more with one simple dashboard.'
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>
  );
};

export default SEO;
