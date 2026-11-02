import { STAFF, CERTS, Cert } from "../../index";

export type DocCategory = "Contract" | "Certificates" | "Licences" | "Emergency" | "PPE" | "Site clearance" | "Vehicle";
export interface Doc { id: string; staffId: string; name: string; category: DocCategory; added: string; size: string; by: string; expires?: string; cert?: Cert }

const CERT_DOC: Record<string, [string, DocCategory]> = {
  "Safe Pass": ["Safe Pass card (SOLAS)", "Certificates"],
  "Manual Handling": ["Manual Handling certificate", "Certificates"],
  "Working at Height": ["Working at Height certificate", "Certificates"],
  "Electrical Registration": ["RECI registration certificate", "Licences"],
  "PSA Licence": ["PSA installer licence", "Licences"],
  "First Aid": ["First Aid certificate", "Certificates"],
  "Fire Systems Cert": ["Fire systems competence certificate", "Licences"],
};
const size = (s: string) => (((s.length * 37) % 18) / 10 + 0.2).toFixed(1) + " MB";
function build(): Doc[] {
  const out: Doc[] = [];
  STAFF.forEach((s) => {
    const add = (name: string, category: DocCategory, added: string, by = "caitlin", extra: Partial<Doc> = {}) =>
      out.push({ id: "D-" + (out.length + 1), staffId: s.id, name, category, added, size: size(name + s.id), by, ...extra });
    add("Employment contract", "Contract", s.since + "-04-01", "seamus");
    add("Emergency contact form", "Emergency", "2025-01-10");
    if (s.field) add("PPE issue sheet", "PPE", s.ppe[0].issued);
    if (s.van) add("Driving licence copy", "Vehicle", "2025-02-03");
    if (["darragh", "ciara", "sean"].indexOf(s.id) > -1) add("Garda vetting, Cahersiveen Nursing Home", "Site clearance", "2025-09-15");
    CERTS.filter((c) => c.staffId === s.id).forEach((c) => {
      const [n, cat] = CERT_DOC[c.cert];
      add(n, cat, c.issued, "caitlin", { expires: c.expires, cert: c });
    });
  });
  return out;
}
export const DOCS: Doc[] = build();
export const docCount = (staffId: string) => DOCS.filter((d) => d.staffId === staffId).length;
