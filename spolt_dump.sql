--
-- PostgreSQL database dump
--

\restrict YmRcWCGBlWFDMVqjRjdSZdldzdefObeTKtpQ8RAQpODgi570fmBjovw67zMmvu8

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: EstadoAmistad; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoAmistad" AS ENUM (
    'pendiente',
    'aceptada',
    'rechazada',
    'bloqueada'
);


ALTER TYPE public."EstadoAmistad" OWNER TO postgres;

--
-- Name: EstadoEvento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoEvento" AS ENUM (
    'abierto',
    'cerrado',
    'cancelado',
    'finalizado'
);


ALTER TYPE public."EstadoEvento" OWNER TO postgres;

--
-- Name: EstadoParticipacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EstadoParticipacion" AS ENUM (
    'pendiente',
    'confirmado',
    'rechazado',
    'retirado'
);


ALTER TYPE public."EstadoParticipacion" OWNER TO postgres;

--
-- Name: TipoConversacion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoConversacion" AS ENUM (
    'individual',
    'grupo'
);


ALTER TYPE public."TipoConversacion" OWNER TO postgres;

--
-- Name: TipoEvento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoEvento" AS ENUM (
    'partido',
    'torneo'
);


ALTER TYPE public."TipoEvento" OWNER TO postgres;

--
-- Name: TipoMensaje; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoMensaje" AS ENUM (
    'texto',
    'imagen',
    'archivo',
    'ubicacion'
);


ALTER TYPE public."TipoMensaje" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: amistades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.amistades (
    id_amistad integer NOT NULL,
    id_usuario_solicitante integer NOT NULL,
    id_usuario_receptor integer NOT NULL,
    estado public."EstadoAmistad" DEFAULT 'pendiente'::public."EstadoAmistad" NOT NULL,
    fecha_solicitud timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_respuesta timestamp(3) without time zone
);


ALTER TABLE public.amistades OWNER TO postgres;

--
-- Name: amistades_id_amistad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.amistades_id_amistad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.amistades_id_amistad_seq OWNER TO postgres;

--
-- Name: amistades_id_amistad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.amistades_id_amistad_seq OWNED BY public.amistades.id_amistad;


