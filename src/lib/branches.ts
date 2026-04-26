export interface Branch {
  id: string;
  name: string;
  district: string;
  address: string;
  mapsUrl: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
}

export const simbaBranches: Branch[] = [
  { 
    id: 'remera', 
    name: 'Simba Supermarket Remera', 
    district: 'Gasabo',
    address: 'KG 11 Ave, Remera, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Remera+Kigali',
    phone: '+250 788 300 100',
    hours: '24/7',
    lat: -1.9587,
    lng: 30.1128
  },
  { 
    id: 'kimironko', 
    name: 'Simba Supermarket Kimironko', 
    district: 'Gasabo',
    address: 'KG 194 St, Kimironko, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Kimironko+Kigali',
    phone: '+250 788 300 200',
    hours: '06:00 - 23:00',
    lat: -1.9392,
    lng: 30.1257
  },
  { 
    id: 'kacyiru', 
    name: 'Simba Supermarket Kacyiru', 
    district: 'Gasabo',
    address: 'KG 544 St, Kacyiru, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Kacyiru+Kigali',
    phone: '+250 788 300 300',
    hours: '07:00 - 22:00',
    lat: -1.9441,
    lng: 30.0894
  },
  { 
    id: 'nyamirambo', 
    name: 'Simba Supermarket Nyamirambo', 
    district: 'Nyarugenge',
    address: 'KN 2 Ave, Nyamirambo, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Nyamirambo+Kigali',
    phone: '+250 788 300 400',
    hours: '07:00 - 22:00',
    lat: -1.9791,
    lng: 30.0514
  },
  { 
    id: 'gikondo', 
    name: 'Simba Supermarket Gikondo', 
    district: 'Kicukiro',
    address: 'KK 31 Ave, Gikondo, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Gikondo+Kigali',
    phone: '+250 788 300 500',
    hours: '07:00 - 22:00',
    lat: -1.9723,
    lng: 30.0667
  },
  { 
    id: 'kanombe', 
    name: 'Simba Supermarket Kanombe', 
    district: 'Kicukiro',
    address: 'KK 15 Ave, Kanombe, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Kanombe+Kigali',
    phone: '+250 788 300 600',
    hours: '07:00 - 22:00',
    lat: -1.9612,
    lng: 30.1465
  },
  { 
    id: 'kinyinya', 
    name: 'Simba Supermarket Kinyinya', 
    district: 'Gasabo',
    address: 'KG 19 Ave, Kinyinya, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Kinyinya+Kigali',
    phone: '+250 788 300 700',
    hours: '07:00 - 22:00',
    lat: -1.9215,
    lng: 30.0911
  },
  { 
    id: 'kibagabaga', 
    name: 'Simba Supermarket Kibagabaga', 
    district: 'Gasabo',
    address: 'KG 19 Ave, Kibagabaga, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Kibagabaga+Kigali',
    phone: '+250 788 300 800',
    hours: '07:00 - 22:00',
    lat: -1.9312,
    lng: 30.1145
  },
  { 
    id: 'nyanza', 
    name: 'Simba Supermarket Nyanza', 
    district: 'Kicukiro',
    address: 'KK 500 St, Nyanza, Kigali',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Nyanza+Kigali',
    phone: '+250 788 300 900',
    hours: '07:00 - 22:00',
    lat: -2.0012,
    lng: 30.0834
  },
];

