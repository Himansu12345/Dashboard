declare module "@/components/ReportExporter" {
  import React from "react";

  interface DateRange {
    startDate: Date;
    endDate: Date;
  }

  interface ReportExporterProps {
    reportData: unknown;
    dateRange: DateRange;
  }

  export default function ReportExporter(props: ReportExporterProps): React.ReactElement;
}
