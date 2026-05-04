export type JordanCity = {
    value: string;
    label: string;
    lat: number;
    lng: number;
};

export const JORDAN_CITIES: JordanCity[] = [
    { value: 'amman',   label: 'عمّان',    lat: 31.9454, lng: 35.9284 },
    { value: 'zarqa',   label: 'الزرقاء',  lat: 32.0728, lng: 36.0878 },
    { value: 'irbid',   label: 'إربد',     lat: 32.5560, lng: 35.8500 },
    { value: 'aqaba',   label: 'العقبة',   lat: 29.5321, lng: 35.0063 },
    { value: 'madaba',  label: 'مادبا',    lat: 31.7161, lng: 35.7944 },
    { value: 'alblat',  label: 'البلقاء',  lat: 32.0392, lng: 35.7281 },
    { value: 'mafraq',  label: 'المفرق',   lat: 32.3427, lng: 36.2044 },
    { value: 'jerash',  label: 'جرش',      lat: 32.2831, lng: 35.8969 },
    { value: 'ajloun',  label: 'عجلون',    lat: 32.3327, lng: 35.7502 },
    { value: 'karak',   label: 'الكرك',    lat: 31.1827, lng: 35.7046 },
    { value: 'tafilah', label: 'الطفيلة',  lat: 30.8336, lng: 35.6075 },
    { value: 'maan',    label: 'معان',     lat: 30.1960, lng: 35.7322 },
];
