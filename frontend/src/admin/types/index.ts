export interface HRUser {
  name: string;
  companyName: string;
  phone: string;
  address: string;
  email: string;
  password: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  postedAt: string;
  applicants: number;
  status: "Active" | "Processing" | "Closed";
}

export interface Stat {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
}
