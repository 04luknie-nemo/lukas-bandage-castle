-- bandage castle schema
-- run with: npm run db:init

CREATE TABLE IF NOT EXISTS tbl_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'STAFF',
  display_name VARCHAR(191),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_customer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  title VARCHAR(64),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(191),
  contact_pref VARCHAR(32) DEFAULT 'raven',
  lair_address TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_monster (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(100),
  owner_id INT,
  birth_date DATE,
  temperament VARCHAR(100),
  quirks TEXT,
  history TEXT,
  photo_url VARCHAR(255),
  status VARCHAR(32) DEFAULT 'IN_RESIDENCE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_stay (
  id INT AUTO_INCREMENT PRIMARY KEY,
  monster_id INT NOT NULL,
  customer_id INT NOT NULL,
  reason VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'BOOKED',
  start_date DATE,
  expected_pickup DATE,
  checked_in_at DATETIME NULL,
  checked_out_at DATETIME NULL,
  daily_rate DECIMAL(10,2) DEFAULT 10.00,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS tbl_invoice (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stay_id INT NULL,
  customer_id INT NOT NULL,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  total DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(16) DEFAULT 'UNPAID'
);

CREATE TABLE IF NOT EXISTS tbl_invoice_line (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  description VARCHAR(255),
  qty INT DEFAULT 1,
  unit_price DECIMAL(10,2),
  amount DECIMAL(10,2),
  kind VARCHAR(16) DEFAULT 'OTHER'
);

CREATE TABLE IF NOT EXISTS tbl_payment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  amount DECIMAL(10,2),
  method VARCHAR(16) DEFAULT 'GOLD',
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_raven (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  subject VARCHAR(255),
  body TEXT,
  status VARCHAR(16) DEFAULT 'QUEUED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS tbl_password_reset (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL
);
