import React from 'react';
import './RecomendacionCard.css';

interface RecomendacionCardProps {
  nombre: string;
  imagenUrl: string;
}

const RecomendacionCard: React.FC<RecomendacionCardProps> = ({ nombre, imagenUrl }) => {
  return (
    <div className="recomendacion-card">
      <img src={imagenUrl} alt={nombre} className="recomendacion-imagen" />
      <p className="recomendacion-nombre">{nombre}</p>
    </div>
  );
};

export default RecomendacionCard;
