import { useCurran, roleOf } from "../index";
import { Toast as ToastView } from "../ui";
import FieldApp from "../field/FieldApp";

/* Technician Home: today's job, large actions, nothing financial. */
export default function FieldHome({ v }: { v: any }) {
  const cur = useCurran();
  const staffId = roleOf(cur.role).staffId;
  return (
    <div style={{ padding: "8px 16px 40px", minHeight: "100%" }}>
      <FieldApp staffId={staffId} />
      <ToastView msg={cur.toast} />
    </div>
  );
}
