interface Accounts {
  id: string /* primary key */;
  created_at?: string;
  name?: string;
  logo?: string;
  shopify_storefront_access_token?: string;
  stripe_id?: string;
  application_fee?: any; // type unknown;
}

interface People {
  id: string /* primary key */;
  account_id?: string /* foreign key to accounts.id */;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  address?: any; // type unknown;
  birthdate?: string;
  grade?: string;
  tags?: any; // type unknown;
  gender?: string;
  name?: string;
  dependent?: boolean;
  aau_number?: string;
  accounts?: Accounts;
}

interface Senders {
  id: string /* primary key */;
  created_at: string;
  account_id?: string /* foreign key to accounts.id */;
  name?: string;
  email?: string;
  accounts?: Accounts;
}

interface Teams {
  id: string /* primary key */;
  created_at: string;
  account_id?: string /* foreign key to accounts.id */;
  name?: string;
  coach?: string;
  accounts?: Accounts;
}

interface Sites {
  id: string /* primary key */;
  created_at: string;
  name?: string;
  subdomain?: string;
  domain?: string;
  description?: string;
  account_id?: string /* foreign key to accounts.id */;
  theme?: any; // type unknown;
  logo?: string;
  accounts?: Accounts;
}

interface Posts {
  id: string /* primary key */;
  site_id: string /* foreign key to sites.id */;
  created_at: string;
  published?: boolean;
  title?: string;
  slug?: string;
  description?: string;
  sites?: Sites;
}

interface Profiles {
  id: string /* primary key */;
  created_at: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  account_id?: string /* foreign key to accounts.id */;
  role?: string;
  people_id?: string /* foreign key to people.id */;
  email?: string;
  accounts?: Accounts;
  people?: People;
}

interface Tags {
  id: string /* primary key */;
  account_id: string /* foreign key to accounts.id */;
  created_at: string;
  name: string;
  description?: string;
  accounts?: Accounts;
}

interface Relationships {
  id: string /* primary key */;
  created_at: string;
  person_id: string /* foreign key to people.id */;
  relation_id: string /* foreign key to people.id */;
  name?: string;
  primary?: boolean;
  people?: People;
}

interface Fees {
  id: string /* primary key */;
  created_at: string;
  account_id?: string /* foreign key to accounts.id */;
  name?: string;
  description?: string;
  amount?: number;
  type?: string;
  accounts?: Accounts;
}

interface Rosters {
  id: string /* primary key */;
  created_at: string;
  team_id?: string /* foreign key to teams.id */;
  person_id?: string /* foreign key to people.id */;
  fee_id?: string /* foreign key to fees.id */;
  teams?: Teams;
  people?: People;
  fees?: Fees;
}

interface Payments {
  id: string /* primary key */;
  created_at: string;
  account_id?: string /* foreign key to accounts.id */;
  profile_id?: string /* foreign key to profiles.id */;
  person_id?: string /* foreign key to people.id */;
  payment_intent_id?: string;
  status?: string;
  fee_id?: string /* foreign key to fees.id */;
  amount?: number;
  data?: any; // type unknown;
  roster_id?: string /* foreign key to rosters.id */;
  accounts?: Accounts;
  profiles?: Profiles;
  people?: People;
  fees?: Fees;
  rosters?: Rosters;
}

interface Events {
  id: string /* primary key */;
  created_at: string;
  account_id?: string /* foreign key to accounts.id */;
  name?: string;
  description?: string;
  location?: any; // type unknown;
  schedule?: any; // type unknown;
  visibility?: string;
  accounts?: Accounts;
  fees?: Fees;
}

interface Participants {
  id: string /* primary key */;
  created_at: string;
  person_id?: string /* foreign key to people.id */;
  event_id?: string /* foreign key to events.id */;
  people?: People;
  events?: Events;
}

interface Pages {
  id: string /* primary key */;
  site_id: string /* foreign key to sites.id */;
  created_at: string;
  data: any; // type unknown;
  name?: string;
  slug: string;
  sites?: Sites;
}
