// ComboPaises.tsx
import React from 'react';
import Select from 'react-select';

interface Pais {
  id: number;
  nombre: string;
  bandera: string;
}

interface ComboPaisesProps {
  paises: Pais[];
  onChange: (pais: Pais | null) => void;
  value: Pais | null;
}

const ComboPaises: React.FC<ComboPaisesProps> = ({ paises, onChange, value }) => {
  const opciones = paises.map((pais) => ({
    value: pais,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={pais.bandera}
          alt={pais.nombre}
          style={{ width: '25px', height: '15px', marginRight: '10px' }}
        />
        {pais.nombre}
      </div>
    ),
  }));

  return (
    <Select
      options={opciones}
      onChange={(option) => onChange(option ? option.value : null)}
      value={value ? opciones.find((opt) => opt.value.id === value.id) : null}
    />
  );
};

export default ComboPaises;
