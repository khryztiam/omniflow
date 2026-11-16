import { useState } from 'react';
import styles from '@styles/FormularioMulti.module.css';

/**
 * Formulario multiforms (crear/editar/eliminar en un solo componente)
 */
export default function FormularioMulti({
  modo, // 'crear', 'editar' o 'ver'
  campos, // Array de {name, label, type, required, options?, disabled?}
  valores, // Objeto con valores actuales
  onCambio, // Callback al cambiar campo
  cargando = false,
  error = null,
}) {
  const esVisible = (campo) => {
    if (!campo.mostrarEn) return true;
    return campo.mostrarEn.includes(modo);
  };

  const esEditando = modo === 'editar' || modo === 'crear';

  return (
    <div className={styles.formulario}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.campos}>
        {campos.map((campo) => {
          if (!esVisible(campo)) return null;

          return (
            <div key={campo.name} className={styles.grupo}>
              <label className={styles.label}>
                {campo.label}
                {campo.required && (
                  <span className={styles.obligatorio}>*</span>
                )}
              </label>

              {campo.type === 'text' ||
              campo.type === 'email' ||
              campo.type === 'password' ||
              campo.type === 'date' ? (
                <input
                  type={campo.type}
                  name={campo.name}
                  value={valores[campo.name] || ''}
                  onChange={(e) => onCambio(campo.name, e.target.value)}
                  disabled={!esEditando || campo.disabled}
                  className={styles.input}
                  placeholder={campo.placeholder}
                  required={campo.required && esEditando}
                />
              ) : campo.type === 'number' ? (
                <input
                  type="number"
                  name={campo.name}
                  value={valores[campo.name] || 0}
                  onChange={(e) =>
                    onCambio(campo.name, parseInt(e.target.value))
                  }
                  disabled={!esEditando || campo.disabled}
                  className={styles.input}
                  required={campo.required && esEditando}
                />
              ) : campo.type === 'color' ? (
                <div className={styles.campoColor}>
                  <input
                    type="color"
                    name={campo.name}
                    value={valores[campo.name] || '#cccccc'}
                    onChange={(e) => onCambio(campo.name, e.target.value)}
                    disabled={!esEditando || campo.disabled}
                    className={styles.inputColor}
                  />
                  <span className={styles.valorColor}>
                    {(valores[campo.name] || '#cccccc').toUpperCase()}
                  </span>
                </div>
              ) : campo.type === 'textarea' ? (
                <textarea
                  name={campo.name}
                  value={valores[campo.name] || ''}
                  onChange={(e) => onCambio(campo.name, e.target.value)}
                  disabled={!esEditando || campo.disabled}
                  className={styles.textarea}
                  rows={3}
                  placeholder={campo.placeholder}
                  required={campo.required && esEditando}
                />
              ) : campo.type === 'select' ? (
                <select
                  name={campo.name}
                  value={valores[campo.name] || ''}
                  onChange={(e) => onCambio(campo.name, e.target.value)}
                  disabled={!esEditando || campo.disabled}
                  className={styles.select}
                  required={campo.required && esEditando}
                >
                  {campo.options?.length ? (
                    <>
                      <option value="">-- Seleccionar --</option>
                      {campo.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="" disabled>
                      {campo.emptyLabel || 'No hay opciones disponibles'}
                    </option>
                  )}
                </select>
              ) : campo.type === 'checkbox-group' ? (
                <div className={styles.opcionesCheckbox}>
                  {campo.options?.map((opcion) => {
                    const seleccionados = valores[campo.name] || [];

                    return (
                      <label key={opcion.id} className={styles.opcionCheckbox}>
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(opcion.id)}
                          disabled={!esEditando || campo.disabled}
                          onChange={(e) => {
                            const nuevosSeleccionados = e.target.checked
                              ? [...seleccionados, opcion.id]
                              : seleccionados.filter((id) => id !== opcion.id);
                            onCambio(campo.name, nuevosSeleccionados);
                          }}
                        />
                        <span>{opcion.label}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}

              {campo.ayuda && <p className={styles.ayuda}>{campo.ayuda}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
