//src/components/Debug/DebugInfo.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const DebugInfo = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');

  return (
    <div className="debug-info">
      <div>Current Path: {location.pathname}</div>
      <div>Category Param: {categoryParam || 'none'}</div>
      <div>Search: {location.search}</div>
    </div>
  );
};

export default DebugInfo;