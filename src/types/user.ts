export type User = {
  id: number;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  website?: string;
  photo?: Photo;
  address?: Address;
  company?: Company;
};

export type Address = {
  street?: string;
  suite?: string;
  city?: string;
  zipcode?: string;
  geo?: {
    lat: number;
    lng: number;
  };
};

export type Company = {
  name: string;
  catchPhrase: string;
  bs: string;
};

export type Photo = {
  albumId?: number;
  id: number;
  title?: string;
  url: string;
  thumbnailUrl: string;
};
