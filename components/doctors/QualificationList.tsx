import { Award } from "lucide-react";

export function QualificationList({ qualifications }: { qualifications: string[] }) {
  return (
    <ul className="space-y-2">
      {qualifications.map((qual, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
          <Award className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
          <span>{qual}</span>
        </li>
      ))}
    </ul>
  );
}
