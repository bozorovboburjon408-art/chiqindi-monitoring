-- EcoControl — Chiqindi xizmatlarini boshqarish va GIS monitoring tizimi
-- PostgreSQL + PostGIS Schema (Supabase moslashuvi)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HUDUDLAR (Tuman va shaharlar)
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'shahar',
    population INT DEFAULT 0,
    subscribers_count INT DEFAULT 0,
    households_count INT DEFAULT 0,
    coverage_percent DECIMAL(5,2) DEFAULT 0,
    center_lat DOUBLE PRECISION DEFAULT 40.0988,
    center_lng DOUBLE PRECISION DEFAULT 65.3792,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. KO'CHA TARMOQLARI (3-rangli GIS qarish holati: Yashil, Sariq, Qizil)
CREATE TABLE IF NOT EXISTS street_networks (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mahalla VARCHAR(150) NOT NULL,
    region_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'green', -- 'green' (<24h), 'yellow' (24-48h), 'red' (>48h)
    age_hours DECIMAL(6,2) DEFAULT 0.0,
    last_passed_at VARCHAR(100) DEFAULT 'Bugun 09:00',
    vehicle_plate VARCHAR(30) DEFAULT '85 714 UZA',
    houses_count INT DEFAULT 0,
    cleaned_houses_count INT DEFAULT 0,
    path_coordinates JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. XONADONLAR / ABONENTLAR (GIS poligonlari va nuqtalari)
CREATE TABLE IF NOT EXISTS households (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    street_name VARCHAR(255) NOT NULL,
    mahalla VARCHAR(150) NOT NULL,
    region_id VARCHAR(100),
    region_name VARCHAR(150) DEFAULT 'Navoiy shahri',
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    polygon_latlngs JSONB NOT NULL DEFAULT '[]',
    subscriber_name VARCHAR(200) NOT NULL,
    passport_series VARCHAR(20),
    phone VARCHAR(30) NOT NULL,
    residents_count INT DEFAULT 4,
    balance DECIMAL(12,2) DEFAULT 0.00,
    last_collected_time VARCHAR(100) DEFAULT 'Bugun 09:00',
    last_collected_vehicle VARCHAR(50) DEFAULT '85 714 UZA',
    last_collected_driver VARCHAR(100) DEFAULT 'Jasur Rahimov',
    status VARCHAR(30) DEFAULT 'Tozalangan',
    type VARCHAR(30) DEFAULT 'Hovli',
    cadastre_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CHIQINDI YIG'ISH MAYDONCHALARI (ЧЙМ - 300 ta maydoncha)
CREATE TABLE IF NOT EXISTS chym_sites (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    mahalla VARCHAR(150) NOT NULL,
    region_id VARCHAR(100),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    capacity INT DEFAULT 5,
    current_containers_count INT DEFAULT 4,
    fill_percent_avg INT DEFAULT 35,
    cleanliness_status VARCHAR(50) DEFAULT 'Qoniqarli',
    has_camera BOOLEAN DEFAULT FALSE,
    camera_ip VARCHAR(50),
    rtsp_stream_url TEXT,
    snapshot_url TEXT,
    last_cleaned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_inspected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. KONTEYNERLAR
CREATE TABLE IF NOT EXISTS containers (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    chym_id VARCHAR(100) REFERENCES chym_sites(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'Standart (1.1 m³)',
    capacity_m3 DECIMAL(5,2) DEFAULT 1.1,
    fill_level INT DEFAULT 40,
    status VARCHAR(50) DEFAULT 'Normal',
    last_emptied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MAXSUS TEXNIKALAR (40 ta avtotransport GPS integratsiyasi)
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(100) PRIMARY KEY,
    plate_number VARCHAR(30) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    garage_number VARCHAR(30),
    driver_name VARCHAR(150) NOT NULL,
    driver_phone VARCHAR(30),
    lat DOUBLE PRECISION DEFAULT 40.0988,
    lng DOUBLE PRECISION DEFAULT 65.3792,
    speed INT DEFAULT 0,
    heading INT DEFAULT 0,
    fuel_level INT DEFAULT 80,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Marshrutda',
    current_street VARCHAR(200) DEFAULT 'G‘alaba shoh ko‘chasi',
    collected_volume_today DECIMAL(6,2) DEFAULT 12.5,
    last_gps_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. KAMERALAR VA 10 DAQIQALIK SNAPSHOTLAR (AI Tahlil jurnali)
CREATE TABLE IF NOT EXISTS camera_snapshots (
    id VARCHAR(100) PRIMARY KEY,
    site_id VARCHAR(100) REFERENCES chym_sites(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    detected_fill_percent INT NOT NULL,
    is_overflow BOOLEAN DEFAULT FALSE,
    alert_triggered BOOLEAN DEFAULT FALSE,
    telegram_sent BOOLEAN DEFAULT FALSE,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FUQAROLAR MUROJAATLARI (Shikoyat va takliflar)
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    citizen_name VARCHAR(150) NOT NULL,
    citizen_phone VARCHAR(30) NOT NULL,
    region_id VARCHAR(100),
    region_name VARCHAR(150) DEFAULT 'Navoiy shahri',
    address VARCHAR(255) NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'Yangi',
    photo_urls JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. INDEKSLAR
CREATE INDEX IF NOT EXISTS idx_households_street ON households(street_name);
CREATE INDEX IF NOT EXISTS idx_households_mahalla ON households(mahalla);
CREATE INDEX IF NOT EXISTS idx_households_code ON households(code);
CREATE INDEX IF NOT EXISTS idx_chym_sites_mahalla ON chym_sites(mahalla);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_snapshots_site ON camera_snapshots(site_id, analyzed_at DESC);

-- 10. REALTIME VA RUXSATLAR (RLS)
ALTER TABLE regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE street_networks DISABLE ROW LEVEL SECURITY;
ALTER TABLE households DISABLE ROW LEVEL SECURITY;
ALTER TABLE chym_sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE containers DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;

-- Supabase Realtime uchun
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE households;
ALTER PUBLICATION supabase_realtime ADD TABLE chym_sites;
ALTER PUBLICATION supabase_realtime ADD TABLE street_networks;

