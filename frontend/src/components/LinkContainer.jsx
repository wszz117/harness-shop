import { cloneElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// 轻量 LinkContainer（替代 react-router-bootstrap，避免额外依赖）
export const LinkContainer = ({ to, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  return cloneElement(children, {
    onClick: (e) => {
      e.preventDefault();
      if (children.props.onClick) children.props.onClick(e);
      navigate(to);
    },
    href: to,
    active: location.pathname === to,
  });
};

export default LinkContainer;
