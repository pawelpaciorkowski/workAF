export interface User {
  email: string;
  flows: { id: number; name: string }[];
  id: number;
  isActive: boolean;
  isProcessAdministrator: boolean;
  name: string;
  surname: string;
  team: 
  { id: number,
    name: string,
    department: {
      id: number,
      name: string,
      uuid: string,
    }
  };
  user: number | null;
  password: string;
}

export const Departments = [
  { id: 1, name: "Sprzedaż" },
  { id: 2, name: "System" },
  { id: 3, name: "Rozliczenia" },
  { id: 4, name: "Medyczny" },
  { id: 5, name: "HL7" },
  { id: 6, name: "Logistyka" },
  { id: 7, name: "Zaopatrzenie" },
  { id: 8, name: "IT" },
  { id: 9, name: "Konkursy" },
];




export const Teams = [
  {
    id: 1,
    name: "Super Admin",
    role: "ROLE_SUPERADMIN",
    department_id: 2,
  },
  {
    id: 2,
    name: "Administrator",
    role: "ROLE_ADMIN",
    department_id: 2,
  },
  // {
  //   id: 3,
  //   name: "Administrator procesu",
  //   role: "ROLE_PROCESS_ADMIN",
  //   department_id: 1,
  // },
  {
    id: 4,
    name: "Przedstawiciel handlowy",
    role: "ROLE_SALES_REPRESENTATIVE",
    department_id: 1,
  },
  {
    id: 5,
    name: "Dyrektor regionalny",
    role: "ROLE_REGIONAL_MANAGER",
    department_id: 1,
  },
  {
    id: 6,
    name: "Pracownik działu rozliczeń",
    role: "ROLE_SETTLEMENT",
    department_id: 3,
  },
  {
    id: 7,
    name: "Pracownik działu medycznego",
    role: "ROLE_MEDICAL",
    department_id: 4,
  },
  {
    id: 8,
    name: "Pracownik działu HL7",
    role: "ROLE_HL7",
    department_id: 5,
  },
  {
    id: 9,
    name: "Pracownik działu logistyki",
    role: "ROLE_LOGISTICS",
    department_id: 6,
  },
  {
    id: 10,
    name: "Pracownik działu zaopatrzenia",
    role: "ROLE_SUPPLY",
    department_id: 7,
  },
  {
    id: 11,
    name: "Pracownik działu IT",
    role: "ROLE_IT",
    department_id: 8,
  },
  {
    id: 12,
    name: "Pracownik działu konkursów",
    role: "ROLE_COMPETITION",
    department_id: 9,
  },
  {
    id: 13,
    name: "Pracownik działu księgowości",
    role: "ROLE_ACCOUNTING",
    department_id: 10,
  }
];




