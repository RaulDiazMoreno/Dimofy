import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Genero {
  idGenero: number;
  nombreGenero: string;
}

interface Props {
  show: boolean;
  onHide: () => void;
  onSave: (genero: Genero) => void;
  genero?: Genero;
}

const GeneroFormModal: React.FC<Props> = ({ show, onHide, onSave, genero }) => {
  const [formData, setFormData] = useState<Genero>({ idGenero: 0, nombreGenero: '' });

  useEffect(() => {
    if (genero) {
      setFormData(genero);
    } else {
      setFormData({ idGenero: 0, nombreGenero: '' });
    }
  }, [genero]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, nombreGenero: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{genero ? 'Editar Género' : 'Crear Género'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Nombre del Género</Form.Label>
            <Form.Control
              type="text"
              value={formData.nombreGenero}
              onChange={handleChange}
              placeholder="Introduce el nombre del género"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {genero ? 'Guardar Cambios' : 'Crear'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GeneroFormModal;

