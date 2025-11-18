-- Create attendance records table
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  total_hours DECIMAL(5,2),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_accuracy INTEGER,
  check_in_method VARCHAR(20) DEFAULT 'manual' CHECK (check_in_method IN ('manual', 'geofence', 'biometric')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'incomplete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX idx_attendance_check_in_time ON attendance_records(check_in_time);
CREATE INDEX idx_attendance_status ON attendance_records(status);

-- Create trigger for updated_at
CREATE TRIGGER update_attendance_updated_at 
  BEFORE UPDATE ON attendance_records 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();