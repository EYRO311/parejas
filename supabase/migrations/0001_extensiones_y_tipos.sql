-- ============================================================
-- 0001: Extensiones y tipos enumerados
-- ============================================================

create extension if not exists pgcrypto;

create type grupo_tipo as enum ('pareja', 'familia', 'roommates');
create type miembro_rol as enum ('admin', 'miembro');
create type invitacion_estado as enum ('activo', 'usado', 'expirado');
create type presupuesto_estado as enum ('activo', 'cerrado');
