import WorkExceptions from "../../curran/WorkExceptions";

type Props = { v: any };

/* The template's fourth Work tab was a schedule calendar. For Joe Curran Electrical it is Exceptions. */
export default function WorkSchedules({ v: _v }: Props) {
  return <WorkExceptions />;
}
