import React from 'react';

interface UiBadgeProps {
  id: string;
  name: string;
  className?: string;
}

/**
 * 미래스마트산업진흥원 UI inspect 일련번호 뱃지 컴포넌트
 * - 평상시: 숨김
 * - Alt+I 활성화 시: 요소 좌상단에 콤팩트 9.5px 뱃지 표시
 * - 클릭 시: 4대 정보(일련번호/페이지명/URI/항목명) 클립보드 복사
 */
export const UiBadge: React.FC<UiBadgeProps> = ({ id, name, className = '' }) => {
  return (
    <span
      className={`ui-serial-badge ${className}`}
      data-serial-id={id}
      data-item-name={name}
      aria-hidden="true"
    >
      {id}
    </span>
  );
};

export default UiBadge;
