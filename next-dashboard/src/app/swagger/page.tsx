"use client";

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const SwaggerPage = () => {
  return <SwaggerUI url="/api/openapi.json" />;
}

export default SwaggerPage;