export interface Deployment {
  id: number;
  deployment_name: string;
  description: string;
  domain: string;
  fqdn: string;
  image?: string;
  selected?: boolean;
  status: string;
  subdomain: string;
  tier: string;
}
