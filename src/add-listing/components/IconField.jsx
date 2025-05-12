import React from 'react';
import {
  FaClipboardList,
  FaTag,
  FaDollarSign,
  FaMoneyBillAlt,
  FaCar,
  FaCheckCircle,
  FaIndustry,
  FaCarSide,
  FaCalendarAlt,
  FaRoad,
  FaCogs,
  FaGasPump,
  FaTachometerAlt,
  FaWrench,
  FaCircle,
  FaPalette,
  FaDoorClosed,
  FaIdCard,
  FaTags,
  FaFileAlt
} from 'react-icons/fa';

const iconMap = {
  FaClipboardList,
  FaTag,
  FaDollarSign,
  FaMoneyBillAlt,
  FaCar,
  FaCheckCircle,
  FaIndustry,
  FaCarSide,
  FaCalendarAlt,
  FaRoad,
  FaCogs,
  FaGasPump,
  FaTachometerAlt,
  FaWrench,
  FaCircle,
  FaPalette,
  FaDoorClosed,
  FaIdCard,
  FaTags,
  FaFileAlt
};

function IconField({ iconName, size = 15, className = '' }) {
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 transition-colors duration-200 hover:bg-primary hover:text-white ${className}`}>
      <IconComponent size={size} className="inline-block" />
    </div>
  );
}

export default IconField;
