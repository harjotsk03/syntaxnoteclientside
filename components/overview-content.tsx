import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OverviewContent() {
  return (
    <div>
      <CardTitle className="py-0 mb-1.5">Project Overview</CardTitle>
      <CardDescription>
        A high level overview of the project.
      </CardDescription>
    </div>
  );
}
