import * as React from 'react';
import Image from 'next/image';
import walmartLogo from '../../app/walmart-logo.png' // rename the uploaded file to this in your project

export const WalmartLogo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <Image
    src={walmartLogo}
    alt="Walmart Logo"
    {...props}
  />
);
