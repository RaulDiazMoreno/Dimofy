import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Row, Col, Container } from "react-bootstrap";
import PaisesTable from "./PaisesTable";
import { FaSave, FaArrowLeft, FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStoredUser } from "../src/dashboard/utils/getStoredUser";

interface Usuario {
  id: number;
  userName: string;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  pais: string;
  imagenBase64: string;
  fechaAlta: string;
  admin: boolean;
}

interface Pais {
  idpais: number;
  nombre: string;
  bandera: string;
}

const UsuarioEditar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [busquedaPais] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] = useState<Pais | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

 const me = getStoredUser();

const rawUser = JSON.parse(localStorage.getItem("user") || "{}");

const username =
  me?.username ??
  rawUser?.username ??
  rawUser?.userName ??
  "";

const administrador = Boolean(
  me?.isAdmin === true ||
  rawUser?.admin === true ||
  rawUser?.isAdmin === true ||
  rawUser?.roles?.includes("ROLE_ADMIN") ||
  rawUser?.roles?.includes("ADMIN") ||
  rawUser?.authorities?.some((a: any) =>
    a?.authority === "ROLE_ADMIN" || a?.authority === "ADMIN"
  )
);

  const getToken = (): string | null => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData).token : null;
  };

  const formatDateForInput = (isoDate: string): string => {
    return isoDate ? isoDate.split("T")[0] : "";
  };

  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return "";

    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleVolver = () => {
    navigate(administrador ? "/admin/usuarios" : "/home");
  };

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] ?? null;
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Selecciona una imagen válida.");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    const base64 = reader.result as string;

    setUsuario((prev) =>
      prev ? { ...prev, imagenBase64: base64 } : prev
    );

    setNewImageFile(file);
  };

  reader.readAsDataURL(file);
};


useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const token = getToken();

        if (!token) {
          navigate("/login");
          return;
        }

        const endpointConsultar = administrador
          ? `http://localhost:8080/app/usuarios/admin/consultar/${id}`
          : `http://localhost:8080/app/usuarios/consultar/${id}`;

        const response = await fetch(endpointConsultar, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          const usuarioFormateado: Usuario = {
            ...data,
            fechaNacimiento: formatDateForInput(data.fechaNacimiento),
            fechaAlta: formatDateForInput(data.fechaAlta),
          };

          setUsuario(usuarioFormateado);
        } else if (response.status === 403) {
          setError("No tienes permisos para consultar este usuario.");
        } else {
          setError("No se pudo cargar el usuario.");
        }
      } catch (err) {
        console.error(err);
        setError("Error de conexión al cargar usuario.");
      }
    };

    fetchUsuario();
  }, [id, administrador, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!usuario) return;

    setUsuario({
      ...usuario,
      [e.target.name]: e.target.value,
    } as Usuario);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!usuario) {
      setError("No se ha cargado el usuario.");
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    if (!usuario.nombre || !usuario.email || !usuario.dni) {
      setError("Faltan datos obligatorios: nombre, email o DNI.");
      return;
    }

    const formData = new FormData();

    formData.append("username", usuario.userName);
    formData.append("nombre", usuario.nombre);
    formData.append("apellidos", usuario.apellidos);
    formData.append("dni", usuario.dni);
    formData.append("email", usuario.email);
    formData.append("telefono", usuario.telefono);
    formData.append("fechaNacimiento", usuario.fechaNacimiento);
    formData.append("pais", usuario.pais);
    formData.append("imagen", usuario.imagenBase64 ?? "");

    try {
      const endpointEditar = administrador
        ? `http://localhost:8080/app/usuarios/admin/editar/${usuario.id}`
        : `http://localhost:8080/app/usuarios/editar/${usuario.id}`;

      const response = await fetch(endpointEditar, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("¡Usuario actualizado correctamente!");

        setTimeout(() => {
          navigate(administrador ? "/admin/usuarios" : "/home");
        }, 700);
      } else if (response.status === 403) {
        setError("No tienes permisos para guardar estos cambios.");
      } else {
        const errorText = await response.text();
        setError(`Error al guardar los cambios: ${errorText}`);
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      setError("Error de conexión al guardar.");
    }
  };

  useEffect(() => {
    if (paisSeleccionado) {
      setUsuario((prev) => {
        if (!prev) return prev;
        return { ...prev, pais: paisSeleccionado.nombre };
      });
    }
  }, [paisSeleccionado]);

  useEffect(() => {
    if (!administrador) {
      document.body.classList.add("force-white-page");

      return () => {
        document.body.classList.remove("force-white-page");
      };
    }
  }, [administrador]);

  return (
    <Container className="mt-4">
      <h3>
        <FaEdit style={{ color: "blue" }} className="me-2" />
        Editar Usuario
      </h3>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {usuario ? (
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={username || usuario.userName}
                  disabled
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={usuario.nombre}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidos"
                  value={usuario.apellidos}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>DNI</Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={usuario.dni}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={usuario.email}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={usuario.telefono}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaNacimiento"
                  value={usuario.fechaNacimiento}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Fecha de Alta</Form.Label>
                <Form.Control
                  type="text"
                  name="fechaAlta"
                  value={formatDateForDisplay(usuario.fechaAlta)}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>País</Form.Label>
                <Form.Control
                  type="text"
                  name="pais"
                  value={usuario.pais}
                  disabled
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <PaisesTable
                onPaisSeleccionado={setPaisSeleccionado}
                filtroNombre={busquedaPais}
                resetTrigger={false}
              />
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Foto de perfil</Form.Label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <img
                    src={usuario.imagenBase64}
                    alt="Usuario"
                    style={{
                      width: "200px",
                      height: "200px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />

                  {!administrador && (
                    <div>
                      <input
                        id="user-image-input"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handlePickImage}
                      />

                      <Button
                        variant="outline-primary"
                        type="button"
                        onClick={() =>
                          document.getElementById("user-image-input")?.click()
                        }
                      >
                        Cambiar imagen
                      </Button>

                      {newImageFile && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            opacity: 0.8,
                          }}
                        >
                          {newImageFile.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" className="me-3">
                <FaSave className="me-2" />
                Guardar
              </Button>

              <Button variant="warning" type="button" onClick={handleVolver}>
                <FaArrowLeft className="me-2" />
                Volver
              </Button>
            </div>
          </Row>
        </Form>
      ) : (
        <p>Cargando usuario...</p>
      )}

      <ToastContainer />
    </Container>
  );
};

export default UsuarioEditar;



