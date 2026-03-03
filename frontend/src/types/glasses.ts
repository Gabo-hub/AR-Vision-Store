export interface Glasses {
  id: number;
  name: string;
  description: string;
  price: string | number;
  thumbnail: string | null;
  model_3d_file: string | null;
  scale_factor: number;
  offset_x: number;
  offset_y: number;
  offset_z: number;
  created_at: string;
  updated_at: string;
}
