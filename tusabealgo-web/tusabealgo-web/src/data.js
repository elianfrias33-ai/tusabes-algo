// Datos tomados de @tusabealgoshop23 (Instagram), revisados el 26 oct 2026.
// Precios, tallas y ❌ (agotado) copiados tal cual de cada post. Los nombres de las piezas
// describen la foto (el post solo dice "T-shirt" / "Pantalón"); se pueden cambiar sin tocar precios.

export const BUSINESS = {
  name: 'TuSabeAlgo Shop',
  handle: '@tusabealgoshop23',
  whatsapp: '18495914366',
  phone: '(849) 591-4366',
  instagram: 'https://www.instagram.com/tusabealgoshop23/',
  ceo: '@andry.jj',
  city: 'Santiago de los Caballeros',
  verse: 'Proverbios 13:4',
};

export const waLink = (text) => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;
export const money = (n) => `RD$${n.toLocaleString('en-US')}`;

// kind: arriba | abajo | calzado. price null = el post no muestra precio (pieza agotada).
// Cada flow es un post; n = orden de publicación (01 = el más viejo de esta tanda).
export const FLOWS = [
  {
    n: 11,
    post: 'De0lYkONK5W',
    date: '2026-10-22',
    pieces: [{ kind: 'calzado', label: 'Calzado', name: 'Chancleta Skeleton negra', sizes: ['8', '8.5'], price: 2500, sold: false }],
  },
  {
    n: 10,
    post: 'De0lLjst-fN',
    date: '2026-10-22',
    pieces: [{ kind: 'abajo', label: 'Pantalón', name: 'Jean baggy negro', sizes: ['34'], price: 2490, sold: false }],
  },
  {
    n: 9,
    post: 'DdW077PpP1y',
    date: '2026-09-16',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'T-shirt negra gráfica', sizes: ['M'], price: 1290, sold: false },
      { kind: 'abajo', label: 'Pantalón', name: 'Jort denim tachonado', sizes: ['34'], price: 1890, sold: false },
    ],
  },
  {
    n: 8,
    post: 'DdAXHupp5rY',
    date: '2026-09-07',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'Jersey 22 blanco', sizes: ['M'], price: 1690, sold: true },
      { kind: 'abajo', label: 'Pantalón', name: 'Jean camo flare', sizes: ['34'], price: 2790, sold: false },
    ],
  },
  {
    n: 7,
    post: 'Dc9CBRcoKZa',
    date: '2026-09-06',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'Camisa pinstripe con zíper', sizes: ['M'], price: 2590, sold: false },
      { kind: 'abajo', label: 'Pantalón', name: 'Jean baggy lavado', sizes: ['34'], price: null, sold: true },
    ],
  },
  {
    n: 6,
    post: 'Dc6sfR_mEcm',
    date: '2026-09-05',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'Polo tejido marrón', sizes: ['S'], price: 1990, sold: false },
      { kind: 'abajo', label: 'Pantalón', name: 'Pantalón de pinzas marrón', sizes: ['30', '32'], price: 1990, sold: false },
    ],
  },
  {
    n: 5,
    post: 'DczlrMHIC1s',
    date: '2026-09-02',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'Camisa franela roja', sizes: ['L', 'XL'], price: 1890, sold: false },
      { kind: 'abajo', label: 'Pantalón', name: 'Jean baggy beige', sizes: ['30', '34'], price: 1890, sold: true },
    ],
  },
  {
    n: 4,
    post: 'Dcw7yE1CRmW',
    date: '2026-09-01',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'Camisa cuadros 07', sizes: ['M', 'L'], price: null, sold: true },
      { kind: 'abajo', label: 'Pantalón', name: 'Jean baggy negro lavado', sizes: ['34'], price: null, sold: true },
    ],
  },
  {
    n: 3,
    post: 'DcuPpjSGEO8',
    date: '2026-08-31',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'Polo Rebel a rayas', sizes: ['M', 'L'], price: 1790, sold: false },
      { kind: 'abajo', label: 'Pantalón', name: 'Jean baggy gris', sizes: ['34'], price: null, sold: true },
    ],
  },
  {
    n: 2,
    post: 'DcuO963GKtE',
    date: '2026-08-31',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'T-shirt azul gráfica', sizes: ['L'], price: 1790, sold: false },
      { kind: 'abajo', label: 'Pantalón', name: 'Jean flare claro', sizes: ['36'], price: 1790, sold: false },
    ],
  },
  {
    n: 1,
    post: 'DcuNdsiGEKL',
    date: '2026-08-31',
    // Mismo jersey y jean que el reel "Rain" (30 jun, mismos precios); se usa como foto en modelo.
    model: 'DaOg0oDxQMN',
    pieces: [
      { kind: 'arriba', label: 'Arriba', name: 'Jersey 02 Peace & Love', sizes: ['M'], price: 1599, sold: false },
      { kind: 'abajo', label: 'Pantalón', name: 'Jean flare lavado', sizes: ['36'], price: 1800, sold: false },
    ],
  },
];

// Reels de junio 2026 con precio publicado. El post no marca agotado, así que se muestran
// como "consultar disponibilidad". Se dejaron fuera los posts sin precio y los repetidos
// (el polo a rayas de junio es el Flow 03 con precio nuevo).
export const LOOKS = [
  { post: 'DZ8L782RJCO', date: '2026-06-23', caption: 'Yea', pieces: [{ label: 'Arriba', size: null, price: 1799 }, { label: 'Pantalón', size: null, price: 1799 }] },
  { post: 'DZx5NiVzsBD', date: '2026-06-19', caption: 'Disponible', pieces: [{ label: 'Arriba', size: 'S', price: 1799 }, { label: 'Pantalón', size: '34', price: 1799 }] },
  { post: 'DZNbuMRu-mM', date: '2026-06-05', caption: 'Yeh yeh', pieces: [{ label: 'Camisa', size: null, price: 1990 }, { label: 'Pantalón', size: null, price: 1899 }] },
  { post: 'DZIv9I9Omf5', date: '2026-06-03', caption: 'Loco muy loco', pieces: [{ label: 'Arriba', size: null, price: 2699 }, { label: 'Pantalón', size: null, price: 1799 }] },
  { post: 'DZGDuDqJ6Ji', date: '2026-06-02', caption: 'New outfit', pieces: [{ label: 'Arriba', size: null, price: 1699 }, { label: 'Pantalón', size: null, price: 1899 }], outfit: 3298 },
];

export const flowCode = (n) => `FLOW ${String(n).padStart(2, '0')}`;
export const shortDate = (iso) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y.slice(2)}`;
};
export const flowAvailable = (f) => f.pieces.some((p) => !p.sold);