--
-- Name: conversaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversaciones (
    id_conversacion integer NOT NULL,
    tipo public."TipoConversacion" DEFAULT 'individual'::public."TipoConversacion" NOT NULL,
    nombre_grupo character varying(100),
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ultima_actividad timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversaciones OWNER TO postgres;

--
-- Name: conversaciones_id_conversacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversaciones_id_conversacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversaciones_id_conversacion_seq OWNER TO postgres;

--
-- Name: conversaciones_id_conversacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversaciones_id_conversacion_seq OWNED BY public.conversaciones.id_conversacion;


--
-- Name: deportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deportes (
    id_deporte integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text,
    imagen_icono character varying(255)
);


ALTER TABLE public.deportes OWNER TO postgres;

--
-- Name: deportes_id_deporte_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.deportes_id_deporte_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deportes_id_deporte_seq OWNER TO postgres;

--
-- Name: deportes_id_deporte_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.deportes_id_deporte_seq OWNED BY public.deportes.id_deporte;


--
-- Name: eventos_deportivos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eventos_deportivos (
    id_evento integer NOT NULL,
    id_creador integer NOT NULL,
    id_deporte integer NOT NULL,
    titulo character varying(100) NOT NULL,
    descripcion text,
    tipo_evento public."TipoEvento" NOT NULL,
    fecha_evento date NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone,
    ubicacion character varying(255),
    latitud numeric(10,8),
    longitud numeric(11,8),
    numero_max_participantes integer NOT NULL,
    numero_participantes_actuales integer DEFAULT 0 NOT NULL,
    estado public."EstadoEvento" DEFAULT 'abierto'::public."EstadoEvento" NOT NULL,
    fecha_creacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.eventos_deportivos OWNER TO postgres;

--
-- Name: eventos_deportivos_id_evento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.eventos_deportivos_id_evento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.eventos_deportivos_id_evento_seq OWNER TO postgres;

--
-- Name: eventos_deportivos_id_evento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.eventos_deportivos_id_evento_seq OWNED BY public.eventos_deportivos.id_evento;


--
-- Name: mensajes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensajes (
    id_mensaje integer NOT NULL,
    id_conversacion integer NOT NULL,
    id_usuario_emisor integer NOT NULL,
    contenido text NOT NULL,
    tipo_mensaje public."TipoMensaje" DEFAULT 'texto'::public."TipoMensaje" NOT NULL,
    url_archivo character varying(255),
    fecha_envio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    editado boolean DEFAULT false NOT NULL,
    fecha_edicion timestamp(3) without time zone
);


ALTER TABLE public.mensajes OWNER TO postgres;

--
-- Name: mensajes_id_mensaje_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mensajes_id_mensaje_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mensajes_id_mensaje_seq OWNER TO postgres;

--
-- Name: mensajes_id_mensaje_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mensajes_id_mensaje_seq OWNED BY public.mensajes.id_mensaje;


--
-- Name: participantes_conversacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participantes_conversacion (
    id_participante integer NOT NULL,
    id_conversacion integer NOT NULL,
    id_usuario integer NOT NULL,
    fecha_union timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ultimo_mensaje_leido integer,
    notificaciones_activas boolean DEFAULT true NOT NULL
);


ALTER TABLE public.participantes_conversacion OWNER TO postgres;

--
-- Name: participantes_conversacion_id_participante_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.participantes_conversacion_id_participante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.participantes_conversacion_id_participante_seq OWNER TO postgres;

--
-- Name: participantes_conversacion_id_participante_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.participantes_conversacion_id_participante_seq OWNED BY public.participantes_conversacion.id_participante;


--
-- Name: participantes_evento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participantes_evento (
    id_participacion integer NOT NULL,
    id_evento integer NOT NULL,
    id_usuario integer NOT NULL,
    estado public."EstadoParticipacion" DEFAULT 'pendiente'::public."EstadoParticipacion" NOT NULL,
    fecha_solicitud timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_respuesta timestamp(3) without time zone
);


ALTER TABLE public.participantes_evento OWNER TO postgres;

--
-- Name: participantes_evento_id_participacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.participantes_evento_id_participacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.participantes_evento_id_participacion_seq OWNER TO postgres;

--
-- Name: participantes_evento_id_participacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.participantes_evento_id_participacion_seq OWNED BY public.participantes_evento.id_participacion;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre_usuario character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    contrasena_hash character varying(255) NOT NULL,
    nombre_completo character varying(100),
    biografia text,
    imagen_perfil character varying(255),
    fecha_nacimiento date,
    fecha_registro timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ultimo_acceso timestamp(3) without time zone,
    activo boolean DEFAULT true NOT NULL,
    refresh_token_hash character varying(255),
    role text DEFAULT 'user'::text NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: amistades id_amistad; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades ALTER COLUMN id_amistad SET DEFAULT nextval('public.amistades_id_amistad_seq'::regclass);


--
-- Name: conversaciones id_conversacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones ALTER COLUMN id_conversacion SET DEFAULT nextval('public.conversaciones_id_conversacion_seq'::regclass);


--
-- Name: deportes id_deporte; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes ALTER COLUMN id_deporte SET DEFAULT nextval('public.deportes_id_deporte_seq'::regclass);


--
-- Name: eventos_deportivos id_evento; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_deportivos ALTER COLUMN id_evento SET DEFAULT nextval('public.eventos_deportivos_id_evento_seq'::regclass);


--
-- Name: mensajes id_mensaje; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes ALTER COLUMN id_mensaje SET DEFAULT nextval('public.mensajes_id_mensaje_seq'::regclass);


--
-- Name: participantes_conversacion id_participante; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_conversacion ALTER COLUMN id_participante SET DEFAULT nextval('public.participantes_conversacion_id_participante_seq'::regclass);


--
-- Name: participantes_evento id_participacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_evento ALTER COLUMN id_participacion SET DEFAULT nextval('public.participantes_evento_id_participacion_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
25b1c798-fbc1-4ea5-bf25-5acf4b8ff9ec	3163c5bb48a48b769e0ede43f066fbf6e599dbe7537d4759a108c052cdae5930	2026-03-12 11:44:16.604295+00	20260312114416_init	\N	\N	2026-03-12 11:44:16.395759+00	1
bb295d2e-705a-414f-8e38-0e77876ecbd9	fada3256fd9284d8d626824193e9723a75940d1d4a603b43d92a70508298d4f3	2026-03-12 12:00:22.34106+00	20260312120022_v2	\N	\N	2026-03-12 12:00:22.31116+00	1
c517a6bd-614d-4625-ab73-7251b9f0ff71	9fa7a59825639dce5c5f51c201f0472238f40763915e412d0ab6773fcfb94bc0	2026-03-12 12:34:53.64274+00	20260312123453_init_auth	\N	\N	2026-03-12 12:34:53.633405+00	1
\.


--
-- Data for Name: amistades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.amistades (id_amistad, id_usuario_solicitante, id_usuario_receptor, estado, fecha_solicitud, fecha_respuesta) FROM stdin;
1	4	3	aceptada	2026-03-24 09:38:48.126	2026-03-24 09:50:50.937
\.


--
-- Data for Name: conversaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversaciones (id_conversacion, tipo, nombre_grupo, fecha_creacion, ultima_actividad) FROM stdin;
\.


--
-- Data for Name: deportes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deportes (id_deporte, nombre, descripcion, imagen_icono) FROM stdin;
1	Fútbol	Deporte de equipo jugado entre dos conjuntos de once jugadores	\N
2	Baloncesto	Deporte de equipo jugado entre dos conjuntos de cinco jugadores	\N
3	Voley	Deporte de equipo jugado entre dos conjuntos de 6 jugadores	\N
\.


--
-- Data for Name: eventos_deportivos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eventos_deportivos (id_evento, id_creador, id_deporte, titulo, descripcion, tipo_evento, fecha_evento, hora_inicio, hora_fin, ubicacion, latitud, longitud, numero_max_participantes, numero_participantes_actuales, estado, fecha_creacion) FROM stdin;
2	4	2	Partido de baloncesto Amateur	Partido amistoso para echar un rato el domingo por la mañana. Nivel intermedio.	partido	2026-04-15	10:00:00	12:00:00	Polideportivo Municipal	40.41680000	-3.70380000	10	0	abierto	2026-03-25 14:04:27.582
1	3	1	Partido de Fútbol Amateur	Partido amistoso para echar un rato el domingo por la mañana. Nivel intermedio.	partido	2026-04-15	10:00:00	12:00:00	Polideportivo Municipal	40.41680000	-3.70380000	10	1	abierto	2026-03-25 12:49:27.463
\.


--
-- Data for Name: mensajes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mensajes (id_mensaje, id_conversacion, id_usuario_emisor, contenido, tipo_mensaje, url_archivo, fecha_envio, editado, fecha_edicion) FROM stdin;
\.


--
-- Data for Name: participantes_conversacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participantes_conversacion (id_participante, id_conversacion, id_usuario, fecha_union, ultimo_mensaje_leido, notificaciones_activas) FROM stdin;
\.


--
-- Data for Name: participantes_evento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participantes_evento (id_participacion, id_evento, id_usuario, estado, fecha_solicitud, fecha_respuesta) FROM stdin;
2	1	4	confirmado	2026-03-25 15:58:54.857	\N
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, nombre_usuario, email, contrasena_hash, nombre_completo, biografia, imagen_perfil, fecha_nacimiento, fecha_registro, ultimo_acceso, activo, refresh_token_hash, role) FROM stdin;
3	David	denun2005@gmail.com	$2b$10$UsO03fbFK5z4T9Lyv4m3R.g0snsRgsNoWAkXFLtgOm1VbuMdJRGFq	\N	\N	\N	2005-01-31	2026-03-23 18:37:26.318	\N	t	$2b$10$LBKx9J2jlOqeutHWjDnCXesbeWv5QIm0mrebdcINJU2PlqlALNTYm	user
4	Dfezbue	dfdezbue@gmail.com	$2b$10$NrRwGsCLfFSxGQFZa0Ua8.h.vl0KKRDF.o9gfRTBpS9xGSPZbW9vi	\N	\N	\N	2005-01-31	2026-03-24 09:31:13.014	\N	t	$2b$10$TMfmNUIBUmaHq2YmsJaTBOet./ySgIerRFUIIin1Fhff4/q14yePa	user
5	David3	duvit03@gmail.com	$2b$10$RKYFQIL3WAW8aLmmtvx86.wCzCYbI/LwmnfpcJ6OlODGY/5oxxJD6	\N	\N	\N	2004-01-31	2026-03-24 10:03:06.984	\N	t	$2b$10$IQz/8zQGKZP8LkNe0aD9Le23lfuXX6wa.lYuQqtgs4Pn389srs44u	user
\.


--
-- Name: amistades_id_amistad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.amistades_id_amistad_seq', 2, true);


--
-- Name: conversaciones_id_conversacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversaciones_id_conversacion_seq', 1, false);


--
-- Name: deportes_id_deporte_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.deportes_id_deporte_seq', 3, true);


--
-- Name: eventos_deportivos_id_evento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.eventos_deportivos_id_evento_seq', 2, true);


--
-- Name: mensajes_id_mensaje_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mensajes_id_mensaje_seq', 1, false);


--
-- Name: participantes_conversacion_id_participante_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.participantes_conversacion_id_participante_seq', 1, false);


--
-- Name: participantes_evento_id_participacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.participantes_evento_id_participacion_seq', 2, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 5, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: amistades amistades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_pkey PRIMARY KEY (id_amistad);


--
-- Name: conversaciones conversaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversaciones
    ADD CONSTRAINT conversaciones_pkey PRIMARY KEY (id_conversacion);


--
-- Name: deportes deportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportes
    ADD CONSTRAINT deportes_pkey PRIMARY KEY (id_deporte);


--
-- Name: eventos_deportivos eventos_deportivos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_deportivos
    ADD CONSTRAINT eventos_deportivos_pkey PRIMARY KEY (id_evento);


--
-- Name: mensajes mensajes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_pkey PRIMARY KEY (id_mensaje);


--
-- Name: participantes_conversacion participantes_conversacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_conversacion
    ADD CONSTRAINT participantes_conversacion_pkey PRIMARY KEY (id_participante);


--
-- Name: participantes_evento participantes_evento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_evento
    ADD CONSTRAINT participantes_evento_pkey PRIMARY KEY (id_participacion);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: amistades_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX amistades_estado_idx ON public.amistades USING btree (estado);


--
-- Name: amistades_id_usuario_receptor_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX amistades_id_usuario_receptor_idx ON public.amistades USING btree (id_usuario_receptor);


--
-- Name: amistades_id_usuario_solicitante_id_usuario_receptor_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX amistades_id_usuario_solicitante_id_usuario_receptor_key ON public.amistades USING btree (id_usuario_solicitante, id_usuario_receptor);


--
-- Name: amistades_id_usuario_solicitante_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX amistades_id_usuario_solicitante_idx ON public.amistades USING btree (id_usuario_solicitante);


--
-- Name: conversaciones_ultima_actividad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversaciones_ultima_actividad_idx ON public.conversaciones USING btree (ultima_actividad);


--
-- Name: deportes_nombre_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deportes_nombre_idx ON public.deportes USING btree (nombre);


--
-- Name: deportes_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX deportes_nombre_key ON public.deportes USING btree (nombre);


--
-- Name: eventos_deportivos_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_deportivos_estado_idx ON public.eventos_deportivos USING btree (estado);


--
-- Name: eventos_deportivos_fecha_evento_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_deportivos_fecha_evento_idx ON public.eventos_deportivos USING btree (fecha_evento);


--
-- Name: eventos_deportivos_id_creador_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_deportivos_id_creador_idx ON public.eventos_deportivos USING btree (id_creador);


--
-- Name: eventos_deportivos_id_deporte_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_deportivos_id_deporte_idx ON public.eventos_deportivos USING btree (id_deporte);


--
-- Name: mensajes_id_conversacion_fecha_envio_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensajes_id_conversacion_fecha_envio_idx ON public.mensajes USING btree (id_conversacion, fecha_envio);


--
-- Name: mensajes_id_usuario_emisor_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensajes_id_usuario_emisor_idx ON public.mensajes USING btree (id_usuario_emisor);


--
-- Name: participantes_conversacion_id_conversacion_id_usuario_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX participantes_conversacion_id_conversacion_id_usuario_key ON public.participantes_conversacion USING btree (id_conversacion, id_usuario);


--
-- Name: participantes_conversacion_id_conversacion_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX participantes_conversacion_id_conversacion_idx ON public.participantes_conversacion USING btree (id_conversacion);


--
-- Name: participantes_conversacion_id_usuario_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX participantes_conversacion_id_usuario_idx ON public.participantes_conversacion USING btree (id_usuario);


--
-- Name: participantes_evento_id_evento_id_usuario_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX participantes_evento_id_evento_id_usuario_key ON public.participantes_evento USING btree (id_evento, id_usuario);


--
-- Name: participantes_evento_id_evento_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX participantes_evento_id_evento_idx ON public.participantes_evento USING btree (id_evento);


--
-- Name: participantes_evento_id_usuario_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX participantes_evento_id_usuario_idx ON public.participantes_evento USING btree (id_usuario);


--
-- Name: usuarios_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuarios_email_idx ON public.usuarios USING btree (email);


--
-- Name: usuarios_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email);


--
-- Name: usuarios_nombre_usuario_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX usuarios_nombre_usuario_idx ON public.usuarios USING btree (nombre_usuario);


--
-- Name: usuarios_nombre_usuario_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX usuarios_nombre_usuario_key ON public.usuarios USING btree (nombre_usuario);


--
-- Name: amistades amistades_id_usuario_receptor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_id_usuario_receptor_fkey FOREIGN KEY (id_usuario_receptor) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: amistades amistades_id_usuario_solicitante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.amistades
    ADD CONSTRAINT amistades_id_usuario_solicitante_fkey FOREIGN KEY (id_usuario_solicitante) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: eventos_deportivos eventos_deportivos_id_creador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_deportivos
    ADD CONSTRAINT eventos_deportivos_id_creador_fkey FOREIGN KEY (id_creador) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: eventos_deportivos eventos_deportivos_id_deporte_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_deportivos
    ADD CONSTRAINT eventos_deportivos_id_deporte_fkey FOREIGN KEY (id_deporte) REFERENCES public.deportes(id_deporte) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mensajes mensajes_id_conversacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_id_conversacion_fkey FOREIGN KEY (id_conversacion) REFERENCES public.conversaciones(id_conversacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mensajes mensajes_id_usuario_emisor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_id_usuario_emisor_fkey FOREIGN KEY (id_usuario_emisor) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: participantes_conversacion participantes_conversacion_id_conversacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_conversacion
    ADD CONSTRAINT participantes_conversacion_id_conversacion_fkey FOREIGN KEY (id_conversacion) REFERENCES public.conversaciones(id_conversacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: participantes_conversacion participantes_conversacion_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_conversacion
    ADD CONSTRAINT participantes_conversacion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: participantes_evento participantes_evento_id_evento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_evento
    ADD CONSTRAINT participantes_evento_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.eventos_deportivos(id_evento) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: participantes_evento participantes_evento_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participantes_evento
    ADD CONSTRAINT participantes_evento_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict YmRcWCGBlWFDMVqjRjdSZdldzdefObeTKtpQ8RAQpODgi570fmBjovw67zMmvu8

