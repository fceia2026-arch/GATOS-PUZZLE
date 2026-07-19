# 🐱 Gatitos en la Caja (Michi Box Puzzle)

¡Un encantador juego de rompecabezas espacial donde debes acomodar gatitos en cajas de cartón! Diseñado con React, Tailwind CSS y Motion.

Este repositorio está preparado para ser publicado en **GitHub**, desplegado en **Vercel** y sincronizado en la nube con **Supabase** para guardar el progreso y ver una tabla de clasificación global de jugadores.

---

## 🚀 Despliegue Rápido en Vercel

1. **Sube el código a GitHub:**
   Crea un repositorio en tu cuenta de GitHub y sube este código:
   ```bash
   git init
   git add .
   git commit -m "feat: gatitos en la caja release"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
   - Haz clic en **Add New** > **Project**.
   - Selecciona el repositorio de Gatitos en la Caja.
   - Vercel detectará automáticamente que es un proyecto **Vite**.
   - *(Opcional)* Añade las variables de entorno de Supabase (ver sección de Supabase abajo).
   - Haz clic en **Deploy**. ¡Tu juego estará listo en menos de 1 minuto!

---

## 🗄️ Configuración de Supabase (Guardado en la Nube y Tabla de Posiciones)

El juego funciona en **Modo Local** por defecto (usando `localStorage` de tu navegador), pero si configuras Supabase, los jugadores podrán:
- Guardar su progreso en la nube con un tierno nickname aleatorio de michi (por ejemplo, *Michi Dormilón #412*).
- Cambiar su nickname personalizado desde el juego.
- Sincronizar niveles completados entre dispositivos.
- Ver una **Tabla de Clasificación Global (Leaderboard)** de quién ha completado más cajas de cartón.

### Paso 1: Crear el proyecto en Supabase
1. Registrate en [Supabase](https://supabase.com/).
2. Crea un nuevo proyecto llamado `Gatitos en la Caja`.
3. Ve al **SQL Editor** en la barra lateral izquierda.
4. Crea una nueva consulta (New Query) y pega el contenido del archivo `supabase-schema.sql` que se encuentra en la raíz de este proyecto.
5. Haz clic en **Run**. Esto creará la tabla `gatitos_progress` y configurará la seguridad (RLS) automáticamente.

### Paso 2: Conectar las variables de entorno
1. En tu panel de Supabase, ve a **Project Settings** > **API**.
2. Copia la **Project API URL** y la **anon public API key**.
3. Añádelas a tu archivo `.env` local o configúralas en la sección **Environment Variables** de tu proyecto en Vercel:
   - `VITE_SUPABASE_URL` = (Tu Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (Tu anon public API key)

---

## 🛠️ Desarrollo Local

Para correr el proyecto en tu computadora localmente:

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Corre el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🎮 Características del Juego

- **Temática de Refugio de Michis**: Estilo estético limpio, con colores cálidos y hermosos gatitos ilustrados.
- **Mecánica de Arrastre Inteligente**: Coloca a los gatos arrastrándolos y gíralos con un simple toque/clic rápido para ajustar su orientación.
- **Obstáculos de Juguete**: Las cajas tienen juguetes que bloquean ciertas posiciones, añadiendo capas lógicas al desafío.
- **Efectos de Sonido Felinos**: Sonidos alegres de maullidos y ronroneos al interactuar con cada uno de los gatitos.
- **Compatibilidad Responsiva**: Disfruta del juego con controles táctiles adaptados en tu celular, tablet o computadora.
