import React, { useState } from 'react';
import { buildDjangoStaticUrl } from '../api';

const Hero: React.FC = () => {
  const [heroImage] = useState(() => {
    const images = [
      '137970187_p0.jpg',
      '91067691_p0.jpg',
      '125633249_p0.jpg'
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const src = buildDjangoStaticUrl(`gallary/${randomImage}`);
    return `url('${src}')`;
  });

  return (
    <div className="headertop" style={{ '--bg-hero-image': heroImage } as React.CSSProperties}>
        <div className="center-image"></div>
        <div className="focusinfo">
            <h1 className="center-text sakura-title" data-text="Hi, Tifa!">Hi, Tifa!</h1>
            <div className="header-info">
                <p><i className="fa fa-quote-left"></i> 樱花飘落的速度，是每秒五厘米 <i className="fa fa-quote-right"></i></p>
            </div>
            <ul className="top-social">
                <li><a href="#" title="GitHub"><i className="fab fa-github"></i> GitHub</a></li>
                <li><a href="#" title="Bilibili"><i className="fab fa-bilibili"></i> Bilibili</a></li>
                <li><a href="#" title="Email"><i className="fa fa-envelope"></i> Email</a></li>
            </ul>
        </div>
        
        <div className="headertop-down">
            <span>
                <i className="fa fa-chevron-down" aria-hidden="true"></i>
            </span>
        </div>
        
        <div className="wave-container">
            <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" />
            <use xlinkHref="#gentle-wave" x="48" y="3" />
            <use xlinkHref="#gentle-wave" x="48" y="5" />
            <use xlinkHref="#gentle-wave" x="48" y="7" />
            </g>
            </svg>
        </div>
    </div>
  );
};

export default Hero;
