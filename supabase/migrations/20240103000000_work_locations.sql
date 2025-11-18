-- Create work locations table
CREATE TABLE work_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  radius INTEGER DEFAULT 200, -- radius in meters
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_work_locations_active ON work_locations(is_active);
CREATE INDEX idx_work_locations_coords ON work_locations(latitude, longitude);

-- Create trigger for updated_at
CREATE TRIGGER update_work_locations_updated_at 
  BEFORE UPDATE ON work_locations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default office location
INSERT INTO work_locations (name, address, latitude, longitude, radius) 
VALUES ('Main Office', '123 Business Street, City', 40.7128, -74.0060, 200);