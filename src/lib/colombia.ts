/**
 * Departamentos y municipios principales de Colombia para el checkout.
 * Lista práctica (ciudades más frecuentes por departamento); ampliable.
 */
export const COLOMBIA: { department: string; cities: string[] }[] = [
  { department: "Amazonas", cities: ["Leticia", "Puerto Nariño"] },
  { department: "Antioquia", cities: ["Medellín", "Bello", "Itagüí", "Envigado", "Rionegro", "Apartadó", "Sabaneta"] },
  { department: "Arauca", cities: ["Arauca", "Saravena", "Tame"] },
  { department: "Atlántico", cities: ["Barranquilla", "Soledad", "Malambo", "Sabanalarga"] },
  { department: "Bolívar", cities: ["Cartagena", "Magangué", "Turbaco"] },
  { department: "Boyacá", cities: ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá"] },
  { department: "Caldas", cities: ["Manizales", "La Dorada", "Chinchiná"] },
  { department: "Caquetá", cities: ["Florencia"] },
  { department: "Casanare", cities: ["Yopal", "Aguazul"] },
  { department: "Cauca", cities: ["Popayán", "Santander de Quilichao"] },
  { department: "Cesar", cities: ["Valledupar", "Aguachica"] },
  { department: "Chocó", cities: ["Quibdó"] },
  { department: "Córdoba", cities: ["Montería", "Cereté", "Lorica"] },
  { department: "Cundinamarca", cities: ["Soacha", "Facatativá", "Zipaquirá", "Chía", "Girardot", "Fusagasugá", "Mosquera"] },
  { department: "Bogotá D.C.", cities: ["Bogotá"] },
  { department: "Guainía", cities: ["Inírida"] },
  { department: "Guaviare", cities: ["San José del Guaviare"] },
  { department: "Huila", cities: ["Neiva", "Pitalito", "Garzón"] },
  { department: "La Guajira", cities: ["Riohacha", "Maicao", "Uribia"] },
  { department: "Magdalena", cities: ["Santa Marta", "Ciénaga"] },
  { department: "Meta", cities: ["Villavicencio", "Acacías", "Granada"] },
  { department: "Nariño", cities: ["Pasto", "Tumaco", "Ipiales"] },
  { department: "Norte de Santander", cities: ["Cúcuta", "Ocaña", "Pamplona"] },
  { department: "Putumayo", cities: ["Mocoa", "Puerto Asís"] },
  { department: "Quindío", cities: ["Armenia", "Calarcá", "Montenegro"] },
  { department: "Risaralda", cities: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"] },
  { department: "San Andrés y Providencia", cities: ["San Andrés"] },
  { department: "Santander", cities: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja"] },
  { department: "Sucre", cities: ["Sincelejo", "Corozal"] },
  { department: "Tolima", cities: ["Ibagué", "Espinal", "Melgar"] },
  { department: "Valle del Cauca", cities: ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga"] },
  { department: "Vaupés", cities: ["Mitú"] },
  { department: "Vichada", cities: ["Puerto Carreño"] },
];

export const DEPARTMENTS = COLOMBIA.map((c) => c.department);

export function citiesFor(department: string): string[] {
  return COLOMBIA.find((c) => c.department === department)?.cities ?? [];
}
