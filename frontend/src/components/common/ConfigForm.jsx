export default function ConfigForm({ config, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nombre Comercial */}
      <div className="md:col-span-2">
        <label className="label">
          Nombre Comercial *
        </label>
        <input
          type="text"
          value={config.nombreComercial}
          onChange={(e) => onChange('nombreComercial', e.target.value)}
          placeholder="Ej: Lar Living"
          className="input-field"
        />
      </div>

      {/* Dominio */}
      <div>
        <label className="label">
          Dominio *
        </label>
        <input
          type="text"
          value={config.dominio}
          onChange={(e) => onChange('dominio', e.target.value)}
          placeholder="Ej: larliving.com"
          className="input-field"
        />
      </div>

      {/* Email */}
      <div>
        <label className="label">
          Email de Contacto *
        </label>
        <input
          type="email"
          value={config.emailContacto}
          onChange={(e) => onChange('emailContacto', e.target.value)}
          placeholder="Ej: info@larliving.com"
          className="input-field"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="label">
          Teléfono *
        </label>
        <input
          type="tel"
          value={config.telefono}
          onChange={(e) => onChange('telefono', e.target.value)}
          placeholder="Ej: 933123456"
          className="input-field"
        />
      </div>

      {/* Idioma Preferente */}
      <div>
        <label className="label">
          Idioma Preferente *
        </label>
        <select
          value={config.idiomaPreferente}
          onChange={(e) => onChange('idiomaPreferente', e.target.value)}
          className="input-field"
        >
          <option value="es">Español</option>
          <option value="ca">Catalán</option>
          <option value="en">Inglés</option>
        </select>
      </div>

      {/* Idioma Secundario */}
      <div>
        <label className="label">
          Idioma Secundario (Opcional)
        </label>
        <select
          value={config.idiomaSecundario}
          onChange={(e) => onChange('idiomaSecundario', e.target.value)}
          className="input-field"
        >
          <option value="">Ninguno</option>
          <option value="es">Español</option>
          <option value="ca">Catalán</option>
          <option value="en">Inglés</option>
        </select>
      </div>

      {/* Nombre Carpeta Proyecto */}
      <div>
        <label className="label">
          Nombre Carpeta Proyecto *
        </label>
        <input
          type="text"
          value={config.nombreCarpetaProyecto}
          onChange={(e) => onChange('nombreCarpetaProyecto', e.target.value)}
          placeholder="Ej: Web_LarLiving"
          className="input-field font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Sin espacios ni caracteres especiales
        </p>
      </div>

      {/* Nombre Carpeta Assets */}
      <div>
        <label className="label">
          Nombre Carpeta Assets *
        </label>
        <input
          type="text"
          value={config.nombreCarpetaAssets}
          onChange={(e) => onChange('nombreCarpetaAssets', e.target.value)}
          placeholder="Ej: assets-larliving"
          className="input-field font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Minúsculas, sin espacios
        </p>
      </div>
    </div>
  )
}
