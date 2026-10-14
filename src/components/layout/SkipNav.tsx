import React from 'react';

export const SkipNav: React.FC = () => {
  return (
    <>
      <a href="#main-content" className="skip-nav">
        본문 바로가기 (Skip to Content)
      </a>
      <a href="#main-navigation" className="skip-nav" style={{ left: '16rem' }}>
        주요 메뉴 바로가기 (Skip to Navigation)
      </a>
    </>
  );
};

export default SkipNav;
