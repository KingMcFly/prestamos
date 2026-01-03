export const formatRut = (rut: string): string => {
  if (!rut) return '';
  // Limpiar cualquier caracter que no sea número o K
  let value = rut.replace(/[^0-9kK]/g, '');
  
  // Limitar largo máximo típico de RUT (8 o 9 dígitos)
  if (value.length > 9) value = value.slice(0, 9);

  // Separar cuerpo y dígito verificador
  if (value.length > 1) {
    const dv = value.slice(-1);
    const body = value.slice(0, -1);
    
    // Formatear con puntos
    let formattedBody = '';
    for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) formattedBody = '.' + formattedBody;
      formattedBody = body[i] + formattedBody;
    }
    
    return `${formattedBody}-${dv}`;
  }
  
  return value;
};

export const unformatRut = (rut: string): string => {
  return rut.replace(/[^0-9kK]/g, '');
};

// Función segura para generar IDs en entornos HTTP (móvil local)
export const generateUUID = (): string => {
  // Si está disponible nativamente (HTTPS o Localhost)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para entornos no seguros (HTTP en red local)
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};